import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign, Users } from 'lucide-react';

interface MobileActivityFormProps {
  activity?: any; // For editing
  onSave: (activity: any) => void;
  onCancel: () => void;
  familyMembers?: any[];
}

export const MobileActivityForm: React.FC<MobileActivityFormProps> = ({ 
  activity, 
  onSave, 
  onCancel,
  familyMembers = []
}) => {
  const [formData, setFormData] = useState({
    name: activity?.name || '',
    type: activity?.type || '',
    date: activity?.date || '',
    time: activity?.time || '',
    duration: activity?.duration || '',
    location: activity?.location || '',
    address: activity?.address || '',
    cost: activity?.cost || '',
    costType: activity?.costType || 'per-person',
    bookingRequired: activity?.bookingRequired || false,
    bookingUrl: activity?.bookingUrl || '',
    notes: activity?.notes || '',
    familyNotes: activity?.familyNotes || '',
    participants: activity?.participants || [],
    priority: activity?.priority || 'medium'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Activity name is required';
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
        id: activity?.id || Date.now().toString(),
        status: activity?.status || 'planned'
      });
    }
  };

  const activityTypes = [
    { value: 'sightseeing', label: '🏛️ Sightseeing' },
    { value: 'dining', label: '🍽️ Dining' },
    { value: 'adventure', label: '🎯 Adventure' },
    { value: 'relaxation', label: '🌴 Relaxation' },
    { value: 'cultural', label: '🎭 Cultural' },
    { value: 'shopping', label: '🛍️ Shopping' },
    { value: 'entertainment', label: '🎪 Entertainment' },
    { value: 'beach', label: '🏖️ Beach' },
    { value: 'nature', label: '🌲 Nature' },
    { value: 'other', label: '📍 Other' }
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
            {activity ? 'Edit Activity' : 'Add Activity'}
          </h1>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || !formData.date}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Name *
            </label>
            <Input
              placeholder="e.g., Sagrada Familia Tour"
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
              Type
            </label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Date & Time
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <Input
              placeholder="e.g., 2 hours"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
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
              Location Name
            </label>
            <Input
              placeholder="e.g., Sagrada Familia"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <Textarea
              placeholder="Full address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        {/* Cost & Booking */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Cost & Booking
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost
              </label>
              <Input
                placeholder="0.00"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Type
              </label>
              <Select 
                value={formData.costType} 
                onValueChange={(value) => setFormData({ ...formData, costType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per-person">Per Person</SelectItem>
                  <SelectItem value="total">Total</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              checked={formData.bookingRequired}
              onCheckedChange={(checked) => setFormData({ ...formData, bookingRequired: !!checked })}
            />
            <label className="text-sm font-medium text-gray-700">
              Booking Required
            </label>
          </div>

          {formData.bookingRequired && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking URL
              </label>
              <Input
                type="url"
                placeholder="https://..."
                value={formData.bookingUrl}
                onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* Participants */}
        {familyMembers.length > 0 && (
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Who's Going?
            </h2>
            
            <div className="space-y-2">
              {familyMembers.map((member) => (
                <label key={member.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ 
                          ...formData, 
                          participants: [...formData.participants, member.id] 
                        });
                      } else {
                        setFormData({ 
                          ...formData, 
                          participants: formData.participants.filter(id => id !== member.id) 
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

        {/* Notes */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Notes</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              General Notes
            </label>
            <Textarea
              placeholder="Any important details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Family Notes
            </label>
            <Textarea
              placeholder="Kid-friendly? Accessibility notes?"
              value={formData.familyNotes}
              onChange={(e) => setFormData({ ...formData, familyNotes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        {/* Priority */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Priority</h2>
          
          <div className="grid grid-cols-3 gap-2">
            {['low', 'medium', 'high'].map((priority) => (
              <button
                key={priority}
                onClick={() => setFormData({ ...formData, priority })}
                className={`
                  px-4 py-2 rounded-lg font-medium capitalize transition-colors
                  ${formData.priority === priority 
                    ? priority === 'high' 
                      ? 'bg-red-100 text-red-700 border-2 border-red-300'
                      : priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                      : 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                  }
                `}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-8" />
      </div>
    </div>
  );
};