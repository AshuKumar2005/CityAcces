import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, CheckCircle, Clock, XCircle, Users, Building2, Bell } from 'lucide-react';

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    inProgressComplaints: 0,
    totalCitizens: 0,
    totalAmenities: 0,
    activeAnnouncements: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [complaintsRes, citizensRes, amenitiesRes, announcementsRes] = await Promise.all([
        supabase.from('complaints').select('status', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'citizen'),
        supabase.from('amenities').select('id', { count: 'exact' }),
        supabase.from('announcements').select('id', { count: 'exact' }).eq('is_active', true),
      ]);

      const complaints = complaintsRes.data || [];
      setStats({
        totalComplaints: complaints.length,
        pendingComplaints: complaints.filter((c) => c.status === 'pending').length,
        inProgressComplaints: complaints.filter((c) => c.status === 'in_progress').length,
        resolvedComplaints: complaints.filter((c) => c.status === 'resolved').length,
        totalCitizens: citizensRes.count || 0,
        totalAmenities: amenitiesRes.count || 0,
        activeAnnouncements: announcementsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Complaints</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalComplaints}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingComplaints}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgressComplaints}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolvedComplaints}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Registered Citizens</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCitizens}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">City Amenities</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAmenities}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <Building2 className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Announcements</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeAnnouncements}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <Bell className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
