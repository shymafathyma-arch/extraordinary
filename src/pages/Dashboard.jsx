import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import ScrollAnimation from '../components/ScrollAnimation';
import Navbar from '../components/Navbar';
import CarGrid from '../components/CarGrid';
import Footer from '../components/Footer';

const Dashboard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="dashboard-container"
    >
      <Navbar />
      <Hero />
      <ScrollAnimation />
      <main className="container">
        <CarGrid />
      </main>
      <Footer />
    </motion.div>
  );
};

export default Dashboard;
