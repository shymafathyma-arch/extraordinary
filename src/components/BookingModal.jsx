import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, CreditCard, User, Phone, Star } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import './BookingModal.css';

const BookingModal = ({ car, isOpen, onClose }) => {
  const { addOrder, reviews, formatPrice } = useData();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(0); // Step 0 is Car Preview
  const [orderDetails, setOrderDetails] = useState({
    customerName: '',
    phone: '',
    date: '',
    location: '',
    address: '',
    duration: 'daily',
    chauffeur: false,
    insurance: false,
    payLater: false
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvc: ''
  });
  const [errors, setErrors] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);

  const calculateTotal = () => {
    if (!car.price) return 0;
    let base = car.price;
    if (orderDetails.duration === 'hourly') base = Math.floor(car.price / 8);
    if (orderDetails.duration === 'monthly') base = car.price * 20;
    
    if (orderDetails.chauffeur) base += 5000;
    if (orderDetails.insurance) base += 2000;
    return base;
  };

  const handleBookingComplete = () => {
    const newErrors = {};
    if (!orderDetails.payLater) {
      if (!paymentDetails.cardNumber) newErrors.cardNumber = 'Card Number is required';
      if (!paymentDetails.expiry) newErrors.expiry = 'Expiry is required';
      if (!paymentDetails.cvc) newErrors.cvc = 'CVC is required';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    setErrors({});
    addOrder({
      carId: car.id,
      carModel: `${car.brand} ${car.model}`,
      userEmail: currentUser?.email,
      price: car.price,
      totalPrice: calculateTotal(),
      ...orderDetails
    });
    setStep(3);
  };

  const handleClose = () => {
    setStep(0);
    setOrderDetails({ 
      customerName: '', phone: '', date: '', location: '', address: '', 
      duration: 'daily', chauffeur: false, insurance: false, payLater: false 
    });
    setPaymentDetails({ cardNumber: '', expiry: '', cvc: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen || !car.id) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="modal-content glass-panel"
          style={{ maxWidth: '600px' }}
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 50, opacity: 0 }}
        >
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>

          <div className="modal-header">
            <h2>{step === 0 ? 'Vehicle Preview' : 'Reserve'} <span className="text-gradient-gold">{car.brand}</span></h2>
            <p>{car.model}</p>
          </div>

          <div className="modal-body">
            {step > 0 && step < 3 && (
              <div className="step-indicator">
                <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Details</div>
                <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Payment</div>
                <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Confirm</div>
              </div>
            )}

            {step === 0 && (
              <motion.div className="form-step preview-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="preview-image-container">
                  <img src={car.image} alt={car.model} className="preview-image" />
                </div>
                
                <div className="preview-specs-grid">
                  <div className="spec-item">
                    <span className="spec-label">Power</span>
                    <span className="spec-value">{car.specs?.power || 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Top Speed</span>
                    <span className="spec-value">{car.specs?.topSpeed || 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">0-100 km/h</span>
                    <span className="spec-value">{car.specs?.acceleration || 'N/A'}</span>
                  </div>
                </div>

                <div className="preview-price price-summary">
                  <p>Daily Rate</p>
                  <h3>{formatPrice(car.price || 0)} <span className="period">/ day</span></h3>
                </div>

                <div className="preview-reviews">
                  <h4>Client Testimonials</h4>
                  {reviews.filter(r => r.carId === car.id).length > 0 ? (
                    reviews.filter(r => r.carId === car.id).map(review => (
                      <div key={review.id} className="mini-review glass-panel">
                        <div className="review-meta">
                          <span className="user-name">{review.user}</span>
                          <div className="stars">
                            {[...Array(review.rating)].map((_, i) => <Star key={i} size={10} fill="var(--accent-gold)" color="var(--accent-gold)" />)}
                          </div>
                        </div>
                        <p>"{review.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="no-reviews">No reviews yet for this vehicle.</p>
                  )}
                </div>

                <button 
                  className="glass-button primary w-full mt-4"
                  onClick={() => setStep(1)}
                >
                  Proceed to Booking
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div className="form-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="split-inputs">
                  <div className="input-wrapper">
                    <div className={`input-group ${errors.customerName ? 'input-error' : ''}`}>
                      <User className="input-icon" size={20} />
                      <input type="text" placeholder="Full Name" className="glass-input" 
                        value={orderDetails.customerName} onChange={e => {setOrderDetails({...orderDetails, customerName: e.target.value}); setErrors({...errors, customerName: null})}} />
                    </div>
                    {errors.customerName && <span className="error-text">{errors.customerName}</span>}
                  </div>
                  <div className="input-wrapper">
                    <div className={`input-group ${errors.phone ? 'input-error' : ''}`}>
                      <Phone className="input-icon" size={20} />
                      <input type="tel" placeholder="Phone Number" className="glass-input" 
                        value={orderDetails.phone} onChange={e => {setOrderDetails({...orderDetails, phone: e.target.value}); setErrors({...errors, phone: null})}} />
                    </div>
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>
                </div>

                <div className="input-wrapper">
                  <div className={`input-group ${errors.date ? 'input-error' : ''}`}>
                    <Calendar className="input-icon" size={20} />
                    <input type="date" className="glass-input" 
                      value={orderDetails.date} onChange={e => {setOrderDetails({...orderDetails, date: e.target.value}); setErrors({...errors, date: null})}} />
                  </div>
                  {errors.date && <span className="error-text">{errors.date}</span>}
                </div>
                
                <div className="input-wrapper">
                  <div className={`input-group ${errors.location ? 'input-error' : ''}`}>
                    <MapPin className="input-icon" size={20} />
                    <select className="glass-input" value={orderDetails.location} onChange={e => {setOrderDetails({...orderDetails, location: e.target.value}); setErrors({...errors, location: null})}}>
                      <option value="" disabled>Select Location</option>
                      <option value="Mumbai">Mumbai, MH</option>
                      <option value="Delhi">New Delhi, DL</option>
                      <option value="Bangalore">Bangalore, KA</option>
                      <option value="Hyderabad">Hyderabad, TS</option>
                    </select>
                  </div>
                  {errors.location && <span className="error-text">{errors.location}</span>}
                </div>
                
                <div className="input-group">
                  <Calendar className="input-icon" size={20} />
                  <select className="glass-input" value={orderDetails.duration} onChange={e => setOrderDetails({...orderDetails, duration: e.target.value})}>
                    <option value="hourly">Hourly Rental</option>
                    <option value="daily">Daily Rental</option>
                    <option value="monthly">Monthly Subscription</option>
                  </select>
                </div>

                <div className="add-ons-container">
                  <h4 style={{ marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Premium Add-ons</h4>
                  <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '8px' }}>
                    <input type="checkbox" checked={orderDetails.chauffeur} onChange={e => setOrderDetails({...orderDetails, chauffeur: e.target.checked})} />
                    White-Glove Chauffeur (+₹5,000)
                  </label>
                  <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={orderDetails.insurance} onChange={e => setOrderDetails({...orderDetails, insurance: e.target.checked})} />
                    Elite Protection Insurance (+₹2,000)
                  </label>
                </div>
                
                {orderDetails.location && (
                  <motion.div className="input-wrapper" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <div className={`input-group ${errors.address ? 'input-error' : ''}`}>
                      <MapPin className="input-icon" size={20} style={{ alignSelf: 'flex-start', marginTop: '12px' }} />
                      <textarea 
                        placeholder="Detailed Delivery Address" 
                        className="glass-input" 
                        style={{ minHeight: '80px', resize: 'vertical' }}
                        value={orderDetails.address} 
                        onChange={e => {setOrderDetails({...orderDetails, address: e.target.value}); setErrors({...errors, address: null})}} 
                      />
                    </div>
                    {errors.address && <span className="error-text">{errors.address}</span>}
                  </motion.div>
                )}
                
                <div className="price-summary">
                  <p>Total Estimated Price</p>
                  <h3>{formatPrice(calculateTotal())} <span className="period">/ {orderDetails.duration === 'hourly' ? 'hour' : orderDetails.duration === 'monthly' ? 'month' : 'day'}</span></h3>
                </div>

                <button 
                  className="glass-button primary w-full mt-4"
                  disabled={isVerifying}
                  onClick={() => {
                    const newErrors = {};
                    if (!orderDetails.customerName) newErrors.customerName = 'Name is required';
                    if (!orderDetails.phone) newErrors.phone = 'Phone is required';
                    if (!orderDetails.date) newErrors.date = 'Date is required';
                    if (!orderDetails.location) newErrors.location = 'Location is required';
                    if (orderDetails.location && !orderDetails.address) newErrors.address = 'Detailed address is required';
                    
                    if (Object.keys(newErrors).length > 0) {
                      setErrors(newErrors);
                    } else {
                      setErrors({});
                      setIsVerifying(true);
                      setTimeout(() => {
                        setIsVerifying(false);
                        setStep(2);
                      }, 2000);
                    }
                  }}
                >
                  {isVerifying ? 'Verifying Identity...' : 'Continue to Payment'}
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div className="form-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                
                <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="radio" checked={!orderDetails.payLater} onChange={() => setOrderDetails({...orderDetails, payLater: false})} />
                    Pay Now
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '10px' }}>
                    <input type="radio" checked={orderDetails.payLater} onChange={() => setOrderDetails({...orderDetails, payLater: true})} />
                    Reserve Now, Pay Later
                  </label>
                </div>

                {!orderDetails.payLater && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <div className="input-wrapper" style={{ marginBottom: '1rem' }}>
                      <div className={`input-group ${errors.cardNumber ? 'input-error' : ''}`}>
                        <CreditCard className="input-icon" size={20} />
                        <input type="text" placeholder="Card Number" className="glass-input" 
                          value={paymentDetails.cardNumber} onChange={e => {setPaymentDetails({...paymentDetails, cardNumber: e.target.value}); setErrors({...errors, cardNumber: null})}} />
                      </div>
                      {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                    </div>
                    <div className="split-inputs">
                      <div className="input-wrapper">
                        <div className={`input-group ${errors.expiry ? 'input-error' : ''}`}>
                          <input type="text" placeholder="MM/YY" className="glass-input" 
                            value={paymentDetails.expiry} onChange={e => {setPaymentDetails({...paymentDetails, expiry: e.target.value}); setErrors({...errors, expiry: null})}} />
                        </div>
                        {errors.expiry && <span className="error-text">{errors.expiry}</span>}
                      </div>
                      <div className="input-wrapper">
                        <div className={`input-group ${errors.cvc ? 'input-error' : ''}`}>
                          <input type="text" placeholder="CVC" className="glass-input" 
                            value={paymentDetails.cvc} onChange={e => {setPaymentDetails({...paymentDetails, cvc: e.target.value}); setErrors({...errors, cvc: null})}} />
                        </div>
                        {errors.cvc && <span className="error-text">{errors.cvc}</span>}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div className="modal-actions" style={{ marginTop: '2rem' }}>
                  <button className="glass-button" onClick={() => setStep(1)}>Back</button>
                  <button className="glass-button primary" onClick={handleBookingComplete}>Authorize & Book</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div className="form-step success-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="success-icon">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    ✨
                  </motion.div>
                </div>
                <h3>Reservation Confirmed</h3>
                <p>Your {car.model} is ready for you in {orderDetails.location}.</p>
                <button className="glass-button w-full mt-4" onClick={handleClose}>
                  Return to Dashboard
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingModal;
