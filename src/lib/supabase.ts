import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'citizen';
  phone?: string;
  created_at: string;
  updated_at: string;
};

export type Complaint = {
  id: string;
  citizen_id: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'sanitation' | 'traffic' | 'electricity' | 'water' | 'other';
  location: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  admin_response?: string;
  created_at: string;
  updated_at: string;
};

export type Amenity = {
  id: string;
  name: string;
  type: 'hospital' | 'school' | 'park' | 'library' | 'police_station' | 'fire_station' | 'other';
  address: string;
  contact?: string;
  operating_hours?: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'emergency' | 'event' | 'maintenance';
  published_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
