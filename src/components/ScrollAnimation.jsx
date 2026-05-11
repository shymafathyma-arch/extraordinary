import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import './ScrollAnimation.css';

const FRAME_COUNT = 240;
const PRELOAD_BATCH = 20;

const ScrollAnimation = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Use Framer Motion's useScroll to track scroll progress within this container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Apply spring physics for ultra-smooth scrubbing
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001
  });

  // Preload images
  useEffect(() => {
    const loadedImages = [];
    let loadedCount = 0;

    const loadBatch = (startIdx) => {
      for (let i = startIdx; i < Math.min(startIdx + PRELOAD_BATCH, FRAME_COUNT); i++) {
        const img = new Image();
        // The images are named ezgif-frame-001.jpg to ezgif-frame-240.jpg
        const paddedIndex = (i + 1).toString().padStart(3, '0');
        // Vite requires dynamic assets in public folder or explicitly imported.
        // Since they are in src/animationcar, we can use new URL to get the path.
        // Or we can assume they are copied by Vite or we import them dynamically.
        // A standard Vite pattern for this is import.meta.glob but it's easier to use a static path if we move them to public.
        // Wait, they are in `src/animationcar`. We can construct the URL using Vite's URL feature:
        img.src = new URL(`../animationcar/ezgif-frame-${paddedIndex}.jpg`, import.meta.url).href;
        
        img.onload = () => {
          loadedCount++;
          if (loadedCount === FRAME_COUNT) {
            setImages(loadedImages);
            setLoaded(true);
          } else if (loadedCount % PRELOAD_BATCH === 0) {
            // Load next batch
            loadBatch(loadedCount);
          }
        };
        img.onerror = () => {
          // Fallback if image fails
          loadedCount++;
          if (loadedCount === FRAME_COUNT) {
            setImages(loadedImages);
            setLoaded(true);
          }
        };
        loadedImages[i] = img;
      }
    };

    loadBatch(0);
  }, []);

  // Update canvas when scroll changes
  useEffect(() => {
    if (!loaded || !canvasRef.current || images.length === 0) return;

    const context = canvasRef.current.getContext('2d');
    const canvas = canvasRef.current;

    // Draw initial frame
    const drawImage = (img) => {
      if (!img) return;
      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;
      // Calculate aspect ratio to fit cover
      const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
      const x = (canvasWidth / 2) - (img.width / 2) * scale;
      const y = (canvasHeight / 2) - (img.height / 2) * scale;
      
      // Enhance image drawing quality
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.drawImage(img, x, y, img.width * scale, img.height * scale);
    };

    drawImage(images[0]);

    // Subscribe to scroll updates using the smoothed progress
    const unsubscribe = smoothProgress.on("change", (v) => {
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.floor(v * FRAME_COUNT)
      );
      if (images[frameIndex]) {
        // Request animation frame for smooth drawing
        requestAnimationFrame(() => drawImage(images[frameIndex]));
      }
    });

    return () => unsubscribe();
  }, [smoothProgress, loaded, images]);

  // Handle window resize for canvas
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        
        // Redraw current frame if available
        if (images.length > 0) {
          const currentProgress = scrollYProgress.get();
          const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(currentProgress * FRAME_COUNT));
          if (images[frameIndex]) {
            const img = images[frameIndex];
            const canvasWidth = window.innerWidth;
            const canvasHeight = window.innerHeight;
            const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
            const x = (canvasWidth / 2) - (img.width / 2) * scale;
            const y = (canvasHeight / 2) - (img.height / 2) * scale;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          }
        }
      }
    };
    handleResize(); // initial set
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [images, smoothProgress]);

  // Text animations setup using the smoothed progress
  // Feature 1: 10% to 30% scroll
  const opacity1 = useTransform(smoothProgress, [0.05, 0.1, 0.25, 0.3], [0, 1, 1, 0]);
  const y1 = useTransform(smoothProgress, [0.05, 0.1, 0.25, 0.3], [50, 0, 0, -50]);

  // Feature 2: 40% to 60% scroll
  const opacity2 = useTransform(smoothProgress, [0.35, 0.4, 0.55, 0.6], [0, 1, 1, 0]);
  const y2 = useTransform(smoothProgress, [0.35, 0.4, 0.55, 0.6], [50, 0, 0, -50]);

  // Feature 3: 70% to 90% scroll
  const opacity3 = useTransform(smoothProgress, [0.65, 0.7, 0.85, 0.9], [0, 1, 1, 0]);
  const y3 = useTransform(smoothProgress, [0.65, 0.7, 0.85, 0.9], [50, 0, 0, -50]);

  return (
    <div ref={containerRef} className="scroll-container">
      <div className="sticky-canvas-container">
        {!loaded && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading Visuals...</p>
          </div>
        )}
        <canvas ref={canvasRef} className="scroll-canvas" />
        
        {/* Overlay Texts */}
        <div className="features-overlay">
          {/* Feature 1 - Left Side */}
          <motion.div 
            className="feature-text feature-left"
            style={{ opacity: opacity1, y: y1 }}
          >
            <h3 className="text-gradient-gold">UNPARALLELED COMFORT</h3>
            <p>Hand-crafted leather interiors that redefine the meaning of luxury seating. Every stitch tells a story of absolute perfection.</p>
          </motion.div>

          {/* Feature 2 - Right Side */}
          <motion.div 
            className="feature-text feature-right"
            style={{ opacity: opacity2, y: y2 }}
          >
            <h3 className="text-gradient-gold">V12 ENGINE POWER</h3>
            <p>Feel the raw, unbridled power of a masterfully engineered V12 engine. Silent when cruising, roaring when commanded.</p>
          </motion.div>

          {/* Feature 3 - Left Side */}
          <motion.div 
            className="feature-text feature-left"
            style={{ opacity: opacity3, y: y3 }}
          >
            <h3 className="text-gradient-gold">AERODYNAMIC EXCELLENCE</h3>
            <p>Sculpted by the wind. Every curve is designed to cut through the air with minimal resistance and maximum stability.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ScrollAnimation;
