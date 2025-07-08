import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Heart, Users, GraduationCap, Lightbulb, Download, CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const DonatePage = () => {

    useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [amount, setAmount] = useState<number | ''>('');
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [donorAddress, setDonorAddress] = useState<string>('');
  const [donorPAN, setDonorPAN] = useState<string>('');
  const [donationType, setDonationType] = useState<string>('general');
  const [wantsTaxBenefit, setWantsTaxBenefit] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [razorpayKey, setRazorpayKey] = useState<string>('');
  const [donationSuccess, setDonationSuccess] = useState<{
    show: boolean;
    receiptNumber?: string;
    amount?: number;
  }>({ show: false });
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState<boolean>(false);

  const apiUri = import.meta.env.VITE_API_URI;

  // Load Razorpay script and get configuration
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const fetchRazorpayConfig = async () => {
      try {
        const response = await fetch(`${apiUri}/api/donations/razorpay-config`);
        const data = await response.json();
        if (data.success) {
          setRazorpayKey(data.razorpayKeyId);
        }
      } catch (error) {
        console.error('Error fetching Razorpay config:', error);
      }
    };

    loadRazorpay();
    fetchRazorpayConfig();
  }, [apiUri]);

  const handleAmountClick = (value: number) => {
    setAmount(value);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value === '' ? '' : parseInt(value));
    }
  };

  const getPurposeText = (type: string) => {
    const purposes = {
      general: 'General Support',
      education: 'Education & Training',
      advocacy: 'Legal Advocacy',
      community: 'Community Projects'
    };
    return purposes[type as keyof typeof purposes] || 'General Support';
  };

  const downloadReceipt = async (receiptNumber: string) => {
    try {
      const response = await fetch(`${apiUri}/api/receipts/download/${receiptNumber}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt-${receiptNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download receipt. Please try again later.');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again later.');
    }
  };

  const handleDonate = async () => {
    if (!amount || !donorName || !donorEmail) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate PAN if tax benefit is requested
    if (wantsTaxBenefit && !donorPAN) {
      alert('PAN number is required for tax exemption under Section 80G');
      return;
    }

    if (!razorpayKey) {
      alert('Payment system not ready. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      // Create order
      const orderResponse = await fetch(`${apiUri}/api/donations/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: Number(amount),
          donorName,
          donorEmail,
          donorPhone: wantsTaxBenefit ? donorPhone : '',
          donorAddress: wantsTaxBenefit ? donorAddress : '',
          donorPAN: wantsTaxBenefit ? donorPAN : '',
          purpose: getPurposeText(donationType)
        })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: razorpayKey,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'We Can Trust',
        description: getPurposeText(donationType),
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${apiUri}/api/donations/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                donationId: orderData.donationId
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              setDonationSuccess({
                show: true,
                receiptNumber: verifyData.receiptNumber,
                amount: Number(amount)
              });
              
              // Reset form
              setAmount('');
              setDonorName('');
              setDonorEmail('');
              setDonorPhone('');
              setDonorAddress('');
              setDonorPAN('');
              setDonationType('general');
              setWantsTaxBenefit(true);
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
            alert('Payment verification failed. Please contact support.');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: donorName,
          email: donorEmail,
          contact: donorPhone
        },
        theme: {
          color: '#0066cc'
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Error creating donation order:', error);
      alert('Failed to process donation. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-16">
      {/*Receipt Download*/}

      {donationSuccess.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
            <button 
              onClick={() => setDonationSuccess({show:false})}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 focus:outline-none text-2xl"
            >
              &times;
            </button>
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
            <p className="text-gray-600">Your donation has been processed successfully.</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-lg font-semibold text-green-800">
              ₹{donationSuccess.amount?.toLocaleString('en-IN')} Donated
            </p>
            {donationSuccess.receiptNumber && (
              <p className="text-sm text-green-600 mt-1">
                Receipt #{donationSuccess.receiptNumber}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              A receipt with tax exemption certificate has been sent to your email address.
            </p>
            
            {donationSuccess.receiptNumber && (
              <Button
                onClick={() => downloadReceipt(donationSuccess.receiptNumber!)}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Receipt</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => setDonationSuccess({ show: false })}
              className="w-full"
            >
              Make Another Donation
            </Button>
          </div>
        </motion.div>
      </div>
      )}

      {/* Creative Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 py-40 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Animated blurred gradient background with amber blobs */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: 
                  'radial-gradient(circle at 20% 30%, rgba(255, 235, 59, 0.7) 0%, transparent 50%), ' +
                  'radial-gradient(circle at 80% 50%, rgba(76, 175, 80, 0.6) 0%, transparent 50%), ' +
                  'radial-gradient(circle at 50% 80%, rgba(255, 152, 0, 0.5) 0%, transparent 50%)',
                backgroundSize: '200% 200%',
                animation: 'animatedGradient 16s ease-in-out infinite',
                filter: 'blur(60px)',
                opacity: 0.7,
              }}
            />
          </div>
        </div>

      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid-hero" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.3" />
              <circle cx="0" cy="0" r="0.5" fill="currentColor" opacity="0.3" />
            </pattern>
            <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.8" />
              <stop offset="50%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#grid-hero)" stroke="url(#gridGradient)" />
        </svg>
      </div>     

        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Make a <span className="text-amber-300">Difference</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Your generosity creates ripples of hope and change in communities that need it most.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Donation Form */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Support Our Mission</h2>
            
            {/* Amount Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold mb-4">Select Amount</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[500, 1000, 2500, 5000].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAmountClick(value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      amount === value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    ₹{value.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Enter custom amount"
                value={amount}
                onChange={handleCustomAmountChange}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>

            {/* Donation Purpose */}
            <div className="mb-8">
              <label className="block text-lg font-semibold mb-4">Purpose</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'general', icon: Heart, title: 'General Support' },
                  { id: 'education', icon: GraduationCap, title: 'Education & Training' },
                  { id: 'advocacy', icon: Lightbulb, title: 'Legal Advocacy' },
                  { id: 'community', icon: Users, title: 'Community Projects' }
                ].map(({ id, icon: Icon, title }) => (
                  <button
                    key={id}
                    onClick={() => setDonationType(id)}
                    className={`p-4 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                      donationType === id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Donor Information */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Donor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  required
                />
              </div>

              {wantsTaxBenefit && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                  <textarea
                    placeholder="Address"
                    value={donorAddress}
                    onChange={(e) => setDonorAddress(e.target.value)}
                    rows={3}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="PAN Number (Required for tax exemption)"
                    value={donorPAN}
                    onChange={(e) => setDonorPAN(e.target.value.toUpperCase())}
                    maxLength={10}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </motion.div>
              )}
            </div>

            {/* Privacy Policy Agreement */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyPolicyAccepted}
                  onChange={(e) => setPrivacyPolicyAccepted(e.target.checked)}
                  className="w-4 h-4 text-primary-600 mt-1"
                  required
                />
                <div className="text-sm">
                  <span className="text-gray-700">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setIsPrivacyModalOpen(true)}
                      className="text-primary-600 hover:text-primary-800 underline font-medium"
                    >
                      Terms of Service & Privacy Policy
                    </button>
                    {' '}and understand that my personal information will be used to process this donation and issue receipts.
                  </span>
                </div>
              </label>
            </div>

            {/* Donate Button */}
            <Button
              onClick={handleDonate}
              disabled={isLoading || !amount || !donorName || !donorEmail || !privacyPolicyAccepted}
              className="w-full text-lg py-4 flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>
                {isLoading ? 'Processing...' : `Donate ₹${amount ? Number(amount).toLocaleString('en-IN') : '0'}`}
              </span>
            </Button>

            <p className="text-sm text-gray-500 text-center mt-4">
              Your donation is secure and will be processed via Razorpay. 
              You will receive a receipt with tax exemption certificate via email.
            </p>
          </Card>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
};

export default DonatePage;
