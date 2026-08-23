import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white mt-32 border-t border-gray-900">
      <div className="container-custom py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <img src="/logo.png" alt="Botam Apparels" className="h-20 w-auto mb-8 brightness-0 invert" />
            <p className="text-gray-400 text-lg leading-relaxed max-w-xs">
              Premium quality clothing designed for the modern lifestyle. Comfort meets style in every stitch.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xl font-bold mb-8 uppercase tracking-widest text-white">Shop</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/products/Mens" className="text-gray-400 hover:text-white transition-all text-lg font-medium hover:tracking-wide">
                  Men's Collection
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xl font-bold mb-8 uppercase tracking-widest text-white">Support</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-all text-lg font-medium hover:tracking-wide">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-400 hover:text-white transition-all text-lg font-medium hover:tracking-wide">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-400 hover:text-white transition-all text-lg font-medium hover:tracking-wide">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-all text-lg font-medium hover:tracking-wide">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xl font-bold mb-8 uppercase tracking-widest text-white">Account</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white transition-all text-lg font-medium hover:tracking-wide">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-400 hover:text-white transition-all text-lg font-medium hover:tracking-wide">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-gray-400 hover:text-white transition-all text-lg font-medium hover:tracking-wide">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center text-gray-500 text-base">
          <p>&copy; {currentYear} Botam Apparels. All rights reserved. <span className="mx-2">|</span> Developed by <a href="https://www.linkedin.com/company/sartthi/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Sartthi.</a></p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
