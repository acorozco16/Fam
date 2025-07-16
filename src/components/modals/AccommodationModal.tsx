import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

import { TripData, AccommodationFormData } from '../../types';

interface AccommodationModalProps {
  show: boolean;
  onClose: () => void;
  tripData: TripData;
  editingAccommodationIndex: number | null;
  accommodationFormData: AccommodationFormData;
  setAccommodationFormData: (data: AccommodationFormData) => void;
  onSave: (accommodation: any) => void;
  onUpdate: (accommodation: any, index: number) => void;
}

export const AccommodationModal: React.FC<AccommodationModalProps> = ({
  show,
  onClose,
  tripData,
  editingAccommodationIndex,
  accommodationFormData,
  setAccommodationFormData,
  onSave,
  onUpdate
}) => {
  const handleSave = () => {
    if (editingAccommodationIndex !== null) {
      // Edit mode - update existing accommodation
      const updatedAccommodation = {
        ...accommodationFormData,
        updatedAt: new Date().toISOString()
      };
      onUpdate(updatedAccommodation, editingAccommodationIndex);
    } else {
      // Add mode - create new accommodation
      const newAccommodation = {
        id: Date.now().toString(),
        ...accommodationFormData,
        createdAt: new Date().toISOString()
      };
      onSave(newAccommodation);
    }
    
    onClose();
  };

  const resetForm = () => {
    setAccommodationFormData({
      type: 'hotel',
      name: '',
      address: '',
      checkIn: '',
      checkOut: '',
      details: '',
      roomQuantity: '1',
      roomAssignment: '',
      assignedMembers: [],
      status: 'confirmed',
      confirmationNumber: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{editingAccommodationIndex !== null ? 'Edit Accommodation' : 'Add Accommodation'}</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="accommodation-type">Accommodation Type</Label>
            <Select value={accommodationFormData.type} onValueChange={(value) => setAccommodationFormData(prev => ({...prev, type: value}))}>
              <SelectTrigger>
                <SelectValue placeholder="Select accommodation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="rental">Rental (Airbnb, VRBO)</SelectItem>
                <SelectItem value="family">Staying with Family/Friends</SelectItem>
                <SelectItem value="hostel">Hostel</SelectItem>
                <SelectItem value="camping">Camping</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="accommodation-room-quantity">Number of Rooms</Label>
            <Input 
              id="accommodation-room-quantity" 
              type="number"
              min="1"
              placeholder="1" 
              value={accommodationFormData.roomQuantity}
              onChange={(e) => setAccommodationFormData(prev => ({...prev, roomQuantity: e.target.value}))}
            />
          </div>

          <div>
            <Label htmlFor="accommodation-name">Name</Label>
            <Input 
              id="accommodation-name" 
              placeholder="e.g., Hotel Barcelona Center, Sarah's House" 
              value={accommodationFormData.name}
              onChange={(e) => setAccommodationFormData(prev => ({...prev, name: e.target.value}))}
            />
          </div>

          <div>
            <Label htmlFor="accommodation-address">Address</Label>
            <Input 
              id="accommodation-address" 
              placeholder="Full address or area" 
              value={accommodationFormData.address}
              onChange={(e) => setAccommodationFormData(prev => ({...prev, address: e.target.value}))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="check-in">Check-in Date</Label>
              <Input 
                id="check-in" 
                type="date" 
                value={accommodationFormData.checkIn}
                onChange={(e) => setAccommodationFormData(prev => ({...prev, checkIn: e.target.value}))}
              />
            </div>
            <div>
              <Label htmlFor="check-out">Check-out Date</Label>
              <Input 
                id="check-out" 
                type="date" 
                value={accommodationFormData.checkOut}
                onChange={(e) => setAccommodationFormData(prev => ({...prev, checkOut: e.target.value}))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="accommodation-details">Details</Label>
            <Select value={accommodationFormData.details} onValueChange={(value) => setAccommodationFormData(prev => ({...prev, details: value}))}>
              <SelectTrigger>
                <SelectValue placeholder="Select details" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Room</SelectItem>
                <SelectItem value="double">Double Room</SelectItem>
                <SelectItem value="family">Family Room</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
                <SelectItem value="connecting">Connecting Rooms</SelectItem>
                <SelectItem value="entire-place">Entire Place</SelectItem>
                <SelectItem value="shared">Shared Space</SelectItem>
                <SelectItem value="guest-room">Guest Room</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="accommodation-status">Status</Label>
            <Select value={accommodationFormData.status} onValueChange={(value) => setAccommodationFormData(prev => ({...prev, status: value}))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="researching">Researching</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="accommodation-room-assignment">Room Assignment (optional)</Label>
            <Input 
              id="accommodation-room-assignment" 
              placeholder="e.g., Room 101, Suite A, Floor 3" 
              value={accommodationFormData.roomAssignment || ''}
              onChange={(e) => setAccommodationFormData(prev => ({...prev, roomAssignment: e.target.value}))}
            />
          </div>

          <div>
            <Label>Who's Staying Here?</Label>
            <div className="space-y-2 mt-2">
              {/* Adults */}
              {tripData.adults && tripData.adults.map((adult, idx) => (
                <div key={`adult-${idx}`} className="flex items-center space-x-2">
                  <Checkbox
                    checked={accommodationFormData.assignedMembers?.includes(`adult-${idx}`) || false}
                    onCheckedChange={(checked) => {
                      const currentAssigned = accommodationFormData.assignedMembers || [];
                      const memberId = `adult-${idx}`;
                      const updatedAssigned = checked
                        ? [...currentAssigned, memberId]
                        : currentAssigned.filter(id => id !== memberId);
                      setAccommodationFormData(prev => ({...prev, assignedMembers: updatedAssigned}));
                    }}
                  />
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-700">{adult.name?.[0] || 'A'}</span>
                    </div>
                    <span className="text-sm">{adult.name || 'Adult'}</span>
                  </div>
                </div>
              ))}
              
              {/* Kids */}
              {tripData.kids && tripData.kids.map((kid, idx) => (
                <div key={`kid-${idx}`} className="flex items-center space-x-2">
                  <Checkbox
                    checked={accommodationFormData.assignedMembers?.includes(`kid-${idx}`) || false}
                    onCheckedChange={(checked) => {
                      const currentAssigned = accommodationFormData.assignedMembers || [];
                      const memberId = `kid-${idx}`;
                      const updatedAssigned = checked
                        ? [...currentAssigned, memberId]
                        : currentAssigned.filter(id => id !== memberId);
                      setAccommodationFormData(prev => ({...prev, assignedMembers: updatedAssigned}));
                    }}
                  />
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-pink-700">{kid.name?.[0] || 'K'}</span>
                    </div>
                    <span className="text-sm">{kid.name || 'Kid'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="accommodation-confirmation">Confirmation Number (optional)</Label>
            <Input 
              id="accommodation-confirmation" 
              placeholder="e.g., HTL456, ABC123" 
              value={accommodationFormData.confirmationNumber}
              onChange={(e) => setAccommodationFormData(prev => ({...prev, confirmationNumber: e.target.value}))}
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editingAccommodationIndex !== null ? 'Save Changes' : 'Add Accommodation'}
          </Button>
        </div>
      </div>
    </div>
  );
};