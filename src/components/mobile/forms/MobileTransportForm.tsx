import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { ArrowLeft, Car, Clock, MapPin, Users, Hash, Train, Bus, Ship } from 'lucide-react';

interface MobileTransportFormProps {
  transport?: any; // For editing
  onSave: (transport: any) => void;
  onCancel: () => void;
  familyMembers?: any[];
}

export const MobileTransportForm: React.FC<MobileTransportFormProps> = ({ 
  transport, 
  onSave, 
  onCancel,
  familyMembers = []
}) => {
  const [formData, setFormData] = useState({
    type: transport?.type || '',
    details: transport?.details || '',
    departure: transport?.departure || '',
    arrival: transport?.arrival || '',
    date: transport?.date || '',
    time: transport?.time || '',
    assignedMembers: transport?.assignedMembers || [],
    confirmationNumber: transport?.confirmationNumber || '',
    status: transport?.status || 'confirmed'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.type.trim()) {
      newErrors.type = 'Transportation type is required';
    }
    if (!formData.departure.trim()) {
      newErrors.departure = 'Departure location is required';
    }
    if (!formData.arrival.trim()) {
      newErrors.arrival = 'Arrival location is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave({
        ...formData,
        id: transport?.id || Date.now().toString(),
        createdAt: transport?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  const transportTypes = [
    { value: 'car-rental', label: '🚗 Car Rental', icon: Car },
    { value: 'taxi-rideshare', label: '🚕 Taxi/Rideshare', icon: Car },
    { value: 'train', label: '🚆 Train', icon: Train },
    { value: 'bus', label: '🚌 Bus', icon: Bus },
    { value: 'ferry', label: '⛴️ Ferry', icon: Ship },
    { value: 'shuttle', label: '🚐 Shuttle', icon: Bus },
    { value: 'metro-subway', label: '🚇 Metro/Subway', icon: Train },
    { value: 'private-transfer', label: '🚙 Private Transfer', icon: Car },
    { value: 'other', label: '🚚 Other', icon: Car }
  ];

  const transportStatuses = [
    { value: 'confirmed', label: '✅ Confirmed' },
    { value: 'pending', label: '⏳ Pending' },
    { value: 'cancelled', label: '❌ Cancelled' },
    { value: 'delayed', label: '⚠️ Delayed' }
  ];

  const getTransportIcon = (type: string) => {
    const transport = transportTypes.find(t => t.value === type);
    return transport ? transport.icon : Car;
  };

  const TransportIcon = getTransportIcon(formData.type);

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
            {transport ? 'Edit Transport' : 'Add Transportation'}
          </h1>
          <Button
            onClick={handleSubmit}
            disabled={!formData.type.trim() || !formData.departure.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Save
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-6">
        {/* Transport Details */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center">
            <TransportIcon className="w-4 h-4 mr-2" />
            Transportation Details
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
                <SelectValue placeholder="Select transportation type" />
              </SelectTrigger>
              <SelectContent>
                {transportTypes.map(type => (
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
              Service Details
            </label>
            <Input
              placeholder="e.g., Hertz Car Rental, Metro Line 3, Airport Shuttle"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            />
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
                {transportStatuses.map(status => (
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From *
            </label>
            <Input
              placeholder="Departure location"
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
              placeholder="Arrival location"
              value={formData.arrival}
              onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
              className={errors.arrival ? 'border-red-500' : ''}
            />
            {errors.arrival && (
              <p className="text-sm text-red-500 mt-1">{errors.arrival}</p>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Schedule
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-sm text-red-500 mt-1">{errors.date}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
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
              placeholder="e.g., CAR123456"
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
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm">{member.name}</span>
                  {member.age && <span className="text-xs text-gray-500">({member.age})</span>}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Transport-specific tips */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-medium text-purple-900 mb-2">🚗 Transport Tips</h3>
          <div className="text-sm text-purple-800 space-y-1">
            {formData.type === 'car-rental' && (
              <>
                <div>• Check driver's license validity and international permits</div>
                <div>• Consider insurance options and fuel policies</div>
                <div>• Bring GPS or download offline maps</div>
              </>
            )}
            {formData.type === 'train' && (
              <>
                <div>• Book seats in advance for popular routes</div>
                <div>• Arrive 30 minutes early for long-distance trains</div>
                <div>• Check luggage restrictions and policies</div>
              </>
            )}
            {formData.type === 'taxi-rideshare' && (
              <>
                <div>• Download local rideshare apps before arrival</div>
                <div>• Have cash as backup payment method</div>
                <div>• Share trip details with family for safety</div>
              </>
            )}
            {!['car-rental', 'train', 'taxi-rideshare'].includes(formData.type) && (
              <>
                <div>• Confirm pickup times and locations</div>
                <div>• Keep confirmation details easily accessible</div>
                <div>• Have backup transportation plans</div>
              </>
            )}
          </div>
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-8" />
      </div>
    </div>
  );
};