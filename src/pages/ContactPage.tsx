import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Heart } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useEffect } from 'react';


const ContactPage = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const apiUri = import.meta.env.VITE_API_URI;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(
        `${apiUri}/api/contact/submit`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        console.warn('No JSON in response');
      }
      if(!res.ok) throw new Error(data?.message || res.statusText);

      setIsSubmitting(true);
      setFormData({name: '', email: '', phone: '', subject: '', message: ''});
      alert('Message sent successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setIsSubmitted(false), 5000);
    }
  };
  
  return (
    <div className="pb-16">
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

      {/* Optional: Decorative grid pattern on top */}
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
    </div>

        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                  <Heart className="text-accent-400" size={24} />
                  <span className="text-white font-medium">Get In Touch</span>
                  <Heart className="text-accent-400" size={24} />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
                Contact <span className="text-accent-400">Us</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
                Ready to make a difference? Get in touch with our team to learn more about our programs, 
                volunteer opportunities, or partnership possibilities
              </p>
              
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-white">
                  <span className="font-bold text-accent-400">24/7</span> Support
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-white">
                  <span className="font-bold text-accent-400">Quick</span> Response
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-white">
                  <span className="font-bold text-accent-400">Always</span> Available
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Contact Information & Form */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-0  ">
              {/* Contact Information */}
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Get In Touch</h2>
                
                <div className="space-y-6">
                  <ContactInfo 
                    icon={<MapPin size={24} />} 
                    title="Our Location" 
                    content={<>15/564, Kammalar Street, Kadalai post,<br />Kalasapakkam Taluk, Tiruvannamalai<br /> Tamil Nadu, India</>} 
                  />
                  
                  <ContactInfo 
                    icon={<Phone size={24} />} 
                    title="Phone Number" 
                    content={<>+91 9943163345<br /></>} 
                  />
                  
                  <ContactInfo 
                    icon={<Mail size={24} />} 
                    title="Email Address" 
                    content={<>wecantrust98@gmail.com<br /></>} 
                  />
                  
                  <ContactInfo 
                    icon={<Clock size={24} />} 
                    title="Office Hours" 
                    content={<>Monday - Friday: 9am - 5pm<br />Saturday: 10am - 2pm<br />Sunday: Closed</>} 
                  />
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="p-8">
                  <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Send Us a Message</h2>
                  
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-50 p-6 rounded-lg border border-green-100 text-center"
                    >
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-medium text-green-800 mb-2">Message Sent Successfully!</h3>
                      <p className="text-green-600">Thank you for reaching out. We'll get back to you shortly.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition-colors"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition-colors"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                          <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition-colors"
                            required
                          >
                            <option value="">Select a subject</option>
                            <option value="general">General Inquiry</option>
                            <option value="donation">Donation</option>
                            <option value="volunteer">Volunteering</option>
                            <option value="program">Program Information</option>
                            <option value="partnership">Partnership Opportunity</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={6}
                          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition-colors"
                          required
                        ></textarea>
                      </div>
                      
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        size="lg" 
                        disabled={isSubmitting}
                        className='flex items-center gap-2'
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={18}/>
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                    </form>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Google Map */}
      <section className="py-16 px-4 sm:px-0 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="aspect-w-16 aspect-h-9">
              <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62385.73472979925!2d79.02805307180343!3d12.240937611909336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bacc0852cd3d6cd%3A0x74002b16e5bac856!2sTiruvannamalai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1751067044404!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Our Location"
                  onLoad={() => console.log('Map loaded')}
                  onError={() => console.log('Map failed to load')}
                ></iframe>
                
                {/* Fallback content in case iframe fails */}
                <noscript>
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin size={48} className="mx-auto text-primary-500 mb-4" />
                      <p className="text-gray-600">Please enable JavaScript to view the map</p>
                    </div>
                  </div>
                </noscript>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find answers to common questions about our organization and programs
              </p>
            </div>
            
            <div className="space-y-6">
              <FaqItem 
                question="How can I volunteer with We Can Trust You?" 
                answer="You can volunteer by filling out our contact form or sending an email to volunteer@wecantrustyou.org. We have various opportunities based on your skills and availability." 
              />
              
              <FaqItem 
                question="Are donations tax-deductible?" 
                answer="Yes, all donations to We Can Trust You are eligible for tax deduction under Section 80G of the Income Tax Act. We provide receipts for all donations received." 
              />
              
              <FaqItem 
                question="How can I enroll in one of your training programs?" 
                answer="To enroll in our training programs, please contact us through email or phone. Our team will guide you through the eligibility criteria and enrollment process." 
              />
              
              <FaqItem 
                question="Do you provide assistance with employment after training?" 
                answer="Yes, we offer job placement assistance and career counseling to participants who complete our training programs. We have partnerships with several organizations to facilitate employment opportunities." 
              />
              
              <FaqItem 
                question="How can organizations partner with We Can Trust You?" 
                answer="We welcome partnerships with organizations that share our vision. Please contact us at partnerships@wecantrustyou.org to discuss potential collaboration opportunities." 
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

interface ContactInfoProps {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

const ContactInfo = ({ icon, title, content }: ContactInfoProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="flex"
    >
      <div className="text-primary-500 mr-4 flex-shrink-0 mt-1">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{content}</p>
      </div>
    </motion.div>
  );
};

interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem = ({ question, answer }: FaqItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Card className="overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-gray-800">{question}</h3>
        <span className="ml-4">
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      
      <div
        className={`px-6 overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600">{answer}</p>
      </div>
    </Card>
  );
};

export default ContactPage;
