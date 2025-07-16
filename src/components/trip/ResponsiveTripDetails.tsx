import React, { useState, useEffect } from 'react';
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
  const isMobile = useIsMobile(768);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'travel' | 'packing'>('overview');
  
  // Force mobile detection for common mobile screen sizes
  const [forceMobile, setForceMobile] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;
      
      // More aggressive mobile detection - force mobile for any small screen
      const isLikelyMobile = width <= 900 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent) ||
        ('ontouchstart' in window) ||
        width < 1024; // Force mobile for anything under desktop size
      
      setForceMobile(isLikelyMobile);
      console.log('🔍 Screen detection:', { width, height, userAgent, isMobile, forceMobile: isLikelyMobile });
      console.log('📱 Will use mobile layout:', isLikelyMobile || isMobile);
    }
  }, [isMobile]);

  // Force mobile by default, only use desktop for large screens
  const shouldUseMobile = true; // Always use mobile for now to debug

  // Calculate badges for mobile navigation - only show if > 0
  const badges = {
    overview: undefined, // Don't show badge for overview
    itinerary: undefined, // We'll calculate this from actual data later
    travel: undefined, // We'll calculate this from actual data later  
    packing: undefined // We'll calculate this from actual data later
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
  if (shouldUseMobile) {
    console.log('✅ Using mobile layout - activeTab:', activeTab);
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