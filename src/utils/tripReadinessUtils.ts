import { FamilyMember } from '../types';

/**
 * Calculate trip readiness data for a given trip
 */
export const calculateTripReadinessData = (trip: any) => {
  const items = [];
  const totalTravelers = (trip.adults?.length || 0) + (trip.kids?.length || 0);
  
  // Destination & Dates
  if (trip.city && trip.country && trip.startDate && trip.endDate) {
    items.push({
      id: 'destination',
      title: 'Destination & Dates Confirmed',
      subtitle: `${trip.city}, ${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${new Date(trip.endDate).toLocaleDateString('en-US', { day: 'numeric' })}`,
      status: 'complete',
      category: 'planning'
    });
  } else {
    items.push({
      id: 'destination',
      title: 'Destination & Dates Confirmed',
      subtitle: 'Complete trip wizard',
      status: 'incomplete',
      category: 'planning'
    });
  }
  
  // Primary Transportation (Flights or Alternative)
  const hasFlights = trip.flights && trip.flights.some((f: any) => f.status === 'booked' || f.status === 'confirmed');
  const hasPrimaryTransport = trip.transportation?.some((t: any) => 
    ['driving', 'train', 'bus'].includes(t.type) && (t.status === 'booked' || t.status === 'confirmed')
  );
  const hasTransportation = hasFlights || hasPrimaryTransport;
  
  items.push({
    id: 'airfare',
    title: hasFlights ? 'Flights Booked' : 'Transportation Arranged',
    subtitle: hasFlights 
      ? `${trip.flights.filter((f: any) => f.status === 'booked' || f.status === 'confirmed').length} flights booked`
      : hasPrimaryTransport 
        ? 'Primary transportation confirmed'
        : 'Need flights or transportation method',
    status: hasTransportation ? 'complete' : 'incomplete',
    category: 'travel',
    urgent: !hasTransportation
  });
  
  // Accommodations
  const hasAccommodations = trip.accommodations && trip.accommodations.some((a: any) => a.status === 'booked' || a.status === 'confirmed');
  items.push({
    id: 'hotel',
    title: 'Hotel Accommodations Secured',
    subtitle: hasAccommodations ? `${trip.accommodations.filter((a: any) => a.status === 'booked' || a.status === 'confirmed').length} accommodations booked` : 'No accommodations booked',
    status: hasAccommodations ? 'complete' : 'incomplete',
    category: 'travel'
  });
  
  // Transportation
  const hasTransport = trip.transportation && trip.transportation.some((t: any) => t.status === 'booked' || t.status === 'confirmed');
  items.push({
    id: 'transport',
    title: 'Transportation Arranged',
    subtitle: hasTransport ? `${trip.transportation.filter((t: any) => t.status === 'booked' || t.status === 'confirmed').length} bookings confirmed` : 'Local transport needed',
    status: hasTransport ? 'complete' : 'incomplete',
    category: 'travel'
  });
  
  // Packing
  const packingProgress = (() => {
    if (!trip.packingLists) return 0;
    
    let totalItems = 0;
    let checkedItems = 0;
    
    Object.values(trip.packingLists).forEach((list: any) => {
      if (list.items) {
        Object.values(list.items).forEach((item: any) => {
          totalItems++;
          if (item.checked) checkedItems++;
        });
      }
    });
    
    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  })();
  
  items.push({
    id: 'packing',
    title: 'Packing Lists Created',
    subtitle: packingProgress > 0 ? `${packingProgress}% of items packed` : 'Packing not started',
    status: packingProgress >= 80 ? 'complete' : 'incomplete',
    category: 'packing'
  });
  
  // Travel Insurance
  const hasInsurance = trip.documents?.insurance;
  items.push({
    id: 'insurance',
    title: 'Travel Insurance Purchased',
    subtitle: hasInsurance ? 'Coverage confirmed' : `Coverage needed for ${totalTravelers} travelers`,
    status: hasInsurance ? 'complete' : 'incomplete',
    category: 'travel',
    urgent: !hasInsurance
  });
  
  // Documents
  const documentsComplete = (() => {
    if (!trip.documents) return false;
    const requiredDocs = ['passport', 'insurance'];
    return requiredDocs.every(doc => trip.documents[doc]);
  })();
  
  items.push({
    id: 'documents',
    title: 'Passports/Documents Ready',
    subtitle: documentsComplete ? 'All documents confirmed' : 'Check document requirements',
    status: documentsComplete ? 'complete' : 'incomplete',
    category: 'planning'
  });
  
  // Activities
  const activitiesCount = trip.activities ? trip.activities.length : 0;
  items.push({
    id: 'activities',
    title: 'Activities & Reservations',
    subtitle: activitiesCount > 0 ? `${activitiesCount} planned, 0 more suggested` : '0 planned, 0 more suggested',
    status: activitiesCount > 0 ? 'complete' : 'incomplete',
    category: 'itinerary'
  });
  
  // Emergency Contacts
  const emergencyCount = trip.emergencyContacts ? trip.emergencyContacts.length : 0;
  items.push({
    id: 'emergency',
    title: 'Emergency Contacts Shared',
    subtitle: emergencyCount > 0 ? 'Local contacts added' : 'Local contacts needed',
    status: emergencyCount > 0 ? 'complete' : 'incomplete',
    category: 'planning'
  });
  
  // Currency
  items.push({
    id: 'currency',
    title: 'Currency & Payment Methods',
    subtitle: trip.currencyReady ? 'Bank notified, cards activated' : 'Bank notified, cards activated',
    status: trip.currencyReady ? 'complete' : 'incomplete',
    category: 'planning'
  });
  
  // Health Information
  const familyProfiles = JSON.parse(localStorage.getItem('familyProfiles') || '[]');
  const healthInfoComplete = familyProfiles.length > 0 && familyProfiles.every((profile: FamilyMember) => 
    profile.healthInfo && profile.healthInfo.trim() !== ''
  );
  items.push({
    id: 'health-info',
    title: 'Health Information Complete',
    subtitle: healthInfoComplete ? 'All family members have health info' : 'Add health info for all family members',
    status: healthInfoComplete ? 'complete' : 'incomplete',
    category: 'planning'
  });
  
  // Add custom readiness items
  if (trip.customReadinessItems) {
    items.push(...trip.customReadinessItems);
  }
  
  // Filter out hidden items
  const visibleItems = items.filter(item => 
    !trip.hiddenReadinessItems?.includes(item.id)
  );
  
  return visibleItems;
};