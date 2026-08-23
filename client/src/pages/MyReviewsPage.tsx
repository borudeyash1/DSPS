import React, { useState, useEffect } from 'react';
import { Star, Edit2, Trash2, Package, Calendar, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

interface Review {
    _id: string;
    product: {
        _id: string;
        name: string;
        images?: Array<{ url: string }>;
        colorVariants?: Array<{ images: Array<{ url: string }> }>;
    };
    rating: number;
    comment?: string;
    images?: string[];
    isVerifiedPurchase: boolean;
    createdAt: string;
    order: {
        _id: string;
        createdAt: string;
    };
}

const MyReviewsPage: React.FC = () => {
    const { toasts, showToast, hideToast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingReview, setEditingReview] = useState<string | null>(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reviews/user/my-reviews');
            setReviews(response.data.data || []);
        } catch (error: any) {
            console.error('Error fetching reviews:', error);
            const errorMsg = error.response?.data?.message || 'Failed to load reviews';
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (review: Review) => {
        setEditingReview(review._id);
        setEditRating(review.rating);
        setEditComment(review.comment || '');
    };

    const handleSaveEdit = async (reviewId: string) => {
        try {
            await api.put(`/reviews/user/${reviewId}`, {
                rating: editRating,
                comment: editComment
            });
            showToast('Review updated successfully!', 'success');
            setEditingReview(null);
            fetchReviews();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to update review';
            showToast(errorMsg, 'error');
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            await api.delete(`/reviews/user/${reviewId}`);
            showToast('Review deleted successfully!', 'success');
            fetchReviews();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to delete review';
            showToast(errorMsg, 'error');
        }
    };

    const getProductImage = (product: Review['product']) => {
        if (product.images && product.images.length > 0) {
            return product.images[0].url;
        }
        if (product.colorVariants && product.colorVariants.length > 0) {
            const firstVariant = product.colorVariants[0];
            if (firstVariant.images && firstVariant.images.length > 0) {
                return firstVariant.images[0].url;
            }
        }
        return '/placeholder-product.png';
    };

    const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-5 h-5 ${star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                        onClick={() => interactive && onRate && onRate(star)}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your reviews...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reviews</h1>
                    <p className="text-gray-600">
                        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </p>
                </div>

                {/* Reviews List */}
                {reviews.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                        <p className="text-gray-600 mb-6">
                            You haven't reviewed any products yet. Purchase and review products to see them here.
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            className="btn-primary"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex gap-4">
                                    {/* Product Image */}
                                    <img
                                        src={getProductImage(review.product)}
                                        alt={review.product.name}
                                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => navigate(`/product/${review.product._id}`)}
                                    />

                                    {/* Review Content */}
                                    <div className="flex-1">
                                        {/* Product Name */}
                                        <h3
                                            className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-orange-600 transition-colors"
                                            onClick={() => navigate(`/product/${review.product._id}`)}
                                        >
                                            {review.product.name}
                                        </h3>

                                        {/* Rating */}
                                        {editingReview === review._id ? (
                                            <div className="mb-3">
                                                <p className="text-sm text-gray-600 mb-1">Your Rating:</p>
                                                {renderStars(editRating, true, setEditRating)}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 mb-3">
                                                {renderStars(review.rating)}
                                                <span className="text-sm text-gray-600">
                                                    {review.rating}/5
                                                </span>
                                            </div>
                                        )}

                                        {/* Comment */}
                                        {editingReview === review._id ? (
                                            <div className="mb-3">
                                                <textarea
                                                    value={editComment}
                                                    onChange={(e) => setEditComment(e.target.value)}
                                                    placeholder="Write your review..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    rows={3}
                                                />
                                            </div>
                                        ) : (
                                            review.comment && (
                                                <p className="text-gray-700 mb-3">{review.comment}</p>
                                            )
                                        )}

                                        {/* Meta Info */}
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            {review.isVerifiedPurchase && (
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Verified Purchase
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {editingReview === review._id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSaveEdit(review._id)}
                                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingReview(null)}
                                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(review)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(review._id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Toast Notifications */}
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => hideToast(toast.id)}
                />
            ))}
        </div>
    );
};

export default MyReviewsPage;
