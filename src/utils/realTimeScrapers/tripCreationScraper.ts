/**
 * Real-time scraping when user creates a trip
 * Scrapes data on-demand for specific destinations
 */

import { TripData } from '../../types';

export interface ScrapingJob {
  tripId: string;
  city: string;
  country: string;
  familyProfile: any;
  status: 'pending' | 'scraping' | 'completed' | 'failed';
  progress: number;
  results: any[];
  startedAt: Date;
  completedAt?: Date;
}

export class TripCreationScraper {
  private static scrapingJobs = new Map<string, ScrapingJob>();

  /**
   * Start scraping when user creates a trip
   */
  static async enhanceTripOnCreation(trip: TripData): Promise<{
    basicTasks: any[];
    scrapingJobId: string;
  }> {
    // Step 1: Generate basic tasks immediately
    const basicTasks = this.generateBasicTasks(trip);

    // Step 2: Start background scraping if supported city
    const scrapingJobId = await this.startBackgroundScraping(trip);

    return {
      basicTasks,
      scrapingJobId
    };
  }

  /**
   * Generate basic tasks that work for any city
   */
  private static generateBasicTasks(trip: TripData) {
    return [
      {
        id: 'research-restaurants',
        title: 'Research Family-Friendly Restaurants',
        subtitle: 'Looking for specific recommendations...',
        category: 'planning',
        status: 'incomplete',
        priority: 'medium',
        isEnhancing: true, // Flag to show it's being enhanced
        intelligence: {
          reasoning: 'Finding specific family-tested restaurants in your destination',
          source: 'AI is researching...'
        }
      },
      {
        id: 'research-activities',
        title: 'Find Family Activities',
        subtitle: 'Searching for age-appropriate attractions...',
        category: 'planning', 
        status: 'incomplete',
        priority: 'medium',
        isEnhancing: true,
        intelligence: {
          reasoning: 'Finding activities suitable for your family composition',
          source: 'AI is researching...'
        }
      }
    ];
  }

  /**
   * Start background scraping job
   */
  private static async startBackgroundScraping(trip: TripData): Promise<string> {
    const jobId = `scrape-${trip.id}-${Date.now()}`;
    
    const job: ScrapingJob = {
      tripId: trip.id!,
      city: trip.city!,
      country: trip.country!,
      familyProfile: {
        adults: trip.adults?.length || 0,
        kids: trip.kids?.length || 0,
        kidAges: trip.kids?.map(k => k.age).filter(Boolean) || [],
        dietaryNeeds: trip.dietaryPreferences || []
      },
      status: 'pending',
      progress: 0,
      results: [],
      startedAt: new Date()
    };

    this.scrapingJobs.set(jobId, job);

    // Start scraping in background (don't await)
    this.performScraping(jobId).catch(error => {
      console.error('Background scraping failed:', error);
      const failedJob = this.scrapingJobs.get(jobId);
      if (failedJob) {
        failedJob.status = 'failed';
        this.scrapingJobs.set(jobId, failedJob);
      }
    });

    return jobId;
  }

  /**
   * Perform the actual scraping
   */
  private static async performScraping(jobId: string): Promise<void> {
    const job = this.scrapingJobs.get(jobId);
    if (!job) return;

    try {
      // Update status
      job.status = 'scraping';
      job.progress = 10;
      this.scrapingJobs.set(jobId, job);

      // Scrape restaurants
      job.progress = 30;
      const restaurants = await this.scrapeRestaurants(job.city, job.country, job.familyProfile);
      job.results.push(...restaurants);

      // Scrape activities  
      job.progress = 60;
      const activities = await this.scrapeActivities(job.city, job.country, job.familyProfile);
      job.results.push(...activities);

      // Scrape practical tips
      job.progress = 90;
      const tips = await this.scrapePracticalTips(job.city, job.country);
      job.results.push(...tips);

      // Complete
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date();
      this.scrapingJobs.set(jobId, job);

    } catch (error) {
      job.status = 'failed';
      job.progress = 0;
      this.scrapingJobs.set(jobId, job);
      throw error;
    }
  }

  /**
   * Scrape family restaurants for the city
   */
  private static async scrapeRestaurants(city: string, country: string, familyProfile: any) {
    // Simulate scraping delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In production, this would scrape TripAdvisor, Google Maps, etc.
    return [
      {
        type: 'restaurant',
        name: `Local Family Restaurant in ${city}`,
        address: `Main Street, ${city}`,
        phone: '+1-234-567-8900',
        familyFeatures: ['high chairs', 'kids menu'],
        confidence: 0.8,
        source: 'TripAdvisor scraping'
      }
    ];
  }

  /**
   * Scrape family activities
   */
  private static async scrapeActivities(city: string, country: string, familyProfile: any) {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return [
      {
        type: 'activity',
        name: `${city} Central Park`,
        address: `City Center, ${city}`,
        ageRecommendation: 'All ages',
        duration: '2-3 hours',
        confidence: 0.9,
        source: 'Local tourism sites'
      }
    ];
  }

  /**
   * Scrape practical tips
   */
  private static async scrapePracticalTips(city: string, country: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return [
      {
        type: 'tip',
        content: `Best time to visit ${city} attractions is early morning`,
        category: 'timing',
        confidence: 0.7,
        source: 'Travel blogs'
      }
    ];
  }

  /**
   * Get scraping job status
   */
  static getScrapingStatus(jobId: string): ScrapingJob | null {
    return this.scrapingJobs.get(jobId) || null;
  }

  /**
   * Get enhanced tasks once scraping is complete
   */
  static getEnhancedTasks(jobId: string): any[] {
    const job = this.scrapingJobs.get(jobId);
    if (!job || job.status !== 'completed') return [];

    // Convert scraped results to task format
    const enhancedTasks = [];

    job.results.forEach(result => {
      if (result.type === 'restaurant') {
        enhancedTasks.push({
          id: `scraped-restaurant-${Date.now()}`,
          title: `Try: ${result.name}`,
          subtitle: `${result.familyFeatures.join(', ')} - Call ${result.phone}`,
          category: 'planning',
          status: 'incomplete',
          priority: 'medium',
          isCustom: false,
          intelligence: {
            reasoning: `📞 ${result.phone}\n👨‍👩‍👧‍👦 ${result.familyFeatures.join(', ')}`,
            source: `Scraped from ${result.source}`
          }
        });
      }

      if (result.type === 'activity') {
        enhancedTasks.push({
          id: `scraped-activity-${Date.now()}`,
          title: `Visit: ${result.name}`,
          subtitle: `${result.ageRecommendation} - ${result.duration}`,
          category: 'planning',
          status: 'incomplete', 
          priority: 'medium',
          isCustom: false,
          intelligence: {
            reasoning: `📍 ${result.address}\n⏰ Duration: ${result.duration}`,
            source: `Scraped from ${result.source}`
          }
        });
      }
    });

    return enhancedTasks;
  }

  /**
   * Clean up old scraping jobs (call periodically)
   */
  static cleanupOldJobs() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [jobId, job] of this.scrapingJobs.entries()) {
      if (job.startedAt < oneDayAgo) {
        this.scrapingJobs.delete(jobId);
      }
    }
  }
}

export { TripCreationScraper };