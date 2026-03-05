import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Loader2 } from "lucide-react"; // 1. Added missing icons
import { useAlert } from "../../context/AlertContext";

// 2. Added local validation to prevent ReferenceError
const validateReview = (reviewData) => {
  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
    throw new Error("Rating must be between 1 and 5 stars");
  }
  if (!reviewData.reviewText || reviewData.reviewText.trim().length === 0) {
    throw new Error("Review text cannot be empty");
  }
  if (reviewData.reviewText.length > 1000) {
    throw new Error("Review text cannot exceed 1000 characters");
  }
  return true;
};

export default function ReviewModel({ isOpen, onClose, order, onSubmit }) {
  const { showAlert } = useAlert();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const trimmedText = reviewText.trim();
      validateReview({ rating, reviewText: trimmedText });

      setSubmitting(true);

      // 3. Aligned keys with the data structure from MyOrders
      await onSubmit({
        orderId: order.id,
        itemId: order.itemId,
        itemName: order.itemName || order.dish?.name,
        itemPhoto: order.itemPhoto || order.dish?.image, // Safely check dish object
        rating,
        reviewText: trimmedText,
        reviewedAt: new Date(),
      });

      showAlert("Review submitted successfully!", "success");
      setReviewText(""); // Reset text for next time
      onClose();
    } catch (err) {
      showAlert(err.message || "Failed to submit review", "error");
      console.error("Error submitting review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
      >
        {/* Background Overlay */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-sm sm:max-w-lg bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 m-4"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={18} sm:size={20} className="text-gray-500" />
          </button>

          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-8 space-y-4 sm:space-y-6"
          >
            <div className="text-center space-y-1 sm:space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Rate your order
              </h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                How was the {order.itemName || "item"}?
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform active:scale-90 p-1"
                >
                  <Star
                    size={28}
                    sm:size={36}
                    className={`${
                      (hoverRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-zinc-700"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you like or dislike?"
                className="w-full h-24 sm:h-32 p-3 sm:p-4 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl sm:rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all text-sm sm:text-base"
              />
              <p className="text-right text-xs text-gray-400">
                {reviewText.length}/1000
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 sm:py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl sm:rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Submit Review"
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}