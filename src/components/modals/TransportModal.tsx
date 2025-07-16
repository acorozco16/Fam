import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

import { TripData, TransportFormData } from '../../types';

interface TransportModalProps {
  show: boolean;
  onClose: () => void;
  tripData: TripData;
  editingTransportationIndex: number | null;
  transportFormData: TransportFormData;
  setTransportFormData: (data: TransportFormData) => void;
  onSave: (transport: any) => void;
  onUpdate: (transport: any, index: number) => void;
}

export const TransportModal: React.FC<TransportModalProps> = ({
  show,
  onClose,
  tripData,
  editingTransportationIndex,
  transportFormData,
  setTransportFormData,
  onSave,
  onUpdate
}) => {
  const handleSave = () => {
    if (editingTransportationIndex !== null) {
      // Edit mode - update existing transportation
      const updatedTransport = {
        ...transportFormData,
        updatedAt: new Date().toISOString()
      };
      onUpdate(updatedTransport, editingTransportationIndex);
    } else {
      // Add mode - create new transportation
      const newTransport = {
        id: Date.now().toString(),
        ...transportFormData,
        createdAt: new Date().toISOString()
      };
      onSave(newTransport);
    }
    
    onClose();
  };

  const resetForm = () => {
    setTransportFormData({
      type: 'driving',
      details: '',
      departure: '',
      arrival: '',
      date: '',
      time: '',
      assignedMembers: [],
      confirmationNumber: '',
      status: 'confirmed'
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
          <h2 className="text-xl font-bold">{editingTransportationIndex !== null ? 'Edit Transportation' : 'Add Transportation'}</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="transport-type">Transportation Type</Label>
            <Select value={transportFormData.type} onValueChange={(value) => setTransportFormData(prev => ({...prev, type: value}))}>
              <SelectTrigger>
                <SelectValue placeholder="Select transportation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="driving">Driving (Personal Car)</SelectItem>
                <SelectItem value="train">Train/Railway</SelectItem>
                <SelectItem value="bus">Bus/Coach</SelectItem>
                <SelectItem value="rental-car">Rental Car (At Destination)</SelectItem>
                <SelectItem value="subway-pass">Subway/Metro Pass</SelectItem>
                <SelectItem value="taxi-uber">Taxi/Rideshare</SelectItem>
                <SelectItem value="airport-transfer">Airport Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="transport-details">Details</Label>
            <Input 
              id="transport-details" 
              placeholder="e.g., Compact car from Hertz" 
              value={transportFormData.details}
              onChange={(e) => setTransportFormData(prev => ({...prev, details: e.target.value}))}
            />
          </div>

          <div>
            <Label htmlFor="transport-dates">Date</Label>
            <Input 
              id="transport-dates" 
              type="date"
              value={transportFormData.date}
              onChange={(e) => setTransportFormData(prev => ({...prev, date: e.target.value}))}
            />
          </div>

          <div>
            <Label htmlFor="transport-status">Status</Label>
            <Select value={transportFormData.status} onValueChange={(value) => setTransportFormData(prev => ({...prev, status: value}))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="researching">Researching</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Who's Using This Transportation?</Label>
            <div className="space-y-2 mt-2">
              {/* Adults */}
              {tripData.adults && tripData.adults.map((adult, idx) => (
                <div key={`adult-${idx}`} className="flex items-center space-x-2">
                  <Checkbox
                    checked={transportFormData.assignedMembers?.includes(`adult-${idx}`) || false}
                    onCheckedChange={(checked) => {
                      const currentAssigned = transportFormData.assignedMembers || [];
                      const memberId = `adult-${idx}`;
                      const updatedAssigned = checked
                        ? [...currentAssigned, memberId]
                        : currentAssigned.filter(id => id !== memberId);
                      setTransportFormData(prev => ({...prev, assignedMembers: updatedAssigned}));
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
                    checked={transportFormData.assignedMembers?.includes(`kid-${idx}`) || false}
                    onCheckedChange={(checked) => {
                      const currentAssigned = transportFormData.assignedMembers || [];
                      const memberId = `kid-${idx}`;
                      const updatedAssigned = checked
                        ? [...currentAssigned, memberId]
                        : currentAssigned.filter(id => id !== memberId);
                      setTransportFormData(prev => ({...prev, assignedMembers: updatedAssigned}));
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
            <Label htmlFor="transport-confirmation">Confirmation/Reference (optional)</Label>
            <Input 
              id="transport-confirmation" 
              placeholder="e.g., CAR789" 
              value={transportFormData.confirmationNumber}
              onChange={(e) => setTransportFormData(prev => ({...prev, confirmationNumber: e.target.value}))}
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editingTransportationIndex !== null ? 'Update Transportation' : 'Add Transportation'}
          </Button>
        </div>
      </div>
    </div>
  );
};