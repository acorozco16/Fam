import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

import { TripData, FlightFormData } from '../../types';

interface FlightModalProps {
  show: boolean;
  onClose: () => void;
  tripData: TripData;
  editingFlightIndex: number | null;
  flightFormData: FlightFormData;
  setFlightFormData: (data: FlightFormData) => void;
  onSave: (flight: any) => void;
  onUpdate: (flight: any, index: number) => void;
}

export const FlightModal: React.FC<FlightModalProps> = ({
  show,
  onClose,
  tripData,
  editingFlightIndex,
  flightFormData,
  setFlightFormData,
  onSave,
  onUpdate
}) => {
  const handleSave = () => {
    if (editingFlightIndex !== null) {
      // Edit mode - update existing flight
      const updatedFlight = {
        ...flightFormData,
        updatedAt: new Date().toISOString()
      };
      onUpdate(updatedFlight, editingFlightIndex);
    } else {
      // Add mode - create new flight
      const newFlight = {
        id: Date.now().toString(),
        ...flightFormData,
        createdAt: new Date().toISOString()
      };
      onSave(newFlight);
    }
    
    onClose();
  };

  const resetForm = () => {
    setFlightFormData({
      airline: '',
      flightNumber: '',
      departure: '',
      arrival: '',
      departureTime: '',
      arrivalTime: '',
      confirmationNumber: '',
      status: 'confirmed',
      assignedMembers: []
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{editingFlightIndex !== null ? 'Edit Flight' : 'Add Flight'}</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="flight-type">Flight Type</Label>
            <Select onValueChange={(value) => setFlightFormData(prev => ({...prev, type: value}))}>
              <SelectTrigger>
                <SelectValue placeholder="Select flight type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outbound">Outbound Flight</SelectItem>
                <SelectItem value="return">Return Flight</SelectItem>
                <SelectItem value="one-way">One-way Flight</SelectItem>
                <SelectItem value="connecting">Connecting Flight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="airline">Airline</Label>
              <Input 
                id="airline" 
                placeholder="e.g., American Airlines" 
                value={flightFormData.airline}
                onChange={(e) => setFlightFormData(prev => ({...prev, airline: e.target.value}))}
              />
            </div>
            <div>
              <Label htmlFor="flight-number">Flight Number</Label>
              <Input 
                id="flight-number" 
                placeholder="e.g., AA123" 
                value={flightFormData.flightNumber}
                onChange={(e) => setFlightFormData(prev => ({...prev, flightNumber: e.target.value}))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="flight-from">From</Label>
              <Input 
                id="flight-from" 
                placeholder="Departure airport" 
                value={flightFormData.departure}
                onChange={(e) => setFlightFormData(prev => ({...prev, departure: e.target.value}))}
              />
            </div>
            <div>
              <Label htmlFor="flight-to">To</Label>
              <Input 
                id="flight-to" 
                placeholder="Arrival airport" 
                value={flightFormData.arrival}
                onChange={(e) => setFlightFormData(prev => ({...prev, arrival: e.target.value}))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="flight-date">Date</Label>
              <Input 
                id="flight-date" 
                type="date" 
                value={flightFormData.departureTime.split('T')[0] || ''}
                onChange={(e) => setFlightFormData(prev => ({...prev, departureTime: e.target.value}))}
              />
            </div>
            <div>
              <Label htmlFor="flight-time">Time</Label>
              <Input 
                id="flight-time" 
                type="time" 
                value={flightFormData.departureTime.split('T')[1]?.substring(0,5) || ''}
                onChange={(e) => {
                  const date = flightFormData.departureTime.split('T')[0] || '';
                  const datetime = date + 'T' + e.target.value;
                  setFlightFormData(prev => ({...prev, departureTime: datetime}));
                }}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="flight-status">Status</Label>
            <Select onValueChange={(value) => setFlightFormData(prev => ({...prev, status: value}))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="researching">Researching</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Who's Taking This Flight?</Label>
            <div className="space-y-2 mt-2">
              {/* Adults */}
              {tripData.adults && tripData.adults.length > 0 ? tripData.adults.map((adult, idx) => (
                <div key={`adult-${idx}`} className="flex items-center space-x-2">
                  <Checkbox
                    checked={flightFormData.assignedMembers?.includes(`adult-${idx}`) || false}
                    onCheckedChange={(checked) => {
                      const currentAssigned = flightFormData.assignedMembers || [];
                      const memberId = `adult-${idx}`;
                      const updatedAssigned = checked
                        ? [...currentAssigned, memberId]
                        : currentAssigned.filter(id => id !== memberId);
                      setFlightFormData(prev => ({...prev, assignedMembers: updatedAssigned}));
                    }}
                  />
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-700">{adult.name?.[0] || 'A'}</span>
                    </div>
                    <span className="text-sm">{adult.name || 'Adult'}</span>
                  </div>
                </div>
              )) : null}
              
              {/* Kids */}
              {tripData.kids && tripData.kids.length > 0 ? tripData.kids.map((kid, idx) => (
                <div key={`kid-${idx}`} className="flex items-center space-x-2">
                  <Checkbox
                    checked={flightFormData.assignedMembers?.includes(`kid-${idx}`) || false}
                    onCheckedChange={(checked) => {
                      const currentAssigned = flightFormData.assignedMembers || [];
                      const memberId = `kid-${idx}`;
                      const updatedAssigned = checked
                        ? [...currentAssigned, memberId]
                        : currentAssigned.filter(id => id !== memberId);
                      setFlightFormData(prev => ({...prev, assignedMembers: updatedAssigned}));
                    }}
                  />
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-pink-700">{kid.name?.[0] || 'K'}</span>
                    </div>
                    <span className="text-sm">{kid.name || 'Kid'}</span>
                  </div>
                </div>
              )) : null}
              
              {/* Show message if no family members */}
              {(!tripData.adults || tripData.adults.length === 0) && (!tripData.kids || tripData.kids.length === 0) && (
                <div className="text-sm text-gray-500 italic">
                  No family members added yet. Add family members in the trip setup to assign them to flights.
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="confirmation-number">Confirmation Number (optional)</Label>
            <Input 
              id="confirmation-number" 
              placeholder="e.g., ABC123" 
              value={flightFormData.confirmationNumber}
              onChange={(e) => setFlightFormData(prev => ({...prev, confirmationNumber: e.target.value}))}
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editingFlightIndex !== null ? 'Save Changes' : 'Add Flight'}
          </Button>
        </div>
      </div>
    </div>
  );
};