const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const path = require("path");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Import receipt and email utilities
const ReceiptGenerator = require("./utils/receiptGenerator");
const EmailService = require("./utils/emailService");

require("dotenv").config();
mongoose.connect(process.env.MONGO_URI);

// Models
const Donation = require("./models/donation").default;
const Contact = require("./models/contact");

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Initialize receipt generator and email service
const receiptGenerator = new ReceiptGenerator();
const emailService = new EmailService();

const app = express();
const allowedOrigins = [
  'https://we-can-trust-mercy-trusts-projects.vercel.app',
  'https://www.we-can-trust.org',
  'http://localhost:5173',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));


// Body parsing middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static files for receipts (with authentication)
app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

// Session configuration
app.use(
  session({ 
    secret: process.env.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }),
);

// Passport configuration
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "We Can Trust API is running" });
});

// User authentication status
app.get("/api/auth/status", (req, res) => {
  if (req.user) {
    res.json({ 
      authenticated: true, 
      user: { 
        id: req.user._id, 
        name: req.user.name, 
        email: req.user.email 
      } 
    });
  } else {
    res.json({ authenticated: false, user: null });
  }
});

// User registration
app.post("/api/auth/signup", (req, res, next) => {
  passport.authenticate("local-signup", (err, user, info) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
    if (!user) {
      return res.status(400).json({ success: false, message: info.message || "Registration failed" });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Login after registration failed" });
      }
      return res.json({ 
        success: true, 
        message: "Registration successful", 
        user: { id: user._id, name: user.name, email: user.email } 
      });
    });
  })(req, res, next);
});

// User login
app.post("/api/auth/login", (req, res, next) => {
  passport.authenticate("local-login", (err, user, info) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: info.message || "Login failed" });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Login failed" });
      }
      return res.json({ 
        success: true, 
        message: "Login successful", 
        user: { id: user._id, name: user.name, email: user.email } 
      });
    });
  })(req, res, next);
});

// Google OAuth routes
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { session: true }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/auth/success`);
  }
);

// Logout
app.post("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// Donation routes

// Get Razorpay configuration
app.get("/api/donations/razorpay-config", (req, res) => {
  res.json({
    success: true,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID
  });
});

app.post("/api/donations/create-order", async (req, res) => {
  try {
    const { 
      amount, 
      donorName, 
      donorEmail, 
      donorPhone, 
      donorAddress, 
      donorPAN, 
      purpose 
    } = req.body;
    
    // Validation
    if (!amount || !donorName || !donorEmail) {
      return res.status(400).json({ 
        success: false, 
        error: "Amount, donor name, and donor email are required" 
      });
    }

    if (amount < 1) {
      return res.status(400).json({ 
        success: false, 
        error: "Amount must be at least ₹1" 
      });
    }
    
    const options = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save donation
    const donation = new Donation({
      donorName,
      donorEmail,
      donorPhone: donorPhone || "",
      donorAddress: donorAddress || "",
      donorPAN: donorPAN || "",
      amount,
      razorpayOrderId: order.id,
      purpose: purpose || "General Donation",
      userId: req.user ? req.user._id : null,
    });

    await donation.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: amount,
      currency: "INR",
      donationId: donation._id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to create order",
      details: error.message 
    });
  }
});

app.post("/api/donations/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId } = req.body;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    const year = new Date().getFullYear();
    const shortId = donationId.toString().slice(-6);
    const receiptNumber = `RCT-${year}-${shortId}`;

    if (razorpay_signature === expectedSign) {
      // Update donation status
      const donation = await Donation.findByIdAndUpdate(donationId, {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "completed",
        receiptNumber: receiptNumber,
        financialYear: `${year}-${year + 1}`,
      }, { new: true });

      if (donation) {
        // Generate receipt in background
        generateReceiptAsync(donation, req.get('host'));
      }

      res.json({ 
        success: true, 
        message: "Payment verified successfully",
        donationId: donationId,
        receiptNumber: donation.receiptNumber
      });
    } else {
      await Donation.findByIdAndUpdate(donationId, { status: "failed" });
      res.status(400).json({ 
        success: false, 
        message: "Payment verification failed" 
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Payment verification failed" 
    });
  }
});

// Async function to generate and send receipt
async function generateReceiptAsync(donation, host) {
  try {
    const baseUrl = `http://${host}`;
    
    // Generate receipt PDF
    const receiptResult = await receiptGenerator.generateReceipt(donation, baseUrl);
    
    if (receiptResult.success) {
      // Update donation with receipt information
      await Donation.findByIdAndUpdate(donation._id, {
        receiptGenerated: true,
        receiptGeneratedAt: new Date(),
        receiptPath: receiptResult.filePath,
        receiptHash: receiptResult.verificationHash
      });

      // Send receipt via email
      const emailResult = await emailService.sendReceiptEmail(
        donation, 
        receiptResult.filePath, 
        receiptGenerator.organizationDetails
      );

      if (emailResult.success) {
        console.log(`Receipt sent successfully to ${donation.donorEmail} for donation ${donation.receiptNumber}`);
      } else {
        console.error(`Failed to send receipt email for donation ${donation.receiptNumber}:`, emailResult.error);
      }
    } else {
      console.error(`Failed to generate receipt for donation ${donation._id}:`, receiptResult.error);
    }
  } catch (error) {
    console.error("Error in receipt generation process:", error);
  }
}

app.get("/api/donations/:id", async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation || donation.status !== "completed") {
      return res.status(404).json({ 
        success: false, 
        message: "Donation not found or incomplete" 
      });
    }
    res.json({ 
      success: true, 
      donation: {
        id: donation._id,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        amount: donation.amount,
        currency: donation.currency,
        purpose: donation.purpose,
        status: donation.status,
        createdAt: donation.createdAt
      }
    });
  } catch (error) {
    console.error("Error fetching donation:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching donation" 
    });
  }
});

// Get user's donations
app.get("/api/donations/user/my-donations", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Please login to view your donations" 
    });
  }
  
  try {
    const donations = await Donation.find({ 
      userId: req.user._id,
      status: "completed" 
    }).sort({ createdAt: -1 });
    
    const formattedDonations = donations.map(donation => ({
      id: donation._id,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      amount: donation.amount,
      currency: donation.currency,
      purpose: donation.purpose,
      status: donation.status,
      createdAt: donation.createdAt
    }));
    
    res.json({ 
      success: true, 
      donations: formattedDonations 
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error loading donations" 
    });
  }
});

// Receipt management routes

// Download receipt PDF
app.get("/api/receipts/download/:receiptNumber", async (req, res) => {
  try {
    const { receiptNumber } = req.params;
    
    const donation = await Donation.findOne({ 
      receiptNumber, 
      status: "completed",
    });
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found"
      });
    }
    
    // Check if file exists
    const result = await receiptGenerator.generateReceipt(donation, `http://${req.get('host')}`);
    if (!result.success) {
      console.error("Receipt gen failed:", result.error);
      return res.status(500).json({ success: false, message: "Failed to generate receipt" });
    }

    // Stream it down
    res
      .status(200)
      .set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${result.fileName}"`,
        'Content-Length': result.buffer.length
      })
      .send(result.buffer);
    
  } catch (error) {
    console.error("Error downloading receipt:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading receipt"
    });
  }
});

// Verify receipt authenticity
app.get("/api/receipts/verify/:receiptNumber", async (req, res) => {
  try {
    const { receiptNumber } = req.params;
    const { hash } = req.query;
    
    const donation = await Donation.findOne({ 
      receiptNumber, 
      status: "completed" 
    });
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found"
      });
    }
    
    // Verify hash if provided
    let isValid = true;
    if (hash) {
      isValid = receiptGenerator.verifyReceipt(donation, hash);
    }
    
    res.json({
      success: true,
      valid: isValid,
      receipt: {
        receiptNumber: donation.receiptNumber,
        donorName: donation.donorName,
        amount: donation.amount,
        currency: donation.currency,
        purpose: donation.purpose,
        donationDate: donation.createdAt,
        financialYear: donation.financialYear,
        organizationName: receiptGenerator.organizationDetails.name,
        section80G: receiptGenerator.organizationDetails.section80G
      }
    });
    
  } catch (error) {
    console.error("Error verifying receipt:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying receipt"
    });
  }
});

// Regenerate receipt (admin function)
app.post("/api/receipts/regenerate/:donationId", async (req, res) => {
  // Add authentication check for admin users here
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  
  try {
    const { donationId } = req.params;
    
    const donation = await Donation.findById(donationId);
    
    if (!donation || donation.status !== "completed") {
      return res.status(404).json({
        success: false,
        message: "Completed donation not found"
      });
    }
    
    const baseUrl = `http://${req.get('host')}`;
    
    // Generate new receipt
    const receiptResult = await receiptGenerator.generateReceipt(donation, baseUrl);
    
    if (receiptResult.success) {
      // Update donation with new receipt information
      await Donation.findByIdAndUpdate(donation._id, {
        receiptGenerated: true,
        receiptGeneratedAt: new Date(),
        receiptPath: receiptResult.filePath,
        receiptHash: receiptResult.verificationHash
      });

      // Optionally send receipt via email again
      if (req.body.sendEmail) {
        const emailResult = await emailService.sendReceiptEmail(
          donation, 
          receiptResult.filePath, 
          receiptGenerator.organizationDetails
        );
        
        return res.json({
          success: true,
          message: "Receipt regenerated and sent successfully",
          receiptNumber: donation.receiptNumber,
          emailSent: emailResult.success
        });
      }
      
      res.json({
        success: true,
        message: "Receipt regenerated successfully",
        receiptNumber: donation.receiptNumber
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to regenerate receipt",
        error: receiptResult.error
      });
    }
    
  } catch (error) {
    console.error("Error regenerating receipt:", error);
    res.status(500).json({
      success: false,
      message: "Error regenerating receipt"
    });
  }
});

// Resend receipt email
app.post("/api/receipts/resend/:receiptNumber", async (req, res) => {
  try {
    const { receiptNumber } = req.params;
    const { email } = req.body; // Optional: send to different email
    
    const donation = await Donation.findOne({ 
      receiptNumber, 
      status: "completed",
      receiptGenerated: true 
    });
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found"
      });
    }
    
    // Check if receipt file exists
    const fs = require('fs');
    if (!fs.existsSync(donation.receiptPath)) {
      return res.status(404).json({
        success: false,
        message: "Receipt file not found. Please regenerate receipt."
      });
    }
    
    // Use provided email or original donor email
    const targetEmail = email || donation.donorEmail;
    
    // Create a copy of donation with target email for sending
    const donationForEmail = { ...donation.toObject(), donorEmail: targetEmail };
    
    const emailResult = await emailService.sendReceiptEmail(
      donationForEmail, 
      donation.receiptPath, 
      receiptGenerator.organizationDetails
    );
    
    if (emailResult.success) {
      res.json({
        success: true,
        message: `Receipt sent successfully to ${targetEmail}`,
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send receipt email",
        error: emailResult.error
      });
    }
    
  } catch (error) {
    console.error("Error resending receipt:", error);
    res.status(500).json({
      success: false,
      message: "Error resending receipt"
    });
  }
});

// Contact routes

// Submit contact form
app.post("/api/contact/submit", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required"
      });
    }
    
    // Validate subject
    const validSubjects = ["general", "donation", "volunteer", "program", "partnership"];
    if (!validSubjects.includes(subject)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject selected"
      });
    }
    
    // Create new contact message
    const contact = new Contact({
      name,
      email,
      phone: phone || "",
      subject,
      message,
      userId: req.user ? req.user._id : null,
    });
    
    await contact.save();
    
    res.json({
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon!",
      contactId: contact._id
    });
    
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit your message. Please try again."
    });
  }
});

// Get all contact messages (Admin only - for future use)
app.get("/api/contact/messages", async (req, res) => {
  // For now, just check if user is logged in
  // You can add admin role checking later
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (status && ["new", "in-progress", "resolved", "closed"].includes(status)) {
      query.status = status;
    }
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "name email")
      .populate("respondedBy", "name email");
    
    const total = await Contact.countDocuments(query);
    
    const formattedContacts = contacts.map(contact => ({
      id: contact._id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject,
      message: contact.message,
      status: contact.status,
      user: contact.userId ? {
        id: contact.userId._id,
        name: contact.userId.name,
        email: contact.userId.email
      } : null,
      adminNotes: contact.adminNotes,
      respondedAt: contact.respondedAt,
      respondedBy: contact.respondedBy ? {
        id: contact.respondedBy._id,
        name: contact.respondedBy.name,
        email: contact.respondedBy.email
      } : null,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt
    }));
    
    res.json({
      success: true,
      contacts: formattedContacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({
      success: false,
      message: "Error loading contact messages"
    });
  }
});

// Get specific contact message by ID
app.get("/api/contact/:id", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  
  try {
    const contact = await Contact.findById(req.params.id)
      .populate("userId", "name email")
      .populate("respondedBy", "name email");
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }
    
    res.json({
      success: true,
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        subject: contact.subject,
        message: contact.message,
        status: contact.status,
        user: contact.userId ? {
          id: contact.userId._id,
          name: contact.userId.name,
          email: contact.userId.email
        } : null,
        adminNotes: contact.adminNotes,
        respondedAt: contact.respondedAt,
        respondedBy: contact.respondedBy ? {
          id: contact.respondedBy._id,
          name: contact.respondedBy.name,
          email: contact.respondedBy.email
        } : null,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }
    });
    
  } catch (error) {
    console.error("Error fetching contact message:", error);
    res.status(500).json({
      success: false,
      message: "Error loading contact message"
    });
  }
});

// Update contact message status (Admin only)
app.put("/api/contact/:id", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  
  try {
    const { status, adminNotes } = req.body;
    
    // Validate status
    if (status && !["new", "in-progress", "resolved", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }
    
    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === "resolved" || status === "closed") {
        updateData.respondedAt = new Date();
        updateData.respondedBy = req.user._id;
      }
    }
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("userId", "name email")
     .populate("respondedBy", "name email");
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }
    
    res.json({
      success: true,
      message: "Contact message updated successfully",
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        subject: contact.subject,
        message: contact.message,
        status: contact.status,
        user: contact.userId ? {
          id: contact.userId._id,
          name: contact.userId.name,
          email: contact.userId.email
        } : null,
        adminNotes: contact.adminNotes,
        respondedAt: contact.respondedAt,
        respondedBy: contact.respondedBy ? {
          id: contact.respondedBy._id,
          name: contact.respondedBy.name,
          email: contact.respondedBy.email
        } : null,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }
    });
    
  } catch (error) {
    console.error("Error updating contact message:", error);
    res.status(500).json({
      success: false,
      message: "Error updating contact message"
    });
  }
});

// Get contact statistics (Admin only)
app.get("/api/contact/stats/overview", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const subjectStats = await Contact.aggregate([
      {
        $group: {
          _id: "$subject",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Contact.countDocuments();
    const thisMonth = await Contact.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });
    
    // Format stats
    const statusCounts = {
      new: 0,
      "in-progress": 0,
      resolved: 0,
      closed: 0
    };
    
    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });
    
    const subjectCounts = {
      general: 0,
      donation: 0,
      volunteer: 0,
      program: 0,
      partnership: 0
    };
    
    subjectStats.forEach(stat => {
      subjectCounts[stat._id] = stat.count;
    });
    
    res.json({
      success: true,
      stats: {
        total,
        thisMonth,
        byStatus: statusCounts,
        bySubject: subjectCounts
      }
    });
    
  } catch (error) {
    console.error("Error fetching contact statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error loading statistics"
    });
  }
});

app.listen(8000, '0.0.0.0', () => console.log("Server running on http://localhost:8000"));
