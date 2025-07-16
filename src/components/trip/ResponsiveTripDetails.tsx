import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileLayout } from '../mobile/MobileLayout';
import { MobileOverview } from '../mobile/MobileOverview';

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
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'travel' | 'packing'>('overview');

  // Calculate badges for mobile navigation
  const badges = {
    overview: 0, // Could be number of urgent items
    itinerary: trip.activities?.filter((a: any) => !a.completed).length || 0,
    travel: trip.flights?.filter((f: any) => !f.confirmationNumber).length || 0,
    packing: trip.packingItems?.filter((i: any) => !i.packed).length || 0
  };

  const handleQuickAction = (action: string) => {
    // Handle quick actions - you can trigger modals or navigation here
    console.log('Quick action:', action);
    
    // Example: trigger existing modals based on action
    switch (action) {
      case 'flight':
        // Trigger flight modal
        break;
      case 'hotel':
        // Trigger accommodation modal
        break;
      case 'activity':
        // Trigger activity modal
        break;
      case 'packing':
        setActiveTab('packing');
        break;
    }
  };

  // Mobile layout
  if (isMobile) {
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
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Itinerary</h2>
            {/* TODO: Add MobileItinerary component */}
            <p className="text-gray-600">Itinerary tab coming soon...</p>
          </div>
        )}
        
        {activeTab === 'travel' && (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Travel</h2>
            {/* TODO: Add MobileTravel component */}
            <p className="text-gray-600">Travel tab coming soon...</p>
          </div>
        )}
        
        {activeTab === 'packing' && (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Packing</h2>
            {/* TODO: Add MobilePacking component */}
            <p className="text-gray-600">Packing tab coming soon...</p>
          </div>
        )}
      </MobileLayout>
    );
  }

  // Desktop layout (existing layout)
  return <>{children}</>;
};