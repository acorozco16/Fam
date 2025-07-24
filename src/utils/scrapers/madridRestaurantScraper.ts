/**
 * Madrid Restaurant Scraper - Proof of Concept
 * Scrapes family-friendly restaurant data from multiple sources
 */

export interface ScrapedRestaurant {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  priceLevel: 'budget' | 'mid-range' | 'expensive' | 'luxury';
  familyFeatures: string[];
  bestTimes: string[];
  reservationRequired: boolean;
  specialNotes: string[];
  source: string;
  confidence: number; // 0-1 score based on data quality
}

export class MadridRestaurantScraper {
  private static readonly FAMILY_KEYWORDS = [
    'family-friendly', 'kids menu', 'high chairs', 'children welcome',
    'playground', 'family restaurant', 'kids eat free', 'child portions',
    'booster seats', 'changing table', 'stroller accessible'
  ];

  private static readonly TIME_KEYWORDS = [
    'early dinner', 'lunch', 'breakfast', 'brunch', 'late night',
    'quick service', 'fast casual', 'table service'
  ];

  /**
   * Scrape family-friendly restaurants from multiple sources
   */
  static async scrapeAllSources(): Promise<ScrapedRestaurant[]> {
    const results: ScrapedRestaurant[] = [];
    
    try {
      // Note: In production, these would be actual web scraping calls
      // For now, we'll simulate with realistic data structures
      
      const tripadvisorResults = await this.scrapeTripAdvisor();
      const timeoutResults = await this.scrapeTimeoutMadrid();
      const localBlogResults = await this.scrapeLocalBlogs();
      
      results.push(...tripadvisorResults);
      results.push(...timeoutResults);
      results.push(...localBlogResults);
      
      // Deduplicate and merge data for same restaurants
      return this.deduplicateAndMerge(results);
      
    } catch (error) {
      console.warn('Restaurant scraping failed:', error);
      return this.getFallbackData();
    }
  }

  /**
   * Simulate TripAdvisor scraping
   */
  private static async scrapeTripAdvisor(): Promise<ScrapedRestaurant[]> {
    // In production: fetch('https://tripadvisor.com/restaurants/madrid')
    // Parse HTML, extract family-friendly mentions
    
    return [
      {
        name: "Casa Botín",
        address: "Calle Cuchilleros, 17, 28005 Madrid",
        phone: "+34 913 664 217",
        website: "https://www.botin.es",
        priceLevel: 'expensive',
        familyFeatures: ['high chairs available', 'children portions', 'historic atmosphere kids love'],
        bestTimes: ['5:30pm early dinner', 'weekend lunch'],
        reservationRequired: true,
        specialNotes: [
          'World\'s oldest restaurant (1725)',
          'Book 2-3 weeks ahead',
          'Famous roast suckling pig',
          'Kids fascinated by historic setting'
        ],
        source: 'TripAdvisor Family Reviews',
        confidence: 0.9
      },
      {
        name: "Mercado de San Miguel",
        address: "Plaza de San Miguel, s/n, 28005 Madrid", 
        phone: "+34 915 424 936",
        priceLevel: 'mid-range',
        familyFeatures: ['multiple food options', 'standing/casual eating', 'stroller accessible'],
        bestTimes: ['11am-2pm lunch', 'avoid 7-9pm crowds'],
        reservationRequired: false,
        specialNotes: [
          'Covered market with 10+ food stalls',
          'Perfect for picky eaters - something for everyone',
          'Can get crowded, go early',
          'Great backup for rainy days'
        ],
        source: 'TripAdvisor + Local Reviews',
        confidence: 0.8
      }
    ];
  }

  /**
   * Simulate Timeout Madrid scraping
   */
  private static async scrapeTimeoutMadrid(): Promise<ScrapedRestaurant[]> {
    // In production: fetch('https://timeout.com/madrid/restaurants/family-friendly')
    
    return [
      {
        name: "La Bola Taberna",
        address: "Calle Bola, 5, 28013 Madrid",
        phone: "+34 915 476 930",
        priceLevel: 'mid-range',
        familyFeatures: ['traditional Spanish food', 'welcoming to families', 'generous portions'],
        bestTimes: ['1:30pm lunch', '8:30pm dinner'],
        reservationRequired: true,
        specialNotes: [
          'Famous for cocido madrileño (chickpea stew)',
          'Family-run since 1870',
          'Authentic Madrid experience',
          'Portions easily shared with kids'
        ],
        source: 'Timeout Madrid',
        confidence: 0.7
      },
      {
        name: "StreetXO",
        address: "Calle de Serrano, 52, 28001 Madrid",
        phone: "+34 915 648 969",
        priceLevel: 'luxury',
        familyFeatures: ['modern atmosphere', 'small plates good for sharing'],
        bestTimes: ['early seating 7pm'],
        reservationRequired: true,
        specialNotes: [
          'Michelin-starred casual',
          'Asian fusion - adventurous kids only',
          'Book 1+ month ahead',
          'Not ideal for very young children'
        ],
        source: 'Timeout Madrid',
        confidence: 0.6
      }
    ];
  }

  /**
   * Simulate local parenting blog scraping
   */
  private static async scrapeLocalBlogs(): Promise<ScrapedRestaurant[]> {
    // In production: scrape "Madrid with kids", "Family travel Madrid" blogs
    
    return [
      {
        name: "Chocolatería San Ginés",
        address: "Pasadizo de San Ginés, 5, 28013 Madrid",
        phone: "+34 913 656 546",
        priceLevel: 'budget',
        familyFeatures: ['kid-friendly treat', 'quick service', 'late hours'],
        bestTimes: ['after dinner 10pm', 'afternoon snack 5pm'],
        reservationRequired: false,
        specialNotes: [
          'Famous churros and hot chocolate',
          'Open until 2am - great after dinner treat',
          'Kids love dipping churros',
          'Can be touristy but worth it'
        ],
        source: 'Madrid Family Blogs',
        confidence: 0.8
      }
    ];
  }

  /**
   * Deduplicate restaurants mentioned in multiple sources
   */
  private static deduplicateAndMerge(restaurants: ScrapedRestaurant[]): ScrapedRestaurant[] {
    const merged = new Map<string, ScrapedRestaurant>();
    
    restaurants.forEach(restaurant => {
      const key = restaurant.name.toLowerCase().trim();
      
      if (merged.has(key)) {
        // Merge data from multiple sources
        const existing = merged.get(key)!;
        merged.set(key, {
          ...existing,
          familyFeatures: [...new Set([...existing.familyFeatures, ...restaurant.familyFeatures])],
          bestTimes: [...new Set([...existing.bestTimes, ...restaurant.bestTimes])],
          specialNotes: [...new Set([...existing.specialNotes, ...restaurant.specialNotes])],
          source: `${existing.source} + ${restaurant.source}`,
          confidence: Math.max(existing.confidence, restaurant.confidence),
          phone: existing.phone || restaurant.phone,
          website: existing.website || restaurant.website
        });
      } else {
        merged.set(key, restaurant);
      }
    });
    
    return Array.from(merged.values()).sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate specific AI task recommendations from scraped data
   */
  static generateRestaurantTasks(
    restaurants: ScrapedRestaurant[], 
    familyProfile: {hasToddler: boolean, hasTeens: boolean, dietaryNeeds: string[]}
  ): Array<{id: string, title: string, subtitle: string, details: string}> {
    const tasks = [];
    
    // Filter restaurants based on family profile
    const suitableRestaurants = restaurants.filter(restaurant => {
      if (familyProfile.hasToddler && !restaurant.familyFeatures.some(f => 
        f.includes('high chair') || f.includes('family-friendly')
      )) {
        return false;
      }
      
      return true;
    });

    // Generate specific booking tasks
    suitableRestaurants.slice(0, 3).forEach((restaurant, index) => {
      const urgency = restaurant.reservationRequired ? 'Book now' : 'Consider visiting';
      
      tasks.push({
        id: `restaurant-${restaurant.name.toLowerCase().replace(/\s+/g, '-')}`,
        title: `${urgency}: ${restaurant.name}`,
        subtitle: restaurant.address,
        details: [
          restaurant.phone ? `📞 ${restaurant.phone}` : '',
          `💰 ${restaurant.priceLevel}`,
          `⏰ Best times: ${restaurant.bestTimes.join(', ')}`,
          `👨‍👩‍👧‍👦 Family features: ${restaurant.familyFeatures.join(', ')}`,
          `💡 ${restaurant.specialNotes[0]}`,
          `📍 Source: ${restaurant.source}`
        ].filter(Boolean).join('\n')
      });
    });
    
    return tasks;
  }

  /**
   * Fallback data if scraping fails
   */
  private static getFallbackData(): ScrapedRestaurant[] {
    return [
      {
        name: "Casa Botín",
        address: "Calle Cuchilleros, 17, Madrid",
        priceLevel: 'expensive',
        familyFeatures: ['historic setting', 'traditional Spanish'],
        bestTimes: ['early dinner'],
        reservationRequired: true,
        specialNotes: ['World\'s oldest restaurant'],
        source: 'Fallback data',
        confidence: 0.5
      }
    ];
  }
}

/**
 * Usage example for integration with SmartTaskGenerator
 */
export async function generateMadridRestaurantTasks(familyProfile: any) {
  const restaurants = await MadridRestaurantScraper.scrapeAllSources();
  return MadridRestaurantScraper.generateRestaurantTasks(restaurants, familyProfile);
}