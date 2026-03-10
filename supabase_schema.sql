-- kabshop Database Schema

-- 1. Create is_admin Helper Function
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN (SELECT role = 'Admin' FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Profiles Table (extends Supabase Auth Users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'User' CHECK (role IN ('Admin', 'User')),
    phone TEXT,
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Categories Table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Products Table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    image_urls TEXT[] DEFAULT '{}',
    description TEXT,
    specs JSONB DEFAULT '{}', -- Store Size/Dimensions, Manufacturer info
    tags TEXT[] DEFAULT '{}', -- Array of descriptive tags (e.g., 'Minimal', 'Premium')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Orders Table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    total_price DECIMAL(10, 2) NOT NULL,
    payment_proof_url TEXT,
    status INTEGER DEFAULT 4 CHECK (status IN (1, 2, 3, 4)), -- 1: Delivered, 2: Shipping, 3: Canceled, 4: Pending
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Order Items Table
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    cost_at_purchase DECIMAL(10, 2) NOT NULL DEFAULT 0
);

-- Row Level Security (RLS) Setup

-- Profiles: Users can view own profile or admins view all. Users can update own.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile or admins view all." ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: Everyone can read; Only Admins can insert/update/delete.
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone." ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories." ON categories FOR ALL USING (is_admin());

-- Products: Everyone can read; Only Admins can insert/update/delete.
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products." ON products FOR ALL USING (is_admin());

-- Orders: Users can read/create their own; Admins can read/update all.
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders." ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders." ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders." ON orders FOR ALL USING (is_admin());

-- Order Items: Users can read/create their own (via order); Admins can read/update all.
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items." ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can create order items." ON order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can manage all order items." ON order_items FOR ALL USING (is_admin());

-- Function to handle new user signup and create a profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, phone, shipping_address)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    'User',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'shipping_address'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Automatic Stock Management
CREATE OR REPLACE FUNCTION deduct_stock_on_payment()
RETURNS trigger AS $$
BEGIN
    -- เช็กว่าสถานะเปลี่ยนจาก Pending (4) เป็น Shipping/Paid (2/1) หรือไม่
    IF (OLD.status = 4 AND NEW.status <= 2) THEN
        UPDATE products p
        SET stock = p.stock - oi.quantity
        FROM order_items oi
        WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for stock deduction
CREATE TRIGGER on_order_paid
    AFTER UPDATE OF status ON orders
    FOR EACH ROW
    EXECUTE PROCEDURE deduct_stock_on_payment();

-- Insert initial dummy categories
INSERT INTO categories (name) VALUES 
('Popular'), ('Pencils'), ('Pens'), ('Erasers'), ('Various Tools'), 
('Correction'), ('Notebooks'), ('Pocket Notebooks'), 
('Math Books'), ('Science Books'), ('Social Books'), ('History Books');

-- Optional: Create Storage Buckets for product images and payment proofs
-- Note: You might need to run these queries as a superuser or manually create the buckets via Supabase dashboard.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'product-images' (Admins can insert/update/delete, anyone can select)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin Manage Images" ON storage.objects FOR ALL USING (bucket_id = 'product-images' AND is_admin());

-- Storage Policies for 'payment-proofs' (Users can insert, Admins can view/update)
CREATE POLICY "Admin Select Proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs' AND is_admin());
CREATE POLICY "User Insert Proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid() IS NOT NULL);
