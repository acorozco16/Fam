/**
 * Integration Example: How Scraped Data Enhances AI Tasks
 * This shows the transformation from generic to specific recommendations
 */

import { MadridRestaurantScraper, ScrapedRestaurant } from './madridRestaurantScraper';

export class EnhancedTaskGenerator {
  /**
   * Example: Transform generic family dining task to specific recommendations
   */
  static async enhanceFamilyDiningTasks(trip: any, daysUntilTrip: number) {
    const tasks = [];

    // Check if trip is to Madrid
    if (trip.city?.toLowerCase().includes('madrid') || trip.destination?.toLowerCase().includes('madrid')) {
      
      // Get family profile
      const familyProfile = {
        hasToddler: trip.kids?.some((kid: any) => parseInt(kid.age) <= 3),
        hasTeens: trip.kids?.some((kid: any) => parseInt(kid.age) >= 13),
        dietaryNeeds: trip.dietaryPreferences || []
      };

      try {
        // Get scraped restaurant data
        const restaurants = await MadridRestaurantScraper.scrapeAllSources();
        
        // Transform generic task into specific recommendations
        const specificTasks = this.generateSpecificDiningTasks(restaurants, familyProfile, daysUntilTrip);
        
        tasks.push(...specificTasks);
        
      } catch (error) {
        // Fallback to generic task if scraping fails
        tasks.push({
          id: 'generic-early-dinner',
          title: 'Plan 5:30pm Dinner Reservations',
          subtitle: 'Beat dinner rush, kids are hungry but not overtired yet',
          category: 'planning',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'medium',
          intelligence: {
            reasoning: 'Early dinners work better for families with children',
            source: 'Family dynamics intelligence'
          }
        });
      }
    }

    return tasks;
  }

  /**
   * Generate specific restaurant booking tasks from scraped data
   */
  private static generateSpecificDiningTasks(
    restaurants: ScrapedRestaurant[], 
    familyProfile: any, 
    daysUntilTrip: number
  ) {
    const tasks = [];

    // Filter restaurants suitable for this family
    const suitableRestaurants = restaurants.filter(restaurant => {
      // Skip expensive places if family seems budget-conscious
      if (restaurant.priceLevel === 'luxury') return false;
      
      // Ensure toddler-friendly features if family has toddlers
      if (familyProfile.hasToddler && 
          !restaurant.familyFeatures.some(f => f.includes('high chair') || f.includes('family-friendly'))) {
        return false;
      }
      
      return true;
    });

    // Generate specific booking tasks for top 3 restaurants
    suitableRestaurants.slice(0, 3).forEach((restaurant, index) => {
      const isUrgent = restaurant.reservationRequired && daysUntilTrip < 21;
      
      tasks.push({
        id: `madrid-restaurant-${restaurant.name.toLowerCase().replace(/\s+/g, '-')}`,
        title: `${restaurant.reservationRequired ? 'Book' : 'Visit'}: ${restaurant.name}`,
        subtitle: `${restaurant.specialNotes[0]} - ${restaurant.bestTimes[0]}`,
        category: 'planning',
        status: 'incomplete',
        urgent: isUrgent,
        isCustom: false,
        priority: index === 0 ? 'high' : 'medium',
        daysBeforeTrip: restaurant.reservationRequired ? 14 : 3,
        intelligence: {
          reasoning: [
            `📞 ${restaurant.phone || 'Walk-in available'}`,
            `📍 ${restaurant.address}`,
            `👨‍👩‍👧‍👦 ${restaurant.familyFeatures.join(', ')}`,
            `💡 ${restaurant.specialNotes.slice(0, 2).join('. ')}`
          ].join('\n'),
          source: `Scraped from ${restaurant.source}`
        }
      });
    });

    // Add backup indoor option for bad weather
    const casualOptions = restaurants.filter(r => 
      r.familyFeatures.some(f => f.includes('casual') || f.includes('market') || f.includes('stroller'))
    );
    
    if (casualOptions.length > 0) {
      const backup = casualOptions[0];
      tasks.push({
        id: 'madrid-backup-dining',
        title: `Backup Plan: ${backup.name}`,
        subtitle: 'Perfect for rainy days or toddler meltdowns',
        category: 'planning',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'low',
        daysBeforeTrip: 7,
        intelligence: {
          reasoning: `${backup.specialNotes.find(note => note.includes('rain') || note.includes('cover') || note.includes('indoor')) || backup.specialNotes[0]}`,
          source: `Scraped from ${backup.source}`
        }
      });
    }

    return tasks;
  }

  /**
   * Example output showing transformation
   */
  static getDemoComparison() {
    return {
      before: {
        title: "Plan 5:30pm Dinner Reservations",
        subtitle: "Beat dinner rush, kids are hungry but not overtired yet",
        intelligence: "Early dinners work better for families with children"
      },
      after: {
        title: "Book: Casa Botín",
        subtitle: "World's oldest restaurant (1725) - 5:30pm early dinner",
        intelligence: [
          "📞 +34 913 664 217",
          "📍 Calle Cuchilleros, 17, 28005 Madrid", 
          "👨‍👩‍👧‍👦 high chairs available, children portions, historic atmosphere kids love",
          "💡 Book 2-3 weeks ahead. Kids fascinated by historic setting"
        ].join('\n')
      },
      value_difference: "User gets specific restaurant, phone number, booking timeline, and family-specific features vs generic advice"
    };
  }
}

// Export for integration
export { EnhancedTaskGenerator };