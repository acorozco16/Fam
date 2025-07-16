import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X, MapPin, Calendar, Clock, DollarSign, Users, Star } from 'lucide-react';

import { Activity, TripData } from '../../types';

// Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

declare const google: any;

interface AddActivityModalProps {
  show: boolean;
  onClose: () => void;
  tripData: TripData;
  editingActivity: Activity | null;
  newActivity: Partial<Activity>;
  setNewActivity: (activity: Partial<Activity>) => void;
  validationErrors: Record<string, string>;
  onSave: (activity: Activity) => void;
  onUpdate: (activity: Activity) => void;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  show,
  onClose,
  tripData,
  editingActivity,
  newActivity,
  setNewActivity,
  validationErrors,
  onSave,
  onUpdate
}) => {
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Initialize Google Maps Places Autocomplete
  useEffect(() => {
    if (show && addressInputRef.current && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["places"]
      });

      loader.load().then(() => {
        if (window.google && addressInputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
            types: ['establishment', 'geocode'],
            componentRestrictions: tripData.country ? { 
              country: tripData.country.toLowerCase().slice(0, 2) // Get country code
            } : undefined
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.name) {
              setNewActivity(prev => ({
                ...prev,
                location: place.name || prev.location,
                coordinates: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                }
              }));
            }
          });
        }
      }).catch(error => {
        console.warn('Google Maps failed to load:', error);
        // Graceful fallback - form still works without autocomplete
      });
    }
    // If no API key, Google Maps autocomplete is disabled but form still works
  }, [show, tripData.country, setNewActivity]);

  // Populate form when editing
  useEffect(() => {
    if (show && tripData) {
      if (editingActivity) {
        // Editing mode - populate form with existing activity data
        setNewActivity({
          name: editingActivity.name || '',
          type: editingActivity.type || '',
          location: editingActivity.location || '',
          date: editingActivity.date || '',
          time: editingActivity.time || '',
          duration: editingActivity.duration || '',
          cost: editingActivity.cost || '',
          status: editingActivity.status || 'Planned',
          participants: editingActivity.participants || []
        });
      } else {
        // Create mode - reset form
        setNewActivity({
          name: '',
          type: '',
          location: '',
          date: '',
          time: '',
          duration: '',
          cost: '',
          status: 'Planned',
          participants: []
        });
      }

      // Populate participants list with all family members
      const allParticipants: string[] = [];
      if (tripData.adults) {
        tripData.adults.forEach((_, idx) => allParticipants.push(`adult-${idx}`));
      }
      if (tripData.kids) {
        tripData.kids.forEach((_, idx) => allParticipants.push(`kid-${idx}`));
      }
    }
  }, [show, tripData, editingActivity, setNewActivity]);

  const validateActivityForm = (data: Partial<Activity>): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!data.name?.trim()) {
      errors.name = 'Activity name is required';
    }
    
    if (!data.date?.trim()) {
      errors.date = 'Date is required';
    }
    
    if (!data.location?.trim()) {
      errors.location = 'Location is required';
    }
    
    return errors;
  };

  const handleSave = () => {
    const errors = validateActivityForm(newActivity);
    if (Object.keys(errors).length > 0) {
      return; // Don't save if there are validation errors
    }

    const activityWithId: Activity = {
      id: editingActivity?.id || Date.now().toString(),
      name: newActivity.name || '',
      date: newActivity.date || '',
      time: newActivity.time,
      duration: newActivity.duration,
      location: newActivity.location || '',
      status: (newActivity.status as Activity['status']) || 'Planned',
      cost: newActivity.cost,
      participants: newActivity.participants || [],
      category: newActivity.type || 'general'
    };

    if (editingActivity) {
      onUpdate(activityWithId);
    } else {
      onSave(activityWithId);
    }
    
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{editingActivity ? 'Edit Activity' : 'Add Activity'}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="activity-name">Activity Name *</Label>
              <Input
                id="activity-name"
                placeholder="e.g., Prado Museum, Retiro Park"
                value={newActivity.name || ''}
                onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                className={validationErrors.name ? 'border-red-500' : ''}
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="activity-type">Type</Label>
              <Select
                value={newActivity.type || ''}
                onValueChange={(value) => setNewActivity(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sightseeing">Sightseeing</SelectItem>
                  <SelectItem value="museum">Museum</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="outdoor">Outdoor Activity</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="cultural">Cultural Experience</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="activity-location">Location/Venue *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="activity-location"
                ref={addressInputRef}
                placeholder="e.g., Santiago Bernabéu Stadium, Madrid"
                value={newActivity.location || ''}
                onChange={(e) => setNewActivity(prev => ({ ...prev, location: e.target.value }))}
                className={`pl-10 ${validationErrors.location ? 'border-red-500' : ''}`}
              />
            </div>
            {validationErrors.location && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.location}</p>
            )}
            {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
              <p className="text-gray-500 text-xs mt-1">
                Add Google Maps API key for location autocomplete
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="activity-date">Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="activity-date"
                  type="date"
                  value={newActivity.date || ''}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, date: e.target.value }))}
                  className={`pl-10 ${validationErrors.date ? 'border-red-500' : ''}`}
                />
              </div>
              {validationErrors.date && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.date}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="activity-time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="activity-time"
                  type="time"
                  value={newActivity.time || ''}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="activity-duration">Duration</Label>
              <Input
                id="activity-duration"
                placeholder="e.g., 2 hours"
                value={newActivity.duration || ''}
                onChange={(e) => setNewActivity(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>
          </div>

          {/* Cost and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="activity-cost">Cost per person</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="activity-cost"
                  placeholder="e.g., €15"
                  value={newActivity.cost || ''}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, cost: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="activity-status">Status</Label>
              <Select
                value={newActivity.status || 'Planned'}
                onValueChange={(value) => setNewActivity(prev => ({ ...prev, status: value as Activity['status'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="Booked">Booked</SelectItem>
                  <SelectItem value="Suggested">Suggested</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Participants */}
          <div>
            <Label className="text-base font-medium">Who's participating?</Label>
            <div className="mt-3 space-y-3">
              {/* Adults */}
              {tripData.adults && tripData.adults.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Adults</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tripData.adults.map((adult, idx) => (
                      <div key={`adult-${idx}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`adult-${idx}`}
                          checked={newActivity.participants?.includes(`adult-${idx}`) || false}
                          onCheckedChange={(checked) => {
                            const participantId = `adult-${idx}`;
                            setNewActivity(prev => ({
                              ...prev,
                              participants: checked
                                ? [...(prev.participants || []), participantId]
                                : (prev.participants || []).filter(p => p !== participantId)
                            }));
                          }}
                        />
                        <Label htmlFor={`adult-${idx}`} className="text-sm cursor-pointer">
                          {adult.name} {adult.age && `(${adult.age})`}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kids */}
              {tripData.kids && tripData.kids.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Children</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tripData.kids.map((kid, idx) => (
                      <div key={`kid-${idx}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`kid-${idx}`}
                          checked={newActivity.participants?.includes(`kid-${idx}`) || false}
                          onCheckedChange={(checked) => {
                            const participantId = `kid-${idx}`;
                            setNewActivity(prev => ({
                              ...prev,
                              participants: checked
                                ? [...(prev.participants || []), participantId]
                                : (prev.participants || []).filter(p => p !== participantId)
                            }));
                          }}
                        />
                        <Label htmlFor={`kid-${idx}`} className="text-sm cursor-pointer">
                          {kid.name} {kid.age && `(${kid.age}yr)`}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!tripData.adults || tripData.adults.length === 0) && (!tripData.kids || tripData.kids.length === 0) && (
                <p className="text-gray-500 text-sm">
                  No family members added yet. Add family members in the trip wizard to assign participants.
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingActivity ? 'Update Activity' : 'Add Activity'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};