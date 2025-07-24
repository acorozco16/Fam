import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileLayout } from '../mobile/MobileLayout';
import { MobileOverview } from '../mobile/MobileOverview';
import { MobileItinerary } from '../mobile/MobileItinerary';
import { MobileTravel } from '../mobile/MobileTravel';
import { MobilePacking } from '../mobile/MobilePacking';
import { MobileActivityForm } from '../mobile/forms/MobileActivityForm';
import { MobileFlightForm } from '../mobile/forms/MobileFlightForm';
import { MobileAccommodationForm } from '../mobile/forms/MobileAccommodationForm';
import { MobileTransportForm } from '../mobile/forms/MobileTransportForm';

interface FamilyMember {
  id: string;
  name: string;
  type: 'adult' | 'child';
  age?: string;
  email?: string;
  interests?: string;
  specialNeeds?: string;
  inviteStatus?: string;
  isConnection?: boolean;
  avatar?: string;
  role?: 'parent' | 'child' | 'collaborator';
  status?: 'online' | 'offline';
  lastActive?: string;
  healthInfo?: string;
  dietaryInfo?: string;
  parentId?: string;
  relationship?: string;
  createdAt?: string;
  updatedAt?: string;
  dateOfBirth?: string;
  energyLevel?: string[];
  activityPreferences?: string[];
  sleepSchedule?: string;
  bestTimes?: string;
  specialConsiderations?: string;
}

interface ResponsiveTripDetailsProps {
  trip: any; // Replace with your TripData type
  onBack: () => void;
  children?: React.ReactNode; // Desktop layout
  // Mobile handlers
  onAddActivity?: () => void;
  onEditActivity?: (activity: any) => void;
  onAddFlight?: () => void;
  onEditFlight?: (flight: any, index: number) => void;
  onAddAccommodation?: () => void;
  onEditAccommodation?: (accommodation: any, index: number) => void;
  onAddTransportation?: () => void;
  onEditTransportation?: (transport: any, index: number) => void;
  onAddPackingItem?: (listIndex: number) => void;
  onTogglePackingItem?: (listIndex: number, itemIndex: number) => void;
  onDeletePackingItem?: (listIndex: number, itemIndex: number) => void;
  onUpdateTrip?: (updatedTrip: any) => void;
  // Family profile props
  familyProfiles?: FamilyMember[];
  onOpenFamilyProfiles?: () => void;
}

export const ResponsiveTripDetails: React.FC<ResponsiveTripDetailsProps> = ({ 
  trip, 
  onBack, 
  children,
  // Mobile handlers
  onAddActivity,
  onEditActivity,
  onAddFlight,
  onEditFlight,
  onAddAccommodation,
  onEditAccommodation,
  onAddTransportation,
  onEditTransportation,
  onAddPackingItem,
  onTogglePackingItem,
  onDeletePackingItem,
  onUpdateTrip,
  // Family profile props
  familyProfiles = [],
  onOpenFamilyProfiles
}) => {
  const isMobile = useIsMobile(768);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'travel' | 'packing'>('overview');
  const [mobileView, setMobileView] = useState<'main' | 'add-activity' | 'edit-activity' | 'add-flight' | 'edit-flight' | 'add-accommodation' | 'edit-accommodation' | 'add-transport' | 'edit-transport'>('main');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  

  const shouldUseMobile = isMobile; // Use proper mobile detection

  // Calculate badges for mobile navigation - only show if > 0
  const badges = {
    overview: undefined, // Don't show badge for overview
    itinerary: undefined, // We'll calculate this from actual data later
    travel: undefined, // We'll calculate this from actual data later  
    packing: undefined // We'll calculate this from actual data later
  };

  const handleQuickAction = (action: string) => {
    // Handle quick actions - navigate to respective pages based on action
    switch (action) {
      case 'view-lists':
      case 'packing':
        setActiveTab('packing');
        break;
      case 'set-reminder':
      case 'flight':
      case 'check-now':
        setActiveTab('travel');
        break;
      case 'hotel':
      case 'accommodation':
        setActiveTab('travel');
        break;
      case 'activity':
      case 'plan-now':
        setActiveTab('itinerary');
        break;
      case 'consider':
        // For "Consider" actions, stay on overview for now
        break;
      default:
        // For other actions, stay on overview
        break;
    }
  };

  // Mobile form navigation handlers
  const handleMobileAddActivity = () => {
    setMobileView('add-activity');
  };

  const handleMobileEditActivity = (activity: any) => {
    setEditingItem(activity);
    setMobileView('edit-activity');
  };

  const handleMobileAddFlight = () => {
    setMobileView('add-flight');
  };

  const handleMobileEditFlight = (flight: any, index: number) => {
    setEditingItem(flight);
    setEditingIndex(index);
    setMobileView('edit-flight');
  };

  const handleMobileAddAccommodation = () => {
    setMobileView('add-accommodation');
  };

  const handleMobileEditAccommodation = (accommodation: any, index: number) => {
    setEditingItem(accommodation);
    setEditingIndex(index);
    setMobileView('edit-accommodation');
  };

  const handleMobileAddTransport = () => {
    setMobileView('add-transport');
  };

  const handleMobileEditTransport = (transport: any, index: number) => {
    setEditingItem(transport);
    setEditingIndex(index);
    setMobileView('edit-transport');
  };

  const handleMobileFormSave = (formData: any) => {
    switch (mobileView) {
      case 'add-activity':
        // Add new activity directly to trip data
        if (onUpdateTrip) {
          const newActivity = {
            ...formData,
            id: Date.now().toString(),
            status: 'planned'
          };
          
          const updatedTrip = {
            ...trip,
            activities: [...(trip.activities || []), newActivity]
          };
          
          onUpdateTrip(updatedTrip);
        }
        break;
      case 'edit-activity':
        // Update existing activity
        if (onUpdateTrip && editingItem) {
          const updatedActivities = trip.activities?.map((activity: any) => 
            activity.id === editingItem.id ? { ...formData, id: editingItem.id } : activity
          ) || [];
          
          const updatedTrip = {
            ...trip,
            activities: updatedActivities
          };
          
          onUpdateTrip(updatedTrip);
        }
        break;
      case 'add-flight':
        // Add new flight
        if (onUpdateTrip) {
          const newFlight = {
            ...formData,
            id: Date.now().toString()
          };
          
          const updatedTrip = {
            ...trip,
            flights: [...(trip.flights || []), newFlight]
          };
          
          onUpdateTrip(updatedTrip);
        }
        break;
      case 'edit-flight':
        // Update existing flight
        if (onUpdateTrip && editingItem && editingIndex !== null) {
          const updatedFlights = [...(trip.flights || [])];
          updatedFlights[editingIndex] = { ...formData, id: editingItem.id };
          
          const updatedTrip = {
            ...trip,
            flights: updatedFlights
          };
          
          onUpdateTrip(updatedTrip);
        }
        break;
      case 'add-accommodation':
        // Add new accommodation
        if (onUpdateTrip) {
          const newAccommodation = {
            ...formData,
            id: Date.now().toString()
          };
          
          const updatedTrip = {
            ...trip,
            accommodations: [...(trip.accommodations || []), newAccommodation]
          };
          
          onUpdateTrip(updatedTrip);
        }
        break;
      case 'edit-accommodation':
        // Update existing accommodation
        if (onUpdateTrip && editingItem && editingIndex !== null) {
          const updatedAccommodations = [...(trip.accommodations || [])];
          updatedAccommodations[editingIndex] = { ...formData, id: editingItem.id };
          
          const updatedTrip = {
            ...trip,
            accommodations: updatedAccommodations
          };
          
          onUpdateTrip(updatedTrip);
        }
        break;
      case 'add-transport':
        // Add new transport
        if (onUpdateTrip) {
          const newTransport = {
            ...formData,
            id: Date.now().toString()
          };
          
          const updatedTrip = {
            ...trip,
            transportation: [...(trip.transportation || []), newTransport]
          };
          
          onUpdateTrip(updatedTrip);
        }
        break;
      case 'edit-transport':
        // Update existing transport
        if (onUpdateTrip && editingItem && editingIndex !== null) {
          const updatedTransportation = [...(trip.transportation || [])];
          updatedTransportation[editingIndex] = { ...formData, id: editingItem.id };
          
          const updatedTrip = {
            ...trip,
            transportation: updatedTransportation
          };
          
          onUpdateTrip(updatedTrip);
        }
        break;
    }
    
    // Navigate back to main view
    setMobileView('main');
    setEditingItem(null);
    setEditingIndex(null);
  };

  const handleMobileFormCancel = () => {
    setMobileView('main');
    setEditingItem(null);
    setEditingIndex(null);
  };

  // Mobile layout
  if (shouldUseMobile) {
    // Show mobile forms when in form view
    if (mobileView !== 'main') {
      switch (mobileView) {
        case 'add-activity':
        case 'edit-activity':
          return (
            <MobileActivityForm
              activity={mobileView === 'edit-activity' ? editingItem : undefined}
              onSave={handleMobileFormSave}
              onCancel={handleMobileFormCancel}
              familyMembers={[...(trip.adults || []), ...(trip.kids || [])]}
            />
          );
        case 'add-flight':
        case 'edit-flight':
          return (
            <MobileFlightForm
              flight={mobileView === 'edit-flight' ? editingItem : undefined}
              onSave={handleMobileFormSave}
              onCancel={handleMobileFormCancel}
              familyMembers={[...(trip.adults || []), ...(trip.kids || [])]}
            />
          );
        case 'add-accommodation':
        case 'edit-accommodation':
          return (
            <MobileAccommodationForm
              accommodation={mobileView === 'edit-accommodation' ? editingItem : undefined}
              onSave={handleMobileFormSave}
              onCancel={handleMobileFormCancel}
              familyMembers={[...(trip.adults || []), ...(trip.kids || [])]}
            />
          );
        case 'add-transport':
        case 'edit-transport':
          return (
            <MobileTransportForm
              transport={mobileView === 'edit-transport' ? editingItem : undefined}
              onSave={handleMobileFormSave}
              onCancel={handleMobileFormCancel}
              familyMembers={[...(trip.adults || []), ...(trip.kids || [])]}
            />
          );
        default:
          // Fallback to main view if unknown form view
          setMobileView('main');
          break;
      }
    }

    // Show main tab layout
    return (
      <MobileLayout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        badges={badges}
      >
        {activeTab === 'overview' && (
          <MobileOverview 
            trip={trip} 
            onQuickAction={handleQuickAction} 
            onUpdateTrip={onUpdateTrip}
            familyProfiles={familyProfiles}
            onOpenFamilyProfiles={onOpenFamilyProfiles}
          />
        )}
        
        {activeTab === 'itinerary' && (
          <MobileItinerary 
            trip={trip} 
            onAddActivity={handleMobileAddActivity}
            onEditActivity={handleMobileEditActivity}
            familyProfiles={familyProfiles}
            onOpenFamilyProfiles={onOpenFamilyProfiles}
          />
        )}
        
        {activeTab === 'travel' && (
          <MobileTravel 
            trip={trip} 
            onAddFlight={handleMobileAddFlight}
            onEditFlight={handleMobileEditFlight}
            onAddAccommodation={handleMobileAddAccommodation}
            onEditAccommodation={handleMobileEditAccommodation}
            onAddTransportation={handleMobileAddTransport}
            onEditTransportation={handleMobileEditTransport}
            familyProfiles={familyProfiles}
            onOpenFamilyProfiles={onOpenFamilyProfiles}
          />
        )}
        
        {activeTab === 'packing' && (
          <MobilePacking 
            trip={trip} 
            onAddPackingItem={onAddPackingItem || ((listIndex) => console.log('Add packing item clicked for category:', listIndex))}
            onTogglePackingItem={onTogglePackingItem || ((listIndex, itemIndex) => console.log('Toggle packing item:', listIndex, itemIndex))}
            onDeletePackingItem={onDeletePackingItem || ((listIndex, itemIndex) => console.log('Delete packing item:', listIndex, itemIndex))}
            onUpdateTrip={onUpdateTrip}
          />
        )}
      </MobileLayout>
    );
  }

  // Desktop layout (existing layout)
  return <>{children}</>;
};