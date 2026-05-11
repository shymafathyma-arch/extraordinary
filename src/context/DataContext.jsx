import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

const INITIAL_CARS = [
  {
    id: 1,
    brand: 'Rolls-Royce',
    model: 'Phantom Series VIII',
    year: '2024',
    price: 95000,
    image: 'https://images.unsplash.com/photo-1631405051614-2ec55de5b2c9?auto=format&fit=crop&q=80',
    type: 'Luxury Sedan',
    specs: { power: '563 hp', topSpeed: '250 km/h', acceleration: '5.3s' },
    isExclusive: true,
    requiredTier: 'Elite'
  },
  {
    id: 2,
    brand: 'Lamborghini',
    model: 'Revuelto',
    year: '2024',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80',
    type: 'Hypercar',
    specs: { power: '1001 hp', topSpeed: '350 km/h', acceleration: '2.5s' },
    isExclusive: true,
    requiredTier: 'Black'
  },
  {
    id: 3,
    brand: 'Bentley',
    model: 'Continental GT',
    year: '2023',
    price: 75000,
    image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&q=80',
    type: 'Grand Tourer',
    specs: { power: '650 hp', topSpeed: '335 km/h', acceleration: '3.6s' }
  },
  {
    id: 4,
    brand: 'Mercedes-Maybach',
    model: 'S-Class',
    year: '2024',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80',
    type: 'Executive',
    specs: { power: '496 hp', topSpeed: '250 km/h', acceleration: '4.8s' }
  },
  {
    id: 5,
    brand: 'Porsche',
    model: '911 GT3 RS',
    year: '2024',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80',
    type: 'Track Special',
    specs: { power: '518 hp', topSpeed: '296 km/h', acceleration: '3.2s' },
    isExclusive: true,
    requiredTier: 'Elite'
  },
  {
    id: 6,
    brand: 'Aston Martin',
    model: 'DB12',
    year: '2024',
    price: 72000,
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80',
    type: 'Super Tourer',
    specs: { power: '671 hp', topSpeed: '325 km/h', acceleration: '3.6s' }
  }
];

export const CURRENCIES = {
  USD: { symbol: '$', rate: 1, locale: 'en-US' },
  EUR: { symbol: '€', rate: 0.92, locale: 'de-DE' },
  GBP: { symbol: '£', rate: 0.79, locale: 'en-GB' },
  AED: { symbol: 'د.إ', rate: 3.67, locale: 'ar-AE' },
  INR: { symbol: '₹', rate: 83, locale: 'en-IN' }
};

const INITIAL_REVIEWS = [
  { id: 1, carId: 1, user: 'James W.', rating: 5, comment: 'An absolute dream to drive.' },
  { id: 2, carId: 2, user: 'Sarah M.', rating: 5, comment: 'Incredible experience, spotless car.' },
  { id: 3, carId: 3, user: 'Michael T.', rating: 4, comment: 'Very smooth ride, great service.' }
];

export const DataProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [cars, setCars] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('luxuryCurrency');
    if (savedCurrency && CURRENCIES[savedCurrency]) {
      setCurrency(savedCurrency);
    }
    const fetchData = async () => {
      if (!isSupabaseConfigured) {
        // Fallback to local storage for cars
        const savedCars = localStorage.getItem('luxuryCars_v7');
        if (savedCars) {
          setCars(JSON.parse(savedCars));
        } else {
          setCars(INITIAL_CARS);
        }

        // Fallback to local storage for orders
        const savedOrders = localStorage.getItem('luxuryOrders');
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        return;
      }

      try {
        // Fetch Cars from Supabase
        const { data: carsData, error: carsError } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
        if (carsError) throw carsError;
        
        if (carsData && carsData.length > 0) {
          setCars(carsData);
        } else {
          // If DB is empty, seed it with INITIAL_CARS (optional, but good for first run)
          setCars(INITIAL_CARS);
        }

        // Fetch Orders from Supabase
        const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (ordersError) throw ordersError;
        
        // Map snake_case to camelCase for the app
        const mappedOrders = (ordersData || []).map(o => ({
          ...o,
          customerName: o.customer_name,
          userEmail: o.user_email,
          carModel: o.car_model,
          totalPrice: o.total_price
        }));
        setOrders(mappedOrders);

      } catch (error) {
        console.error("Error fetching data from Supabase:", error);
      }
    };

    fetchData();
    const savedWishlist = localStorage.getItem('luxuryWishlist');
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  const addCar = async (car) => {
    if (!isSupabaseConfigured) {
      const newCar = { ...car, id: Date.now() };
      const updated = [newCar, ...cars];
      setCars(updated);
      localStorage.setItem('luxuryCars_v7', JSON.stringify(updated));
      return;
    }

    try {
      const { data, error } = await supabase.from('cars').insert([car]).select().single();
      if (error) throw error;
      setCars(prev => [data, ...prev]);
    } catch (error) {
      console.error("Error adding car:", error);
    }
  };

  const updateCar = async (id, updatedCar) => {
    if (!isSupabaseConfigured) {
      const updated = cars.map(c => c.id === id ? { ...c, ...updatedCar } : c);
      setCars(updated);
      localStorage.setItem('luxuryCars_v7', JSON.stringify(updated));
      return;
    }

    try {
      const { data, error } = await supabase.from('cars').update(updatedCar).eq('id', id).select().single();
      if (error) throw error;
      setCars(prev => prev.map(c => c.id === id ? data : c));
    } catch (error) {
      console.error("Error updating car:", error);
    }
  };

  const deleteCar = async (id) => {
    if (!isSupabaseConfigured) {
      const updated = cars.filter(c => c.id !== id);
      setCars(updated);
      localStorage.setItem('luxuryCars_v7', JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase.from('cars').delete().eq('id', id);
      if (error) throw error;
      setCars(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting car:", error);
    }
  };

  const addOrder = async (order) => {
    const newOrder = {
      ...order,
      status: 'Confirmed',
      created_at: new Date().toISOString()
    };

    if (!isSupabaseConfigured) {
      const orderWithId = { ...newOrder, id: Date.now().toString(36) };
      setOrders(prev => {
        const updated = [orderWithId, ...prev];
        localStorage.setItem('luxuryOrders', JSON.stringify(updated));
        return updated;
      });

      // Tier upgrade check for mock data
      const saved = JSON.parse(localStorage.getItem('luxuryOrders') || '[]');
      const userOrders = saved.filter(o => o.userEmail === order.userEmail);
      checkTierUpgrade(order.userEmail, userOrders.length);
      return;
    }

    try {
      const snakeOrder = {
        user_email: order.userEmail,
        customer_name: order.customerName,
        phone: order.phone,
        car_id: order.carId,
        car_model: order.carModel,
        location: order.location,
        address: order.address,
        date: order.date,
        duration: order.duration,
        chauffeur: order.chauffeur,
        insurance: order.insurance,
        total_price: order.totalPrice,
        status: 'Confirmed'
      };

      const { data, error } = await supabase.from('orders').insert([snakeOrder]).select().single();
      if (error) throw error;

      // Map back to camelCase for state
      const mappedData = {
        ...data,
        customerName: data.customer_name,
        userEmail: data.user_email,
        carModel: data.car_model,
        totalPrice: data.total_price
      };

      setOrders(prev => [mappedData, ...prev]);

      // Check for tier upgrade
      const { count, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_email', order.userEmail);

      if (!countError) checkTierUpgrade(order.userEmail, count);
    } catch (error) {
      console.error("Error adding order:", error);
    }
  };

  const checkTierUpgrade = async (email, totalTrips) => {
    if (!isSupabaseConfigured) {
      const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
      if (demoUser.email === email) {
        let newTier = demoUser.tier || 'VIP';
        if (totalTrips >= 20) newTier = 'Black';
        else if (totalTrips >= 10) newTier = 'Elite';

        if (newTier !== demoUser.tier) {
          demoUser.tier = newTier;
          localStorage.setItem('demoUser', JSON.stringify(demoUser));
        }
      }
      return;
    }

    try {
      let newTier = 'VIP';
      if (totalTrips >= 20) newTier = 'Black';
      else if (totalTrips >= 10) newTier = 'Elite';

      const { error } = await supabase
        .from('profiles')
        .update({ tier: newTier })
        .eq('email', email);

      if (error) throw error;
    } catch (error) {
      console.error("Error upgrading tier:", error);
    }
  };

  const cancelOrder = async (id) => {
    if (!isSupabaseConfigured) {
      const updated = orders.filter(o => o.id !== id);
      setOrders(updated);
      localStorage.setItem('luxuryOrders', JSON.stringify(updated));
      return;
    }
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      setOrders(orders.filter(o => o.id !== id));
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const toggleWishlist = (carId) => {
    const updated = wishlist.includes(carId)
      ? wishlist.filter(id => id !== carId)
      : [...wishlist, carId];
    setWishlist(updated);
    localStorage.setItem('luxuryWishlist', JSON.stringify(updated));
  };

  const changeCurrency = (code) => {
    setCurrency(code);
    localStorage.setItem('luxuryCurrency', code);
  };

  const formatPrice = (price) => {
    const currencyData = CURRENCIES[currency] || CURRENCIES['USD'];
    // Assuming base price in INITIAL_CARS is in USD (e.g. 95000 for Rolls-Royce). 
    // If the original price was INR, we would divide. But looking at 95000, it's USD.
    const convertedPrice = price * currencyData.rate;
    return new Intl.NumberFormat(currencyData.locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(convertedPrice);
  };

  const getInsights = (userEmail) => {
    const userOrders = orders.filter(o => o.userEmail === userEmail);
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.totalPrice || o.price || 0), 0);
    const favoriteBrand = userOrders.length > 0
      ? userOrders[0].carModel.split(' ')[0]
      : 'None';

    return {
      totalTrips: userOrders.length,
      totalSpent,
      favoriteBrand
    };
  };

  const getOccasionSuggestions = (occasionId) => {
    switch (occasionId) {
      case 'wedding': return cars.filter(c => c.brand === 'Rolls-Royce' || c.brand === 'Bentley');
      case 'business': return cars.filter(c => c.type === 'Executive' || c.brand === 'Mercedes-Maybach');
      case 'leisure': return cars.filter(c => c.type === 'Grand Tourer' || c.type === 'Luxury Sedan');
      default: return [];
    }
  };

  return (
    <DataContext.Provider value={{
      currency,
      currencies: CURRENCIES,
      changeCurrency,
      cars,
      orders,
      wishlist,
      reviews,
      addCar,
      updateCar,
      deleteCar,
      addOrder,
      cancelOrder,
      toggleWishlist,
      formatPrice,
      getInsights,
      getOccasionSuggestions
    }}>
      {children}
    </DataContext.Provider>
  );
};
