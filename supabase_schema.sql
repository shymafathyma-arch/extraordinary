-- SQL Schema for Shaima Luxury Rent-A-Car
-- Run this in your Supabase SQL Editor

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    role TEXT DEFAULT 'customer',
    tier TEXT DEFAULT 'VIP',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Cars Table
CREATE TABLE IF NOT EXISTS public.cars (
    id BIGSERIAL PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    price NUMERIC NOT NULL,
    type TEXT,
    image TEXT,
    specs JSONB,
    is_exclusive BOOLEAN DEFAULT FALSE,
    required_tier TEXT DEFAULT 'VIP',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    car_id BIGINT REFERENCES public.cars(id),
    car_model TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    date TEXT NOT NULL,
    duration TEXT,
    chauffeur BOOLEAN DEFAULT FALSE,
    insurance BOOLEAN DEFAULT FALSE,
    total_price NUMERIC,
    status TEXT DEFAULT 'Confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - Basic setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Cars: Everyone can read
CREATE POLICY "Everyone can view cars" ON public.cars
    FOR SELECT USING (true);

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR user_email = auth.jwt()->>'email');

-- Orders: Users can insert their own orders
CREATE POLICY "Users can insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_email = auth.jwt()->>'email');

-- Admin access: Admins can do everything
CREATE POLICY "Admins have full access" ON public.profiles
    USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
