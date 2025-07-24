import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { ArrowLeft, Hotel, Calendar, MapPin, Users, Hash, Bed } from 'lucide-react';

interface MobileAccommodationFormProps {
  accommodation?: any; // For editing
  onSave: (accommodation: any) => void;
  onCancel: () => void;
  familyMembers?: any[];
}

export const MobileAccommodationForm: React.FC<MobileAccommodationFormProps> = ({ 
  accommodation, 
  onSave, 
  onCancel,
  familyMembers = []
}) => {
  const [formData, setFormData] = useState({
    type: accommodation?.type || '',
    name: accommodation?.name || '',
    address: accommodation?.address || '',
    checkIn: accommodation?.checkIn || '',
    checkOut: accommodation?.checkOut || '',
    details: accommodation?.details || '',
    roomQuantity: accommodation?.roomQuantity || '',
    roomAssignment: accommodation?.roomAssignment || '',
    assignedMembers: accommodation?.assignedMembers || [],
    status: accommodation?.status || 'confirmed',
    confirmationNumber: accommodation?.confirmationNumber || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.type.trim()) {
      newErrors.type = 'Accommodation type is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }
    if (!formData.checkIn) {
      newErrors.checkIn = 'Check-in date is required';
    }
    if (!formData.checkOut) {
      newErrors.checkOut = 'Check-out date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave({
        ...formData,
        id: accommodation?.id || Date.now().toString(),
        createdAt: accommodation?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  const accommodationTypes = [
    { value: 'hotel', label: '🏨 Hotel' },
    { value: 'resort', label: '🏖️ Resort' },
    { value: 'vacation-rental', label: '🏠 Vacation Rental' },
    { value: 'apartment', label: '🏢 Apartment' },
    { value: 'bed-breakfast', label: '🏡 Bed & Breakfast' },
    { value: 'hostel', label: '🏠 Hostel' },
    { value: 'villa', label: '🏰 Villa' },
    { value: 'cabin', label: '🏔️ Cabin' },
    { value: 'other', label: '📍 Other' }
  ];

  const accommodationStatuses = [
    { value: 'confirmed', label: '✅ Confirmed' },
    { value: 'pending', label: '⏳ Pending' },
    { value: 'cancelled', label: '❌ Cancelled' },
    { value: 'modified', label: '✏️ Modified' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold flex-1">
            {accommodation ? 'Edit Stay' : 'Add Accommodation'}
          </h1>
          <Button
            onClick={handleSubmit}
            disabled={!formData.type.trim() || !formData.name.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            Save
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-6">
        {/* Property Details */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center">
            <Hotel className="w-4 h-4 mr-2" />
            Property Information
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select accommodation type" />
              </SelectTrigger>
              <SelectContent>
                {accommodationTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500 mt-1">{errors.type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Name *
            </label>
            <Input
              placeholder="e.g., Hotel Barcelona Plaza"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accommodationStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Location
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <Textarea
              placeholder="Full property address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Stay Dates
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in *
              </label>
              <Input
                type="date"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                className={errors.checkIn ? 'border-red-500' : ''}
              />
              {errors.checkIn && (
                <p className="text-sm text-red-500 mt-1">{errors.checkIn}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out *
              </label>
              <Input
                type="date"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                className={errors.checkOut ? 'border-red-500' : ''}
              />
              {errors.checkOut && (
                <p className="text-sm text-red-500 mt-1">{errors.checkOut}</p>
              )}
            </div>
          </div>
        </div>

        {/* Room Details */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center">
            <Bed className="w-4 h-4 mr-2" />
            Room Details
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Rooms
            </label>
            <Select 
              value={formData.roomQuantity} 
              onValueChange={(value) => setFormData({ ...formData, roomQuantity: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of rooms" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'Room' : 'Rooms'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Assignment
            </label>
            <Textarea
              placeholder="e.g., Parents in Suite 101, Kids in connecting room 102"
              value={formData.roomAssignment}
              onChange={(e) => setFormData({ ...formData, roomAssignment: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center">
            <Hash className="w-4 h-4 mr-2" />
            Booking Details
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmation Number
            </label>
            <Input
              placeholder="e.g., HTL123456"
              value={formData.confirmationNumber}
              onChange={(e) => setFormData({ ...formData, confirmationNumber: e.target.value.toUpperCase() })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Details
            </label>
            <Textarea
              placeholder="Amenities, special requests, notes..."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        {/* Guests */}
        {familyMembers.length > 0 && (
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Guests
            </h2>
            
            <div className="space-y-2">
              {familyMembers.map((member) => (
                <label key={member.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.assignedMembers.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ 
                          ...formData, 
                          assignedMembers: [...formData.assignedMembers, member.id] 
                        });
                      } else {
                        setFormData({ 
                          ...formData, 
                          assignedMembers: formData.assignedMembers.filter(id => id !== member.id) 
                        });
                      }
                    }}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm">{member.name}</span>
                  {member.age && <span className="text-xs text-gray-500">({member.age})</span>}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">🏨 Stay Tips</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Contact property directly for special requests</li>
            <li>• Join loyalty programs for potential upgrades</li>
            <li>• Check cancellation policy before booking</li>
            <li>• Consider location relative to planned activities</li>
          </ul>
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-8" />
      </div>
    </div>
  );
};