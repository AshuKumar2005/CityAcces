import { Complaint } from '../lib/supabase';
import { MapPin, Calendar, AlertCircle } from 'lucide-react';

type ComplaintListProps = {
  complaints: Complaint[];
};

export default function ComplaintList({ complaints }: ComplaintListProps) {
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

  if (complaints.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No complaints submitted yet</p>
      </div>
    );
  }

  return (
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

          <div className="flex items-center space-x-2 text-sm">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {complaint.category.replace('_', ' ').toUpperCase()}
            </span>
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
  );
}
