/**
 * Master City Intelligence Integration
 * Connects all city-specific recommendations to SmartTaskGenerator
 */

import { generateOrlandoTasks } from '../orlando/orlandoRecommendations';
import { generateParisTasks } from './parisRecommendations';
import { generateLondonTasks } from './londonRecommendations';
import { generateTokyoTasks } from './tokyoRecommendations';
import { generateBarcelonaTasks } from './barcelonaRecommendations';
import { generateAmsterdamTasks } from './amsterdamRecommendations';
import { generateRomeTasks } from './romeRecommendations';
import { generateNewYorkTasks } from './newYorkRecommendations';
import { generateSanDiegoTasks } from './sanDiegoRecommendations';
import { generateCopenhagenTasks } from './copenhagenRecommendations';
import { generateMadridTasks } from './madridRecommendations';

/**
 * City-specific task generators mapping
 */
const CITY_GENERATORS: Record<string, (familyProfile: any, daysUntilTrip: number) => any[]> = {
  // Tier 1: Premium family destinations
  'orlando': generateOrlandoTasks,
  'paris': generateParisTasks,
  'london': generateLondonTasks,
  'tokyo': generateTokyoTasks,
  'barcelona': generateBarcelonaTasks,
  'amsterdam': generateAmsterdamTasks,
  'rome': generateRomeTasks,
  'new york': generateNewYorkTasks,
  'new york city': generateNewYorkTasks,
  'nyc': generateNewYorkTasks,
  'san diego': generateSanDiegoTasks,
  'copenhagen': generateCopenhagenTasks,
  'madrid': generateMadridTasks,
  
  // Alternative city names
  'orlando, florida': generateOrlandoTasks,
  'paris, france': generateParisTasks,
  'london, england': generateLondonTasks,
  'london, uk': generateLondonTasks,
  'tokyo, japan': generateTokyoTasks,
  'barcelona, spain': generateBarcelonaTasks,
  'amsterdam, netherlands': generateAmsterdamTasks,
  'rome, italy': generateRomeTasks,
  'san diego, california': generateSanDiegoTasks,
  'copenhagen, denmark': generateCopenhagenTasks,
  'madrid, spain': generateMadridTasks
};

/**
 * Get city-specific intelligence for any supported city
 */
export function getCitySpecificTasks(city: string, familyProfile: any, daysUntilTrip: number): any[] {
  if (!city) return [];
  
  const cityKey = city.toLowerCase().trim();
  const generator = CITY_GENERATORS[cityKey];
  
  if (generator) {
    try {
      return generator(familyProfile, daysUntilTrip);
    } catch (error) {
      console.warn(`City intelligence failed for ${city}:`, error);
      return [];
    }
  }
  
  return [];
}

/**
 * Check if a city has specific intelligence available
 */
export function hasCityIntelligence(city: string): boolean {
  if (!city) return false;
  const cityKey = city.toLowerCase().trim();
  return cityKey in CITY_GENERATORS;
}

/**
 * Get list of all supported cities for autocomplete/suggestions
 */
export function getSupportedCities(): string[] {
  return [
    'Orlando, Florida',
    'Paris, France', 
    'London, England',
    'Tokyo, Japan',
    'Barcelona, Spain',
    'Amsterdam, Netherlands',
    'Rome, Italy',
    'New York City',
    'San Diego, California',
    'Copenhagen, Denmark',
    'Madrid, Spain'
  ];
}

/**
 * Get city intelligence metadata
 */
export function getCityMetadata(city: string): {
  hasIntelligence: boolean;
  tier: 'premium' | 'standard' | 'basic';
  coverageLevel: string;
} {
  const hasIntelligence = hasCityIntelligence(city);
  
  if (!hasIntelligence) {
    return {
      hasIntelligence: false,
      tier: 'basic',
      coverageLevel: 'Generic family travel advice only'
    };
  }
  
  // All current cities are premium tier with full family intelligence
  return {
    hasIntelligence: true,
    tier: 'premium',
    coverageLevel: 'Full family intelligence with specific recommendations'
  };
}

/**
 * Generate city-specific welcome message
 */
export function getCityWelcomeMessage(city: string): string {
  if (!hasCityIntelligence(city)) {
    return `Planning your family trip to ${city}! We'll provide general family travel advice and are working on specific recommendations for this destination.`;
  }
  
  const cityKey = city.toLowerCase().trim();
  
  // City-specific welcome messages
  const welcomeMessages: Record<string, string> = {
    'orlando': `🏰 Orlando detected! Get ready for Disney World magic - I'll help you navigate the most complex family destination on Earth!`,
    'paris': `🗼 Bonjour! Planning Paris with kids requires strategy - I'll help you master Disneyland Paris, museums, and French dining culture!`,
    'london': `🇬🇧 Brilliant! London is incredibly family-friendly - I'll help you book Harry Potter tours, navigate the Tube, and find the best playgrounds!`,
    'tokyo': `🗾 Tokyo with kids is amazing! I'll help you conquer Disney, master the trains, and navigate the language barrier with confidence!`,
    'barcelona': `🏖️ Barcelona combines beaches and culture perfectly for families - I'll help you time Sagrada Familia visits and navigate Spanish meal times!`,
    'amsterdam': `🚲 Amsterdam is bike paradise for families! I'll help you rent cargo bikes, find the best playgrounds, and plan canal adventures!`,
    'rome': `🏛️ Rome's history comes alive for kids! I'll help you make the Colosseum exciting and find the best gelato spots!`,
    'new york': `🗽 The Big Apple with kids! I'll help you score Broadway tickets, navigate the subway, and find the best playgrounds in Central Park!`,
    'new york city': `🗽 The Big Apple with kids! I'll help you score Broadway tickets, navigate the subway, and find the best playgrounds in Central Park!`,
    'san diego': `☀️ Perfect weather for family fun! I'll help you plan zoo days, beach visits, and Legoland adventures!`,
    'copenhagen': `🧜‍♀️ Hygge family time in Copenhagen! I'll help you enjoy Tivoli Gardens, rent family bikes, and find the best Danish pastries!`,
    'madrid': `🇪🇸 ¡Hola! Madrid with kids is amazing - I'll help you navigate Spanish meal times, enjoy Retiro Park, and find the best churros!`
  };
  
  return welcomeMessages[cityKey] || `✈️ ${city} family adventure incoming! I've got specific intelligence to make your trip amazing!`;
}

export { generateOrlandoTasks, generateParisTasks, generateLondonTasks, generateTokyoTasks, generateBarcelonaTasks, generateAmsterdamTasks, generateRomeTasks, generateNewYorkTasks, generateSanDiegoTasks, generateCopenhagenTasks, generateMadridTasks };