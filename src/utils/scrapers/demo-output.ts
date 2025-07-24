/**
 * Demo Output: Before vs After Scraping Integration
 * Run this to see the transformation in action
 */

import { MadridRestaurantScraper } from './madridRestaurantScraper';
import { EnhancedTaskGenerator } from './integration-example';

export async function runScrapingDemo() {
  console.log('🔄 FamApp Restaurant Scraping Demo\n');
  
  // Sample family trip to Madrid
  const sampleTrip = {
    city: 'Madrid',
    country: 'Spain',
    startDate: '2024-08-15',
    endDate: '2024-08-22',
    kids: [
      { age: '3', name: 'Emma' },
      { age: '8', name: 'Lucas' }
    ],
    adults: [
      { age: '35', name: 'Sarah' },
      { age: '37', name: 'Mike' }
    ],
    dietaryPreferences: ['Gluten-free'],
    optInDietary: true
  };

  // BEFORE: Generic AI Task
  console.log('❌ BEFORE (Generic AI):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Task: "Plan 5:30pm Dinner Reservations"');
  console.log('📝 Details: "Beat dinner rush, kids are hungry but not overtired yet"');
  console.log('🤖 Intelligence: "Early dinners work better for families with children"');
  console.log('😕 User still needs to: Research restaurants, call around, check if kid-friendly\n');

  // AFTER: Scraped-Enhanced AI Task
  console.log('✅ AFTER (Scraped-Enhanced AI):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const restaurants = await MadridRestaurantScraper.scrapeAllSources();
    
    restaurants.slice(0, 2).forEach((restaurant, index) => {
      console.log(`📋 Task ${index + 1}: "Book: ${restaurant.name}"`);
      console.log(`📝 Details: "${restaurant.specialNotes[0]}"`);
      console.log('🤖 Intelligence:');
      console.log(`   📞 Phone: ${restaurant.phone}`);
      console.log(`   📍 Address: ${restaurant.address}`);
      console.log(`   ⏰ Best time: ${restaurant.bestTimes[0]}`);
      console.log(`   👨‍👩‍👧‍👦 Family features: ${restaurant.familyFeatures.join(', ')}`);
      console.log(`   💡 Pro tip: ${restaurant.specialNotes[1]}`);
      console.log(`   📊 Confidence: ${Math.round(restaurant.confidence * 100)}%`);
      console.log(`   🔗 Source: ${restaurant.source}\n`);
    });
    
    console.log('😍 User experience: Gets specific restaurants with phone numbers, exact features, and booking advice!\n');
    
  } catch (error) {
    console.log('❌ Scraping failed, falling back to generic tasks\n');
  }

  // Show the data quality difference
  console.log('📊 VALUE COMPARISON:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Generic AI:    "Research restaurants"');
  console.log('Enhanced AI:   "Call +34 913 664 217 to book Casa Botín"');
  console.log('');
  console.log('Generic AI:    "Find family-friendly places"');
  console.log('Enhanced AI:   "High chairs available, kids love historic atmosphere"');
  console.log('');
  console.log('Generic AI:    "Book early"');
  console.log('Enhanced AI:   "Book 2-3 weeks ahead - world\'s oldest restaurant"');
  console.log('');
  console.log('🎯 Result: User saves 2+ hours of research and gets family-tested recommendations!');
}

// Production Integration Pattern
export class ProductionScrapingIntegration {
  /**
   * How this would integrate with existing SmartTaskGenerator
   */
  static async enhanceExistingTasks(trip: any, daysUntilTrip: number) {
    const enhancedTasks = [];
    
    // Replace generic dining tasks with specific ones
    if (this.isScrapingSupportedCity(trip.city)) {
      const specificTasks = await EnhancedTaskGenerator.enhanceFamilyDiningTasks(trip, daysUntilTrip);
      enhancedTasks.push(...specificTasks);
    }
    
    // Could add more scraped enhancements:
    // - Specific museums with family programs
    // - Actual playground locations
    // - Kid-friendly hotels with amenities
    // - Family-tested walking routes
    
    return enhancedTasks;
  }

  private static isScrapingSupportedCity(city: string): boolean {
    const supportedCities = ['madrid', 'barcelona', 'paris', 'london', 'rome'];
    return supportedCities.some(supported => 
      city?.toLowerCase().includes(supported)
    );
  }
}

// Export demo function
export { runScrapingDemo };