import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  interface NavLinkClassProps {
    isActive: boolean;
  }

  type NavLinkClassFn = (props: NavLinkClassProps) => string;

  const navLinkClass = (isScrolled: boolean, isMobile: boolean = false): NavLinkClassFn => ({ isActive }: NavLinkClassProps): string => {
    const baseClasses = "px-4 py-2 rounded-md transition-colors duration-200";
    const mobileClasses = isMobile ? "block w-full text-left" : "";
    
    if (isActive) {
      return `${baseClasses} ${mobileClasses} ${
        isScrolled || isMobile
          ? 'text-primary-600 font-semibold bg-primary-50'
          : 'text-white font-semibold bg-white/10'
      }`;
    }
    
    return `${baseClasses} ${mobileClasses} ${
      isScrolled || isMobile
        ? 'text-gray-700 hover:text-primary-500 hover:bg-primary-50'
        : 'text-gray-100 hover:text-white hover:bg-white/10'
    }`;
  };

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <NavLink to="/" className="flex items-center space-x-2">
            <span className={`text-xl font-display font-semibold transition-colors duration-200 ${
              isScrolled ? 'text-primary-600' : 'text-white'
            }`}>
              We Can Trust
            </span>
          </NavLink>

          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/" className={navLinkClass(isScrolled)}>
              Home
            </NavLink>
            <NavLink to="/about" className={navLinkClass(isScrolled)}>
              About
            </NavLink>
            <NavLink to="/programs" className={navLinkClass(isScrolled)}>
              Programs
            </NavLink>
            <NavLink to="/contact" className={navLinkClass(isScrolled)}>
              Contact
            </NavLink>
            <NavLink to="/verify-receipt" className={navLinkClass(isScrolled)}>
              Verify Receipt
            </NavLink>
            <NavLink 
              to="/donate" 
              className="ml-4 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Donate
            </NavLink>
          </nav>
          <button 
            className={`md:hidden p-2 rounded-md transition-colors duration-200 ${
              isScrolled 
                ? 'text-gray-700 hover:bg-gray-100' 
                : 'text-white hover:bg-white/10'
            }`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <nav className="mt-4 pt-4 pb-4 px-2 bg-white rounded-lg shadow-lg border border-gray-100 space-y-1">
              <NavLink 
                to="/" 
                className={navLinkClass(true, true)} 
                onClick={toggleMenu}
              >
                Home
              </NavLink>
              <NavLink 
                to="/about" 
                className={navLinkClass(true, true)} 
                onClick={toggleMenu}
              >
                About
              </NavLink>
              <NavLink 
                to="/programs" 
                className={navLinkClass(true, true)} 
                onClick={toggleMenu}
              >
                Programs
              </NavLink>
              <NavLink 
                to="/contact" 
                className={navLinkClass(true, true)} 
                onClick={toggleMenu}
              >
                Contact
              </NavLink>
              <NavLink to="/verify-receipt" className={navLinkClass(true, true)} >
                Verify Receipt
              </NavLink>
              <div className="pt-2 mt-2 border-t border-gray-200">
                <NavLink 
                  to="/donate" 
                  className="block w-full px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors duration-200 font-semibold text-center shadow-md"
                  onClick={toggleMenu}
                >
                  Donate
                </NavLink>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;