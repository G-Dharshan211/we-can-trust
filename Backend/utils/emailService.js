const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure your email service here
    // For production, use services like SendGrid, AWS SES, or your organization's SMTP
    this.transporter = nodemailer.createTransport({
      // For Gmail (you'll need to enable "Less secure app access" or use App Passwords)
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Add to .env file
        pass: process.env.EMAIL_PASSWORD // Add to .env file or use App Password
      }
      
      // Alternative: For other SMTP services
      // host: process.env.SMTP_HOST,
      // port: process.env.SMTP_PORT,
      // secure: process.env.SMTP_SECURE === 'true',
      // auth: {
      //   user: process.env.SMTP_USER,
      //   pass: process.env.SMTP_PASSWORD
      // }
    });
  }

  // Generate email template for receipt
  generateReceiptEmailHTML(donation, organizationDetails) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Your Donation</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #0066cc;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                color: #0066cc;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .thank-you {
                color: #0066cc;
                font-size: 24px;
                margin-bottom: 20px;
                text-align: center;
            }
            .donation-summary {
                background: #e3f2fd;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 5px solid #0066cc;
            }
            .amount {
                font-size: 28px;
                font-weight: bold;
                color: #0066cc;
                text-align: center;
                margin-bottom: 10px;
            }
            .details {
                margin: 20px 0;
            }
            .detail-row {
                margin-bottom: 10px;
                padding: 8px 0;
                border-bottom: 1px dotted #ddd;
            }
            .label {
                font-weight: bold;
                color: #555;
                display: inline-block;
                width: 140px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #0066cc;
                font-size: 14px;
                color: #666;
            }
            .important-note {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .cta-button {
                display: inline-block;
                background: #0066cc;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">${organizationDetails.name}</div>
                <p style="margin: 0; color: #666;">Empowering Communities, Changing Lives</p>
            </div>

            <div class="thank-you">Thank You for Your Generous Donation!</div>

            <p>Dear ${donation.donorName},</p>

            <p>We are deeply grateful for your generous donation. Your contribution will make a significant impact in the lives of those we serve. Every donation, regardless of size, brings us one step closer to our mission of creating positive change in our communities.</p>

            <div class="donation-summary">
                <div class="amount">₹${donation.amount.toLocaleString('en-IN')}</div>
                <p style="text-align: center; margin: 0; color: #666;">has been received successfully</p>
            </div>

            <div class="details">
                <div class="detail-row">
                    <span class="label">Receipt Number:</span>
                    ${donation.receiptNumber}
                </div>
                <div class="detail-row">
                    <span class="label">Donation Date:</span>
                    ${new Date(donation.createdAt).toLocaleDateString('en-IN')}
                </div>
                <div class="detail-row">
                    <span class="label">Purpose:</span>
                    ${donation.purpose}
                </div>
                <div class="detail-row">
                    <span class="label">Payment ID:</span>
                    ${donation.razorpayPaymentId}
                </div>
                <div class="detail-row">
                    <span class="label">Financial Year:</span>
                    ${donation.financialYear}
                </div>
            </div>

            <div class="important-note">
                <strong>🏛️ Tax Exemption Certificate</strong><br>
                This donation is eligible for tax deduction under Section 80G of the Income Tax Act, 1961. 
                Please retain the attached receipt for your tax filing purposes.
                <br><br>
                <strong>Certificate Number:</strong> ${organizationDetails.section80G}
            </div>

            <p><strong>What happens next?</strong></p>
            <ul>
                <li>Your donation will be utilized for ${donation.purpose.toLowerCase()}</li>
                <li>You will receive updates on how your contribution is making a difference</li>
                <li>You can track our impact through our regular newsletters and reports</li>
            </ul>

            <p>If you have any questions about your donation or would like to learn more about our work, please don't hesitate to contact us at ${organizationDetails.email} or ${organizationDetails.phone}.</p>

            <p>Once again, thank you for your trust and generosity. Together, we can create a better tomorrow.</p>

            <div class="footer">
                <p><strong>${organizationDetails.name}</strong></p>
                <p>${organizationDetails.address}</p>
                <p>Email: ${organizationDetails.email} | Phone: ${organizationDetails.phone}</p>
                <p>Website: ${organizationDetails.website}</p>
                <p style="margin-top: 15px; font-style: italic;">
                    This is an automated email. Please do not reply to this email address.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Send receipt email with PDF buffer attachment
  async sendReceiptEmail(donation, pdfBuffer, organizationDetails) {
    try {
      const emailHTML = this.generateReceiptEmailHTML(donation, organizationDetails);
      
      const mailOptions = {
        from: {
          name: organizationDetails.name,
          address: process.env.EMAIL_USER
        },
        to: donation.donorEmail,
        subject: `Thank you for your donation - Receipt #${donation.receiptNumber}`,
        html: emailHTML,
        attachments: [
          {
            filename: `Receipt-${donation.receiptNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };
      
    } catch (error) {
      console.error('Error sending receipt email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send donation confirmation email (without receipt)
  async sendDonationConfirmation(donation, organizationDetails) {
    try {
      const mailOptions = {
        from: {
          name: organizationDetails.name,
          address: process.env.EMAIL_USER
        },
        to: donation.donorEmail,
        subject: `Donation Confirmation - ${organizationDetails.name}`,
        html: `
          <h2>Donation Confirmation</h2>
          <p>Dear ${donation.donorName},</p>
          <p>Thank you for your donation of ₹${donation.amount}. Your payment has been received and is being processed.</p>
          <p>You will receive a detailed receipt with tax exemption certificate once the payment is confirmed.</p>
          <p>Order ID: ${donation.razorpayOrderId}</p>
          <p>Best regards,<br>${organizationDetails.name}</p>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId
      };
      
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = EmailService;
