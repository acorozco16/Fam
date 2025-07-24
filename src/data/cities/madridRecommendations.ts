/**
 * Madrid Family Travel Intelligence - ESSENTIAL TASKS ONLY
 * Focus: Critical cultural differences and major booking deadlines
 * Additional recommendations stored separately to avoid task overload
 */

export function generateMadridTasks(familyProfile: any, daysUntilTrip: number) {
  const tasks = [];
  const kids = familyProfile.kids || [];
  const tripPurpose = familyProfile.tripPurpose;
  const hasSchoolAge = kids.some((kid: any) => {
    const age = parseInt(kid.age);
    return age >= 5 && age <= 12;
  });

  // ESSENTIAL ONLY: Critical cultural difference (unless business trip)
  if (tripPurpose !== 'business-family') {
    tasks.push({
      id: 'madrid-meal-timing',
      title: 'Note: Spanish Meal Times Very Different',
      subtitle: 'Lunch 2-4pm, dinner 9-11pm - restaurants closed between. Pack snacks!',
      category: 'essential',
      status: 'incomplete',
      urgent: false,
      isCustom: false,
      priority: 'high',
      daysBeforeTrip: 7,
      intelligence: {
        reasoning: [
          '🕐 Spanish lunch: 2-4pm (restaurants closed before)',
          '🌙 Spanish dinner: 9-11pm (very late for kids)',
          '🥪 Pack snacks for 5-7pm hunger gap',
          '⚠️ This catches many families off guard'
        ].join('\n'),
        source: 'Madrid cultural essentials'
      }
    });
  }

  // ESSENTIAL ONLY: Major museum that needs advance planning (family vacation focus)
  if (hasSchoolAge && daysUntilTrip >= 21 && tripPurpose === 'family-vacation') {
    tasks.push({
      id: 'prado-museum-advance-booking',
      title: 'Consider Prado Museum Family Tour',
      subtitle: 'World-class art - family tours make it engaging, book ahead for skip-the-line',
      category: 'booking',
      status: 'incomplete',
      urgent: false,
      isCustom: false,
      priority: 'medium',
      daysBeforeTrip: 21,
      intelligence: {
        reasoning: [
          '🎨 Skip-the-line family tours available',
          '🎫 Under 18 free admission',
          '⏰ 90 minutes max with young kids',
          '📅 Book ahead to avoid disappointment'
        ].join('\n'),
        source: 'Madrid booking essentials'
      }
    });
  }

  return tasks;
}

import { TripTip } from '../../types';

/**
 * Tips for your Madrid trip - browseable recommendations
 */

export const madridTripTips: TripTip[] = [
  // Parks & Activities
  {
    id: 'madrid-retiro-park',
    title: 'Retiro Park - Rowboats & Puppet Shows',
    description: 'Rent rowboats on the lake (kids love it!), weekend puppet shows at Retiro Puppet Theater, Crystal Palace for photos',
    category: 'attraction',
    ageRecommendation: 'All ages',
    estimatedDuration: '2-4 hours',
    cost: 'Free (rowboats €6)',
    canAddToItinerary: true,
    itineraryTemplate: {
      name: 'Retiro Park & Rowboats',
      location: 'Parque del Retiro, Madrid',
      estimatedDuration: '3 hours',
      category: 'outdoor'
    }
  },
  {
    id: 'madrid-warner-bros',
    title: 'Warner Bros Park - DC Comics Theme Park',
    description: '30 minutes outside Madrid by car, much less crowded than Disney parks, great DC Comics themed rides',
    category: 'attraction',
    ageRecommendation: '5-15 years',
    estimatedDuration: 'Full day',
    cost: '€25-35',
    canAddToItinerary: true,
    itineraryTemplate: {
      name: 'Warner Bros Park',
      location: 'San Martín de la Vega (30min from Madrid)',
      estimatedDuration: '8 hours',
      category: 'theme-park'
    }
  },
  
  // Family Restaurants
  {
    id: 'madrid-mercado-san-miguel',
    title: 'Mercado San Miguel - Food Hall Paradise',
    description: 'Beautiful glass food hall near Plaza Mayor. Kids love choosing from multiple stalls - jamón, cheese, olives, pastries',
    category: 'restaurant',
    ageRecommendation: 'All ages',
    estimatedDuration: '1-2 hours',
    cost: '€€',
    canAddToItinerary: true,
    itineraryTemplate: {
      name: 'Lunch at Mercado San Miguel',
      location: 'Plaza de San Miguel, near Plaza Mayor',
      estimatedDuration: '1.5 hours',
      category: 'dining'
    }
  },
  {
    id: 'madrid-san-gines',
    title: 'San Ginés Chocolatería - 24-Hour Churros',
    description: 'Famous 24-hour churrería near Sol. Thick hot chocolate for dipping churros - traditional Spanish breakfast or merienda',
    category: 'restaurant',
    ageRecommendation: 'All ages',
    estimatedDuration: '30-45 minutes',
    cost: '€',
    canAddToItinerary: true,
    itineraryTemplate: {
      name: 'Churros con Chocolate',
      location: 'San Ginés Chocolatería, near Puerta del Sol',
      estimatedDuration: '45 minutes',
      category: 'dining'
    }
  },
  {
    id: 'madrid-casa-lucio',
    title: 'Casa Lucio - Famous for Huevos Rotos',
    description: 'Traditional tavern famous for huevos rotos (broken eggs over fries). Kids love the simple, tasty concept',
    category: 'restaurant',
    ageRecommendation: 'All ages',
    estimatedDuration: '1-2 hours',
    cost: '€€',
    canAddToItinerary: true,
    itineraryTemplate: {
      name: 'Dinner at Casa Lucio',
      location: 'Calle de la Cava Baja, La Latina',
      estimatedDuration: '1.5 hours',
      category: 'dining'
    }
  },

  // Getting Around
  {
    id: 'madrid-metro-family',
    title: 'Madrid Metro with Kids',
    description: 'Kids under 4 ride free. Buy 10-trip ticket (can share among family). Most central stations have elevators.',
    category: 'transport',
    ageRecommendation: 'All ages',
    estimatedDuration: 'N/A',
    cost: '€1.50-2 per trip',
    canAddToItinerary: false
  },

  // Cultural Tips
  {
    id: 'madrid-siesta-culture',
    title: 'Spanish Schedule - Plan Around Siesta',
    description: 'Shops close 2-5pm for siesta. Use this time for lunch, park visits, or hotel rest with tired kids',
    category: 'cultural',
    ageRecommendation: 'All families',
    estimatedDuration: 'N/A',
    cost: 'Free',
    canAddToItinerary: false
  }
];