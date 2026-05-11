import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, Package, Car, Plus, Edit, Trash, Check, Users, BarChart3, TrendingUp, DollarSign } from 'lucide-react';
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
    brand: '', model: '', price: '', type: 'Luxury', image: '',
    specs: { power: '', topSpeed: '', acceleration: '' }
  });

  const handleOpenForm = (car = null) => {
    if (car) {
      setEditingCar(car);
      setFormData({ ...car });
    } else {
      setEditingCar(null);
      setFormData({
        brand: '', model: '', price: '', type: 'Luxury', image: '',
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

  // Sync users when tab changes
  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  return (
    <div className="admin-container">
      <aside className="admin-sidebar glass-panel">
        <div className="admin-logo text-gradient-gold">EXTRAORDINARY <br/><span className="admin-badge">ADMIN</span></div>
        
        <nav className="admin-nav">
          <button 
            className={`admin-nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Package size={20} /> Bookings
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'fleet' ? 'active' : ''}`}
            onClick={() => setActiveTab('fleet')}
          >
            <Car size={20} /> Fleet Management
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} /> User Management
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={20} /> Analytics
          </button>
        </nav>

        <button onClick={logout} className="logout-btn admin-logout">
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      <main className="admin-main">
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="admin-header">
              <h2>Confirmed Bookings</h2>
            </div>
            
            <div className="table-container glass-panel">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Car</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="7" className="text-center">No bookings yet.</td></tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id.slice(0, 8).toUpperCase()}</td>
                        <td>{order.customerName}</td>
                        <td>{order.phone}</td>
                        <td>{order.carModel}</td>
                        <td><span className="location-badge">{order.location}</span></td>
                        <td>{order.date}</td>
                        <td><span className="status-badge success"><Check size={14}/> {order.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'fleet' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="admin-header">
              <h2>Fleet Management</h2>
              <button className="glass-button primary" onClick={() => handleOpenForm()}>
                <Plus size={18} /> Add New Car
              </button>
            </div>

            <div className="fleet-grid">
              {(cars || []).map(car => {
                const carModelName = `${car?.brand || ''} ${car?.model || ''}`.trim();
                const carBookings = (orders || []).filter(o => o && (o.carModel === carModelName || o.carId === car?.id));
                const isBooked = carBookings.some(o => o.status === 'Confirmed');
                
                return (
                  <div key={car?.id || Math.random()} className="fleet-card glass-panel">
                    <div className="fleet-img-container">
                      <img src={car?.image} alt={car?.model} className="fleet-img" />
                      <div className={`availability-badge ${isBooked ? 'booked' : 'available'}`}>
                        {isBooked ? 'Currently Booked' : 'Available'}
                      </div>
                    </div>
                    <div className="fleet-details">
                      <div className="fleet-header">
                        <h4>{car?.brand} {car?.model}</h4>
                        <span className="booking-count-badge" title="Total Bookings">
                          <Package size={12} /> {carBookings.length}
                        </span>
                      </div>
                      <p className="fleet-price">₹ {(car?.price || 0).toLocaleString('en-IN')} / day</p>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="admin-header">
              <h2>User Management</h2>
            </div>
            
            <div className="table-container glass-panel">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Display Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Tier</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="5" className="text-center">No users found.</td></tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.uid}>
                        <td>{user.displayName}</td>
                        <td>{user.email}</td>
                        <td><span className={`status-badge ${user.role === 'admin' ? 'warning' : ''}`}>{user.role.toUpperCase()}</span></td>
                        <td><span className={`tier-badge tier-${user.tier?.toLowerCase()}`}>{user.tier}</span></td>
                        <td>
                          <button 
                            className="icon-btn delete" 
                            title="Revoke Access"
                            onClick={() => handleRevokeAccess(user.uid)}
                            disabled={user.uid === currentUser.uid}
                          >
                            <Trash size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="admin-header">
              <h2>Performance Analytics</h2>
            </div>

            <div className="analytics-grid">
              <div className="stat-card glass-panel">
                <div className="stat-header">
                  <DollarSign size={24} color="var(--accent-gold)" />
                  <span>Total Revenue</span>
                </div>
                <h3>{formatPrice(orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? (o.price || 0) : 0), 0))}</h3>
                <p className="trend positive">+12% from last month</p>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-header">
                  <TrendingUp size={24} color="var(--accent-neon)" />
                  <span>Active Bookings</span>
                </div>
                <h3>{orders.filter(o => o.status === 'Confirmed').length}</h3>
                <p className="trend positive">+5 today</p>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-header">
                  <Users size={24} color="var(--accent-blue)" />
                  <span>Elite Members</span>
                </div>
                <h3>{users.length}</h3>
                <p className="trend">Across 3 tiers</p>
              </div>
            </div>

            <div className="charts-container">
              <div className="chart-box glass-panel">
                <h3>Revenue Overview</h3>
                <div className="svg-chart-container">
                  <svg viewBox="0 0 400 150" className="revenue-chart">
                    <path 
                      d="M 0 120 Q 50 110 100 80 T 200 40 T 300 90 T 400 30" 
                      fill="none" 
                      stroke="var(--accent-gold)" 
                      strokeWidth="3"
                    />
                    <path 
                      d="M 0 120 Q 50 110 100 80 T 200 40 T 300 90 T 400 30 V 150 H 0 Z" 
                      fill="url(#chartGradient)" 
                      opacity="0.2"
                    />
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-gold)" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Car Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <motion.div className="modal-content glass-panel" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <h2>{editingCar ? 'Edit Car' : 'Add New Car'}</h2>
            <form onSubmit={handleSaveCar} className="admin-form">
              <div className="split-inputs">
                <input required type="text" placeholder="Brand" className="glass-input" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                <input required type="text" placeholder="Model" className="glass-input" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
              </div>
              <div className="split-inputs">
                <input required type="number" placeholder="Price (INR)" className="glass-input" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                <select className="glass-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="Luxury">Luxury</option>
                  <option value="Sports">Sports</option>
                  <option value="SUV">SUV</option>
                </select>
              </div>
              <input required type="text" placeholder="Image URL" className="glass-input" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              
              <h4 className="mt-4">Specifications</h4>
              <div className="split-inputs">
                <input required type="text" placeholder="Power (e.g. 500 hp)" className="glass-input" value={formData.specs.power} onChange={e => setFormData({...formData, specs: {...formData.specs, power: e.target.value}})} />
                <input required type="text" placeholder="Top Speed" className="glass-input" value={formData.specs.topSpeed} onChange={e => setFormData({...formData, specs: {...formData.specs, topSpeed: e.target.value}})} />
                <input required type="text" placeholder="0-100 km/h" className="glass-input" value={formData.specs.acceleration} onChange={e => setFormData({...formData, specs: {...formData.specs, acceleration: e.target.value}})} />
              </div>

              <div className="modal-actions">
                <button type="button" className="glass-button" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="glass-button primary">Save Car</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
