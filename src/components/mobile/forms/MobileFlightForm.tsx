import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { ArrowLeft, Plane, Clock, MapPin, Users, Hash } from 'lucide-react';

interface MobileFlightFormProps {
  flight?: any; // For editing
  onSave: (flight: any) => void;
  onCancel: () => void;
  familyMembers?: any[];
}

export const MobileFlightForm: React.FC<MobileFlightFormProps> = ({ 
  flight, 
  onSave, 
  onCancel,
  familyMembers = []
}) => {
  const [formData, setFormData] = useState({
    airline: flight?.airline || '',
    flightNumber: flight?.flightNumber || '',
    departure: flight?.departure || '',
    arrival: flight?.arrival || '',
    departureTime: flight?.departureTime || '',
    arrivalTime: flight?.arrivalTime || '',
    confirmationNumber: flight?.confirmationNumber || '',
    status: flight?.status || 'confirmed',
    assignedMembers: flight?.assignedMembers || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.airline.trim()) {
      newErrors.airline = 'Airline is required';
    }
    if (!formData.flightNumber.trim()) {
      newErrors.flightNumber = 'Flight number is required';
    }
    if (!formData.departure.trim()) {
      newErrors.departure = 'Departure city is required';
    }
    if (!formData.arrival.trim()) {
      newErrors.arrival = 'Arrival city is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave({
        ...formData,
        id: flight?.id || Date.now().toString(),
        createdAt: flight?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  const airlines = [
    'American Airlines', 'Delta Air Lines', 'United Airlines', 'Southwest Airlines',
    'JetBlue Airways', 'Alaska Airlines', 'Spirit Airlines', 'Frontier Airlines',
    'British Airways', 'Lufthansa', 'Air France', 'KLM', 'Emirates', 'Qatar Airways',
    'Singapore Airlines', 'Cathay Pacific', 'Japan Airlines', 'All Nippon Airways',
    'Other'
  ];

  const flightStatuses = [
    { value: 'confirmed', label: '✅ Confirmed' },
    { value: 'pending', label: '⏳ Pending' },
    { value: 'cancelled', label: '❌ Cancelled' },
    { value: 'delayed', label: '⚠️ Delayed' }
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
            {flight ? 'Edit Flight' : 'Add Flight'}
          </h1>
          <Button
            onClick={handleSubmit}
            disabled={!formData.airline.trim() || !formData.flightNumber.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-6">
        {/* Flight Details */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center">
            <Plane className="w-4 h-4 mr-2" />
            Flight Information
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Airline *
            </label>
            <Select 
              value={formData.airline} 
              onValueChange={(value) => setFormData({ ...formData, airline: value })}
            >
              <SelectTrigger className={errors.airline ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select airline" />
              </SelectTrigger>
              <SelectContent>
                {airlines.map(airline => (
                  <SelectItem key={airline} value={airline}>
                    {airline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.airline && (
              <p className="text-sm text-red-500 mt-1">{errors.airline}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flight Number *
            </label>
            <Input
              placeholder="e.g., AA1234"
              value={formData.flightNumber}
              onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })}
              className={errors.flightNumber ? 'border-red-500' : ''}
            />
            {errors.flightNumber && (
              <p className="text-sm text-red-500 mt-1">{errors.flightNumber}</p>
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
                {flightStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Route */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Route
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From *
              </label>
              <Input
                placeholder="Airport/City"
                value={formData.departure}
                onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                className={errors.departure ? 'border-red-500' : ''}
              />
              {errors.departure && (
                <p className="text-sm text-red-500 mt-1">{errors.departure}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To *
              </label>
              <Input
                placeholder="Airport/City"
                value={formData.arrival}
                onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
                className={errors.arrival ? 'border-red-500' : ''}
              />
              {errors.arrival && (
                <p className="text-sm text-red-500 mt-1">{errors.arrival}</p>
              )}
            </div>
          </div>
        </div>

        {/* Times */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Schedule
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departure Time
              </label>
              <Input
                type="datetime-local"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arrival Time
              </label>
              <Input
                type="datetime-local"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Confirmation */}
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
              placeholder="e.g., ABC123"
              value={formData.confirmationNumber}
              onChange={(e) => setFormData({ ...formData, confirmationNumber: e.target.value.toUpperCase() })}
            />
          </div>
        </div>

        {/* Passengers */}
        {familyMembers.length > 0 && (
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Passengers
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
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">{member.name}</span>
                  {member.age && <span className="text-xs text-gray-500">({member.age})</span>}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">✈️ Flight Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Check in 24 hours before departure</li>
            <li>• Arrive 2 hours early for domestic, 3 hours for international</li>
            <li>• Download airline app for real-time updates</li>
            <li>• Take a photo of your confirmation number</li>
          </ul>
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-8" />
      </div>
    </div>
  );
};