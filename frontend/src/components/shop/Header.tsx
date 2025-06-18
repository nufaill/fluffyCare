import { LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/user/logo.png'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-2 -ml-6 md:-ml-10 lg:-ml-25 w-16 h-10">
            <img
              src={logo}
              alt="logo"
              className="max-w-57 max-h-44 object-contain"
            />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-black focus:outline-none">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Login/Signup */}
          <div className="hidden md:flex items-center space-x-3 -mr-25">
            <Link to="/shop/login">
              <button className="group relative overflow-hidden px-4 py-2 text-sm font-medium text-black border-2 border-black rounded-lg transition-all duration-300 hover:bg-black hover:text-white hover:shadow-lg hover:scale-105">
                <span className="absolute inset-0 bg-black transform translate-x-full transition-transform duration-300 group-hover:translate-x-0"></span>
                <span className="relative flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </span>
              </button>
            </Link>

            <Link to="/shop/signup">
              <button className="group relative overflow-hidden px-4 py-2 text-sm font-medium text-white bg-black border-2 border-black rounded-lg transition-all duration-300 hover:bg-transparent hover:text-black hover:shadow-lg hover:scale-105">
                <span className="absolute inset-0 bg-white transform -translate-x-full transition-transform duration-300 group-hover:translate-x-0"></span>
                <span className="relative flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Slide Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white text-black shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${menuOpen ? 'translate-x-0' : 'translate-x-full'
          } md:hidden`}
      >
        <div className="p-5 space-y-4">
          {/* Close Icon */}
          <div className="flex justify-end">
            <button
              onClick={() => setMenuOpen(false)}
              className="text-3xl font-bold text-black hover:text-gray-700 transition duration-200"
              aria-label="Close menu"
            >
              &times;
            </button>
          </div>

          {/* Mobile Login/Signup Buttons */}
          <div className="mt-6 space-y-3">
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-black border-2 border-black rounded-lg transition-all duration-300 hover:bg-black hover:text-white">
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>

            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-black border-2 border-black rounded-lg transition-all duration-300 hover:bg-white hover:text-black">
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
