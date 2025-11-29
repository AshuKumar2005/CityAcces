import { useState } from 'react';
import { supabase, Amenity } from '../lib/supabase';
import { MapPin, Plus, X, Trash2, Edit } from 'lucide-react';

type AdminAmenitiesProps = {
  amenities: Amenity[];
  loading: boolean;
  onUpdate: () => void;
};

export default function AdminAmenities({ amenities, loading, onUpdate }: AdminAmenitiesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'hospital' | 'school' | 'park' | 'library' | 'police_station' | 'fire_station' | 'other'>('hospital');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setType('hospital');
    setAddress('');
    setContact('');
    setOperatingHours('');
    setDescription('');
    setEditingAmenity(null);
    setShowForm(false);
  };

  const handleEdit = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setName(amenity.name);
    setType(amenity.type);
    setAddress(amenity.address);
    setContact(amenity.contact || '');
    setOperatingHours(amenity.operating_hours || '');
    setDescription(amenity.description || '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingAmenity) {
        const { error } = await supabase
          .from('amenities')
          .update({
            name,
            type,
            address,
            contact: contact || null,
            operating_hours: operatingHours || null,
            description: description || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingAmenity.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('amenities').insert({
          name,
          type,
          address,
          contact: contact || null,
          operating_hours: operatingHours || null,
          description: description || null,
        });

        if (error) throw error;
      }

      resetForm();
      onUpdate();
    } catch (error) {
      console.error('Error saving amenity:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this amenity?')) return;

    try {
      const { error } = await supabase.from('amenities').delete().eq('id', id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting amenity:', error);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Amenities</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Amenity</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {amenities.map((amenity) => (
          <div key={amenity.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{amenity.name}</h3>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {amenity.type.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
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
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleEdit(amenity)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(amenity.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {editingAmenity ? 'Edit Amenity' : 'Add New Amenity'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City Hospital"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="hospital">Hospital</option>
                  <option value="school">School</option>
                  <option value="park">Park</option>
                  <option value="library">Library</option>
                  <option value="police_station">Police Station</option>
                  <option value="fire_station">Fire Station</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact (Optional)
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operating Hours (Optional)
                </label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="9:00 AM - 5:00 PM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional information about this amenity"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {submitting ? 'Saving...' : editingAmenity ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
