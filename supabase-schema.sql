-- ============================================
-- STOCKMANAGER PRO - DATABASE SCHEMA
-- Esegui questo script in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#6366f1',
    icon VARCHAR(50) DEFAULT 'package',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SUBCATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster subcategory lookups by category
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    barcode VARCHAR(50),
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    min_quantity INTEGER DEFAULT 5 CHECK (min_quantity >= 0),
    purchase_price DECIMAL(10, 2) DEFAULT 0 CHECK (purchase_price >= 0),
    sale_price DECIMAL(10, 2) DEFAULT 0 CHECK (sale_price >= 0),
    category_id UUID NOT NULL REFERENCES categories(id),
    subcategory_id UUID REFERENCES subcategories(id),
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster product lookups
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (using anon key)
-- In a production app, you'd want more restrictive policies

CREATE POLICY "Allow all for anon" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON subcategories FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON products FOR ALL USING (true);

-- ============================================
-- ENABLE REALTIME
-- ============================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE subcategories;

-- ============================================
-- INSERT DEFAULT ADMIN USER
-- Password: Jessica26 (hashed with bcrypt)
-- ============================================

INSERT INTO users (username, password_hash, display_name, role)
VALUES (
    'Admin',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.M4yqbLOPHKMPYO',
    'Amministratore',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- ============================================
-- INSERT SAMPLE CATEGORIES
-- ============================================

INSERT INTO categories (name, description, color, icon) VALUES
    ('Reparto Detersivi', 'Prodotti per la pulizia della casa', '#6366f1', 'droplets'),
    ('Alimentari', 'Prodotti alimentari e bevande', '#22c55e', 'utensils'),
    ('Igiene Personale', 'Prodotti per la cura del corpo', '#ec4899', 'heart'),
    ('Cancelleria', 'Articoli per ufficio e scuola', '#f59e0b', 'pen')
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT SAMPLE SUBCATEGORIES
-- ============================================

-- Get category IDs
DO $$
DECLARE
    detersivi_id UUID;
    alimentari_id UUID;
    igiene_id UUID;
    cancelleria_id UUID;
BEGIN
    SELECT id INTO detersivi_id FROM categories WHERE name = 'Reparto Detersivi' LIMIT 1;
    SELECT id INTO alimentari_id FROM categories WHERE name = 'Alimentari' LIMIT 1;
    SELECT id INTO igiene_id FROM categories WHERE name = 'Igiene Personale' LIMIT 1;
    SELECT id INTO cancelleria_id FROM categories WHERE name = 'Cancelleria' LIMIT 1;

    -- Subcategories for Detersivi
    IF detersivi_id IS NOT NULL THEN
        INSERT INTO subcategories (name, category_id, description) VALUES
            ('Shampoo', detersivi_id, 'Shampoo per capelli'),
            ('Bagnoschiuma', detersivi_id, 'Prodotti per il bagno'),
            ('Saponi', detersivi_id, 'Saponi per mani e corpo'),
            ('Detersivi Piatti', detersivi_id, 'Detersivi per stoviglie'),
            ('Detersivi Lavatrice', detersivi_id, 'Detersivi per il bucato')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Subcategories for Alimentari
    IF alimentari_id IS NOT NULL THEN
        INSERT INTO subcategories (name, category_id, description) VALUES
            ('Pasta', alimentari_id, 'Pasta secca e fresca'),
            ('Bevande', alimentari_id, 'Acqua, succhi, bibite'),
            ('Snack', alimentari_id, 'Merendine e snack'),
            ('Conserve', alimentari_id, 'Prodotti in scatola')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Subcategories for Igiene Personale
    IF igiene_id IS NOT NULL THEN
        INSERT INTO subcategories (name, category_id, description) VALUES
            ('Dentifrici', igiene_id, 'Prodotti per igiene orale'),
            ('Deodoranti', igiene_id, 'Deodoranti e antitraspiranti'),
            ('Creme', igiene_id, 'Creme per il corpo e viso')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Subcategories for Cancelleria
    IF cancelleria_id IS NOT NULL THEN
        INSERT INTO subcategories (name, category_id, description) VALUES
            ('Penne', cancelleria_id, 'Penne e matite'),
            ('Quaderni', cancelleria_id, 'Quaderni e block notes'),
            ('Accessori', cancelleria_id, 'Forbici, colla, nastro')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================
-- DONE!
-- ============================================
