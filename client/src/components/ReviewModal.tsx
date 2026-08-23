import { useState } from 'react';
import { X, Star } from 'lucide-react';
import axios from 'axios';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    orderId: string;
    onSuccess: () => void;
}

export const ReviewModal = ({
    isOpen,
    onClose,
    productId,
    productName,
    orderId,
    onSuccess,
}: ReviewModalProps) => {
    const { toasts, showToast, hideToast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) {
            showToast('Please select a rating (1-6 stars)', 'warning');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/reviews`,
                {
                    productId,
                    orderId,
                    rating,
                    comment: comment.trim() || undefined,
                },
                { withCredentials: true }
            );

            console.log('✅ Review submitted successfully:', response.data);

            // Show success message
            showToast('Thank you! Your review has been submitted successfully', 'success');

            // Call success callback and close
            onSuccess();
            onClose();

            // Reset form
            setRating(0);
            setComment('');
        } catch (error: any) {
            console.error('Submit review error:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.message || 'Failed to submit review. Please try again.';
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Write a Review</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">{productName}</p>

                {/* Star Rating */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Rating *</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setRating(star)}
                                className="focus:outline-none"
                            >
                                <Star
                                    className={`w-8 h-8 ${star <= (hoveredRating || rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comment */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                        rows={4}
                        maxLength={1000}
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || rating === 0}
                    className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
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
