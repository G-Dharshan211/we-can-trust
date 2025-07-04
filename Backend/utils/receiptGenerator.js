const puppeteer = require('puppeteer');
const QRCode = require('qrcode');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const path = require('path');
const fs = require('fs').promises;

class ReceiptGenerator {
  constructor() {
    this.organizationDetails = {
      name: process.env.ORG_NAME || "We Can Trust",
      registrationNumber: process.env.ORG_REGISTRATION_NUMBER || "NGO/REG/2024/001",
      panNumber: process.env.ORG_PAN_NUMBER || "AAATW1234C",
      address: process.env.ORG_ADDRESS || "123 Trust Avenue, Mumbai, Maharashtra 400001",
      phone: process.env.ORG_PHONE || "+91-9876543210",
      email: process.env.ORG_EMAIL || "contact@wecantrust.org",
      website: process.env.ORG_WEBSITE || "https://wecantrust.org",
      section80G: process.env.ORG_80G_CERTIFICATE || "80G/2024/001",
      logoUrl: "/public/logo.svg" // Path to organization logo
    };
  }

  // Generate a cryptographic hash for receipt verification
  generateReceiptHash(donationData) {
    const dataString = `${donationData.receiptNumber}${donationData.donorName}${donationData.amount}${donationData.donorEmail}${donationData.createdAt}`;
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  // Generate QR code for receipt verification
  async generateQRCode(verificationUrl) {
    try {
      return await QRCode.toDataURL(verificationUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  }

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  // Convert number to words (for Indian numbering system)
  numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    function convertThree(n) {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        return result;
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result;
    }
    
    if (num >= 10000000) { // Crore
      return convertThree(Math.floor(num / 10000000)) + 'Crore ' + this.numberToWords(num % 10000000);
    } else if (num >= 100000) { // Lakh
      return convertThree(Math.floor(num / 100000)) + 'Lakh ' + this.numberToWords(num % 100000);
    } else if (num >= 1000) { // Thousand
      return convertThree(Math.floor(num / 1000)) + 'Thousand ' + this.numberToWords(num % 1000);
    } else {
      return convertThree(num);
    }
  }

  // Generate HTML template for receipt
  generateReceiptHTML(donation, qrCodeDataUrl, verificationHash) {
    const currentDate = new Date().toLocaleDateString('en-IN');
    const donationDate = new Date(donation.createdAt).toLocaleDateString('en-IN');
    const amountInWords = this.numberToWords(Math.floor(donation.amount));
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Donation Receipt - ${donation.receiptNumber}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Arial', sans-serif; 
                font-size: 10px;
                line-height: 1.3; 
                color: #333;
                background: white;
            }
            .receipt-container {
                max-width: 800px;
                margin: 10px auto;
                padding: 40px;
                background: white;
                border: 2px solid #0066cc;
                page-break-inside: avoid;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #0066cc;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                width: 80px;
                height: 80px;
                margin: 0 auto 15px;
            }
            .org-name {
                font-size: 22px;
                font-weight: bold;
                color: #0066cc;
                margin-bottom: 5px;
            }
            .org-details {
                font-size: 12px;
                color: #666;
                line-height: 1.4;
            }
            .receipt-title {
                text-align: center;
                font-size: 20px;
                font-weight: bold;
                color: #0066cc;
                margin: 20px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .receipt-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                background: #f8f9fa;
                padding: 10px;
                border-radius: 5px;
            }
            .receipt-number {
                font-weight: bold;
                color: #0066cc;
            }
            .donation-details {
                margin-bottom: 30px;
            }
            .detail-row {
                display: flex;
                margin-bottom: 8px;
                border-bottom: 1px dotted #ccc;
                padding-bottom: 5px;
            }
            .detail-label {
                width: 200px;
                font-weight: bold;
                color: #555;
            }
            .detail-value {
                flex: 1;
                color: #333;
            }
            .amount-section {
                background: #e3f2fd;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 5px solid #0066cc;
            }
            .amount-value {
                font-size: 28px;
                font-weight: bold;
                color: #0066cc;
                margin-bottom: 5px;
            }
            .amount-words {
                font-style: italic;
                color: #666;
                font-size: 14px;
            }
            .tax-exemption {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #0066cc;
            }
            .qr-section {
                text-align: center;
            }
            .qr-code {
                width: 100px;
                height: 100px;
                margin-bottom: 5px;
            }
            .verification-text {
                font-size: 10px;
                color: #666;
            }
            .signature-section {
                text-align: center;
            }
            .signature-line {
                border-top: 1px solid #333;
                width: 200px;
                margin: 40px auto 5px;
                padding-top: 5px;
            }
            .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 90px;
                color: rgba(0, 102, 204, 0.05);
                font-weight: bold;
                z-index: 0;
                pointer-events: none;
            }
            .content {
                position: relative;
                z-index: 1;
            }
        </style>
    </head>
    <body>
        <div class="watermark">WE CAN TRUST</div>
        <div class="receipt-container">
            <div class="content">
                <div class="header">
                    <div class="org-name">${this.organizationDetails.name}</div>
                    <div class="org-details">
                        ${this.organizationDetails.address}<br>
                        Phone: ${this.organizationDetails.phone} | Email: ${this.organizationDetails.email}<br>
                        Website: ${this.organizationDetails.website}<br>
                        PAN: ${this.organizationDetails.panNumber} | Registration: ${this.organizationDetails.registrationNumber}
                    </div>
                </div>

                <div class="receipt-title">Donation Receipt</div>

                <div class="receipt-info">
                    <div>
                        <div class="receipt-number">Receipt No: ${donation.receiptNumber}</div>
                        <div>Date: ${donationDate}</div>
                    </div>
                    <div>
                        <div>Financial Year: ${donation.financialYear}</div>
                        <div>Payment ID: ${donation.razorpayPaymentId}</div>
                    </div>
                </div>

                <div class="donation-details">
                    <div class="detail-row">
                        <div class="detail-label">Donor Name:</div>
                        <div class="detail-value">${donation.donorName}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Email:</div>
                        <div class="detail-value">${donation.donorEmail}</div>
                    </div>
                    ${donation.donorPhone ? `
                    <div class="detail-row">
                        <div class="detail-label">Phone:</div>
                        <div class="detail-value">${donation.donorPhone}</div>
                    </div>
                    ` : ''}
                    ${donation.donorAddress ? `
                    <div class="detail-row">
                        <div class="detail-label">Address:</div>
                        <div class="detail-value">${donation.donorAddress}</div>
                    </div>
                    ` : ''}
                    ${donation.donorPAN ? `
                    <div class="detail-row">
                        <div class="detail-label">PAN:</div>
                        <div class="detail-value">${donation.donorPAN}</div>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                        <div class="detail-label">Purpose:</div>
                        <div class="detail-value">${donation.purpose}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Payment Method:</div>
                        <div class="detail-value">Online Payment via Razorpay</div>
                    </div>
                </div>

                <div class="amount-section">
                    <div class="amount-value">${this.formatCurrency(donation.amount)}</div>
                    <div class="amount-words">Amount in words: ${amountInWords} Rupees Only</div>
                </div>

                <div class="tax-exemption">
                    <strong>Tax Exemption Notice:</strong><br>
                    This donation is eligible for deduction under Section 80G of the Income Tax Act, 1961.
                    Certificate Number: ${this.organizationDetails.section80G}<br>
                    <em>Please retain this receipt for your tax filing purposes.</em>
                </div>

                <div class="footer">
                    <div class="qr-section">
                        ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="Verification QR Code" class="qr-code">` : ''}
                        <div class="verification-text">
                            Scan QR code to verify<br>
                            Hash: ${verificationHash.substring(0, 16)}...
                        </div>
                    </div>
                    <div class="signature-section">
                        <div class="signature-line">Authorized Signature</div>
                        <div style="font-size: 12px; margin-top: 10px;">
                            Generated on: ${currentDate}<br>
                            This is a computer-generated receipt
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Generate PDF receipt
  async generateReceipt(donation, baseUrl) {
    try {
      // Generate verification hash
      const verificationHash = this.generateReceiptHash(donation);
      
      // Create verification URL
      const verificationUrl = `${baseUrl}/api/receipts/verify/${donation.receiptNumber}?hash=${verificationHash}`;
      
      // Generate QR code
      const qrCodeDataUrl = await this.generateQRCode(verificationUrl);
      
      // Generate HTML
      const html = this.generateReceiptHTML(donation, qrCodeDataUrl, verificationHash);
      
      // Generate PDF using Puppeteer
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      const fileName = `receipt-${donation.receiptNumber}.pdf`;
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      });
      
      await browser.close();
      
      return {
        success: true,
        buffer: pdfBuffer,
        fileName,
        verificationHash,
        verificationUrl
      };
      
    } catch (error) {
      console.error('Error generating receipt:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify receipt authenticity
  verifyReceipt(donation, providedHash) {
    const calculatedHash = this.generateReceiptHash(donation);
    return calculatedHash === providedHash;
  }
}

module.exports = ReceiptGenerator;
