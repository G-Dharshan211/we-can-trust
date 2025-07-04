import { Heart, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import PrivacyPolicyModal from './PrivacyPolicyModal';

const Footer = () => {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  return (
    <footer className="bg-primary-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              We Can Trust is dedicated to empowering people with disabilities and underprivileged 
              communities through education, training, and advocacy.
            </p>
            <div className="flex items-center mt-4 text-sm text-gray-300">
              <Heart size={16} className="text-accent-400 mr-2" />
              <span>Making a difference since 2010</span>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-accent-400 transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent-400 transition-colors duration-200">
                  About
                </Link>
              </li>
              <li>
                <Link to="/programs" className="hover:text-accent-400 transition-colors duration-200">
                  Programs
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover:text-accent-400 transition-colors duration-200">
                  Donate
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-accent-400 transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Programs */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Programs</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Tailoring Training</li>
              <li>Digital Literacy</li>
              <li>Career Guidance</li>
              <li>Bicycle Assembly Training</li>
              <li>Tree Planting Initiatives</li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start">
                <MapPin size={18} className="text-accent-400 mr-2 mt-1 flex-shrink-0" />
                <span>15/564, KAMMALAR STREET,
                KADALADI POST, KALASAPAKKAM TALUK,
                TIRUVANNAMALAI DISTRICT,
                TAMIL NADU, INDIA.
                POSTAL CODE: 606908.
</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-accent-400 mr-2 flex-shrink-0" />
                <span>+91 9943163345</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-accent-400 mr-2 flex-shrink-0" />
                <span>mercysocialtrust@gmail.com

</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} We Can Trust. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <button 
              onClick={() => setIsPrivacyModalOpen(true)}
              className="text-sm text-gray-400 hover:text-accent-400 transition-colors duration-200 underline-offset-2 hover:underline"
            >
              Privacy Policy <span className="text-gray-600">&</span> Terms of Service
            </button>
          </div>
        </div>
      </div>
      
      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />
    </footer>
  );
};

export default Footer;