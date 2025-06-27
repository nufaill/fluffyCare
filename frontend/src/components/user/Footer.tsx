import cat from '@/assets/user/footerCatimage.png'
import dogFootprint from '@/assets/user/footprint.png';
import logo from '@/assets/user/logo.png'
const Footer = () => {
  return (
    <footer
      className="bg-[#f0efee] text-black py-12 border-t border-gray-200"
      style={{
        backgroundImage: `url(${dogFootprint})`,
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
        backgroundSize: 'contain'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Column 1: Logo & Description */}
          <div>
            <div className="flex items-center space-x-2">
              <img
                src={logo}
                alt="logo"
                className="max-w-57 max-h-44 object-contain"
              />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Best service agent lorem sit velit, molestie magna lorem dictum lorem lorem dictum
            </p>
            <div className="flex space-x-4">
              {/* Instagram */}
              <div className="w-8 h-8 bg-gray-200 rounded-full hover:bg-black flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-black hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.3 2.4.6.6.3 1.1.8 1.4 1.4.3.5.5 1.2.6 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.9-.6 2.4-.3.6-.8 1.1-1.4 1.4-.5.3-1.2.5-2.4.6-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.3-2.4-.6-.6-.3-1.1-.8-1.4-1.4-.3-.5-.5-1.2-.6-2.4C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.9.6-2.4.3-.6.8-1.1 1.4-1.4.5-.3 1.2-.5 2.4-.6C8.4 2.2 8.8 2.2 12 2.2m0-2.2C8.7 0 8.3 0 7 .1 5.6.2 4.5.5 3.7.9c-.9.4-1.6 1.1-2 2-.4.8-.7 1.9-.8 3.3C.7 8.3.7 8.7.7 12s0 3.7.1 4.9c.1 1.4.4 2.5.8 3.3.4.9 1.1 1.6 2 2 .8.4 1.9.7 3.3.8 1.3.1 1.7.1 4.9.1s3.7 0 4.9-.1c1.4-.1 2.5-.4 3.3-.8.9-.4 1.6-1.1 2-2 .4-.8.7-1.9.8-3.3.1-1.3.1-1.7.1-4.9s0-3.7-.1-4.9c-.1-1.4-.4-2.5-.8-3.3-.4-.9-1.1-1.6-2-2-.8-.4-1.9-.7-3.3-.8C15.7.1 15.3 0 12 0z" />
                  <path d="M12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.3a4.1 4.1 0 1 1 0-8.2 4.1 4.1 0 0 1 0 8.2z" />
                  <circle cx="18.4" cy="5.6" r="1.4" />
                </svg>
              </div>

              {/* WhatsApp */}
              <div className="w-8 h-8 bg-gray-200 rounded-full hover:bg-black flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-black hover:text-white" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M16 2.7C8.7 2.7 2.7 8.6 2.7 16c0 2.6.7 5.1 2 7.3L2 30l6.9-2.7c2 1.1 4.2 1.7 6.6 1.7 7.3 0 13.3-5.9 13.3-13.3S23.3 2.7 16 2.7zm0 23.8c-2.1 0-4.1-.6-5.9-1.7l-.4-.2-4.1 1.6 1.5-4.1-.2-.4c-1.1-1.8-1.7-3.8-1.7-5.9 0-6 4.9-10.9 10.9-10.9 6 0 10.9 4.9 10.9 10.9S22 26.5 16 26.5z" />
                  <path d="M21.3 19.3l-2.5-1.3c-.3-.1-.7-.1-1 .1l-1.1.7c-2-.9-3.5-2.4-4.4-4.4l.7-1.1c.2-.3.3-.6.1-1l-1.3-2.5c-.3-.7-1.2-.9-1.8-.5l-.7.5c-.4.3-.7.8-.7 1.3 0 .4 0 .8.2 1.3 1.2 3.2 3.7 5.7 6.9 6.9.4.2.9.2 1.3.2.5 0 1-.2 1.3-.7l.5-.7c.5-.6.2-1.5-.5-1.8z" />
                </svg>
              </div>

              {/* LinkedIn */}
              <div className="w-8 h-8 bg-gray-200 rounded-full hover:bg-black flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-black hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.98 3.5C3.33 3.5 2 4.83 2 6.48s1.33 2.98 2.98 2.98 2.98-1.33 2.98-2.98S6.63 3.5 4.98 3.5zM2 21.5h6v-12H2v12zM9.5 9.5V21.5h6v-6.25c0-3.38 4.5-3.66 4.5 0V21.5h6v-7.25c0-6.08-7-5.86-9.25-2.88V9.5h-7.25z" />
                </svg>
              </div>

              {/* Facebook */}
              <div className="w-8 h-8 bg-gray-200 rounded-full hover:bg-black flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-black hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.2 8.5 9.9v-7h-2.6v-2.9h2.6V9.8c0-2.6 1.6-4 3.8-4 1.1 0 2.1.1 2.4.1v2.8h-1.6c-1.3 0-1.6.6-1.6 1.5v2h3.2l-.5 2.9h-2.7v7C18.3 21.2 22 17 22 12z" />
                </svg>
              </div>
            </div>

          </div>

          {/* Column 2: Company */}
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-black hover:underline transition-colors">About us</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">Gift cards</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Column 3: Useful Links */}
          <div>
            <h4 className="font-bold mb-4">Useful Links</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-black hover:underline transition-colors">New products</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">Best services</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">Discount</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">Newsletter</a></li>
            </ul>
          </div>

          {/* Column 4: Customer Service */}
          <div>
            <h4 className="font-bold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-black hover:underline transition-colors">Contact us</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">Service tracking</a></li>
            </ul>
          </div>

          {/* Column 5: Shop Info (You can add images here) */}
          <div>
            <h4 className="font-bold mb-4">Shop</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-black hover:underline transition-colors">My account</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">1234 Street St.</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">Tallahassee, FL 32303</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">+775-238-4948</a></li>
              <li><a href="#" className="hover:text-black hover:underline transition-colors">support@fluffy.com</a></li>
            </ul>
            {/* Example: Place for image */}
            {/* <img src="/your-image.png" alt="Some info" className="mt-4 w-24" /> */}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-gray-300 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <img
              src={cat}
              alt="Cat logo"
              className="w-59 h-35"
            />
          </div>
          <div className="flex space-x-4">
            {/* Visa */}
            <div className="w-12 h-8 flex items-center justify-center">
              <svg viewBox="0 0 48 32" className="w-10 h-auto" fill="currentColor">
                <text x="0" y="22" fontSize="20" fontWeight="bold">VISA</text>
              </svg>
            </div>

            {/* American Express */}
            <div className="w-12 h-8 flex items-center justify-center">
              <svg viewBox="0 0 100 32" className="w-16 h-auto" fill="currentColor">
                <text x="0" y="22" fontSize="10" fontWeight="bold">AMERICAN</text>
                <text x="0" y="32" fontSize="10" fontWeight="bold">EXPRESS</text>
              </svg>
            </div>

            {/* Mastercard */}
            <div className="w-12 h-8 flex items-center justify-center">
              <svg viewBox="0 0 50 32" className="w-10 h-auto" fill="currentColor">
                <circle cx="15" cy="16" r="10" fill="#000" />
                <circle cx="25" cy="16" r="10" fill="#000" fillOpacity="0.5" />
              </svg>
            </div>

            {/* PayPal */}
            <div className="w-12 h-8 flex items-center justify-center">
              <svg viewBox="0 0 80 32" className="w-16 h-auto" fill="currentColor">
                <text x="0" y="22" fontSize="18" fontWeight="bold">PayPal</text>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
