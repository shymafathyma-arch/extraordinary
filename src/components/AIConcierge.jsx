import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Map, Calendar, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AIConcierge.css';

const AIConcierge = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: `Greetings, ${currentUser?.displayName || 'distinguished guest'}. I am your personal AI Concierge. How may I elevate your experience today?` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessages = [...messages, { id: Date.now(), role: 'user', text: inputValue }];
    setMessages(newMessages);
    setInputValue('');

    // Simulated AI Response
    setTimeout(() => {
      let aiResponse = "I'll coordinate that for you immediately. Is there anything else you require?";
      
      const lowerInput = inputValue.toLowerCase();
      if (lowerInput.includes('chauffeur')) {
        aiResponse = "Excellent choice. I've noted your interest in our white-glove chauffeur service. Our elite drivers are trained in absolute discretion and precision.";
      } else if (lowerInput.includes('wedding')) {
        aiResponse = "Congratulations on the occasion. For weddings, I recommend our Rolls-Royce Phantom or a convoy of Mercedes S-Class vehicles. Shall I prepare a custom proposal?";
      } else if (lowerInput.includes('itinerary')) {
        aiResponse = "I can certainly plan a scenic drive for you. Would you prefer a mountain pass or a coastal route?";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: aiResponse }]);
    }, 1000);
  };

  const quickActions = [
    { icon: <Map size={14} />, label: 'Plan Scenic Route' },
    { icon: <Calendar size={14} />, label: 'Schedule Airport Pickup' },
    { icon: <ShieldCheck size={14} />, label: 'Upgrade Insurance' }
  ];

  return (
    <>
      <button 
        className="ai-concierge-trigger glass-panel" 
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Concierge"
      >
        <Sparkles size={24} className="text-gradient-gold" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="ai-concierge-chat glass-panel"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <div className="chat-header">
              <div className="header-info">
                <Sparkles size={20} className="text-gradient-gold" />
                <div>
                  <h4>AI CONCIERGE</h4>
                  <span className="status">Online • 24/7 Priority</span>
                </div>
              </div>
              <button className="close-chat" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="chat-messages" ref={scrollRef}>
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  <div className="message-bubble">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-footer">
              <div className="quick-actions">
                {quickActions.map((action, i) => (
                  <button key={i} className="action-btn" onClick={() => {
                    setInputValue(action.label);
                  }}>
                    {action.icon} {action.label}
                  </button>
                ))}
              </div>
              <div className="input-area">
                <input 
                  type="text" 
                  placeholder="Ask your concierge..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="send-btn" onClick={handleSend}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIConcierge;
