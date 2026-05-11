import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Zap, Settings, Shield, Heart, Search, ArrowUpDown, Flame, Clock, Sparkles, Lock } from 'lucide-react';
import BookingModal from './BookingModal';

import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import './CarGrid.css';

const CATEGORIES = ['All', 'Luxury', 'Sports', 'SUV'];

const CarGrid = () => {
  const { cars, wishlist, toggleWishlist, formatPrice } = useData();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('none');
  const [selectedCar, setSelectedCar] = useState(null);


  const isLocked = (car) => {
    if (!car.isExclusive) return false;
    if (!currentUser) return true;
    if (currentUser.role === 'admin') return false;
    return car.requiredTier === 'Black' && currentUser.tier !== 'Black';
  };

  const getUrgencyBadge = (carId) => {
    const badges = [
      { text: 'High Demand', icon: <Flame size={12} />, class: 'urgency-high' },
      { text: 'Recently Booked', icon: <Clock size={12} />, class: 'urgency-recent' },
      { text: 'Elite Choice', icon: <Sparkles size={12} />, class: 'urgency-elite' }
    ];
    // Deterministic random-ish choice based on carId
    return badges[carId % badges.length];
  };

  const filteredCars = cars
    .filter(car => filter === 'All' || car.type === filter)
    .filter(car => 
      car.brand.toLowerCase().includes(search.toLowerCase()) || 
      car.model.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'perf') return parseFloat(a.specs.acceleration) - parseFloat(b.specs.acceleration);
      return 0;
    });

  return (
    <section className="catalog-section" id="fleet">
      <div className="catalog-header">
        <div>
          <h2 className="section-subtitle">THE COLLECTION</h2>
          <h3 className="section-title">Select Your Vehicle</h3>
        </div>
        
        <div className="filters-container">
          <div className="search-bar glass-panel">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by brand or model..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filters-group">
            <div className="filters glass-panel">
              <Filter size={18} className="filter-icon" />
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  className={`filter-btn ${filter === cat ? 'active' : ''}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="sort-box glass-panel">
              <ArrowUpDown size={18} className="filter-icon" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="none">Sort By</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="perf">Performance (0-100)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        layout 
        className="car-grid"
      >
        <AnimatePresence>
          {filteredCars.map((car, index) => (
            <motion.div
              key={car.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="car-card glass-panel"
            >
              <div className="car-image-container">
                <img src={car.image} alt={car.model} className="car-image" />
                <div className="urgency-badge-wrapper">
                  {getUrgencyBadge(car.id).icon}
                  <span className={`urgency-badge ${getUrgencyBadge(car.id).class}`}>{getUrgencyBadge(car.id).text}</span>
                </div>
                <div className="car-price">
                  <span className="amount">{formatPrice(car.price)}</span>
                  <span className="period">/day</span>
                </div>
                <button 
                  className={`wishlist-toggle ${wishlist.includes(car.id) ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(car.id); }}
                >
                  <Heart size={20} fill={wishlist.includes(car.id) ? "var(--accent-gold)" : "none"} />
                </button>
              </div>
              
              <div className="car-details">
                <div className="car-brand">{car.brand}</div>
                <h4 className="car-model">{car.model}</h4>
                
                <div className="car-specs">
                  <div className="spec-item">
                    <Zap size={16} />
                    <span>{car.specs.power}</span>
                  </div>
                  <div className="spec-item">
                    <Settings size={16} />
                    <span>{car.specs.topSpeed}</span>
                  </div>
                  <div className="spec-item">
                    <Shield size={16} />
                    <span>{car.specs.acceleration}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="glass-button primary w-full"
                    onClick={() => {
                      if (isLocked(car)) {
                        alert('This vehicle is exclusive to Black Tier members.');
                      } else {
                        setSelectedCar(car);
                      }
                    }}
                    disabled={isLocked(car)}
                  >
                    {isLocked(car) ? <><Lock size={16} /> Locked</> : 'Book Now'}
                  </button>

                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {selectedCar && (
        <BookingModal 
          car={selectedCar} 
          isOpen={!!selectedCar} 
          onClose={() => setSelectedCar(null)} 
        />
      )}

    </section>
  );
};

export default CarGrid;
