import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, LogOut, Package, Heart, Settings, ChevronRight, Loader2, Bell } from 'lucide-react';
import NotificationDropdown from './notifications/NotificationDropdown';
import ProfileDropdown from './ui/ProfileDropdown';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useDebounce } from '../hooks/useDebounce';
import { useCategoryStore } from '../store/categoryStore';
import { useNotificationStore } from '../store/notificationStore';
import MegaMenu from './MegaMenu';

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ products: any[], categories: string[], subcategories: string[] }>({ products: [], categories: [], subcategories: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { isAuthenticated, user, logout: logoutStore } = useAuthStore();
  const cartCount = useCartStore((state) => state.getCartCount());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistCount = useWishlistStore((state) => state.wishlist.length);
  const unreadNotificationCount = useNotificationStore((state) => state.unreadCount);
  const { hierarchy, fetchHierarchy } = useCategoryStore();

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const profileMenuItems = [
    { name: 'My Orders', path: '/orders', icon: Package },
    { name: 'Wishlist', path: '/wishlist', icon: Heart },
    { name: 'Account Settings', path: '/profile', icon: Settings },
  ];

  // Fetch Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchQuery.length < 2) {
        setSuggestions({ products: [], categories: [], subcategories: [] });
        return;
      }

      setIsSearching(true);
      try {
        const response = await axios.get(`${API_URL}/products/search/suggestions`, {
          params: { query: debouncedSearchQuery }
        });
        if (response.data.success) {
          setSuggestions(response.data.data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchQuery]);

  // Click outside handling for search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      logoutStore();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      logoutStore();
      navigate('/');
    }
  };

  const categories = [
    { name: 'Home', path: '/' },
    ...Object.keys(hierarchy).sort().map(cat => ({ name: cat, path: `/products/${cat}` })),
    { name: 'Blogs', path: '/blogs' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  // Helper to highlight matched text
  const HighlightedText = ({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? <span key={i} className="font-bold text-primary">{part}</span> : <span key={i}>{part}</span>
        )}
      </span>
    );
  };

  const sanitizeInput = (input: string) => {
    // Remove HTML tags and special chars that might be used for XSS
    return input.replace(/[<>]/g, '').trim().slice(0, 100);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = sanitizeInput(searchQuery);
    if (cleanQuery) {
      navigate(`/products?search=${encodeURIComponent(cleanQuery)}`);
      setShowSuggestions(false);
      setIsSearchOpen(false);
    }
  };



  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm ${isScrolled ? 'py-2' : 'py-4'
        }`}
    >
      {/* Top Bar */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between lg:justify-start gap-2 lg:gap-8">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center group">
            <img
              src="/logo.png"
              alt="Botam Apparels"
              className={`w-auto transition-all duration-300 ${isScrolled ? 'h-8 lg:h-10' : 'h-10 lg:h-14'
                }`}
            />
          </Link>

          {/* Desktop Navigation - Centered & Spaced */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10 ml-12">
            <Link
              to="/"
              className="flex items-center font-bold uppercase tracking-wider text-gray-800 hover:text-black py-2 decoration-2 underline-offset-4 hover:underline transition-all duration-300 text-sm"
            >
              Home
            </Link>

            {/* Dynamic Mega Menus */}
            {(() => {
              const categories = Object.keys(hierarchy).sort();
              console.log('🔍 Navbar rendering categories:', {
                hierarchyKeys: categories,
                hierarchyObject: hierarchy,
                hasHierarchy: Object.keys(hierarchy).length > 0
              });
              return categories.map((category) => (
                <MegaMenu
                  key={category}
                  category={category}
                  label={category}
                />
              ));
            })()}

            <Link
              to="/about"
              className="flex items-center font-bold uppercase tracking-wider text-gray-800 hover:text-black py-2 decoration-2 underline-offset-4 hover:underline transition-all duration-300 whitespace-nowrap text-sm"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="flex items-center font-bold uppercase tracking-wider text-gray-800 hover:text-black py-2 decoration-2 underline-offset-4 hover:underline transition-all duration-300 whitespace-nowrap text-sm"
            >
              Contact
            </Link>
            <Link
              to="/blogs"
              className="flex items-center font-bold uppercase tracking-wider text-gray-800 hover:text-black py-2 decoration-2 underline-offset-4 hover:underline transition-all duration-300 text-sm"
            >
              Blogs
            </Link>
          </div>

          {/* Inline Search Bar */}
          <div className="hidden lg:flex w-full max-w-xs ml-auto mr-6 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="navbar-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!showSuggestions && e.target.value.length >= 2) setShowSuggestions(true);
                  }}
                  placeholder="Search"
                  className="w-full pl-12 pr-4 py-3 bg-[rgb(240,240,240)] border-0 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all rounded-full text-sm placeholder:text-gray-500"
                  autoComplete="off"
                  maxLength={100}
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
                )}
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-xl z-[200] max-h-[70vh] overflow-y-auto">
                {/* No Results */}
                {!isSearching && suggestions.categories.length === 0 && suggestions.subcategories.length === 0 && suggestions.products.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                )}

                {/* Categories */}
                {suggestions.categories.length > 0 && (
                  <div className="p-2 border-b border-gray-100">
                    <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Categories</p>
                    {suggestions.categories.map((cat) => (
                      <div
                        key={cat}
                        onClick={() => {
                          navigate(`/products/${cat}`);
                          setShowSuggestions(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between px-2 py-2 hover:bg-gray-50 rounded cursor-pointer group"
                      >
                        <div className="text-sm capitalize">
                          <HighlightedText text={cat} highlight={searchQuery} />
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Subcategories */}
                {suggestions.subcategories.length > 0 && (
                  <div className="p-2 border-b border-gray-100">
                    <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Related Collections</p>
                    {suggestions.subcategories.map((sub) => (
                      <div
                        key={sub}
                        onClick={() => {
                          navigate(`/products?subcategory=${sub}`);
                          setShowSuggestions(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between px-2 py-2 hover:bg-gray-50 rounded cursor-pointer group"
                      >
                        <div className="text-sm capitalize text-gray-700">
                          <HighlightedText text={sub} highlight={searchQuery} />
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Products */}
                {suggestions.products.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Products</p>
                    {suggestions.products.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          navigate(`/product/${product.id}`);
                          setShowSuggestions(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer group"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            <HighlightedText text={product.name} highlight={searchQuery} />
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{product.category} • {product.subcategory}</p>
                        </div>
                        <div className="text-sm font-semibold whitespace-nowrap">
                          ₹{product.price}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* View All */}
                <div className="p-2 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={(e) => {
                      handleSearchSubmit(e);
                    }}
                    className="w-full py-2 text-sm text-center text-primary font-medium hover:underline"
                  >
                    View all results for "{searchQuery}"
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1 lg:gap-6">
            {/* Mobile Search Icon (Toggle for mobile view) */}
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (!isSearchOpen) setTimeout(() => document.getElementById('navbar-search-input-mobile')?.focus(), 100);
              }}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-all duration-300 group"
              aria-label="Search"
            >
              <Search className="w-6 h-6 text-gray-700 group-hover:text-black" />
            </button>

            {/* User Icon with Dropdown */}
            {isAuthenticated && user ? (
              <div className="hidden lg:block">
                <ProfileDropdown user={user} onLogout={handleLogout} />
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:flex p-2 lg:p-3 hover:bg-gray-100 rounded-full transition-all duration-300 group"
                aria-label="Login"
              >
                <User className="w-6 h-6 text-gray-700 group-hover:text-black" />
              </Link>
            )}

            {/* Notification Dropdown */}
            {isAuthenticated && (
              <div className="hidden lg:block">
                <NotificationDropdown />
              </div>
            )}

            {/* Wishlist Icon with Badge */}
            <button
              onClick={() => navigate('/wishlist')}
              className="hidden lg:flex p-2 lg:p-3 hover:bg-gray-100 rounded-full transition-all duration-300 relative group"
              aria-label="Wishlist"
            >
              <Heart className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white transform scale-100 group-hover:scale-110 transition-transform">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon with Badge */}
            <button
              onClick={openCart}
              className="p-2 lg:p-3 hover:bg-gray-100 rounded-full transition-all duration-300 relative group"
              aria-label="Cart"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-black" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white transform scale-100 group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-all duration-300 text-gray-700"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Expanded below navbar) */}
        {isSearchOpen && (
          <div className="mt-4 animate-fadeIn relative lg:hidden" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  id="navbar-search-input-mobile"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!showSuggestions && e.target.value.length >= 2) setShowSuggestions(true);
                  }}
                  placeholder="Search for products, categories..."
                  className="w-full pl-4 pr-12 py-3 border border-border focus:outline-none focus:border-primary transition-colors rounded-lg shadow-sm"
                  autoFocus
                  autoComplete="off"
                  maxLength={100}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : <Search className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </form>

            {/* Search Suggestions Dropdown for Mobile */}
            {showSuggestions && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-xl z-[200] max-h-[70vh] overflow-y-auto">
                {/* No Results */}
                {!isSearching && suggestions.categories.length === 0 && suggestions.subcategories.length === 0 && suggestions.products.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                )}

                {/* Categories */}
                {suggestions.categories.length > 0 && (
                  <div className="p-2 border-b border-gray-100">
                    <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Categories</p>
                    {suggestions.categories.map((cat) => (
                      <div
                        key={cat}
                        onClick={() => {
                          navigate(`/products/${cat}`);
                          setShowSuggestions(false);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between px-2 py-2 hover:bg-gray-50 rounded cursor-pointer group"
                      >
                        <div className="text-sm capitalize">
                          <HighlightedText text={cat} highlight={searchQuery} />
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Subcategories */}
                {suggestions.subcategories.length > 0 && (
                  <div className="p-2 border-b border-gray-100">
                    <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Related Collections</p>
                    {suggestions.subcategories.map((sub) => (
                      <div
                        key={sub}
                        onClick={() => {
                          navigate(`/products?subcategory=${sub}`);
                          setShowSuggestions(false);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between px-2 py-2 hover:bg-gray-50 rounded cursor-pointer group"
                      >
                        <div className="text-sm capitalize text-gray-700">
                          <HighlightedText text={sub} highlight={searchQuery} />
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Products */}
                {suggestions.products.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Products</p>
                    {suggestions.products.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          navigate(`/product/${product.id}`);
                          setShowSuggestions(false);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer group"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            <HighlightedText text={product.name} highlight={searchQuery} />
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{product.category} • {product.subcategory}</p>
                        </div>
                        <div className="text-sm font-semibold whitespace-nowrap">
                          ₹{product.price}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* View All */}
                <div className="p-2 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={(e) => {
                      handleSearchSubmit(e);
                      setIsSearchOpen(false);
                    }}
                    className="w-full py-2 text-sm text-center text-primary font-medium hover:underline"
                  >
                    View all results for "{searchQuery}"
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>


      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white animate-fadeIn">
          <div className="container-custom py-4 space-y-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className="block text-sm font-medium hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            {isAuthenticated && user && (
              <div className="pt-4 border-t border-border space-y-2">
                <p className="text-sm text-secondary mb-3">
                  Hello, {user.fullName}
                </p>
                {profileMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="flex items-center gap-3 text-sm font-medium hover:text-accent transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}

                <Link
                  to="/notifications"
                  className="flex items-center gap-3 text-sm font-medium hover:text-accent transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-3 h-3 rounded-full flex items-center justify-center font-bold">
                        {unreadNotificationCount}
                      </span>
                    )}
                  </div>
                  Notifications
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 text-sm font-medium text-red-600 hover:text-red-700 transition-colors py-2 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}

            {!isAuthenticated && (
              <div className="pt-4 border-t border-border space-y-2">
                <Link
                  to="/wishlist"
                  className="flex items-center gap-3 text-sm font-medium hover:text-accent transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart className="w-4 h-4" />
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-3 text-sm font-medium hover:text-accent transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Login / Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
