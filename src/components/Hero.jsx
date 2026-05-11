import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { ChevronRight } from 'lucide-react';
import './Hero.css';

const AnimatedSphere = () => {
  const sphereRef = useRef();

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 100, 200]} scale={2.5}>
      <MeshDistortMaterial
        color="#101010"
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
};

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-canvas-container">
        <Canvas>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="city" />
          <AnimatedSphere />
        </Canvas>
      </div>
      
      <div className="hero-content container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h2 className="hero-subtitle">BEYOND DRIVING</h2>
          <h1 className="hero-title">
            DRIVE THE <br />
            <span className="text-gradient-gold">EXTRAORDINARY</span>
          </h1>
          <p className="hero-description">
            Experience the pinnacle of automotive engineering. 
            Exclusive access to the world's most luxurious fleet.
          </p>
          
          <div className="hero-actions">
            <button 
              className="glass-button primary hero-btn"
              onClick={() => document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Fleet <ChevronRight size={18} />
            </button>
            <button 
              className="glass-button hero-btn outline"
              onClick={() => alert('Membership feature is coming soon!')}
            >
              View Memberships
            </button>
          </div>
        </motion.div>
      </div>

      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
