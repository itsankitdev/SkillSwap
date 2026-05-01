import { useState } from 'react';
import { X, Star } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import StarRating from './StarRating';

const RateModal = ({ isOpen, onClose, session, revieweeId, revieweeName, onRated }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setLoading(true);
    try {
      await api.post('/ratings', {
        sessionId: session._id,
        revieweeId,
        rating,
        review,
        skillContext: session.title,
      });
      toast.success('Rating submitted! ⭐');
      onRated?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent!',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Rate your session</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              How was your experience with {revieweeName}?
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

          {/* Session info */}
          <div className="bg-indigo-50 rounded-2xl px-4 py-3 border border-indigo-100">
            <p className="text-xs text-indigo-500 font-medium">Session</p>
            <p className="text-sm font-bold text-indigo-800 mt-0.5">{session?.title}</p>
          </div>

          {/* Stars */}
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700 mb-3">Your Rating</p>
            <div className="flex justify-center mb-2">
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            {rating > 0 && (
              <p className="text-sm font-semibold text-amber-500">
                {ratingLabels[rating]}
              </p>
            )}
          </div>

          {/* Review */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Write a review
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={`Share your experience learning with ${revieweeName}...`}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {review.length}/500
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all">
              Skip
            </button>
            <button type="submit" disabled={loading || rating === 0}
              className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-all shadow-lg shadow-amber-200 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
              ) : (
                <><Star size={15} fill="white" /> Submit Rating</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RateModal;