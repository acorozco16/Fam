import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileLayout } from '../mobile/MobileLayout';
import { MobileOverview } from '../mobile/MobileOverview';
import { MobileItinerary } from '../mobile/MobileItinerary';
import { MobileTravel } from '../mobile/MobileTravel';
import { MobilePacking } from '../mobile/MobilePacking';

interface ResponsiveTripDetailsProps {
  trip: any; // Replace with your TripData type
  onBack: () => void;
  children?: React.ReactNode; // Desktop layout
}

export const ResponsiveTripDetails: React.FC<ResponsiveTripDetailsProps> = ({ 
  trip, 
  onBack, 
  children 
}) => {
  const isMobile = useIsMobile(768);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'travel' | 'packing'>('overview');
  
  

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

  // Mobile layout
  if (shouldUseMobile) {
    return (
      <MobileLayout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        badges={badges}
      >
        {activeTab === 'overview' && (
          <MobileOverview trip={trip} onQuickAction={handleQuickAction} />
        )}
        
        {activeTab === 'itinerary' && (
          <MobileItinerary 
            trip={trip} 
            onAddActivity={() => {
              // TODO: Connect to parent's add activity modal
              console.log('Add activity clicked');
            }}
            onEditActivity={(activity) => {
              // TODO: Connect to parent's edit activity modal
              console.log('Edit activity:', activity);
            }}
          />
        )}
        
        {activeTab === 'travel' && (
          <MobileTravel 
            trip={trip} 
            onAddFlight={() => {
              // TODO: Connect to parent's flight modal
              console.log('Add flight clicked');
            }}
            onEditFlight={(flight, index) => {
              // TODO: Connect to parent's edit flight modal
              console.log('Edit flight:', flight, index);
            }}
            onAddAccommodation={() => {
              // TODO: Connect to parent's accommodation modal
              console.log('Add accommodation clicked');
            }}
            onEditAccommodation={(accommodation, index) => {
              // TODO: Connect to parent's edit accommodation modal
              console.log('Edit accommodation:', accommodation, index);
            }}
            onAddTransportation={() => {
              // TODO: Connect to parent's transportation modal
              console.log('Add transportation clicked');
            }}
            onEditTransportation={(transport, index) => {
              // TODO: Connect to parent's edit transportation modal
              console.log('Edit transportation:', transport, index);
            }}
          />
        )}
        
        {activeTab === 'packing' && (
          <MobilePacking 
            trip={trip} 
            onAddPackingItem={(listIndex) => {
              // TODO: Connect to parent's packing modal
              console.log('Add packing item clicked for person:', listIndex);
            }}
            onTogglePackingItem={(listIndex, itemIndex) => {
              // TODO: Connect to parent's packing toggle
              console.log('Toggle packing item:', listIndex, itemIndex);
            }}
            onDeletePackingItem={(listIndex, itemIndex) => {
              // TODO: Connect to parent's packing delete
              console.log('Delete packing item:', listIndex, itemIndex);
            }}
          />
        )}
      </MobileLayout>
    );
  }

  // Desktop layout (existing layout)
  return <>{children}</>;
};