import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import axios from 'axios';
import { ShoppingCart, ChevronLeft, ChevronRight, Truck, RotateCcw, Ruler, Star } from 'lucide-react';
import SizeChartModal from '../components/modals/SizeChartModal';
import { useToastStore } from '../store/toastStore';

// Helper to convert Google Drive URLs for display
const convertGoogleDriveUrl = (url: string, isVideo: boolean = false): string => {
  if (!url) return url;

  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    if (isVideo) return `https://drive.google.com/file/d/${fileId}/preview`;
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  if (url.includes('drive.google.com/uc?export=view')) {
    const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
    }
  }

  return url;
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProduct, fetchProductById, isLoading } = useProductStore();
  const { showToast } = useToastStore();
  const addItem = useCartStore((state) => state.addItem);

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentProduct) {
      setSelectedSize(currentProduct.sizes?.[0] || '');
      if ((currentProduct as any).colorVariants?.length > 0) {
        setSelectedColorIndex(0);
      }
      // Fetch reviews
      fetchReviews();
    }
  }, [currentProduct]);



  // Get all images for the selected color - safe calculation for top-level
  const hasPhase4Data = currentProduct && (currentProduct as any).colorVariants?.length > 0;
  const colorVariants = currentProduct && (currentProduct as any).colorVariants || [];
  const selectedColorVariant = colorVariants[selectedColorIndex];

  const carouselImages = hasPhase4Data && selectedColorVariant?.images && selectedColorVariant.images.length > 0
    ? selectedColorVariant.images.map((img: any) => ({
      url: img.url,
      alt: `${selectedColorVariant.color} - ${img.view} view`
    }))
    : currentProduct?.images?.map((img: any) => ({ url: img.url, alt: currentProduct.name })) || [];

  // Auto-scroll images every 3 seconds
  useEffect(() => {
    if (carouselImages.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [carouselImages.length, isPaused, selectedColorIndex]);



  const fetchReviews = async () => {
    if (!id) return;
    try {
      setReviewsLoading(true);
      const response = await axios.get(`${API_URL}/reviews/product/${id}`);
      setReviews(response.data.data?.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      showToast('Failed to load reviews', 'error');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!currentProduct || !selectedSize) {
      showToast('Please select a size', 'warning');
      return;
    }

    const selectedColor = (currentProduct as any).colorVariants?.[selectedColorIndex]?.color || currentProduct.colors?.[0] || '';

    addItem(currentProduct, quantity, selectedSize, selectedColor);
    setAddedToCart(true);
    showToast('Product added to cart!', 'success');

    // Trigger Notification
    if (useAuthStore.getState().isAuthenticated) {
      const { addNotification } = useNotificationStore.getState();
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      // Add to local store immediately
      addNotification({
        _id: Date.now().toString(),
        type: 'CART_ADD',
        title: 'Added to Cart',
        message: `${currentProduct.name} added to your cart`,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Persist to backend
      axios.post(`${API_URL}/notifications`, {
        type: 'CART_ADD',
        title: 'Added to Cart',
        message: `${currentProduct.name} added to your cart`,
        metadata: { productId: currentProduct._id }
      }, { withCredentials: true }).catch(err => console.error("Failed to persist notification", err));
    }

    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="container-custom py-20 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="container-custom py-20 text-center">
        <p className="text-secondary mb-4">Product not found</p>
        <button onClick={() => navigate(-1)} className="btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  // Block inactive products
  if ((currentProduct as any).status === 'inactive' || (!currentProduct.isActive && (currentProduct as any).status !== 'coming-soon')) {
    return (
      <div className="container-custom py-20 text-center">
        <p className="text-xl text-secondary mb-4">Product is inactive</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  // Get all images for the selected color
  // Variables are already defined above for auto-scroll usage:
  // hasPhase4Data, colorVariants, selectedColorVariant, carouselImages

  const sizeChart = (currentProduct as any).sizeGuideId;
  const deliveryInfo = (currentProduct as any).deliveryInfo || {
    estimatedDays: 7,
    freeShippingThreshold: 0,
    returnPolicy: '7 days return policy'
  };



  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    setIsPaused(true);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    setIsPaused(true);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="container-custom py-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-black transition-colors flex items-center gap-2"
        >
          ← Back
          <span className="mx-2">›</span>
          <span className="capitalize">{currentProduct.category}</span>
          {currentProduct.subcategory && (
            <>
              <span className="mx-2">›</span>
              <span className="capitalize">{currentProduct.subcategory.replace(/-/g, ' ')}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Product Section - Split Layout */}
      <div className="container-custom pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* LEFT COLUMN - Image Carousel */}
          <div className="space-y-6">
            {/* Main Image with Dotted Navigation */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden group">
              {carouselImages.length > 0 ? (
                <>
                  <img
                    src={convertGoogleDriveUrl(carouselImages[currentImageIndex]?.url)}
                    alt={carouselImages[currentImageIndex]?.alt}
                    className="w-full h-full object-contain"
                  />

                  {/* Coming Soon Ribbon */}
                  {(currentProduct as any).status === 'coming-soon' && (
                    <div className="absolute top-4 left-4 z-20">
                      <span className="bg-black text-white px-4 py-2 text-sm font-bold uppercase tracking-wider rounded shadow-lg">
                        Coming Soon
                      </span>
                    </div>
                  )}

                  {/* Navigation Arrows */}
                  {carouselImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Pagination Dots */}
                  {carouselImages.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      {carouselImages.map((_: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentImageIndex(index);
                            setIsPaused(true);
                          }}
                          className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                            ? 'bg-black w-6'
                            : 'bg-white/60 hover:bg-white/80'
                            }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
            </div>

            {/* Horizontal Thumbnails (Optional) */}
            {carouselImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {carouselImages.map((img: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setIsPaused(true);
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                      ? 'border-black'
                      : 'border-gray-200 hover:border-gray-400'
                      }`}
                  >
                    <img
                      src={convertGoogleDriveUrl(img.url)}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Product Details (Sticky) */}
          <div className="lg:sticky lg:top-24 h-fit space-y-8">
            {/* Title & Price */}
            <div className="space-y-4">
              <h1 className="text-4xl font-serif font-light tracking-tight text-gray-900">
                {currentProduct.name}
              </h1>

              {/* Rating Display */}
              {currentProduct.rating && currentProduct.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${star <= Math.round(currentProduct.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {currentProduct.rating?.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({currentProduct.reviewCount || 0} reviews)
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-3">
                {currentProduct.discountPrice ? (
                  <>
                    <span className="text-3xl font-semibold text-gray-900">₹{currentProduct.discountPrice}</span>
                    <span className="text-xl text-gray-400 line-through">₹{currentProduct.price}</span>
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      {Math.round(((currentProduct.price - currentProduct.discountPrice) / currentProduct.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-semibold text-gray-900">₹{currentProduct.price}</span>
                )}
              </div>
            </div>

            {/* Color Selector */}
            {hasPhase4Data && colorVariants.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Color: <span className="font-normal text-gray-600">{selectedColorVariant?.color}</span>
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {colorVariants.map((variant: any, index: number) => {
                    const frontImage = variant.images?.find((img: any) => img.view === 'front');

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedColorIndex(index);
                          setCurrentImageIndex(0);
                        }}
                        className={`relative group`}
                        title={variant.color}
                      >
                        <div
                          className={`w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${selectedColorIndex === index
                            ? 'border-black ring-2 ring-black ring-offset-2'
                            : 'border-gray-200 hover:border-gray-400'
                            }`}
                        >
                          {frontImage ? (
                            <img
                              src={convertGoogleDriveUrl(frontImage.url)}
                              alt={variant.color}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{ backgroundColor: variant.colorHex || '#ccc' }}
                            />
                          )}
                        </div>
                        <span className="block text-xs text-center mt-1 font-medium text-gray-700">
                          {variant.color}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {currentProduct.sizes && currentProduct.sizes.length > 0 &&
              !(currentProduct.sizes.length === 1 && currentProduct.sizes[0] === 'One Size') && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900">Select Size</h3>
                    {sizeChart && (
                      <button
                        onClick={() => setShowSizeChart(true)}
                        className="text-sm text-gray-600 hover:text-black underline flex items-center gap-1"
                      >
                        <Ruler className="w-4 h-4" />
                        Size Guide
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {currentProduct.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 border-2 rounded-lg text-sm font-medium transition-all ${selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 hover:border-black'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border-2 border-gray-200 rounded-lg hover:border-black transition-colors flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border-2 border-gray-200 rounded-lg hover:border-black transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {(currentProduct as any).status === 'coming-soon' ? (
                <button
                  disabled
                  className="w-full py-4 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed border border-gray-200 uppercase tracking-wide"
                >
                  Coming Soon - Not Available
                </button>
              ) : (
                <>
                  <button
                    onClick={handleBuyNow}
                    disabled={!selectedSize}
                    className="w-full py-4 bg-black text-white rounded-lg font-medium hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                    className="w-full py-4 border-2 border-black text-black rounded-lg font-medium hover:bg-gray-50 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
                  </button>
                </>
              )}
            </div>

            {/* Delivery Info */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex gap-3">
                <Truck className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Free Delivery</p>
                  <p className="text-sm text-gray-600">Estimated {deliveryInfo.estimatedDays} days</p>
                </div>
              </div>
              <div className="flex gap-3">
                <RotateCcw className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                  <p className="text-sm text-gray-600">{deliveryInfo.returnPolicy}</p>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Product Details</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{currentProduct.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {(currentProduct.reviewCount || 0) > 0 && (
        <div className="container-custom pb-16">
          <div className="border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>

            {/* Rating Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="text-center md:text-left">
                  <div className="text-5xl font-bold mb-2">{(currentProduct.rating || 0).toFixed(1)}</div>
                  <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                    {[1, 2, 3, 4, 5, 6].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${star <= Math.round(currentProduct.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Based on {currentProduct.reviewCount} {currentProduct.reviewCount === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review: any) => (
                  <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start gap-4">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        {review.user?.avatarUrl ? (
                          <img
                            src={review.user.avatarUrl}
                            alt={review.user.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                            {review.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>

                      {/* Review Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">
                            {review.user?.fullName || 'Anonymous'}
                          </span>
                          {review.isVerifiedPurchase && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>

                        {/* Star Rating */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5, 6].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>

                        {/* Review Comment */}
                        {review.comment && (
                          <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                        )}

                        {/* Review Images */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {review.images.map((image: string, index: number) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Review image ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                              />
                            ))}
                          </div>
                        )}

                        {/* Helpful Count */}
                        {review.helpfulCount > 0 && (
                          <p className="text-sm text-gray-500">
                            {review.helpfulCount} {review.helpfulCount === 1 ? 'person' : 'people'} found this helpful
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No reviews yet. Be the first to review this product!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      {showSizeChart && (currentProduct as any).sizeGuideId && (
        <SizeChartModal
          sizeGuide={(currentProduct as any).sizeGuideId}
          onClose={() => setShowSizeChart(false)}
        />
      )}
      {/* Toast Notifications */}

    </div>
  );
};

export default ProductDetailPage;
