import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Complaint, Amenity, Announcement } from '../lib/supabase';
import { FileText, Building2, Bell, LogOut, BarChart3 } from 'lucide-react';
import AdminComplaints from './AdminComplaints';
import AdminAmenities from './AdminAmenities';
import AdminAnnouncements from './AdminAnnouncements';
import AdminStats from './AdminStats';

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'complaints' | 'amenities' | 'announcements'>('stats');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'complaints') {
      loadComplaints();
    } else if (activeTab === 'amenities') {
      loadAmenities();
    } else if (activeTab === 'announcements') {
      loadAnnouncements();
    }
  }, [activeTab]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAmenities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('amenities')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setAmenities(data || []);
    } catch (error) {
      console.error('Error loading amenities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Smart City Admin Portal</h1>
              <p className="text-sm text-gray-500">Welcome, {profile?.full_name}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'complaints'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Complaints</span>
          </button>
          <button
            onClick={() => setActiveTab('amenities')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'amenities'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Amenities</span>
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'announcements'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span>Announcements</span>
          </button>
        </div>

        {activeTab === 'stats' && <AdminStats />}

        {activeTab === 'complaints' && (
          <AdminComplaints
            complaints={complaints}
            loading={loading}
            onUpdate={loadComplaints}
          />
        )}

        {activeTab === 'amenities' && (
          <AdminAmenities
            amenities={amenities}
            loading={loading}
            onUpdate={loadAmenities}
          />
        )}

        {activeTab === 'announcements' && (
          <AdminAnnouncements
            announcements={announcements}
            loading={loading}
            onUpdate={loadAnnouncements}
          />
        )}
      </div>
    </div>
  );
}
