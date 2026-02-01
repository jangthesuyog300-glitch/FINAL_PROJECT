import { useState } from "react";
import { submitReview } from "../services/reviewService";
import { useParams } from "react-router-dom";

export default function Reviews({ reviews: initialReviews }) {
  const { id: restaurantId } = useParams();
  const [reviews, setReviews] = useState(initialReviews || []);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const newReview = await submitReview({
        restaurantId: Number(restaurantId),
        rating: Number(rating),
        comment: comment
      });
      setReviews([newReview, ...reviews]);
      setComment("");
      setSuccess("Review submitted successfully!");
    } catch (err) {
      setError(err.response?.data || "Failed to submit review. Ensure you have a completed booking.");
    }
  };

  return (
    <div className="reviews-section">
      <h3>Customer Reviews</h3>

      <div className="review-form">
        <h4>Write a Review</h4>
        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating:</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} ⭐</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Comment:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              required
            ></textarea>
          </div>
          <button type="submit" className="submit-review-btn">Submit Review</button>
        </form>
      </div>

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map(review => (
            <div key={review.reviewId || review.id} className="review-card">
              <div className="review-header">
                <strong>{review.userName || review.user}</strong>
                <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="review-rating">⭐ {review.rating}</p>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
