import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import ReviewModal from '../components/ReviewModal';
import { Calendar, Award, TrendingUp, Sparkles, Map, ChevronRight, Heart, Car, Lock } from 'lucide-react';
import './ProfileDashboard.css';

const ProfileDashboard = () => {
  const { currentUser } = useAuth();
  const { cars, orders, wishlist, toggleWishlist, cancelOrder, formatPrice, getInsights, getOccasionSuggestions } = useData();
  const [synced, setSynced] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [reviewCar, setReviewCar] = useState(null);

  const isLocked = (car) => {
    if (!car.isExclusive) return false;
    if (!currentUser) return true;
    if (currentUser.role === 'admin') return false;
    return car.requiredTier === 'Black' && currentUser.tier !== 'Black';
  };

  const insights = getInsights(currentUser?.email);
  const userOrders = orders.filter(o => o.userEmail === currentUser?.email);

  const occasions = [
    { id: 'wedding', title: 'For Your Next Gala', icon: <Sparkles size={18} /> },
    { id: 'business', title: 'Executive Fleet', icon: <TrendingUp size={18} /> },
    { id: 'leisure', title: 'Weekend Getaways', icon: <Map size={18} /> }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="profile-page"
    >
      <Navbar />
      
      <main className="profile-container container">
        <div className="profile-header">
          <div>
            <h1 className="text-gradient-gold">Welcome back, {currentUser?.displayName}</h1>
            <p className="subtitle">Here is your personalized luxury hub.</p>
          </div>
          <div className="tier-display">
            <span className="tier-label">Current Tier</span>
            <span className={`tier-badge large tier-${currentUser?.tier?.toLowerCase() || 'vip'}`}>
              {currentUser?.tier || 'VIP'}
            </span>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Insights Panel */}
          <div className="dashboard-panel glass-panel">
            <h3><Award size={20} className="panel-icon" /> Your Insights</h3>
            <div className="insights-stats">
              <div className="stat-box">
                <span className="stat-value">{insights.totalTrips}</span>
                <span className="stat-label">Total Trips</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">₹ {(insights.totalSpent || 0).toLocaleString('en-IN')}</span>
                <span className="stat-label">Lifetime Value</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{insights.favoriteBrand}</span>
                <span className="stat-label">Top Brand</span>
              </div>
            </div>
          </div>

          {/* Tier Progress */}
          <div className="dashboard-panel glass-panel tier-progress-panel">
            <h3><TrendingUp size={20} className="panel-icon" /> Tier Progression</h3>
            <div className="progress-info">
              <span>{currentUser?.tier || 'VIP'} Member</span>
              <span>Next: {currentUser?.tier === 'Black' ? 'Max Tier' : currentUser?.tier === 'Elite' ? 'Black Tier' : 'Elite Tier'}</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.min(((insights.totalTrips % 10) / 10) * 100 || 10, 100)}%` }}
              ></div>
            </div>
            <p className="progress-status">
              {currentUser?.tier === 'Black' 
                ? "You've reached the pinnacle of luxury." 
                : `${10 - (insights.totalTrips % 10)} more trips to reach the next tier.`}
            </p>
          </div>

          {/* Smart Calendar Sync */}
          <div className="dashboard-panel glass-panel calendar-panel">
            <h3><Calendar size={20} className="panel-icon" /> Smart Calendar</h3>
            <p>Sync your calendar to get automatic car recommendations for your upcoming trips and events.</p>
            <button 
              className={`glass-button ${synced ? 'synced' : 'primary'}`}
              onClick={() => setSynced(true)}
            >
              {synced ? 'Calendar Synced Successfully' : 'Connect Apple/Google Calendar'}
            </button>
          </div>
        </div>

        {/* Elite Garage (Wishlist) */}
        <div className="garage-section dashboard-panel glass-panel">
          <div className="panel-header">
            <h3><Heart size={20} className="panel-icon" color="var(--accent-gold)" /> Your Elite Garage</h3>
            <span className="garage-count">{wishlist.length} Vehicles Saved</span>
          </div>
          
          <div className="garage-grid">
            {wishlist.length > 0 ? (
              cars.filter(c => wishlist.includes(c.id)).map(car => (
                <div key={car.id} className="garage-card glass-panel">
                  <div className="garage-img-wrapper">
                    <img src={car.image} alt={car.model} />
                    <button className="remove-garage" onClick={() => toggleWishlist(car.id)} title="Remove from Garage">
                      <Heart size={16} fill="currentColor" />
                    </button>
                  </div>
                  <div className="garage-info">
                    <h4>{car.brand}</h4>
                    <p>{car.model}</p>
                    <div className="garage-footer">
                      <span className="price">{formatPrice(car.price)}</span>
                      <button 
                        className="book-mini-btn" 
                        onClick={() => !isLocked(car) && setSelectedCar(car)}
                        disabled={isLocked(car)}
                      >
                        {isLocked(car) ? 'Locked' : 'Reserve'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-garage">
                <Car size={40} className="empty-icon" />
                <p>Your garage is empty. Discover and save your next dream ride from the fleet.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="recommendations-section">
          <h2 className="section-title">AI-Powered Suggestions</h2>
          <p className="section-subtitle">Curated specifically for your preferences and upcoming events.</p>
          
          {occasions.map(occasion => {
            const suggestedCars = getOccasionSuggestions(occasion.id);
            if (suggestedCars.length === 0) return null;
            
            return (
              <div key={occasion.id} className="occasion-row">
                <h4 className="occasion-title">{occasion.icon} {occasion.title}</h4>
                <div className="suggested-cars-scroll">
                  {suggestedCars.map(car => (
                    <div key={car.id} className="suggested-car-card glass-panel">
                      <img src={car.image} alt={car.model} />
                      <div className="suggested-info">
                        <h5>{car.brand} {car.model}</h5>
                        <p>{formatPrice(car.price)} / day</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trip History */}
        <div className="history-section dashboard-panel glass-panel">
          <h3>Recent Itineraries</h3>
          {userOrders.length > 0 ? (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.carModel}</td>
                    <td>{order.location}</td>
                    <td>{order.date}</td>
                    <td><span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                    <td>
                      <div className="action-stack">
                        {order.status === 'Confirmed' && (
                          <button 
                            className="cancel-mini-btn"
                            onClick={() => window.confirm('Cancel this reservation?') && cancelOrder(order.id)}
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          className="review-mini-btn"
                          onClick={() => setReviewCar({ id: order.carId, model: order.carModel })}
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-history">You haven't booked any vehicles yet. Explore our fleet to begin your journey.</p>
          )}
        </div>
      </main>

      {selectedCar && (
        <BookingModal 
          car={selectedCar} 
          isOpen={!!selectedCar} 
          onClose={() => setSelectedCar(null)} 
        />
      )}

      {reviewCar && (
        <ReviewModal
          carId={reviewCar.id}
          carModel={reviewCar.model}
          isOpen={!!reviewCar}
          onClose={() => setReviewCar(null)}
        />
      )}

      <Footer />
    </motion.div>
  );
};

export default ProfileDashboard;
