import { Schema, model } from "mongoose";

const DonationSchema = new Schema({
  donorName: { type: String, required: true },
  donorEmail: { type: String, required: true },
  donorPhone: { type: String }, // Added for receipt
  donorAddress: { type: String }, // Added for receipt
  donorPAN: { type: String }, // Added for tax exemption
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  status: { 
    type: String, 
    enum: ["pending", "completed", "failed"], 
    default: "pending" 
  },
  purpose: { type: String, default: "General Donation" },
  userId: { type: Schema.Types.ObjectId, ref: "user" }, // Optional for logged-in users
  // Receipt related fields
  receiptNumber: { type: String, unique: true, sparse: true }, // Generated for completed donations
  receiptGenerated: { type: Boolean, default: false },
  receiptGeneratedAt: { type: Date },
  receiptHash: { type: String }, // SHA256 hash for verification
  taxExemptionCertificate: { type: String }, // 80G certificate details
  financialYear: { type: String }, // e.g., "2024-25"
}, {
  timestamps: true
});

// Generate receipt number for completed donations
DonationSchema.methods.generateReceiptNumber = function() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  return `WCT-${year}${month}-${timestamp}`;
};

// Helper method to get financial year
DonationSchema.methods.getFinancialYear = function() {
  const date = this.createdAt || new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Financial year in India: April to March
  if (month >= 3) { // April (3) to March next year
    return `${year}-${String(year + 1).slice(-2)}`;
  } else {
    return `${year - 1}-${String(year).slice(-2)}`;
  }
};

// Pre-save hook to generate receipt number and financial year for completed donations
DonationSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.receiptNumber) {
    this.receiptNumber = this.generateReceiptNumber();
    this.financialYear = this.getFinancialYear();
  }
  next();
});

export default model("donation", DonationSchema);
