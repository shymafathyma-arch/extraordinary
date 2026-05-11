import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Package, Car, Plus, Edit, Trash, Check, Users, BarChart3, TrendingUp, DollarSign, Crown, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import './AdminPage.css';

const AdminPage = () => {
  const { cars, addCar, updateCar, deleteCar, orders, formatPrice } = useData();
  const { currentUser, logout, getUsers, deleteUser } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [users, setUsers] = useState([]);
  
  // State for Car Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
    brand: '', model: '', year: '2024', price: '', type: 'Luxury', image: '',
    isExclusive: false,
    requiredTier: 'VIP',
    specs: { power: '', topSpeed: '', acceleration: '' }
  });

  const handleOpenForm = (car = null) => {
    if (car) {
      setEditingCar(car);
      setFormData({ 
        ...car,
        year: car.year || '2024',
        isExclusive: car.isExclusive || false,
        requiredTier: car.requiredTier || 'VIP'
      });
    } else {
      setEditingCar(null);
      setFormData({
        brand: '', model: '', year: '2024', price: '', type: 'Luxury', image: '',
        isExclusive: false,
        requiredTier: 'VIP',
        specs: { power: '', topSpeed: '', acceleration: '' }
      });
    }
    setIsFormOpen(true);
  };

  const handleSaveCar = (e) => {
    e.preventDefault();
    if (editingCar) {
      updateCar(editingCar.id, formData);
    } else {
      addCar(formData);
    }
    setIsFormOpen(false);
  };

  const handleRevokeAccess = (uid) => {
    if (uid === currentUser.uid) {
      alert("You cannot revoke your own access.");
      return;
    }
    if (window.confirm("Are you sure you want to revoke access for this user?")) {
      deleteUser(uid).then(() => {
        fetchUsers();
      });
    }
  };

  const fetchUsers = async () => {
    if (activeTab === 'users') {
      const data = await getUsers();
      setUsers(data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-logo text-gradient-gold">
          EXTRAORDINARY <br/>
          <span className="admin-badge">Management Suite</span>
        </div>
        
        <nav className="admin-nav">
          <button className={`admin-nav-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            <Package size={20} /> <span>Bookings</span>
          </button>
          <button className={`admin-nav-btn ${activeTab === 'fleet' ? 'active' : ''}`} onClick={() => setActiveTab('fleet')}>
            <Car size={20} /> <span>Fleet</span>
          </button>
          <button className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={20} /> <span>Users</span>
          </button>
          <button className={`admin-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <BarChart3 size={20} /> <span>Analytics</span>
          </button>
        </nav>

        <button onClick={logout} className="admin-logout">
          <LogOut size={20} /> <span>Sign Out</span>
        </button>
      </aside>

      <main className="admin-main">
        <AnimatePresence mode="wait">
          {activeTab === 'bookings' && (
            <motion.div key="bookings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="admin-header">
                <h2>Live Bookings</h2>
              </div>
              
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Client</th>
                      <th>Fleet Item</th>
                      <th>Location</th>
                      <th>Schedule</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan="6" className="text-center">System idle. No active bookings.</td></tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id}>
                          <td className="text-secondary">#{order.id.slice(0, 6).toUpperCase()}</td>
                          <td>
                            <div className="user-cell">
                              <span className="user-name">{order.customerName}</span>
                              <span className="user-meta">{order.phone}</span>
                            </div>
                          </td>
                          <td>{order.carModel}</td>
                          <td><div className="flex items-center gap-2"><MapPin size={14} className="text-blue-400"/> {order.location}</div></td>
                          <td>{order.date}</td>
                          <td><span className="status-badge success">{order.status}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'fleet' && (
            <motion.div key="fleet" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="admin-header">
                <h2>Fleet Assets</h2>
                <button className="glass-button primary" onClick={() => handleOpenForm()}>
                  <Plus size={18} /> Add Asset
                </button>
              </div>

              <div className="fleet-grid">
                {(cars || []).map(car => {
                  const carModelName = `${car?.brand || ''} ${car?.model || ''}`.trim();
                  const carBookings = (orders || []).filter(o => o && (o.carModel === carModelName || o.carId === car?.id));
                  const isBooked = carBookings.some(o => o.status === 'Confirmed');
                  
                  return (
                    <div key={car?.id} className="fleet-card">
                      <div className="fleet-img-container">
                        <img src={car?.image} alt={car?.model} className="fleet-img" />
                        {car.isExclusive && <div className="exclusive-ribbon">EXCLUSIVE</div>}
                        <div className={`availability-badge ${isBooked ? 'booked' : 'available'}`}>
                          {isBooked ? 'Active' : 'Ready'}
                        </div>
                        <div className="tier-requirement-badge">
                          <Crown size={12} className="text-gold" /> {car.requiredTier || 'VIP'}
                        </div>
                      </div>
                      <div className="fleet-details">
                        <div className="fleet-header">
                          <h4>{car?.brand} {car?.model} <span className="text-secondary ml-1">{car.year}</span></h4>
                          <span className="booking-count-badge">
                            {carBookings.length} Trips
                          </span>
                        </div>
                        <p className="fleet-price">{formatPrice(car?.price || 0)} / day</p>
                        <div className="fleet-actions">
                          <button className="icon-btn edit" onClick={() => handleOpenForm(car)}><Edit size={16}/></button>
                          <button className="icon-btn delete" onClick={() => deleteCar(car?.id)}><Trash size={16}/></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="admin-header">
                <h2>User Directory</h2>
              </div>
              
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Identity</th>
                      <th>Privileges</th>
                      <th>Membership Tier</th>
                      <th>Management</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.uid}>
                        <td>
                          <div className="user-cell">
                            <span className="user-name">{user.displayName}</span>
                            <span className="user-meta">{user.email}</span>
                          </div>
                        </td>
                        <td><span className={`status-badge ${user.role === 'admin' ? 'warning' : ''}`}>{user.role.toUpperCase()}</span></td>
                        <td><span className={`tier-badge tier-${user.tier?.toLowerCase()}`}>{user.tier}</span></td>
                        <td>
                          <button className="icon-btn delete" onClick={() => handleRevokeAccess(user.uid)} disabled={user.uid === currentUser.uid}>
                            <Trash size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="admin-header">
                <h2>Performance Overview</h2>
              </div>

              <div className="analytics-grid">
                <div className="stat-card">
                  <div className="stat-header"><DollarSign size={20} className="text-gold" /> Total Revenue</div>
                  <h3>{formatPrice(orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? (o.totalPrice || o.price || 0) : 0), 0))}</h3>
                  <p className="trend positive"><TrendingUp size={14}/> +18% increase</p>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><Calendar size={20} className="text-neon" /> Utilization</div>
                  <h3>{orders.filter(o => o.status === 'Confirmed').length}</h3>
                  <p className="trend positive">High Demand</p>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><ShieldCheck size={20} className="text-blue" /> Elite Clients</div>
                  <h3>{users.filter(u => u.tier !== 'VIP').length}</h3>
                  <p className="trend">Across Premium Tiers</p>
                </div>
              </div>

              <div className="chart-box">
                <h3>Revenue Trajectory</h3>
                <div className="svg-chart-container">
                  <svg viewBox="0 0 800 200" className="revenue-chart">
                    <path d="M 0 160 C 100 150, 150 80, 200 100 S 300 40, 400 90 S 600 20, 800 60" fill="none" stroke="var(--accent-gold)" strokeWidth="4" />
                    <path d="M 0 160 C 100 150, 150 80, 200 100 S 300 40, 400 90 S 600 20, 800 60 V 200 H 0 Z" fill="url(#goldGradient)" opacity="0.1" />
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-gold)" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <motion.div className="modal-content glass-panel" onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h2>{editingCar ? 'Update Asset' : 'Register New Asset'}</h2>
            <form onSubmit={handleSaveCar} className="admin-form">
              <div className="split-inputs">
                <input required placeholder="Brand (e.g. Rolls-Royce)" className="glass-input" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                <input required placeholder="Model (e.g. Phantom)" className="glass-input" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
              </div>
              <div className="split-inputs">
                <input required placeholder="Year" className="glass-input" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                <input required type="number" placeholder="Daily Rate (INR)" className="glass-input" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
              </div>
              <div className="split-inputs">
                <select className="glass-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="Luxury">Luxury Sedan</option>
                  <option value="Sports">Hypercar / Sports</option>
                  <option value="SUV">Luxury SUV</option>
                </select>
                <select className="glass-input" value={formData.requiredTier} onChange={e => setFormData({...formData, requiredTier: e.target.value})}>
                  <option value="VIP">VIP Access</option>
                  <option value="Elite">Elite Members Only</option>
                  <option value="Black">Black Card Required</option>
                </select>
              </div>
              <input required placeholder="High-Res Image URL" className="glass-input" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              
              <label className="checkbox-group">
                <input type="checkbox" checked={formData.isExclusive} onChange={e => setFormData({...formData, isExclusive: e.target.checked})} />
                <span>Mark as Exclusive Portfolio Item</span>
              </label>

              <div className="modal-actions">
                <button type="button" className="glass-button" onClick={() => setIsFormOpen(false)}>Discard</button>
                <button type="submit" className="glass-button primary">Publish Asset</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
