/*
  # Smart City Management System Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `role` (text) - 'admin' or 'citizen'
      - `phone` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `complaints`
      - `id` (uuid, primary key)
      - `citizen_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `category` (text) - e.g., 'infrastructure', 'sanitation', 'traffic', 'electricity', 'water'
      - `location` (text)
      - `status` (text) - 'pending', 'in_progress', 'resolved', 'rejected'
      - `priority` (text) - 'low', 'medium', 'high'
      - `admin_response` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `amenities`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - 'hospital', 'school', 'park', 'library', 'police_station', 'fire_station'
      - `address` (text)
      - `contact` (text, optional)
      - `operating_hours` (text, optional)
      - `description` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `announcements`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `category` (text) - 'general', 'emergency', 'event', 'maintenance'
      - `published_by` (uuid, references profiles)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Profiles: Users can read all profiles, update own profile, admins can update any profile
    - Complaints: Citizens can create and read own complaints, admins can read and update all complaints
    - Amenities: All authenticated users can read, only admins can create/update/delete
    - Announcements: All authenticated users can read active announcements, only admins can create/update/delete

  3. Important Notes
    - User roles are stored in profiles table for easy access control
    - Complaints track full lifecycle from submission to resolution
    - Amenities provide comprehensive city services directory
    - Announcements support categorization and active/inactive states
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'citizen' CHECK (role IN ('admin', 'citizen')),
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('infrastructure', 'sanitation', 'traffic', 'electricity', 'water', 'other')),
  location text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  admin_response text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('hospital', 'school', 'park', 'library', 'police_station', 'fire_station', 'other')),
  address text NOT NULL,
  contact text,
  operating_hours text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'emergency', 'event', 'maintenance')),
  published_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Citizens can create own complaints"
  ON complaints FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = citizen_id);

CREATE POLICY "Citizens can read own complaints"
  ON complaints FOR SELECT
  TO authenticated
  USING (
    auth.uid() = citizen_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update all complaints"
  ON complaints FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "All users can read amenities"
  ON amenities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert amenities"
  ON amenities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update amenities"
  ON amenities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can delete amenities"
  ON amenities FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "All users can read active announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can insert announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_complaints_citizen_id ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);