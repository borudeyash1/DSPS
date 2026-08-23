import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';

import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import MyReviewsPage from './pages/MyReviewsPage';
import WishlistPage from './pages/WishlistPage';
import NotificationsPage from './pages/NotificationsPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminGoogleCallbackPage from './pages/admin/AdminGoogleCallbackPage';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminSectionsPage from './pages/admin/AdminSectionsPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminManagementPage from './pages/admin/AdminManagementPage';
import AdminDevicesPage from './pages/admin/AdminDevicesPage';
import AdminMockDeliveryPage from './pages/admin/AdminMockDeliveryPage';
import AdminShiprocketDeliveryPage from './pages/admin/AdminShiprocketDeliveryPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import BlogPage from './pages/BlogPage';
import AdminBlogsPage from './pages/admin/AdminBlogsPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminPaymentSettingsPage from './pages/admin/AdminPaymentSettingsPage';
import BlogPostPage from './pages/BlogPostPage';
import TrackOrderPage from './pages/TrackOrderPage';
import MenPage from './pages/MenPage';
import BlogBuilderPage from './pages/admin/BlogBuilderPage';
import MenPageBuilderPage from './pages/admin/MenPageBuilderPage';
import HomepageBuilderPage from './pages/admin/HomepageBuilderPage';
import AuthorProfilePage from './pages/AuthorProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminCategoryManagementPage from './pages/admin/AdminCategoryManagementPage';
import AdminWhatsAppPage from './pages/admin/AdminWhatsAppPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';

import { CartDrawer } from './components/cart/CartDrawer';
import DeveloperProtectedRoute from './components/admin/DeveloperProtectedRoute';
import AuthGuard from './components/AuthGuard';
import GuestGuard from './components/GuestGuard';
// import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTopButton from './components/ScrollToTopButton';
import ShippingPolicyPage from './pages/ShippingPolicyPage';

import ReturnsPage from './pages/ReturnsPage';
import FAQPage from './pages/FAQPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import MainLayout from './components/MainLayout';
import ScrollToTop from './components/ScrollToTop';

import Toast from './components/Toast';
import { useToastStore } from './store/toastStore';

import GenderSelectionModal from './components/modals/GenderSelectionModal';
import { useAuthStore } from './store/authStore';
import { useState, useEffect } from 'react';

function App() {
  const { toasts, hideToast } = useToastStore();
  const { user } = useAuthStore();
  const [showGenderModal, setShowGenderModal] = useState(false);

  useEffect(() => {
    // Check if previously dismissed in this session
    const isDismissed = sessionStorage.getItem('genderModalDismissed');

    // Show modal only if:
    // 1. User is logged in
    // 2. Gender is missing or 'Other'
    // 3. Not previously dismissed in this session
    // 3. Not previously dismissed in this session
    // 4. Gender is NOT selected (isGenderSelected is false/undefined) AND Gender is 'Other' (or missing)

    // Logic: If user has explicitly selected 'Other', isGenderSelected will be true, so modal won't show.
    // If user is new/default, isGenderSelected is false, so modal shows.
    if (user && !user.isGenderSelected && (!user.gender || user.gender === 'Other') && !isDismissed) {
      setShowGenderModal(true);
    } else {
      setShowGenderModal(false);
    }
  }, [user]);

  const handleCloseGenderModal = () => {
    setShowGenderModal(false);
    sessionStorage.setItem('genderModalDismissed', 'true');
  };

  return (
    <Router>
      <ScrollToTop />
      <GenderSelectionModal isOpen={showGenderModal} onClose={handleCloseGenderModal} />
      <Routes>
        {/* Customer Routes with Main Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />

          {/* Blog Routes */}
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/blogs/:slug" element={<BlogPostPage />} />
          <Route path="/author/:id" element={<AuthorProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping" element={<ShippingPolicyPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Category Landing Pages */}
          <Route path="/products/men" element={<MenPage />} />

          {/* Product Listing Routes */}
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:category" element={<ProductListingPage />} />
          <Route path="/products/:category/:subcategory" element={<ProductListingPage />} />
          <Route path="/products/:category/:subcategory/:itemType" element={<ProductListingPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
          <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes */}
          <Route path="/checkout" element={<AuthGuard><CheckoutPage /></AuthGuard>} />
          <Route path="/order-confirmation/:id" element={<AuthGuard><OrderConfirmationPage /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
          <Route path="/orders" element={<AuthGuard><OrdersPage /></AuthGuard>} />
          <Route path="/my-reviews" element={<AuthGuard><MyReviewsPage /></AuthGuard>} />
          <Route path="/wishlist" element={<AuthGuard><WishlistPage /></AuthGuard>} />
          <Route path="/notifications" element={<AuthGuard><NotificationsPage /></AuthGuard>} />
          <Route path="/track/:trackingNumber?" element={<TrackOrderPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

          {/* Payment Routes */}
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failed" element={<PaymentFailedPage />} />
        </Route>

        {/* Admin Routes (No Navbar/Footer) */}
        <Route path="/my-admin/login" element={<AdminLoginPage />} />
        <Route path="/my-admin/auth/google/callback" element={<AdminGoogleCallbackPage />} />
        <Route path="/my-admin" element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="categories" element={<AdminCategoryManagementPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="admins" element={<AdminManagementPage />} />
            <Route path="devices" element={<AdminDevicesPage />} />
            <Route path="delivery" element={<AdminMockDeliveryPage />} />
            <Route path="shiprocket-delivery" element={<AdminShiprocketDeliveryPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="blogs" element={<AdminBlogsPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="payment-settings" element={<AdminPaymentSettingsPage />} />
            <Route path="whatsapp" element={<AdminWhatsAppPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />


            {/* Developer Only Routes (Sections & Builders) */}
            <Route element={<DeveloperProtectedRoute />}>
              <Route path="sections" element={<AdminSectionsPage />} />
              <Route path="sections/homepage" element={<HomepageBuilderPage />} />
              <Route path="sections/blog" element={<BlogBuilderPage />} />
              <Route path="sections/men" element={<MenPageBuilderPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>

      {/* Global Chat Widget */}
      {/* <WhatsAppButton /> */}
      <ScrollToTopButton />

      <CartDrawer />

      {/* Global Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </Router>
  );
}

export default App;
