import React, { useState } from 'react';
import './styles/reviewModal.css';

const ReviewModal = ({ isOpen, onClose, onSubmit, sellerName }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }
        onSubmit(rating);
        setRating(0);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="review-modal-overlay" onClick={onClose}>
            <div className="review-modal" onClick={e => e.stopPropagation()}>
                <button className="review-modal-close" onClick={onClose}>&times;</button>
                <h2>Rate Your Experience</h2>
                <p>How would you rate your experience with {sellerName}?</p>
                
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                        >
                            ★
                        </span>
                    ))}
                </div>

                <div className="rating-label">
                    {rating === 0 ? 'Select a rating' : 
                     rating === 1 ? 'Poor' :
                     rating === 2 ? 'Fair' :
                     rating === 3 ? 'Good' :
                     rating === 4 ? 'Very Good' : 'Excellent'}
                </div>

                <button 
                    className="submit-rating"
                    onClick={handleSubmit}
                    disabled={rating === 0}
                >
                    Submit Rating
                </button>
            </div>
        </div>
    );
};

export default ReviewModal; 