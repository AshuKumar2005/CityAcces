import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Complaint, Amenity, Announcement } from '../lib/supabase';
import { FileText, MapPin, Bell, Building2, LogOut, Plus, X } from 'lucide-react';
import ComplaintForm from './ComplaintForm';
import ComplaintList from './ComplaintList';

export default function CitizenDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'complaints' | 'amenities' | 'announcements'>('complaints');
  const [showComplaintForm, setShowComplaintForm] = useState(false);
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
        .eq('citizen_id', profile?.id)
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
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintSubmitted = () => {
    setShowComplaintForm(false);
    loadComplaints();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Smart City Portal</h1>
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
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'complaints'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>My Complaints</span>
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
            <span>City Amenities</span>
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

        {activeTab === 'complaints' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Complaints</h2>
              <button
                onClick={() => setShowComplaintForm(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Submit Complaint</span>
              </button>
            </div>

            {showComplaintForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-900">Submit New Complaint</h3>
                    <button
                      onClick={() => setShowComplaintForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <ComplaintForm onSuccess={handleComplaintSubmitted} />
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <ComplaintList complaints={complaints} />
            )}
          </div>
        )}

        {activeTab === 'amenities' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">City Amenities</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {amenities.map((amenity) => (
                  <div key={amenity.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{amenity.name}</h3>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {amenity.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{amenity.address}</span>
                      </div>
                      {amenity.contact && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Contact:</span>
                          <span>{amenity.contact}</span>
                        </div>
                      )}
                      {amenity.operating_hours && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Hours:</span>
                          <span>{amenity.operating_hours}</span>
                        </div>
                      )}
                      {amenity.description && (
                        <p className="text-gray-700 mt-3">{amenity.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'announcements' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Announcements</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{announcement.title}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded ${
                          announcement.category === 'emergency'
                            ? 'bg-red-100 text-red-800'
                            : announcement.category === 'event'
                            ? 'bg-green-100 text-green-800'
                            : announcement.category === 'maintenance'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {announcement.category.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{announcement.content}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(announcement.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
