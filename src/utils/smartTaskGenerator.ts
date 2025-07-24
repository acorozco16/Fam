import { TripData, FamilyMember } from '../types';
import { generateCitySpecificTasks } from '../data/cityRecommendations';
import { apiService } from './apiService';

export interface SmartTask {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  status: 'complete' | 'incomplete';
  urgent?: boolean;
  isCustom: boolean;
  priority: 'high' | 'medium' | 'low';
  daysBeforeTrip?: number; // When to remind user
  intelligence: {
    reasoning: string; // Why this task was suggested
    source: string; // What data triggered it
  };
}

export interface TaskGenerationContext {
  trip: TripData;
  daysUntilTrip: number;
}

export class SmartTaskGenerator {
  static async generateTasks(context: TaskGenerationContext): Promise<SmartTask[]> {
    const { trip, daysUntilTrip } = context;
    const allTasks: SmartTask[] = [];

    // ONLY ESSENTIAL SOURCES - targeting 3-5 total tasks
    
    // 1. Critical pre-trip tasks (1-2 tasks)
    const coreTasks = this.generateCriticalCoreTasks(trip, daysUntilTrip);
    allTasks.push(...coreTasks);
    
    // 2. Travel style-specific family tasks (2-3 tasks)
    const familyTasks = this.generateTargetedFamilyTasks(trip, daysUntilTrip);
    allTasks.push(...familyTasks);
    
    // 3. Critical weather emergencies only (0-1 tasks)
    const weatherTasks = await this.generateCriticalWeatherTasks(trip, daysUntilTrip);
    allTasks.push(...weatherTasks);

    // 4. Holiday crowd warnings (0-1 tasks)
    const holidayTasks = await this.generateHolidayTasks(trip, daysUntilTrip);
    allTasks.push(...holidayTasks.slice(0, 1)); // Max 1 holiday task

    // 5. Essential country data (0-1 tasks)
    if (trip.country) {
      const countryTasks = await this.generateCountryDataTasks(trip, daysUntilTrip);
      allTasks.push(...countryTasks.slice(0, 1)); // Max 1 country task
    }

    // 6. City-specific curated recommendations (1-2 tasks)
    if (trip.city) {
      const familyProfile = { 
        kids: trip.kids, 
        adults: trip.adults,
        tripPurpose: trip.tripPurpose 
      };
      const cityTasks = generateCitySpecificTasks(trip.city, familyProfile, daysUntilTrip);
      allTasks.push(...cityTasks.slice(0, 2)); // Limit to 2 max
    }

    // Prioritize and limit to 5-8 most essential tasks (increased for comprehensive trip purpose coverage)
    const prioritizedTasks = this.prioritizeTasks(allTasks, daysUntilTrip);
    return prioritizedTasks.slice(0, 8); // Hard limit of 8 tasks (to provide comprehensive trip purpose guidance)
  }

  private static async generateExternalDataTasks(trip: TripData, daysUntilTrip: number): Promise<SmartTask[]> {
    const tasks: SmartTask[] = [];

    try {
      // Weather intelligence
      if (trip.city && trip.startDate && daysUntilTrip <= 14) {
        const weatherTasks = await this.generateWeatherTasks(trip, daysUntilTrip);
        tasks.push(...weatherTasks);
      }

      // Holiday intelligence  
      if (trip.country && trip.startDate && trip.endDate) {
        const holidayTasks = await this.generateHolidayTasks(trip, daysUntilTrip);
        tasks.push(...holidayTasks);
      }

      // Country intelligence
      if (trip.country) {
        const countryTasks = await this.generateCountryDataTasks(trip, daysUntilTrip);
        tasks.push(...countryTasks);
      }
    } catch (error) {
      console.warn('External API tasks failed, continuing with static intelligence:', error);
      // Graceful degradation - continue without external data
    }

    return tasks;
  }

  private static async generateWeatherTasks(trip: TripData, daysUntilTrip: number): Promise<SmartTask[]> {
    const tasks: SmartTask[] = [];

    try {
      // Get coordinates for the city (simplified - in production you'd use geocoding)
      const coords = this.getCityCoordinates(trip.city || '');
      if (!coords) return tasks;

      // Call 7Timer API
      const weatherUrl = `https://www.7timer.info/bin/api.pl?lon=${coords.lon}&lat=${coords.lat}&product=civillight&output=json`;
      const response = await fetch(weatherUrl);
      const weatherData = await response.json();

      if (weatherData?.dataseries) {
        const forecastDays = weatherData.dataseries.slice(0, 7); // Next 7 days
        
        // Analyze weather patterns
        const rainDays = forecastDays.filter((day: any) => 
          day.weather?.includes('rain') || day.weather?.includes('shower')
        );
        
        const hotDays = forecastDays.filter((day: any) => 
          day.temp2m?.max > 30 // Above 30°C
        );

        const coldDays = forecastDays.filter((day: any) => 
          day.temp2m?.max < 10 // Below 10°C  
        );

        // Generate weather-based tasks
        if (rainDays.length >= 2) {
          tasks.push({
            id: 'weather-rain-gear',
            title: 'Pack Rain Gear',
            subtitle: `Rain expected on ${rainDays.length} days during your trip`,
            category: 'packing',
            status: 'incomplete',
            urgent: false,
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 7,
            intelligence: {
              reasoning: `Weather forecast shows rain on multiple days in ${trip.city}`,
              source: '7Timer Weather API'
            }
          });
        }

        if (hotDays.length >= 3) {
          tasks.push({
            id: 'weather-sun-protection',
            title: 'Pack Sun Protection',
            subtitle: 'Sunscreen, hats, and light clothing for hot weather',
            category: 'packing',
            status: 'incomplete',
            urgent: false,
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 7,
            intelligence: {
              reasoning: `High temperatures (30°C+) expected in ${trip.city}`,
              source: '7Timer Weather API'
            }
          });
        }

        if (coldDays.length >= 3) {
          tasks.push({
            id: 'weather-warm-clothes',
            title: 'Pack Warm Clothing',
            subtitle: 'Jackets, layers, and warm accessories for cold weather',
            category: 'packing',
            status: 'incomplete',
            urgent: false,
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 7,
            intelligence: {
              reasoning: `Cold temperatures (below 10°C) expected in ${trip.city}`,
              source: '7Timer Weather API'
            }
          });
        }
      }
    } catch (error) {
      console.warn('Weather API failed:', error);
    }

    return tasks;
  }

  private static async generateHolidayTasks(trip: TripData, daysUntilTrip: number): Promise<SmartTask[]> {
    const tasks: SmartTask[] = [];
    
    if (!trip.country || !trip.startDate || !trip.endDate) return tasks;
    
    // Get country code from country name  
    const countryCode = this.getCountryCode(trip.country);
    if (!countryCode) return tasks;

    const year = new Date(trip.startDate).getFullYear();
    
    // Use new API service with caching and error handling
    const holidays = await apiService.getHolidayData(countryCode, year);
    if (!holidays || holidays.length === 0) return tasks;

    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);

    // Check for holidays during trip
    const tripHolidays = holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate >= tripStart && holidayDate <= tripEnd;
    });

    if (tripHolidays.length > 0) {
      const holidayNames = tripHolidays.map(h => h.name).join(', ');
      
      tasks.push({
        id: 'holiday-crowds',
        title: 'Expect Holiday Crowds',
        subtitle: `${holidayNames} occurs during your trip`,
        category: 'planning',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 21,
        intelligence: {
          reasoning: `Public holidays in ${trip.country} may cause crowds and closures`,
          source: 'Nager.Date Holiday API (cached)'
        }
      });

      tasks.push({
        id: 'holiday-reservations',
        title: 'Book Restaurants Early',
        subtitle: 'Holiday periods require advance reservations',
        category: 'planning', 
        status: 'incomplete',
        urgent: daysUntilTrip < 14,
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 14,
        intelligence: {
          reasoning: `${holidayNames} will increase demand for dining`,
          source: 'Nager.Date Holiday API (cached)'
        }
      });
    }

    return tasks;
  }

  private static async generateCountryDataTasks(trip: TripData, daysUntilTrip: number): Promise<SmartTask[]> {
    const tasks: SmartTask[] = [];

    if (!trip.country) return tasks;

    // Use new API service with caching and error handling
    const country = await apiService.getCountryData(trip.country);
    if (!country) return tasks;
    
    // Currency tasks
    if (country.currencies) {
      const currencyCode = Object.keys(country.currencies)[0];
      const currencyName = country.currencies[currencyCode]?.name;
      
      if (currencyCode !== 'USD') {
        tasks.push({
          id: 'currency-exchange',
          title: 'Exchange Currency',
          subtitle: `Get ${currencyCode} (${currencyName}) for your trip`,
          category: 'financial',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'medium',
          daysBeforeTrip: 14,
          intelligence: {
            reasoning: `${trip.country} uses ${currencyCode}, different from USD`,
            source: 'REST Countries API (cached)'
          }
        });
      }
    }

    // Language tasks
    if (country.languages) {
      const languages = Object.values(country.languages) as string[];
      const primaryLanguage = languages[0];
      
      if (primaryLanguage && !['English'].includes(primaryLanguage)) {
        tasks.push({
          id: 'learn-basic-phrases',
          title: 'Learn Basic Phrases',
          subtitle: `Download ${primaryLanguage} translation app or phrasebook`,
          category: 'cultural',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'low',
          daysBeforeTrip: 21,
          intelligence: {
            reasoning: `Primary language in ${trip.country} is ${primaryLanguage}`,
            source: 'REST Countries API (cached)'
          }
        });
      }
    }

    return tasks;
  }

  // Helper method to get coordinates (simplified version)
  private static getCityCoordinates(city: string): {lat: number, lon: number} | null {
    const cityCoords: Record<string, {lat: number, lon: number}> = {
      'madrid': { lat: 40.4168, lon: -3.7038 },
      'barcelona': { lat: 41.3851, lon: 2.1734 },
      'paris': { lat: 48.8566, lon: 2.3522 },
      'london': { lat: 51.5074, lon: -0.1278 },
      'rome': { lat: 41.9028, lon: 12.4964 },
      'tokyo': { lat: 35.6762, lon: 139.6503 },
      'new york': { lat: 40.7128, lon: -74.0060 },
      'los angeles': { lat: 34.0522, lon: -118.2437 },
      'amsterdam': { lat: 52.3676, lon: 4.9041 },
      'berlin': { lat: 52.5200, lon: 13.4050 },
      'vienna': { lat: 48.2082, lon: 16.3738 },
      'prague': { lat: 50.0755, lon: 14.4378 },
      'lisbon': { lat: 38.7223, lon: -9.1393 },
      'copenhagen': { lat: 55.6761, lon: 12.5683 },
      'stockholm': { lat: 59.3293, lon: 18.0686 },
      'reykjavik': { lat: 64.1466, lon: -21.9426 }
      // Add more as needed
    };
    
    return cityCoords[city.toLowerCase()] || null;
  }

  // Helper method to get country codes
  private static getCountryCode(country: string): string | null {
    const countryCodes: Record<string, string> = {
      'spain': 'ES',
      'france': 'FR', 
      'italy': 'IT',
      'germany': 'DE',
      'united kingdom': 'GB',
      'japan': 'JP',
      'united states': 'US',
      'canada': 'CA',
      // Add more as needed
    };
    
    return countryCodes[country.toLowerCase()] || null;
  }

  private static generateCorePlanningTasks(trip: TripData, daysUntilTrip: number): SmartTask[] {
    const tasks: SmartTask[] = [];

    // Core essentials that every trip needs
    tasks.push({
      id: 'book-flights',
      title: 'Book Flight Tickets',
      subtitle: 'Secure your travel dates and get better prices',
      category: 'travel',
      status: 'incomplete',
      urgent: daysUntilTrip < 30,
      isCustom: false,
      priority: 'high',
      daysBeforeTrip: 45,
      intelligence: {
        reasoning: 'Flight prices increase closer to travel dates',
        source: 'Core travel planning requirement'
      }
    });

    tasks.push({
      id: 'book-accommodation',
      title: 'Reserve Accommodation',
      subtitle: 'Secure your stay before popular places fill up',
      category: 'travel',
      status: 'incomplete',
      urgent: daysUntilTrip < 21,
      isCustom: false,
      priority: 'high',
      daysBeforeTrip: 30,
      intelligence: {
        reasoning: 'Good accommodations book up early, especially for families',
        source: 'Core travel planning requirement'
      }
    });

    return tasks;
  }

  private static generateDestinationTasks(trip: TripData, daysUntilTrip: number): SmartTask[] {
    const tasks: SmartTask[] = [];
    const destination = trip.destination?.toLowerCase() || '';
    const country = trip.country?.toLowerCase() || '';

    // International travel tasks
    if (country && !['united states', 'usa'].includes(country)) {
      tasks.push({
        id: 'check-passport',
        title: 'Verify Passport Validity',
        subtitle: `${trip.country} requires 6+ months validity from travel date`,
        category: 'documents',
        status: 'incomplete',
        urgent: daysUntilTrip < 60,
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 90,
        intelligence: {
          reasoning: 'Most countries require 6 months passport validity',
          source: `International travel to ${trip.country}`
        }
      });

      tasks.push({
        id: 'notify-bank',
        title: 'Notify Bank of Travel Plans',
        subtitle: 'Prevent your cards from being blocked abroad',
        category: 'financial',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 14,
        intelligence: {
          reasoning: 'Banks often block cards for suspicious foreign activity',
          source: `International travel to ${trip.country}`
        }
      });

      tasks.push({
        id: 'travel-adapter',
        title: 'Get Travel Power Adapter',
        subtitle: this.getPowerAdapterInfo(country),
        category: 'packing',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 21,
        intelligence: {
          reasoning: 'Different countries use different electrical outlets',
          source: `Traveling to ${trip.country}`
        }
      });
    }

    // Europe-specific tasks
    if (this.isEuropeanCountry(country)) {
      tasks.push({
        id: 'research-transport',
        title: 'Research European Transport Options',
        subtitle: 'Look into rail passes, metro cards, and regional transport',
        category: 'planning',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 30,
        intelligence: {
          reasoning: 'Europe has excellent public transport that can save money',
          source: `Traveling to European country: ${trip.country}`
        }
      });
    }

    // Climate-specific tasks
    const climate = this.getClimateCategory(country);
    if (climate === 'tropical') {
      tasks.push({
        id: 'tropical-prep',
        title: 'Tropical Climate Preparation',
        subtitle: 'Pack sunscreen, insect repellent, and lightweight clothing',
        category: 'health',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 21,
        intelligence: {
          reasoning: 'Tropical climates require specific health and packing considerations',
          source: `Tropical destination: ${trip.country}`
        }
      });
    }

    // Specific destination intelligence
    if (country === 'spain') {
      tasks.push({
        id: 'spain-siesta',
        title: 'Research Spanish Siesta Schedule',
        subtitle: 'Plan around 2-5pm closures for shops and restaurants',
        category: 'cultural',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'low',
        daysBeforeTrip: 14,
        intelligence: {
          reasoning: 'Spanish culture includes afternoon siesta affecting business hours',
          source: 'Spain-specific cultural knowledge'
        }
      });
    }

    return tasks;
  }

  // OLD METHOD - Replaced by generateTargetedFamilyTasks
  private static generateFamilyTasksOLD(trip: TripData, daysUntilTrip: number): SmartTask[] {
    const tasks: SmartTask[] = [];
    const adults = trip.adults || [];
    const kids = trip.kids || [];
    const allFamily = [...adults, ...kids];

    // Enhanced family dynamics intelligence
    if (kids.length > 0) {
      // Age-specific attention span management
      const hasToddler = kids.some(kid => parseInt(kid.age || '0') <= 3);
      const hasPreschooler = kids.some(kid => {
        const age = parseInt(kid.age || '0');
        return age >= 4 && age <= 6;
      });
      const hasSchoolAge = kids.some(kid => {
        const age = parseInt(kid.age || '0');
        return age >= 7 && age <= 12;
      });
      const hasTeen = kids.some(kid => {
        const age = parseInt(kid.age || '0');
        return age >= 13 && age <= 17;
      });

      // Activity duration intelligence
      if (hasToddler || hasPreschooler) {
        tasks.push({
          id: 'activity-duration-limits',
          title: 'Plan 90-Minute Activity Limits',
          subtitle: 'Young kids lose focus after 1.5 hours - plan breaks between activities',
          category: 'planning',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'high',
          daysBeforeTrip: 21,
          intelligence: {
            reasoning: 'Children under 7 have limited attention spans and need frequent breaks',
            source: `Family with children ages ${this.getAgeRange(kids)}`
          }
        });

        tasks.push({
          id: 'backup-indoor-activities',
          title: 'Research Backup Indoor Activities',
          subtitle: 'Malls, indoor playgrounds, cafes with play areas for weather/meltdown emergencies',
          category: 'planning',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'medium',
          daysBeforeTrip: 14,
          intelligence: {
            reasoning: 'Young children need backup plans when outdoor activities fail',
            source: 'Family includes young children'
          }
        });
      }

      // Museum and cultural site intelligence
      if (hasSchoolAge) {
        tasks.push({
          id: 'museum-strategy',
          title: 'Plan Museum Visits Before 11am',
          subtitle: 'Kids are fresh in morning, crowds are lighter, exhibits are quieter',
          category: 'planning',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'medium',
          daysBeforeTrip: 14,
          intelligence: {
            reasoning: 'School-age children focus better in mornings before fatigue sets in',
            source: 'Family includes school-age children'
          }
        });

        tasks.push({
          id: 'interactive-exhibits',
          title: 'Target Interactive Museum Sections',
          subtitle: 'Look for hands-on exhibits, audio guides for kids, scavenger hunts',
          category: 'planning',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'medium',
          daysBeforeTrip: 21,
          intelligence: {
            reasoning: 'Interactive experiences keep school-age children engaged longer',
            source: 'Family includes school-age children'
          }
        });
      }

      // Teen dynamics
      if (hasTeen) {
        tasks.push({
          id: 'teen-independence',
          title: 'Plan Teen Independence Time',
          subtitle: 'Give teenagers 2-3 hours to explore on their own or with friends',
          category: 'planning',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'medium',
          daysBeforeTrip: 14,
          intelligence: {
            reasoning: 'Teenagers need autonomy and peer time to enjoy family trips',
            source: 'Family includes teenagers'
          }
        });

        tasks.push({
          id: 'teen-photo-spots',
          title: 'Research Instagram-Worthy Photo Spots',
          subtitle: 'Find scenic viewpoints and trendy locations teens will want to photograph',
          category: 'planning',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'low',
          daysBeforeTrip: 21,
          intelligence: {
            reasoning: 'Social media opportunities motivate teenage participation',
            source: 'Family includes teenagers'
          }
        });
      }

      // Sibling dynamics
      if (kids.length >= 2) {
        const ageGap = Math.max(...kids.map(k => parseInt(k.age || '0'))) - Math.min(...kids.map(k => parseInt(k.age || '0')));
        
        if (ageGap >= 5) {
          tasks.push({
            id: 'split-activities',
            title: 'Plan Split-Group Activities',
            subtitle: 'Some activities for older kids, some for younger - meet up later',
            category: 'planning',
            status: 'incomplete',
            urgent: false,
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 21,
            intelligence: {
              reasoning: `Large age gap (${ageGap} years) between siblings requires different activities`,
              source: 'Family has children with significant age differences'
            }
          });
        }

        tasks.push({
          id: 'sibling-peace-snacks',
          title: 'Pack Individual Snack Bags',
          subtitle: 'Prevent sibling fights by giving each child their own snacks',
          category: 'packing',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'medium',
          daysBeforeTrip: 7,
          intelligence: {
            reasoning: 'Individual snacks reduce sibling competition and complaints',
            source: 'Multiple children in family'
          }
        });
      }

      // Meal timing intelligence
      tasks.push({
        id: 'early-dinner-strategy',
        title: 'Plan 5:30pm Dinner Reservations',
        subtitle: 'Beat dinner rush, kids are hungry but not overtired yet',
        category: 'planning',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 14,
        intelligence: {
          reasoning: 'Early dinners work better for families with children',
          source: 'Family includes children'
        }
      });

      // Weather contingency for families
      tasks.push({
        id: 'weather-backup-plan',
        title: 'Plan Weather Backup Activities',
        subtitle: 'Indoor options for rain/heat - kids need backup plans when outdoor activities fail',
        category: 'planning',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 14,
        intelligence: {
          reasoning: 'Families with children need weather contingency plans to avoid meltdowns',
          source: 'Family includes children'
        }
      });

      // Toddler-specific enhanced intelligence
      if (hasToddler) {
        tasks.push({
          id: 'toddler-gear-essentials',
          title: 'Pack Toddler Survival Kit',
          subtitle: 'Stroller, carrier, snacks, wipes, change of clothes, comfort item',
          category: 'packing',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'high',
          daysBeforeTrip: 7,
          intelligence: {
            reasoning: 'Toddlers need specialized gear for comfort and safety',
            source: 'Family includes toddler(s)'
          }
        });

        tasks.push({
          id: 'naptime-sacred-time',
          title: 'Protect Sacred Nap Time',
          subtitle: 'Plan 1-3pm quiet time back at hotel - tired toddlers ruin everything',
          category: 'planning',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'high',
          daysBeforeTrip: 14,
          intelligence: {
            reasoning: 'Toddler naps are crucial for family harmony during travel',
            source: 'Family includes toddler(s)'
          }
        });

        tasks.push({
          id: 'toddler-friendly-restaurants',
          title: 'Research Toddler-Friendly Restaurants',
          subtitle: 'High chairs, quick service, finger foods, space for kids to move',
          category: 'planning',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'medium',
          daysBeforeTrip: 21,
          intelligence: {
            reasoning: 'Toddlers need specific restaurant amenities for successful dining',
            source: 'Family includes toddler(s)'
          }
        });
      }
    }

    // Multi-generational wisdom
    const hasGrandparents = adults.some(adult => parseInt(adult.age || '0') >= 65);
    if (hasGrandparents && kids.length > 0) {
      tasks.push({
        id: 'grandparent-kid-bonding',
        title: 'Plan Grandparent-Grandkid Special Time',
        subtitle: 'Ice cream, park bench stories, slow-paced activities they can enjoy together',
        category: 'planning',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 21,
        intelligence: {
          reasoning: 'Multi-generational trips need activities that bridge age gaps',
          source: 'Family includes grandparents and grandchildren'
        }
      });

      tasks.push({
        id: 'accessible-accommodations',
        title: 'Book Accessible Hotel Rooms',
        subtitle: 'Ground floor, elevator access, grab bars, close to main areas',
        category: 'travel',
        status: 'incomplete',
        urgent: daysUntilTrip < 30,
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 45,
        intelligence: {
          reasoning: 'Grandparents may need accessibility accommodations',
          source: 'Family includes older adults'
        }
      });
    }

    // Large family logistics
    if (allFamily.length >= 5) {
      tasks.push({
        id: 'headcount-system',
        title: 'Establish Buddy System',
        subtitle: 'Pair older kids with younger ones, designate meeting spots, group photos to count',
        category: 'planning',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 14,
        intelligence: {
          reasoning: 'Large families need systems to prevent losing family members',
          source: `Large family group: ${allFamily.length} members`
        }
      });

      tasks.push({
        id: 'restaurant-reservations-large-group',
        title: 'Book Large Group Restaurant Reservations',
        subtitle: 'Call ahead - many restaurants struggle with tables for 5+ people',
        category: 'planning',
        status: 'incomplete',
        urgent: daysUntilTrip < 21,
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 30,
        intelligence: {
          reasoning: 'Large families need advance restaurant planning',
          source: `Large family group: ${allFamily.length} members`
        }
      });
    }

    // Single parent considerations
    if (adults.length === 1 && kids.length > 0) {
      tasks.push({
        id: 'single-parent-backup-plan',
        title: 'Plan Solo Parent Strategies',
        subtitle: 'Bathroom buddy system, emergency contacts, simple meal options',
        category: 'planning',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 14,
        intelligence: {
          reasoning: 'Single parents need extra logistical planning for safety',
          source: 'Single parent traveling with children'
        }
      });
    }

    // Dietary preferences intelligence (if opted in)
    if (trip.optInDietary && trip.dietaryPreferences && trip.dietaryPreferences.length > 0) {
      const dietaryNeeds = trip.dietaryPreferences;
      
      if (dietaryNeeds.some(pref => ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher'].includes(pref))) {
        tasks.push({
          id: 'dietary-restaurant-research',
          title: 'Research Dietary-Friendly Restaurants',
          subtitle: `Find restaurants with ${dietaryNeeds.join(', ')} options in ${trip.city}`,
          category: 'planning',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'medium',
          daysBeforeTrip: 21,
          intelligence: {
            reasoning: `Family has specific dietary needs: ${dietaryNeeds.join(', ')}`,
            source: 'User-provided dietary preferences'
          }
        });
      }

      if (dietaryNeeds.some(pref => pref.includes('allerg'))) {
        const allergies = dietaryNeeds.filter(pref => pref.includes('allerg'));
        tasks.push({
          id: 'allergy-emergency-prep',
          title: 'Prepare Allergy Emergency Kit',
          subtitle: `Pack medications, learn key phrases in local language about ${allergies.join(', ')}`,
          category: 'health',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'high',
          daysBeforeTrip: 14,
          intelligence: {
            reasoning: `Family has serious allergies: ${allergies.join(', ')}`,
            source: 'User-provided dietary preferences'
          }
        });
      }

      if (dietaryNeeds.includes('Diabetic-friendly')) {
        tasks.push({
          id: 'diabetic-meal-planning',
          title: 'Plan Diabetic-Friendly Meal Schedule',
          subtitle: 'Regular meal times, healthy snacks, research local pharmacy locations',
          category: 'health',
          status: 'incomplete',
          urgent: false,
          isCustom: false,
          priority: 'high',
          daysBeforeTrip: 21,
          intelligence: {
            reasoning: 'Family member has diabetes requiring meal planning',
            source: 'User-provided dietary preferences'
          }
        });
      }
    }

    return tasks;
  }

  private static generateTimelineTasks(trip: TripData, daysUntilTrip: number): SmartTask[] {
    const tasks: SmartTask[] = [];

    // Tasks based on how far out the trip is
    if (daysUntilTrip > 60) {
      tasks.push({
        id: 'early-research',
        title: 'Research Must-See Attractions',
        subtitle: 'Popular attractions often require advance booking',
        category: 'planning',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 60,
        intelligence: {
          reasoning: 'Early planning allows booking popular attractions before they sell out',
          source: `Trip is ${daysUntilTrip} days away`
        }
      });
    }

    if (daysUntilTrip <= 30 && daysUntilTrip > 14) {
      tasks.push({
        id: 'weather-check',
        title: 'Check Weather Forecast',
        subtitle: 'Update packing list based on expected weather',
        category: 'planning',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 14,
        intelligence: {
          reasoning: 'Weather forecasts become more accurate within 30 days',
          source: `Trip is ${daysUntilTrip} days away`
        }
      });
    }

    if (daysUntilTrip <= 14) {
      tasks.push({
        id: 'confirm-bookings',
        title: 'Confirm All Bookings',
        subtitle: 'Double-check flights, hotels, and activity reservations',
        category: 'travel',
        status: 'incomplete',
        urgent: true,
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 7,
        intelligence: {
          reasoning: 'Final confirmation prevents travel day surprises',
          source: `Trip is ${daysUntilTrip} days away`
        }
      });
    }

    if (daysUntilTrip <= 7) {
      tasks.push({
        id: 'download-offline',
        title: 'Download Offline Maps & Apps',
        subtitle: 'Prepare for areas with limited internet connectivity',
        category: 'technology',
        status: 'incomplete',
        urgent: true,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 3,
        intelligence: {
          reasoning: 'Offline preparation is crucial for navigation and communication',
          source: `Trip is ${daysUntilTrip} days away`
        }
      });
    }

    return tasks;
  }

  private static generateTravelStyleTasks(trip: TripData, daysUntilTrip: number): SmartTask[] {
    const tasks: SmartTask[] = [];
    const travelStyle = trip.travelStyle?.toLowerCase() || '';

    if (travelStyle.includes('adventure')) {
      tasks.push({
        id: 'adventure-gear',
        title: 'Prepare Adventure Equipment',
        subtitle: 'Check gear requirements for planned activities',
        category: 'packing',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 21,
        intelligence: {
          reasoning: 'Adventure travel requires specialized equipment and preparation',
          source: `Travel style: ${trip.travelStyle}`
        }
      });
    }

    if (travelStyle.includes('cultural')) {
      tasks.push({
        id: 'cultural-research',
        title: 'Research Local Customs & Etiquette',
        subtitle: 'Learn about cultural norms and appropriate behavior',
        category: 'cultural',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'low',
        daysBeforeTrip: 21,
        intelligence: {
          reasoning: 'Cultural awareness enhances travel experience and shows respect',
          source: `Travel style: ${trip.travelStyle}`
        }
      });
    }

    if (travelStyle.includes('relaxation')) {
      tasks.push({
        id: 'spa-research',
        title: 'Research Spa & Wellness Options',
        subtitle: 'Find relaxation activities and wellness centers',
        category: 'planning',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'low',
        daysBeforeTrip: 30,
        intelligence: {
          reasoning: 'Relaxation-focused trips benefit from wellness planning',
          source: `Travel style: ${trip.travelStyle}`
        }
      });
    }

    return tasks;
  }

  private static generateBudgetTasks(trip: TripData, daysUntilTrip: number): SmartTask[] {
    const tasks: SmartTask[] = [];
    const budgetLevel = trip.budgetLevel?.toLowerCase() || '';
    const concerns = trip.concerns || [];

    if (concerns.includes('Budget') || budgetLevel === 'budget') {
      tasks.push({
        id: 'budget-research',
        title: 'Research Budget-Friendly Options',
        subtitle: 'Find free activities, happy hours, and local markets',
        category: 'planning',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 30,
        intelligence: {
          reasoning: 'Budget-conscious travelers benefit from advance planning',
          source: 'Budget concerns or budget travel style selected'
        }
      });

      tasks.push({
        id: 'local-transport',
        title: 'Research Public Transportation',
        subtitle: 'Find cost-effective ways to get around locally',
        category: 'planning',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 21,
        intelligence: {
          reasoning: 'Public transport often saves significant money over taxis',
          source: 'Budget concerns or budget travel style selected'
        }
      });
    }

    return tasks;
  }

  private static generateCriticalCoreTasks(trip: TripData, daysUntilTrip: number): SmartTask[] {
    const tasks: SmartTask[] = [];
    const baseId = Date.now();
    const isInternational = trip.country && !['united states', 'usa', 'us'].includes(trip.country.toLowerCase());
    const totalTravelers = (trip.adults?.length || 0) + (trip.kids?.length || 0);

    // 1. TRANSPORTATION - Flights/Primary Transport
    const hasFlights = trip.flights && trip.flights.some((f: any) => f.status === 'booked' || f.status === 'confirmed');
    const hasPrimaryTransport = trip.transportation?.some((t: any) => 
      ['driving', 'train', 'bus'].includes(t.type) && (t.status === 'booked' || t.status === 'confirmed')
    );
    
    if (!hasFlights && !hasPrimaryTransport) {
      tasks.push({
        id: `core-${baseId}-flights`,
        title: isInternational ? 'Book international flights now' : 'Book flights or confirm transportation',
        subtitle: daysUntilTrip <= 30 ? 'Prices increasing daily - book immediately' : 'Lock in travel dates and pricing',
        category: 'travel',
        status: 'incomplete',
        urgent: daysUntilTrip <= 30,
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: isInternational ? 60 : 45,
        intelligence: {
          reasoning: 'Primary transportation is essential and prices increase closer to travel dates',
          source: 'booking_status'
        }
      });
    }

    // 2. ACCOMMODATION - Hotels/Lodging
    const hasAccommodation = (trip.hotels && trip.hotels.length > 0) || 
                           (trip.accommodations && trip.accommodations.length > 0);
    
    if (!hasAccommodation) {
      tasks.push({
        id: `core-${baseId}-accommodation`,
        title: 'Book family accommodations',
        subtitle: `Secure ${totalTravelers} traveler rooms in ${trip.city || 'destination'} - family-friendly places fill fast`,
        category: 'travel',
        status: 'incomplete',
        urgent: daysUntilTrip <= 21,
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 30,
        intelligence: {
          reasoning: 'Family accommodations book up early, especially rooms that can accommodate multiple travelers',
          source: 'booking_status'
        }
      });
    }

    // 3. INTERNATIONAL DOCUMENTATION
    if (isInternational) {
      tasks.push({
        id: `core-${baseId}-passports`,
        title: 'Verify all passports are valid',
        subtitle: `Check ${totalTravelers} passports have 6+ months validity from travel date`,
        category: 'planning',
        status: 'incomplete',
        urgent: daysUntilTrip <= 60,
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 90,
        intelligence: {
          reasoning: 'International travel requires valid passports with sufficient time remaining',
          source: 'trip_type'
        }
      });

      tasks.push({
        id: `core-${baseId}-bank-notify`,
        title: 'Notify banks of international travel',
        subtitle: `Alert credit/debit card companies about ${trip.country} travel to prevent blocks`,
        category: 'financial',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 14,
        intelligence: {
          reasoning: 'Banks often freeze cards for unexpected international transactions',
          source: 'trip_type'
        }
      });
    }

    // 4. TRAVEL INSURANCE (especially for families)
    const hasInsurance = trip.documents?.insurance;
    if (!hasInsurance && (isInternational || totalTravelers >= 3)) {
      tasks.push({
        id: `core-${baseId}-insurance`,
        title: 'Purchase travel insurance',
        subtitle: `Coverage for ${totalTravelers} travelers - medical, cancellation, and lost luggage protection`,
        category: 'planning',
        status: 'incomplete',
        urgent: false,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 21,
        intelligence: {
          reasoning: 'Travel insurance is crucial for families, especially with multiple travelers or international trips',
          source: 'risk_management'
        }
      });
    }

    // 5. ACTIVITY RESERVATIONS (for popular destinations)
    const hasActivities = trip.activities && trip.activities.length > 0;
    const isPopularDestination = ['paris', 'london', 'rome', 'barcelona', 'tokyo', 'new york'].some(city => 
      trip.city?.toLowerCase().includes(city)
    );
    
    if (!hasActivities && isPopularDestination && daysUntilTrip <= 45) {
      tasks.push({
        id: `core-${baseId}-activities`,
        title: 'Book must-see attractions now',
        subtitle: `${trip.city} popular attractions sell out - book family tickets in advance`,
        category: 'Activities',
        status: 'incomplete',
        urgent: daysUntilTrip <= 21,
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 30,
        intelligence: {
          reasoning: 'Popular destinations require advance booking to avoid disappointment',
          source: 'destination_intelligence'
        }
      });
    }

    // 6. RESTAURANT RESERVATIONS (for families in major cities)
    if (isPopularDestination && totalTravelers >= 4 && daysUntilTrip <= 30) {
      tasks.push({
        id: `core-${baseId}-restaurants`,
        title: 'Book family restaurant reservations',
        subtitle: `Large family groups (${totalTravelers} people) need advance reservations in ${trip.city}`,
        category: 'planning',
        status: 'incomplete',
        urgent: daysUntilTrip <= 14,
        isCustom: false,
        priority: 'medium',
        daysBeforeTrip: 21,
        intelligence: {
          reasoning: 'Large families struggle to find restaurant availability without advance booking',
          source: 'family_logistics'
        }
      });
    }

    // 7. FINAL CONFIRMATIONS (close to travel)
    if (daysUntilTrip <= 7) {
      tasks.push({
        id: `core-${baseId}-confirmations`,
        title: 'Confirm all bookings and reservations',
        subtitle: 'Double-check flights, hotels, and activities - print confirmation emails',
        category: 'planning',
        status: 'incomplete',
        urgent: true,
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 3,
        intelligence: {
          reasoning: 'Final confirmations prevent travel day surprises and ensure all bookings are valid',
          source: 'pre_departure_checklist'
        }
      });
    }

    return tasks;
  }

  private static async generateCriticalWeatherTasks(trip: TripData, daysUntilTrip: number): Promise<SmartTask[]> {
    const tasks: SmartTask[] = [];

    // Only generate weather tasks for trips within 14 days (when weather forecast is reliable)
    if (daysUntilTrip > 14 || !trip.city) return tasks;

    const coords = this.getCityCoordinates(trip.city);
    if (!coords) return tasks;

    // Use new API service with caching and error handling
    const weatherData = await apiService.getWeatherData(coords.lat, coords.lon);
    if (!weatherData?.dataseries) return tasks;

    const forecastDays = weatherData.dataseries.slice(0, 7);
    
    // Only generate CRITICAL weather tasks (severe weather)
    const rainDays = forecastDays.filter((day: any) => 
      day.weather?.includes('rain') || day.weather?.includes('shower')
    );

    const extremeHeatDays = forecastDays.filter((day: any) => 
      day.temp2m?.max > 35 // Above 35°C (95°F) - extreme heat
    );

    const extremeColdDays = forecastDays.filter((day: any) => 
      day.temp2m?.max < 5 // Below 5°C (41°F) - very cold
    );

    // Only add critical weather tasks
    if (rainDays.length >= 4) {
      tasks.push({
        id: `weather-${Date.now()}-rain`,
        title: 'Pack umbrella & rain gear',
        subtitle: `Heavy rain expected ${rainDays.length} days during trip`,
        category: 'packing',
        status: 'incomplete',
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 3,
        intelligence: {
          reasoning: `Significant rain forecast for ${trip.city}`,
          source: '7Timer API (cached)'
        }
      });
    }

    if (extremeHeatDays.length >= 3) {
      tasks.push({
        id: `weather-${Date.now()}-heat`,
        title: 'Pack extreme heat protection',
        subtitle: `Temperatures above 35°C expected - sunscreen, hats essential`,
        category: 'packing',
        status: 'incomplete',
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 3,
        intelligence: {
          reasoning: `Extreme heat warning for ${trip.city}`,
          source: '7Timer API (cached)'
        }
      });
    }

    if (extremeColdDays.length >= 3) {
      tasks.push({
        id: `weather-${Date.now()}-cold`,
        title: 'Pack winter gear',
        subtitle: `Freezing temperatures expected - warm clothes essential`,
        category: 'packing',
        status: 'incomplete',
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 3,
        intelligence: {
          reasoning: `Extreme cold warning for ${trip.city}`,
          source: '7Timer API (cached)'
        }
      });
    }

    return tasks;
  }

  private static generateTargetedFamilyTasks(trip: TripData, daysUntilTrip: number): SmartTask[] {
    const tasks: SmartTask[] = [];
    const baseId = Date.now();

    // Trip purpose-specific tasks (1-2 tasks) - NEW!
    if (trip.tripPurpose) {
      const purposeTasks = this.getTripPurposeTasks(trip.tripPurpose, trip, baseId, daysUntilTrip);
      tasks.push(...purposeTasks);
    }

    // Travel style-specific tasks (2-3 per style)
    if (trip.travelStyle) {
      const styleTasks = this.getTravelStyleTasks(trip.travelStyle, trip, baseId);
      tasks.push(...styleTasks);
    }

    // Family composition variables
    const hasKids = trip.kids && trip.kids.length > 0;

    // Family composition-specific smart recommendations (1-2 tasks)
    const compositionTasks = this.getFamilyCompositionTasks(trip, baseId);
    tasks.push(...compositionTasks.slice(0, 2));

    // Real family pain point intelligence (destination-specific)
    if (trip.city && hasKids) {
      const painPointTasks = this.getRealFamilyPainPointTasks(trip, baseId);
      tasks.push(...painPointTasks.slice(0, 1)); // Max 1 pain point task
    }

    return tasks;
  }

  private static getTripPurposeTasks(purpose: string, trip: TripData, baseId: number, daysUntilTrip: number): SmartTask[] {
    const tasks: SmartTask[] = [];
    const city = trip.city || 'your destination';
    const hasKids = trip.kids && trip.kids.length > 0;
    const hasToddlers = trip.kids?.some(kid => parseInt(kid.age || '0') <= 5);
    const hasTeens = trip.kids?.some(kid => parseInt(kid.age || '0') >= 13);

    switch (purpose) {
      case 'Family Vacation & Sightseeing':
        tasks.push(
          {
            id: `purpose-${baseId}-1`,
            title: 'Research kid-friendly attractions first',
            subtitle: `Find interactive experiences in ${city} - avoid passive sightseeing with children`,
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'high',
            daysBeforeTrip: 21,
            intelligence: {
              reasoning: 'Children engage better with hands-on experiences than traditional tourist sites',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-2`,
            title: 'Plan museum visits before 11am',
            subtitle: 'Kids are fresh in morning, crowds are lighter, exhibits are quieter',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 14,
            intelligence: {
              reasoning: 'Early museum visits maximize family engagement and minimize crowds',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-3`,
            title: 'Download offline maps and city apps',
            subtitle: `Save ${city} maps and family-friendly app recommendations for navigation`,
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 3,
            intelligence: {
              reasoning: 'Offline navigation prevents data roaming charges and works in areas with poor signal',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-4`,
            title: 'Book early dinner reservations (5:30pm)',
            subtitle: 'Beat dinner rush, kids are hungry but not overtired yet',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 14,
            intelligence: {
              reasoning: 'Early dinners work better for families - children eat better before getting tired',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-5`,
            title: 'Research backup indoor activities',
            subtitle: 'Find malls, indoor play areas, or family cafes for weather emergencies',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'low',
            daysBeforeTrip: 14,
            intelligence: {
              reasoning: 'Families need weather backup plans to prevent disappointed children',
              source: 'trip_purpose'
            }
          }
        );
        break;

      case 'Theme Parks & Entertainment':
        tasks.push(
          {
            id: `purpose-${baseId}-1`,
            title: 'Download all park apps and create accounts',
            subtitle: 'Disney, Universal, or park-specific apps for mobile ordering and wait times',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'high',
            daysBeforeTrip: 7,
            intelligence: {
              reasoning: 'Park apps can save 2+ hours per day through mobile ordering and wait time optimization',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-2`,
            title: 'Book FastPass/Lightning Lane/Express Pass',
            subtitle: 'Skip regular lines for popular rides - especially important with kids',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'high',
            daysBeforeTrip: 30,
            urgent: daysUntilTrip <= 14,
            intelligence: {
              reasoning: 'Skip-the-line passes are essential for families to maximize park time and minimize waiting',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-3`,
            title: 'Check height requirements for all rides',
            subtitle: 'Avoid disappointment - know which rides each child can enjoy',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 14,
            intelligence: {
              reasoning: 'Height restrictions cause major disappointment - better to plan alternative experiences',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-4`,
            title: 'Pack theme park survival kit',
            subtitle: 'Portable chargers, cooling towels, snacks, pain relievers, band-aids',
            category: 'packing',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 3,
            intelligence: {
              reasoning: 'Theme parks are physically demanding - families need energy and comfort supplies',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-5`,
            title: 'Plan mandatory rest day after theme parks',
            subtitle: 'Theme parks are exhausting - schedule pool/hotel day for recovery',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 21,
            intelligence: {
              reasoning: 'Theme park days are physically and emotionally exhausting for families',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-6`,
            title: 'Make dining reservations inside parks',
            subtitle: 'Popular restaurants fill up 60+ days in advance, especially character dining',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'high',
            daysBeforeTrip: 60,
            urgent: daysUntilTrip <= 30,
            intelligence: {
              reasoning: 'Theme park dining reservations book extremely early, especially family-friendly options',
              source: 'trip_purpose'
            }
          }
        );
        break;

      case 'Visiting Family & Friends':
        tasks.push(
          {
            id: `purpose-${baseId}-1`,
            title: 'Coordinate detailed arrival plans with hosts',
            subtitle: 'Share flight details, confirm pickup arrangements, exchange phone numbers',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'high',
            daysBeforeTrip: 2,
            intelligence: {
              reasoning: 'Clear coordination prevents confusion and stress for both families',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-2`,
            title: 'Pack thoughtful gifts for host family',
            subtitle: hasKids ? 'Include gifts for host family children (ask about ages/interests)' : 'Regional specialties or family favorites from your area',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 7,
            intelligence: {
              reasoning: 'Thoughtful gifts show appreciation and help children bond with host family kids',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-3`,
            title: 'Plan 2-3 backup activities together',
            subtitle: 'Prepare alternatives in case host family plans change or weather interferes',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 14,
            intelligence: {
              reasoning: 'Backup plans reduce stress when visiting family with unpredictable schedules',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-4`,
            title: 'Confirm sleeping arrangements for everyone',
            subtitle: 'Clarify bed/room assignments, bring air mattresses or sleeping bags if needed',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'high',
            daysBeforeTrip: 7,
            intelligence: {
              reasoning: 'Sleep arrangements affect family comfort and host family relationships',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-5`,
            title: 'Ask hosts about their favorite family spots',
            subtitle: 'Get insider recommendations for kid-friendly restaurants and activities',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'low',
            daysBeforeTrip: 14,
            intelligence: {
              reasoning: 'Local family recommendations are more valuable than tourist guides',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-6`,
            title: 'Coordinate meal responsibilities',
            subtitle: 'Clarify who cooks, shops, or pays for meals to avoid awkwardness',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 7,
            intelligence: {
              reasoning: 'Clear meal expectations prevent financial and social awkwardness',
              source: 'trip_purpose'
            }
          }
        );
        break;

      case 'Wedding, Celebration, or Event':
        tasks.push(
          {
            id: `purpose-${baseId}-1`,
            title: 'Confirm dress code for all family members',
            subtitle: 'Verify formal requirements, check weather for outdoor ceremonies, pack backup outfits',
            category: 'packing',
            status: 'incomplete',
            isCustom: false,
            priority: 'high',
            daysBeforeTrip: 7,
            intelligence: {
              reasoning: 'Event dress codes are strictly enforced and difficult to fix on location',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-2`,
            title: 'Purchase and wrap celebration gifts',
            subtitle: 'Buy appropriate gifts, wrap at home, pack carefully in carry-on luggage',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 5,
            intelligence: {
              reasoning: 'Gifts are easier to select and wrap at home rather than during travel',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-3`,
            title: 'Research childcare options if event isn\'t kid-friendly',
            subtitle: 'Find hotel babysitting services or child-friendly activities during adult events',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: hasKids ? 'high' : 'low',
            daysBeforeTrip: 21,
            intelligence: {
              reasoning: 'Many celebration events are adult-focused and require child supervision planning',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-4`,
            title: 'Book hotel room blocks early',
            subtitle: 'Wedding/event locations often sell out - book immediately after receiving invitation',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'high',
            daysBeforeTrip: 90,
            urgent: daysUntilTrip <= 30,
            intelligence: {
              reasoning: 'Event destinations have limited accommodations that book quickly',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-5`,
            title: 'Plan activities for non-event days',
            subtitle: 'Research family-friendly activities near event location for extra days',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 21,
            intelligence: {
              reasoning: 'Event trips often include extra days that need family-appropriate planning',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-6`,
            title: 'Arrange transportation to/from event venue',
            subtitle: 'Confirm whether transportation is provided or if you need rideshare/rental car',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'high',
            daysBeforeTrip: 14,
            intelligence: {
              reasoning: 'Event venues often have limited parking or are in hard-to-reach locations',
              source: 'trip_purpose'
            }
          }
        );
        break;

      case 'Business Trip + Family Extension':
        tasks.push(
          {
            id: `purpose-${baseId}-1`,
            title: 'Block dedicated family time in work calendar',
            subtitle: 'Protect mornings, evenings, and weekends from business meetings',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'high',
            daysBeforeTrip: 14,
            intelligence: {
              reasoning: 'Business trips easily overtake family time without explicit boundaries',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-2`,
            title: 'Book family-friendly hotel near business district',
            subtitle: 'Find accommodations with pool, family amenities, and walking distance to work',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'high',
            daysBeforeTrip: 30,
            intelligence: {
              reasoning: 'Mixed-purpose trips need accommodations that serve both business and family needs',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-3`,
            title: 'Arrange childcare during business commitments',
            subtitle: 'Hotel kids clubs, babysitting services, or partner family member supervision',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: hasKids ? 'high' : 'low',
            daysBeforeTrip: 21,
            intelligence: {
              reasoning: 'Business meetings require childcare solutions to maintain professionalism',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-4`,
            title: 'Research family activities within 30 minutes of business location',
            subtitle: 'Find kid-friendly options that don\'t require long commutes from work area',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 21,
            intelligence: {
              reasoning: 'Geographic convenience is crucial for mixed business-family trips',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-5`,
            title: 'Plan special weekend family activities',
            subtitle: 'Schedule memorable experiences to compensate for business days',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 14,
            intelligence: {
              reasoning: 'Quality family time must be intentionally planned to offset business demands',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-6`,
            title: 'Research family dining near business meetings',
            subtitle: 'Find restaurants suitable for business dinners that also welcome families',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'low',
            daysBeforeTrip: 14,
            intelligence: {
              reasoning: 'Business dining often needs to accommodate family members appropriately',
              source: 'trip_purpose'
            }
          }
        );
        break;

      case 'Other Purpose':
        tasks.push(
          {
            id: `purpose-${baseId}-1`,
            title: 'Clarify trip goals and expectations',
            subtitle: 'Define what success looks like for this unique trip purpose',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 21,
            intelligence: {
              reasoning: 'Unique trip purposes require explicit goal setting to ensure family satisfaction',
              source: 'trip_purpose'
            }
          },
          {
            id: `purpose-${baseId}-2`,
            title: 'Research destination-specific family recommendations',
            subtitle: `Find family travel blogs and forums specific to ${city}`,
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 21,
            intelligence: {
              reasoning: 'Non-standard trip purposes benefit from real family experiences at the destination',
              source: 'trip_purpose'
            }
          }
        );
        break;
    }

    return tasks;
  }

  private static getTravelStyleTasks(style: string, trip: TripData, baseId: number): SmartTask[] {
    const tasks: SmartTask[] = [];
    const city = trip.city || 'your destination';

    switch (style) {
      case 'adventure':
        tasks.push(
          {
            id: `style-${baseId}-1`,
            title: 'Research family-friendly active experiences',
            subtitle: `Find age-appropriate adventures in ${city}`,
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'high',
            intelligence: {
              reasoning: 'Adventure seekers need active options suitable for all ages',
              source: 'travel_style'
            }
          },
          {
            id: `style-${baseId}-2`,
            title: 'Pack motion sickness remedies',
            subtitle: 'Essential for active trips with kids',
            category: 'packing',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            daysBeforeTrip: 3,
            intelligence: {
              reasoning: 'Adventure activities often involve movement that can trigger motion sickness',
              source: 'travel_style'
            }
          }
        );
        break;

      case 'culture':
        tasks.push(
          {
            id: `style-${baseId}-1`,
            title: 'Plan museum visits before 11am',
            subtitle: 'Beat crowds and keep kids engaged',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'high',
            intelligence: {
              reasoning: 'Early museum visits work better for families - less crowded, kids more alert',
              source: 'travel_style'
            }
          },
          {
            id: `style-${baseId}-2`,
            title: 'Book family cultural workshops',
            subtitle: `Interactive experiences in ${city}`,
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            intelligence: {
              reasoning: 'Hands-on cultural activities engage kids better than passive sightseeing',
              source: 'travel_style'
            }
          }
        );
        break;

      case 'relaxed':
        tasks.push(
          {
            id: `style-${baseId}-1`,
            title: 'Research family-friendly parks & green spaces',
            subtitle: `Find relaxing outdoor spots in ${city}`,
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            intelligence: {
              reasoning: 'Relaxed explorers benefit from unstructured outdoor time',
              source: 'travel_style'
            }
          },
          {
            id: `style-${baseId}-2`,
            title: 'Block 1-3pm for nap time daily',
            subtitle: 'Babies/toddlers need consistent rest - plan around this',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'high',
            intelligence: {
              reasoning: 'Very young children require predictable nap schedules to prevent meltdowns',
              source: 'travel_style'
            }
          }
        );
        break;

      case 'comfort':
        tasks.push(
          {
            id: `style-${baseId}-1`,
            title: 'Research accessible transportation',
            subtitle: `Pre-book transfers and easy transit in ${city}`,
            category: 'travel',
            status: 'incomplete',
            isCustom: false,
            priority: 'high',
            intelligence: {
              reasoning: 'Comfort-focused families need reliable, easy transportation',
              source: 'travel_style'
            }
          },
          {
            id: `style-${baseId}-2`,
            title: 'Book ground floor or elevator access',
            subtitle: 'Request accessible rooms for easy movement',
            category: 'planning',
            status: 'incomplete',
            isCustom: false,
            priority: 'medium',
            intelligence: {
              reasoning: 'Accessibility reduces stress for families prioritizing comfort',
              source: 'travel_style'
            }
          }
        );
        break;
    }

    return tasks;
  }

  private static getFamilyCompositionTasks(trip: TripData, baseId: number): SmartTask[] {
    const tasks: SmartTask[] = [];
    const kids = trip.kids || [];
    const adults = trip.adults || [];
    
    // Advanced age analysis
    const hasBabies = kids.some(kid => parseInt(kid.age || '0') <= 2);
    const hasToddlers = kids.some(kid => {
      const age = parseInt(kid.age || '0');
      return age >= 3 && age <= 5;
    });
    const hasSchoolAge = kids.some(kid => {
      const age = parseInt(kid.age || '0');
      return age >= 6 && age <= 12;
    });
    const hasTeens = kids.some(kid => {
      const age = parseInt(kid.age || '0');
      return age >= 13 && age <= 17;
    });
    
    // Family composition analysis
    const totalFamily = kids.length + adults.length;
    const isLargeFamily = totalFamily >= 6;
    const isSingleParent = adults.length === 1 && kids.length > 0;
    const isMultiGen = adults.some(adult => parseInt(adult.age || '0') >= 65);
    const hasMixedAges = kids.length >= 2 && this.hasSignificantAgeGap(kids);

    // ADVANCED INTELLIGENCE RULES

    // Multi-generational specific needs
    if (isMultiGen && trip.city) {
      tasks.push({
        id: `family-${baseId}-multigen`,
        title: 'Book accessible accommodations',
        subtitle: 'Ground floor rooms and elevator access for grandparents',
        category: 'planning',
        status: 'incomplete',
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 14,
        intelligence: {
          reasoning: 'Multi-generational families need accommodation that works for all mobility levels',
          source: 'advanced_family_dynamics'
        }
      });
    }

    // Mixed age siblings - the hardest family dynamic
    if (hasMixedAges) {
      const ageGapAdvice = this.getAgeGapStrategy(kids, trip.city);
      tasks.push({
        id: `family-${baseId}-agegap`,
        title: ageGapAdvice.title,
        subtitle: ageGapAdvice.subtitle,
        category: 'planning',
        status: 'incomplete',
        isCustom: false,
        priority: 'high',
        intelligence: {
          reasoning: ageGapAdvice.reasoning,
          source: 'advanced_family_dynamics'
        }
      });
    }

    // Baby/toddler-specific intelligence (most restrictive)
    if (hasBabies || hasToddlers) {
      const napStrategy = this.getNapTimeStrategy(kids);
      tasks.push({
        id: `family-${baseId}-naptime`,
        title: napStrategy.title,
        subtitle: napStrategy.subtitle,
        category: 'planning',
        status: 'incomplete',
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 7,
        intelligence: {
          reasoning: napStrategy.reasoning,
          source: 'advanced_family_dynamics'
        }
      });
    }

    // Teen engagement (avoid boredom meltdowns)
    if (hasTeens && trip.city) {
      const teenStrategy = this.getTeenEngagementStrategy(trip.city, trip.travelStyle);
      tasks.push({
        id: `family-${baseId}-teen-engagement`,
        title: teenStrategy.title,
        subtitle: teenStrategy.subtitle,
        category: 'Activities',
        status: 'incomplete',
        isCustom: false,
        priority: 'medium',
        intelligence: {
          reasoning: teenStrategy.reasoning,
          source: 'advanced_family_dynamics'
        }
      });
    }

    // Large family logistics (6+ people)
    if (isLargeFamily) {
      tasks.push({
        id: `family-${baseId}-logistics`,
        title: 'Plan split activities for large group',
        subtitle: `${totalFamily} people - consider splitting for some activities`,
        category: 'planning',
        status: 'incomplete',
        isCustom: false,
        priority: 'medium',
        intelligence: {
          reasoning: 'Large families often function better when split into smaller groups for certain activities',
          source: 'advanced_family_dynamics'
        }
      });
    }

    // Single parent support
    if (isSingleParent) {
      const soloStrategy = this.getSingleParentStrategy(kids, trip.city);
      tasks.push({
        id: `family-${baseId}-solo-support`,
        title: soloStrategy.title,
        subtitle: soloStrategy.subtitle,
        category: 'planning',
        status: 'incomplete',
        isCustom: false,
        priority: 'high',
        intelligence: {
          reasoning: soloStrategy.reasoning,
          source: 'advanced_family_dynamics'
        }
      });
    }

    return tasks;
  }

  // Helper methods for advanced family dynamics

  private static hasSignificantAgeGap(kids: FamilyMember[]): boolean {
    if (kids.length < 2) return false;
    const ages = kids.map(k => parseInt(k.age || '0')).sort((a, b) => a - b);
    return (ages[ages.length - 1] - ages[0]) >= 8; // 8+ year gap is significant
  }

  private static getAgeGapStrategy(kids: FamilyMember[], city?: string): { title: string; subtitle: string; reasoning: string } {
    const ages = kids.map(k => parseInt(k.age || '0')).sort((a, b) => a - b);
    const minAge = ages[0];
    const maxAge = ages[ages.length - 1];

    if (minAge <= 5 && maxAge >= 13) {
      // Toddler + Teen combo (hardest)
      return {
        title: 'Plan separate toddler and teen activities',
        subtitle: `Age gap ${minAge}-${maxAge} requires different engagement strategies`,
        reasoning: 'Large age gaps between toddlers and teens require completely different activities and timing'
      };
    } else if (minAge <= 8 && maxAge >= 14) {
      // School age + Teen
      return {
        title: 'Find activities that engage both age groups',
        subtitle: 'Interactive experiences work better than passive sightseeing',
        reasoning: 'Mixed school-age and teen groups need hands-on activities to keep everyone engaged'
      };
    }

    return {
      title: 'Plan age-appropriate activity rotation',
      subtitle: 'Take turns choosing activities that appeal to different ages',
      reasoning: 'Significant age gaps require alternating between different types of activities'
    };
  }

  private static getNapTimeStrategy(kids: FamilyMember[]): { title: string; subtitle: string; reasoning: string } {
    const hasVeryYoung = kids.some(k => parseInt(k.age || '0') <= 2);
    
    if (hasVeryYoung) {
      return {
        title: 'Block 1-3pm for nap time daily',
        subtitle: 'Babies/toddlers need consistent rest - plan around this',
        reasoning: 'Very young children require predictable nap schedules to prevent meltdowns'
      };
    }

    return {
      title: 'Plan rest breaks every 2-3 hours',
      subtitle: 'Toddlers need frequent breaks from stimulation',
      reasoning: 'Toddlers get overstimulated quickly and need regular quiet time'
    };
  }

  private static getTeenEngagementStrategy(city?: string, travelStyle?: string): { title: string; subtitle: string; reasoning: string } {
    if (travelStyle === 'culture') {
      return {
        title: 'Choose interactive cultural experiences',
        subtitle: `Skip traditional museums in ${city} - find hands-on workshops`,
        reasoning: 'Teens engage better with interactive cultural experiences than passive museum visits'
      };
    } else if (travelStyle === 'adventure') {
      return {
        title: 'Let teens research and suggest activities',
        subtitle: 'Give them ownership of 1-2 activity choices',
        reasoning: 'Teen buy-in is crucial for adventure activities - they need to feel involved in planning'
      };
    }

    return {
      title: 'Find Instagram-worthy photo spots',
      subtitle: `Research photogenic locations in ${city}`,
      reasoning: 'Teens are more engaged when they can document experiences for social media'
    };
  }

  private static getSingleParentStrategy(kids: FamilyMember[], city?: string): { title: string; subtitle: string; reasoning: string } {
    if (kids.length >= 3) {
      return {
        title: 'Book family suite or connecting rooms',
        subtitle: 'Single parents with multiple kids need space management',
        reasoning: 'Solo parents managing multiple children need accommodation that provides both supervision and space'
      };
    } else if (kids.some(k => parseInt(k.age || '0') <= 5)) {
      return {
        title: 'Choose hotels with kids clubs or family amenities',
        subtitle: 'Built-in childcare gives solo parents essential breaks',
        reasoning: 'Single parents need accommodations that provide safe, supervised activities for children'
      };
    }

    return {
      title: 'Plan one relaxing activity per day',
      subtitle: 'Solo parenting while traveling is exhausting - pace yourself',
      reasoning: 'Single parents need to balance children\'s activities with their own energy management'
    };
  }

  // Real family pain point intelligence - destination-specific wisdom
  private static getRealFamilyPainPointTasks(trip: TripData, baseId: number): SmartTask[] {
    const tasks: SmartTask[] = [];
    const city = trip.city?.toLowerCase() || '';
    const kids = trip.kids || [];
    
    // Age analysis for pain point recommendations
    const hasYoungKids = kids.some(k => parseInt(k.age || '0') <= 8);
    const hasToddlers = kids.some(k => parseInt(k.age || '0') <= 4);
    const hasTeens = kids.some(k => parseInt(k.age || '0') >= 13);
    const hasSchoolAge = kids.some(k => {
      const age = parseInt(k.age || '0');
      return age >= 6 && age <= 12;
    });

    // Paris-specific family pain points
    if (city.includes('paris')) {
      if (hasYoungKids) {
        tasks.push({
          id: `painpoint-${baseId}-paris-louvre`,
          title: 'Skip Louvre with kids under 8 - try Musée d\'Orsay instead',
          subtitle: 'Louvre is overwhelming for young children - Orsay has better kid-friendly exhibits',
          category: 'planning',
          status: 'incomplete',
          isCustom: false,
          priority: 'medium',
          daysBeforeTrip: 14,
          intelligence: {
            reasoning: 'Louvre causes family meltdowns with young kids - too big, too crowded, not interactive enough',
            source: 'real_family_pain_points'
          }
        });
      }

      if (hasToddlers) {
        tasks.push({
          id: `painpoint-${baseId}-paris-metro`,
          title: 'Plan metro alternatives - most stations lack elevators',
          subtitle: 'Bring lightweight stroller or baby carrier for metro stairs',
          category: 'planning',
          status: 'incomplete',
          isCustom: false,
          priority: 'high',
          daysBeforeTrip: 7,
          intelligence: {
            reasoning: 'Paris metro stairs are exhausting with toddlers and strollers',
            source: 'real_family_pain_points'
          }
        });
      }
    }

    // London-specific family pain points
    else if (city.includes('london')) {
      if (hasYoungKids) {
        tasks.push({
          id: `painpoint-${baseId}-london-museums`,
          title: 'Hit Natural History Museum before 10am or after 4pm',
          subtitle: 'Dinosaur gallery becomes unbearably crowded 10am-4pm with school groups',
          category: 'planning',
          status: 'incomplete',
          isCustom: false,
          priority: 'medium',
          daysBeforeTrip: 14,
          intelligence: {
            reasoning: 'School groups make popular museums impossible for families during peak hours',
            source: 'real_family_pain_points'
          }
        });
      }

      if (hasTeens) {
        tasks.push({
          id: `painpoint-${baseId}-london-teens`,
          title: 'Book Camden Market for teen shopping - skip Oxford Street',
          subtitle: 'Oxford Street overwhelms teens - Camden has unique shops they actually want',
          category: 'planning',
          status: 'incomplete',
          isCustom: false,
          priority: 'low',
          daysBeforeTrip: 14,
          intelligence: {
            reasoning: 'Teens get bored with generic shopping streets but love unique market atmospheres',
            source: 'real_family_pain_points'
          }
        });
      }
    }

    // Rome-specific family pain points
    else if (city.includes('rome')) {
      if (hasYoungKids) {
        tasks.push({
          id: `painpoint-${baseId}-rome-colosseum`,
          title: 'Book underground Colosseum tour for kids 8+ only',
          subtitle: 'Regular tour works for younger kids - underground is claustrophobic for under 8',
          category: 'planning',
          status: 'incomplete',
          isCustom: false,
          priority: 'medium',
          daysBeforeTrip: 21,
          intelligence: {
            reasoning: 'Underground Colosseum tours overwhelm young children but fascinate older kids',
            source: 'real_family_pain_points'
          }
        });
      }

      if (kids.length > 0) {
        tasks.push({
          id: `painpoint-${baseId}-rome-restaurants`,
          title: 'Eat dinner before 7pm or after 9pm',
          subtitle: 'Roman restaurants are chaos 7-9pm - families need off-peak timing',
          category: 'planning',
          status: 'incomplete',
          isCustom: false,
          priority: 'medium',
          daysBeforeTrip: 14,
          intelligence: {
            reasoning: 'Peak dinner hours in Rome are overwhelming for families with children',
            source: 'real_family_pain_points'
          }
        });
      }
    }

    // New York-specific family pain points
    else if (city.includes('new york') || city.includes('nyc')) {
      if (hasYoungKids) {
        tasks.push({
          id: `painpoint-${baseId}-nyc-times-square`,
          title: 'Avoid Times Square with young kids except early morning',
          subtitle: 'Times Square overwhelms children - if you must go, do it before 10am',
          category: 'planning',
          status: 'incomplete',
          isCustom: false,
          priority: 'medium',
          daysBeforeTrip: 14,
          intelligence: {
            reasoning: 'Times Square crowds and sensory overload cause meltdowns in young children',
            source: 'real_family_pain_points'
          }
        });
      }

      if (hasToddlers) {
        tasks.push({
          id: `painpoint-${baseId}-nyc-subway`,
          title: 'Plan subway backup routes - many stations lack elevators',
          subtitle: 'Bring baby carrier as backup for stroller-unfriendly stations',
          category: 'planning',
          status: 'incomplete',
          isCustom: false,
          priority: 'high',
          daysBeforeTrip: 7,
          intelligence: {
            reasoning: 'NYC subway accessibility is limited - families need contingency plans',
            source: 'real_family_pain_points'
          }
        });
      }
    }

    // Barcelona-specific family pain points
    else if (city.includes('barcelona')) {
      if (hasYoungKids) {
        tasks.push({
          id: `painpoint-${baseId}-barcelona-sagrada`,
          title: 'Book Sagrada Familia audioguide for kids',
          subtitle: 'Without context, kids get bored quickly - audioguide makes it magical',
          category: 'planning',
          status: 'incomplete',
          isCustom: false,
          priority: 'medium',
          daysBeforeTrip: 21,
          intelligence: {
            reasoning: 'Architecture is abstract for children without storytelling context',
            source: 'real_family_pain_points'
          }
        });
      }
    }

    // Universal pain points for any major city
    if (!tasks.length && kids.length > 0) {
      // Fallback universal family pain point
      if (hasYoungKids) {
        tasks.push({
          id: `painpoint-${baseId}-universal-timing`,
          title: 'Plan major attractions before 11am or after 4pm',
          subtitle: 'Beat tourist crowds and school groups for better family experience',
          category: 'planning',
          status: 'incomplete',
          isCustom: false,
          priority: 'medium',
          daysBeforeTrip: 14,
          intelligence: {
            reasoning: 'Popular attractions are overwhelming for families during peak tourist hours',
            source: 'real_family_pain_points'
          }
        });
      }
    }

    return tasks;
  }

  private static prioritizeTasks(tasks: SmartTask[], daysUntilTrip: number): SmartTask[] {
    return tasks.sort((a, b) => {
      // Priority order: urgent high > non-urgent high > urgent medium > non-urgent medium > urgent low > non-urgent low
      const getScore = (task: SmartTask) => {
        let score = 0;
        
        // Urgency based on timeline
        if (task.urgent || (task.daysBeforeTrip && daysUntilTrip <= task.daysBeforeTrip)) {
          score += 1000;
        }
        
        // Priority scoring
        if (task.priority === 'high') score += 100;
        else if (task.priority === 'medium') score += 50;
        else score += 10;
        
        return score;
      };
      
      return getScore(b) - getScore(a);
    });
  }

  // Helper methods
  private static getPowerAdapterInfo(country: string): string {
    const adapterInfo = {
      'spain': 'Type C and F outlets (European standard)',
      'france': 'Type C and E outlets (European standard)',
      'germany': 'Type C and F outlets (European standard)',
      'italy': 'Type C, F, and L outlets',
      'united kingdom': 'Type G outlets (3-prong)',
      'japan': 'Type A and B outlets',
      'china': 'Type A, C, and I outlets',
      'australia': 'Type I outlets'
    };
    
    return adapterInfo[country] || 'Research local outlet types for your destination';
  }

  private static isEuropeanCountry(country: string): boolean {
    const europeanCountries = [
      'spain', 'france', 'germany', 'italy', 'portugal', 'netherlands', 
      'belgium', 'austria', 'switzerland', 'czech republic', 'poland',
      'hungary', 'croatia', 'greece', 'norway', 'sweden', 'denmark'
    ];
    return europeanCountries.includes(country);
  }

  private static getClimateCategory(country: string): string {
    const tropical = ['thailand', 'malaysia', 'indonesia', 'philippines', 'vietnam', 'costa rica', 'colombia', 'brazil'];
    const cold = ['norway', 'sweden', 'finland', 'iceland', 'russia', 'canada'];
    const arid = ['egypt', 'morocco', 'jordan', 'israel', 'uae', 'saudi arabia'];
    
    if (tropical.some(c => country.includes(c))) return 'tropical';
    if (cold.some(c => country.includes(c))) return 'cold';
    if (arid.some(c => country.includes(c))) return 'arid';
    return 'temperate';
  }

  private static getAgeRange(kids: FamilyMember[]): string {
    const ages = kids.map(kid => parseInt(kid.age || '0')).filter(age => age > 0);
    if (ages.length === 0) return 'unknown';
    
    const min = Math.min(...ages);
    const max = Math.max(...ages);
    
    if (min === max) return `${min}`;
    return `${min}-${max}`;
  }
}