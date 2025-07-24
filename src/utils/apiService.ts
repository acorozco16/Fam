// API Service with caching and graceful degradation
// Implements the roadmap caching strategy: weather: 6hrs, holidays: 30 days, countries: 7 days

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface WeatherData {
  dataseries: Array<{
    weather: string;
    temp2m: { max: number; min: number };
  }>;
}

export interface HolidayData {
  date: string;
  name: string;
  localName: string;
  countryCode: string;
}

export interface CountryData {
  name: { common: string };
  currencies: Record<string, { name: string; symbol: string }>;
  languages: Record<string, string>;
  timezones: string[];
}

class ApiService {
  private cache = new Map<string, CacheEntry<any>>();

  // Cache durations (in milliseconds)
  private readonly CACHE_DURATIONS = {
    weather: 6 * 60 * 60 * 1000,      // 6 hours
    holiday: 30 * 24 * 60 * 60 * 1000, // 30 days
    country: 7 * 24 * 60 * 60 * 1000   // 7 days
  };

  private isValidCache<T>(entry: CacheEntry<T>): boolean {
    return Date.now() < entry.expiresAt;
  }

  private setCache<T>(key: string, data: T, duration: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration
    };
    this.cache.set(key, entry);
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && this.isValidCache(entry)) {
      return entry.data;
    }
    // Clean up expired entries
    if (entry) {
      this.cache.delete(key);
    }
    return null;
  }

  // Weather API with caching and fallback
  async getWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
    const cacheKey = `weather_${lat}_${lon}`;
    
    // Check cache first
    const cached = this.getCache<WeatherData>(cacheKey);
    if (cached) {
      console.log('🎯 Weather data served from cache');
      return cached;
    }

    try {
      const weatherUrl = `https://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civillight&output=json`;
      
      console.log('🌤️ Fetching fresh weather data...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(weatherUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'FamApp/1.0 (Family Travel Planner)',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Weather API responded with ${response.status}`);
      }

      const data: WeatherData = await response.json();
      
      // Validate data structure
      if (!data.dataseries || !Array.isArray(data.dataseries)) {
        throw new Error('Invalid weather data structure');
      }

      // Cache successful result
      this.setCache(cacheKey, data, this.CACHE_DURATIONS.weather);
      console.log('✅ Weather data fetched and cached');
      
      return data;

    } catch (error) {
      console.warn('⚠️ Weather API failed, using fallback:', error);
      
      // Graceful degradation - return null to skip weather tasks
      return null;
    }
  }

  // Holiday API with caching and fallback  
  async getHolidayData(countryCode: string, year: number): Promise<HolidayData[] | null> {
    const cacheKey = `holiday_${countryCode}_${year}`;
    
    // Check cache first
    const cached = this.getCache<HolidayData[]>(cacheKey);
    if (cached) {
      console.log('🎯 Holiday data served from cache');
      return cached;
    }

    try {
      const holidayUrl = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
      
      console.log('🎉 Fetching fresh holiday data...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(holidayUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'FamApp/1.0 (Family Travel Planner)',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          // Country not supported, cache empty result
          this.setCache(cacheKey, [], this.CACHE_DURATIONS.holiday);
          return [];
        }
        throw new Error(`Holiday API responded with ${response.status}`);
      }

      const data: HolidayData[] = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid holiday data structure');
      }

      // Cache successful result
      this.setCache(cacheKey, data, this.CACHE_DURATIONS.holiday);
      console.log('✅ Holiday data fetched and cached');
      
      return data;

    } catch (error) {
      console.warn('⚠️ Holiday API failed, using fallback:', error);
      
      // Graceful degradation - return null to skip holiday tasks
      return null;
    }
  }

  // Country API with caching and fallback
  async getCountryData(countryName: string): Promise<CountryData | null> {
    const cacheKey = `country_${countryName.toLowerCase()}`;
    
    // Check cache first
    const cached = this.getCache<CountryData>(cacheKey);
    if (cached) {
      console.log('🎯 Country data served from cache');
      return cached;
    }

    try {
      const countryUrl = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=name,currencies,languages,timezones`;
      
      console.log('🌍 Fetching fresh country data...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(countryUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'FamApp/1.0 (Family Travel Planner)',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          // Country not found, cache null result
          this.setCache(cacheKey, null, this.CACHE_DURATIONS.country);
          return null;
        }
        throw new Error(`Country API responded with ${response.status}`);
      }

      const dataArray = await response.json();
      
      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        throw new Error('Invalid country data structure');
      }

      const data: CountryData = dataArray[0];

      // Cache successful result
      this.setCache(cacheKey, data, this.CACHE_DURATIONS.country);
      console.log('✅ Country data fetched and cached');
      
      return data;

    } catch (error) {
      console.warn('⚠️ Country API failed, using fallback:', error);
      
      // Graceful degradation - return null to skip country tasks
      return null;
    }
  }

  // Health check and cache management
  getCacheStats(): { 
    totalEntries: number; 
    weatherEntries: number; 
    holidayEntries: number; 
    countryEntries: number;
    expiredEntries: number;
  } {
    let weatherEntries = 0;
    let holidayEntries = 0;
    let countryEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValidCache(entry)) {
        expiredEntries++;
      } else {
        if (key.startsWith('weather_')) weatherEntries++;
        else if (key.startsWith('holiday_')) holidayEntries++;
        else if (key.startsWith('country_')) countryEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      weatherEntries,
      holidayEntries,
      countryEntries,
      expiredEntries
    };
  }

  // Clean up expired cache entries
  cleanupCache(): number {
    let cleanedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValidCache(entry)) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    return cleanedCount;
  }

  // Clear all cache (for testing)
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const apiService = new ApiService();