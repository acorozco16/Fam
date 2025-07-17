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
      
      // VERY aggressive mobile detection - force mobile for iPhone
      const isLikelyMobile = width <= 1200 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Safari/i.test(userAgent) ||
        ('ontouchstart' in window) ||
        width < 1200 || // Force mobile for anything under 1200px
        height < 1000; // Force mobile for short screens
      
      setForceMobile(isLikelyMobile);
      console.log('🔍 Screen detection:', { width, height, userAgent, isMobile, forceMobile: isLikelyMobile });
      console.log('📱 Will use mobile layout:', isLikelyMobile || isMobile);
    }
  }, [isMobile]);

  const shouldUseMobile = true; // Force mobile for everyone to test

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