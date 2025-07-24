/**
 * Manual city-specific recommendations
 * Quick way to add specific value without scraping
 */

export interface CityRecommendation {
  city: string;
  country: string;
  restaurants: Array<{
    name: string;
    address: string;
    phone?: string;
    familyFeatures: string[];
    bestTime: string;
    priceLevel: 'budget' | 'mid-range' | 'expensive';
    notes: string;
  }>;
  activities: Array<{
    name: string;
    address: string;
    ageRecommendation: string;
    duration: string;
    notes: string;
  }>;
  practicalTips: string[];
}

export const CITY_RECOMMENDATIONS: Record<string, CityRecommendation> = {
  'madrid': {
    city: 'Madrid',
    country: 'Spain',
    restaurants: [
      {
        name: 'Casa Botín',
        address: 'Calle Cuchilleros, 17',
        phone: '+34 913 664 217',
        familyFeatures: ['high chairs', 'children portions', 'historic atmosphere'],
        bestTime: '5:30pm early dinner',
        priceLevel: 'expensive',
        notes: 'World\'s oldest restaurant (1725) - book 2-3 weeks ahead, kids love the historic setting'
      },
      {
        name: 'Mercado de San Miguel',
        address: 'Plaza de San Miguel, s/n',
        familyFeatures: ['multiple food options', 'casual eating', 'stroller accessible'],
        bestTime: '11am-2pm lunch',
        priceLevel: 'mid-range',
        notes: 'Perfect for picky eaters - 10+ food stalls, avoid 7-9pm crowds'
      }
    ],
    activities: [
      {
        name: 'Retiro Park',
        address: 'Plaza de la Independencia, 7',
        ageRecommendation: 'All ages',
        duration: '2-3 hours',
        notes: 'Great for morning walks, playground areas, boat rentals on the lake'
      },
      {
        name: 'Prado Museum',
        address: 'Calle de Ruiz de Alarcón, 23',
        ageRecommendation: '8+ years',
        duration: '1.5 hours max with kids',
        notes: 'Visit before 11am, focus on Velázquez rooms, get family audio guides'
      }
    ],
    practicalTips: [
      'Metro is stroller-friendly with elevators at most stations',
      'Siesta time 2-5pm - plan indoor activities or rest time',
      'Dinner starts late (9pm+) - stick to early family dining'
    ]
  },
  
  'paris': {
    city: 'Paris',
    country: 'France',
    restaurants: [
      {
        name: 'L\'As du Fallafel',
        address: '34 Rue des Rosiers',
        familyFeatures: ['quick service', 'outdoor seating', 'kid-friendly'],
        bestTime: '12pm lunch',
        priceLevel: 'budget',
        notes: 'Famous falafel in Marais district - kids love the wraps, expect queues'
      }
    ],
    activities: [
      {
        name: 'Luxembourg Gardens',
        address: 'Rue de Médicis',
        ageRecommendation: 'All ages',
        duration: 'Half day',
        notes: 'Huge playground, puppet shows, boat rentals - perfect family day out'
      }
    ],
    practicalTips: [
      'Many metro stations lack elevators - research stroller-friendly routes',
      'Playgrounds often locked - bring kids\' own toys',
      'Museums free for EU residents under 26'
    ]
  }
};

/**
 * Get city-specific recommendations
 */
export function getCityRecommendations(city: string, country?: string): CityRecommendation | null {
  const key = city.toLowerCase();
  return CITY_RECOMMENDATIONS[key] || null;
}

/**
 * Generate specific tasks from city recommendations
 */
export function generateCitySpecificTasks(city: string, familyProfile: any) {
  const recommendations = getCityRecommendations(city);
  if (!recommendations) return [];

  const tasks = [];

  // Add restaurant recommendations
  recommendations.restaurants.slice(0, 2).forEach((restaurant, index) => {
    tasks.push({
      id: `city-restaurant-${index}`,
      title: `Try: ${restaurant.name}`,
      subtitle: `${restaurant.notes.split('.')[0]} - ${restaurant.bestTime}`,
      category: 'planning',
      status: 'incomplete',
      urgent: false,
      isCustom: false,
      priority: index === 0 ? 'medium' : 'low',
      daysBeforeTrip: 14,
      intelligence: {
        reasoning: [
          restaurant.phone ? `📞 ${restaurant.phone}` : '',
          `📍 ${restaurant.address}`,
          `👨‍👩‍👧‍👦 ${restaurant.familyFeatures.join(', ')}`,
          `💡 ${restaurant.notes}`
        ].filter(Boolean).join('\n'),
        source: 'Curated city recommendations'
      }
    });
  });

  // Add activity recommendations
  recommendations.activities.slice(0, 2).forEach((activity, index) => {
    tasks.push({
      id: `city-activity-${index}`,
      title: `Visit: ${activity.name}`,
      subtitle: `${activity.ageRecommendation} - ${activity.duration}`,
      category: 'planning',
      status: 'incomplete',
      urgent: false,
      isCustom: false,
      priority: 'medium',
      daysBeforeTrip: 7,
      intelligence: {
        reasoning: `📍 ${activity.address}\n💡 ${activity.notes}`,
        source: 'Curated city recommendations'
      }
    });
  });

  return tasks;
}