import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { ChevronLeft, Zap, Settings, Shield, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './ComparisonPage.css';

const ComparisonPage = () => {
  const { cars, formatPrice } = useData();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([null, null]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickingSlot, setPickingSlot] = useState(null);

  const selectedCars = selectedIds.map(id => id ? cars.find(c => c.id === id) : null);

  const handlePickCar = (carId) => {
    const newSelected = [...selectedIds];
    if (pickingSlot !== null) {
      newSelected[pickingSlot] = carId;
    }
    setSelectedIds(newSelected);
    setIsPickerOpen(false);
    setPickingSlot(null);
  };

  const removeCar = (index) => {
    const newSelected = [...selectedIds];
    newSelected[index] = null;
    setSelectedIds(newSelected);
  };

  const SpecRow = ({ label, icon, val1, val2, unit = "" }) => (
    <div className="spec-row">
      <div className="spec-val val-left">{val1}{unit}</div>
      <div className="spec-label">
        {icon}
        <span>{label}</span>
      </div>
      <div className="spec-val val-right">{val2}{unit}</div>
    </div>
  );

  return (
    <div className="comparison-page">
      <Navbar />
      
      <main className="container comparison-container">
        <header className="comparison-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={20} /> Back
          </button>
          <h1 className="text-gradient-gold">Vehicle Comparison</h1>
          <p className="subtitle">Compare the world's most extraordinary performance specs.</p>
        </header>

        <div className="comparison-slots">
          {[0, 1].map(index => {
            const car = selectedCars[index];
            return (
              <div key={index} className={`comparison-slot glass-panel ${!car ? 'empty' : ''}`}>
                {car ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <button className="remove-slot" onClick={() => removeCar(index)}><X size={16} /></button>
                    <img src={car.image} alt={car.model} className="slot-img" />
                    <div className="slot-info">
                      <h3>{car.brand}</h3>
                      <h4>{car.model}</h4>
                    </div>
                  </motion.div>
                ) : (
                  <button className="add-car-btn" onClick={() => { setIsPickerOpen(true); setPickingSlot(index); }}>
                    <Plus size={32} />
                    <span>Select Vehicle</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {selectedCars[0] && selectedCars[1] && (
          <motion.div 
            className="comparison-details glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SpecRow 
              label="Power" 
              icon={<Zap size={18} />} 
              val1={selectedCars[0].specs.power} 
              val2={selectedCars[1].specs.power} 
            />
            <SpecRow 
              label="Top Speed" 
              icon={<Settings size={18} />} 
              val1={selectedCars[0].specs.topSpeed} 
              val2={selectedCars[1].specs.topSpeed} 
            />
            <SpecRow 
              label="0-100 km/h" 
              icon={<Shield size={18} />} 
              val1={selectedCars[0].specs.acceleration} 
              val2={selectedCars[1].specs.acceleration} 
            />
            <SpecRow 
              label="Daily Rate" 
              icon={<span>₹</span>} 
              val1={formatPrice(selectedCars[0].price)} 
              val2={formatPrice(selectedCars[1].price)} 
            />
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {isPickerOpen && (
          <div className="picker-overlay">
            <motion.div 
              className="picker-modal glass-panel"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <div className="picker-header">
                <h3>Select Vehicle</h3>
                <button onClick={() => setIsPickerOpen(false)}><X size={20} /></button>
              </div>
              <div className="picker-grid">
                {cars.map(car => (
                  <div 
                    key={car.id} 
                    className={`picker-card ${selectedIds.includes(car.id) ? 'disabled' : ''}`}
                    onClick={() => !selectedIds.includes(car.id) && handlePickCar(car.id)}
                  >
                    <img src={car.image} alt={car.model} />
                    <div className="picker-info">
                      <p>{car.brand}</p>
                      <strong>{car.model}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ComparisonPage;
