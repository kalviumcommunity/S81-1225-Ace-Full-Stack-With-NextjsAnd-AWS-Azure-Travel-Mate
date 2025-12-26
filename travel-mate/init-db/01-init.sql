-- Travel Mate Database Initialization Script
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create places table
CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    category VARCHAR(100),
    rating DECIMAL(2, 1) DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create favorites table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, place_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample places data
INSERT INTO places (name, description, location, latitude, longitude, category, rating, image_url) VALUES
    ('Eiffel Tower', 'Iconic iron lattice tower on the Champ de Mars in Paris', 'Paris, France', 48.8584, 2.2945, 'Landmark', 4.7, 'https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4'),
    ('Grand Canyon', 'Steep-sided canyon carved by the Colorado River', 'Arizona, USA', 36.1069, -112.1129, 'Nature', 4.9, 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722'),
    ('Tokyo Tower', 'Communications and observation tower in Shiba-koen district', 'Tokyo, Japan', 35.6586, 139.7454, 'Landmark', 4.5, 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc'),
    ('Machu Picchu', '15th-century Inca citadel in the Eastern Cordillera', 'Cusco Region, Peru', -13.1631, -72.5450, 'Historical', 4.8, 'https://images.unsplash.com/photo-1587595431973-160d0d94add1'),
    ('Great Barrier Reef', 'World''s largest coral reef system', 'Queensland, Australia', -18.2871, 147.6992, 'Nature', 4.9, 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0')
ON CONFLICT DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_places_rating ON places(rating);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON reviews(place_id);

-- Grant permissions (if needed for specific users)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;

-- Log completion (using SELECT instead of RAISE for plain SQL compatibility)
SELECT 'Travel Mate database initialized successfully!' AS status;
