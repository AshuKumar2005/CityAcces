import { useState } from 'react';
import { supabase, Complaint } from '../lib/supabase';
import { MapPin, Calendar, AlertCircle, X } from 'lucide-react';

type AdminComplaintsProps = {
  complaints: Complaint[];
  loading: boolean;
  onUpdate: () => void;
};

export default function AdminComplaints({ complaints, loading, onUpdate }: AdminComplaintsProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'resolved' | 'rejected'>('pending');
  const [adminResponse, setAdminResponse] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!selectedComplaint) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('complaints')
        .update({
          status,
          admin_response: adminResponse,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedComplaint.id);

      if (error) throw error;
      setSelectedComplaint(null);
      setAdminResponse('');
      onUpdate();
    } catch (error) {
      console.error('Error updating complaint:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Complaints</h2>

      {complaints.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No complaints found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{complaint.location}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(complaint.status)}`}>
                    {complaint.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-3">{complaint.description}</p>

              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                  {complaint.category.replace('_', ' ').toUpperCase()}
                </span>
                <button
                  onClick={() => {
                    setSelectedComplaint(complaint);
                    setStatus(complaint.status);
                    setAdminResponse(complaint.admin_response || '');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Update Status
                </button>
              </div>

              {complaint.admin_response && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium text-blue-900 mb-1">Admin Response:</p>
                  <p className="text-sm text-blue-800">{complaint.admin_response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Update Complaint Status</h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{selectedComplaint.title}</h4>
                <p className="text-gray-700 text-sm">{selectedComplaint.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Response
                </label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide feedback or updates to the citizen"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {updating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
