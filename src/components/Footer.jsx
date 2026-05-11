import React from 'react';
import { motion } from 'framer-motion';
import { Car, Mail, Phone, MapPin, Globe, MessageCircle } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section glass-panel" id="about">
      <div className="footer-content container">
        <div className="footer-brand">
          <div className="footer-logo">
            <Car size={32} color="var(--accent-gold)" />
            <h2 className="text-gradient-gold">EXTRAORDINARY</h2>
          </div>
          <p className="footer-description">
            Experience the pinnacle of automotive engineering. 
            Exclusive access to the world's most luxurious fleet across major Indian cities.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon"><Globe size={20} /></a>
            <a href="#" className="social-icon"><MessageCircle size={20} /></a>
          </div>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#fleet">Our Fleet</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Membership feature is coming soon!'); }}>Memberships</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#">Terms & Conditions</a></li>
          </ul>
        </div>

        <div className="footer-contact" id="locations">
          <h3>Contact Us</h3>
          <ul>
            <li>
              <Phone size={16} />
              <span>Customer Care: +91 1800-123-4567</span>
            </li>
            <li>
              <Mail size={16} />
              <span>support@extraordinary.in</span>
            </li>
            <li>
              <MapPin size={16} />
              <span>Headquarters: Bandra Kurla Complex, Mumbai, MH</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Extraordinary Luxury Rentals. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
