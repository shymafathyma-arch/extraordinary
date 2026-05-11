import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MessageSquare } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import './ReviewModal.css';

const ReviewModal = ({ carId, carModel, isOpen, onClose }) => {
  const { addReview } = useData();
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    addReview({
      carId,
      user: currentUser?.displayName || 'Anonymous',
      rating,
      comment,
      date: new Date().toISOString()
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div 
          className="modal-content glass-panel"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
          
          <div className="modal-header">
            <h3>Share Your <span className="text-gradient-gold">Experience</span></h3>
            <p>Rating for {carModel}</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${ (hoveredRating || rating) >= star ? 'active' : '' }`}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star size={32} fill={(hoveredRating || rating) >= star ? 'var(--accent-gold)' : 'none'} />
                </button>
              ))}
            </div>

            <div className="input-wrapper">
              <label><MessageSquare size={16} /> Testimonial</label>
              <textarea 
                className="glass-input" 
                rows="4" 
                placeholder="How was your drive?" 
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="glass-button primary w-full">Submit Elite Review</button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewModal;
