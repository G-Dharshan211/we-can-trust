import React from 'react';
import { X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Privacy Policy & Terms of Use</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close modal"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              We Can Trust is a certified non-profit (NGO) in Tiruvannamalai, Tamil Nadu, India. We accept both one-time 
              and recurring (monthly) donations via our official .org website. All contributions are securely processed 
              through recognized gateways, and donors are provided clear information about how their data will be used 
              and protected. Our policies below explain what personal information we collect (name, email, phone, payment details), 
              how we use it (to process donations and issue receipts), and the rules governing your use of our website.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy Policy</h3>
            
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Data Collection and Use</h4>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect personal data only when you donate or contact us. This includes your name, email address, 
              phone number, and payment details (for donation processing). We use this information solely to process 
              your donation and issue receipts, and to communicate donation updates or reports if you consent. In 
              line with India's data protection norms, we provide clear notice of all data collection and obtain your 
              consent before processing. We use your data only for the purposes you agree to (e.g. making a donation). 
              Once those purposes are fulfilled (for example, after issuing receipts and any required tax documentation), 
              we delete unnecessary personal data in a timely manner.
            </p>

            <h4 className="text-lg font-semibold text-gray-800 mb-3">Payment Processing & Security</h4>
            <p className="text-gray-700 leading-relaxed mb-4">
              All donations on our site are processed via Razorpay, a PCI-DSS Level 1 compliant payment gateway. 
              Razorpay handles credit/debit card transactions and encrypts all payment data (using SSL/TLS and 
              industry-standard encryption). Neither Razorpay nor We Can Trust ever store your raw card details on 
              our servers. These measures ensure safe, fraud-resistant transactions (as noted in sector guidelines). 
              Donors can give via multiple methods (cards, UPI, wallets) and even set up recurring (monthly) gifts – 
              all managed through secure, audited systems. For example, Razorpay can auto-generate 80G tax receipts 
              for donors, simplifying compliance. In summary, we follow encryption, PCI-DSS standards, and best 
              practices to protect your financial information.
            </p>

            <h4 className="text-lg font-semibold text-gray-800 mb-3">Third-Party Sharing and Data Rights</h4>
            <p className="text-gray-700 leading-relaxed mb-4">
              We never sell or rent your personal data. We share your information only with trusted third parties 
              essential to our services (for instance, Razorpay for payment processing) and only to the extent needed 
              for them to perform their function. Those service providers are obligated to protect your data according 
              to their own privacy policies. Apart from these operational needs, we keep your data confidential and 
              will not disclose it offline or online. Under India's Personal Data Protection framework, you have rights 
              over your data: you may access, correct or delete any personal information we hold about you. You can 
              also withdraw consent at any time (our processes allow this easily). We maintain contact details on our 
              site for any privacy inquiries or complaints, and we will address them promptly. For transparency, links 
              to this Privacy Policy and our Terms & Conditions are included on every donation page.
            </p>

            <h4 className="text-lg font-semibold text-gray-800 mb-3">Cookies and Tracking</h4>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not use any cookies or tracking pixels on our website. Our site is designed for simplicity and 
              privacy: visitors can browse and donate without any cookie-based tracking or pop-ups. (All necessary 
              functionality works without storing any cookie data.)
            </p>

            <h4 className="text-lg font-semibold text-gray-800 mb-3">Policy Updates</h4>
            <p className="text-gray-700 leading-relaxed mb-6">
              We may update this Privacy Policy from time to time. Any changes will be posted on our website with an 
              updated "Last Updated" date. Your continued use of our services after changes indicates acceptance of 
              the new policy.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Terms of Use</h3>
            
            <ul className="space-y-4 text-gray-700">
              <li>
                <strong>Donations:</strong> All gifts on this site are voluntary contributions to We Can Trust for 
                charitable purposes. Donations are generally non-refundable, as funds are used immediately for our 
                programs. If you believe an error has occurred (e.g. a duplicate charge), please contact us for assistance.
              </li>
              
              <li>
                <strong>No User Accounts:</strong> We do not create user accounts or require registration. Donations 
                are made anonymously as "guests," and we do not maintain login profiles or credentials.
              </li>
              
              <li>
                <strong>Website Content:</strong> Our website and its content are provided "as is" without warranties. 
                We do not guarantee uninterrupted access or that the site will be error-free. We disclaim liability 
                for any losses or inconvenience from using the site. Donors understand that payments are processed 
                by Razorpay; please review Razorpay's own terms and privacy policy as well.
              </li>
              
              <li>
                <strong>Recurring Donations:</strong> If you sign up for a monthly donation, you may cancel it anytime 
                by contacting our support team. We will then stop future charges.
              </li>
              
              <li>
                <strong>Tax Compliance:</strong> We Can Trust is registered under India's NGO regulations and authorized 
                to issue tax-exempt receipts (e.g. 80G certification). Donors will receive appropriate donation receipts; 
                for automated receipts we rely on Razorpay's 80G feature.
              </li>
              
              <li>
                <strong>Changes to Terms:</strong> We may modify these Terms of Use at any time. Updated terms will be 
                posted on our website. Continued use of the site constitutes acceptance of the latest Terms.
              </li>
            </ul>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This documentation is based on standard NGO donation practices and Indian data protection guidelines, 
                including secure PCI-compliant payment processing and legal rights for data principals.
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
