import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Heart, ShoppingCart, Trash2, Package, LogIn } from 'lucide-react';

import { useToastStore } from '../store/toastStore';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlist, loading, error, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [fetchWishlist, isAuthenticated]);

  const handleAddToCart = (product: any) => {
    // Construct a partial product object that satisfies the store's needs
    // We assume default size/color for wishlist items if not specified
    addItem(product, 1, product.sizes?.[0] || 'M', product.colors?.[0] || 'Default');
    showToast('Product added to cart!', 'success');
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      showToast('Removed from wishlist', 'info');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      showToast('Failed to remove item', 'error');
    }
  };

  // Check if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <LogIn className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your wishlist. Sign in to save and manage your favorite items!
          </p>
          <button
            onClick={() => navigate('/login?redirect=/wishlist')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Log In to Continue
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  // Check if error is authentication related
  const isAuthError = error && (
    error.toLowerCase().includes('not found') ||
    error.toLowerCase().includes('unauthorized') ||
    error.toLowerCase().includes('token') ||
    error.toLowerCase().includes('session')
  );

  if (error) {
    if (isAuthError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <LogIn className="w-16 h-16 mx-auto mb-4 text-orange-400" />
            <h2 className="text-2xl font-bold mb-2">Session Expired</h2>
            <p className="text-gray-600 mb-6">
              Your session has expired. Please log in again to continue shopping and access your wishlist.
            </p>
            <button
              onClick={() => navigate('/login?redirect=/wishlist')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Log In Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchWishlist()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
          <p className="text-gray-600 mb-6">
            Save items you love to your wishlist and shop them later!
          </p>
          <Link to="/products" className="btn-primary inline-block">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
        <p className="text-gray-600">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</p>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div key={product._id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            {/* Product Image */}
            <Link to={`/product/${product._id}`} className="block aspect-square overflow-hidden bg-gray-100">
              <img
                src={
                  (product.colorVariants && product.colorVariants[0]?.images?.[0]?.url) ||
                  product.images?.[0]?.url ||
                  'https://via.placeholder.com/400'
                }
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>

            {/* Remove Button */}
            <button
              onClick={() => handleRemove(product._id)}
              className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
              title="Remove from wishlist"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>

            {/* Product Info */}
            <div className="p-4">
              <Link to={`/product/${product._id}`}>
                <h3 className="font-medium text-gray-900 mb-1 hover:text-gray-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>

              <p className="text-sm text-gray-500 mb-2 capitalize">
                {product.category} {product.subcategory && `• ${product.subcategory}`}
              </p>

              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col">
                  {product.discountPrice && product.discountPrice > 0 ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">₹{product.discountPrice.toLocaleString()}</span>
                        <span className="text-sm text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                      </div>
                      <span className="text-xs font-semibold text-green-600">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                  )}
                </div>
                {product.stock > 0 ? (
                  <span className="text-xs text-green-600 flex items-center">
                    <Package className="w-3 h-3 mr-1" />
                    In Stock
                  </span>
                ) : (
                  <span className="text-xs text-red-600">Out of Stock</span>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Toast Notifications */}

    </div>
  );
};

export default WishlistPage;
