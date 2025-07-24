import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  serverTimestamp, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Trip {
  id?: string;
  userId?: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  familyMembers: any[];
  activities: any[];
  travel: any[];
  packing: any[];
  createdAt?: any;
  updatedAt?: any;
}

export class TripPersistenceService {
  private static instance: TripPersistenceService;
  
  public static getInstance(): TripPersistenceService {
    if (!TripPersistenceService.instance) {
      TripPersistenceService.instance = new TripPersistenceService();
    }
    return TripPersistenceService.instance;
  }

  // Generate consistent trip ID from trip data
  private generateTripId(trip: Trip): string {
    if (trip.id) return trip.id;
    
    const baseString = `${trip.city}-${trip.startDate}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    return baseString || `trip-${Date.now()}`;
  }

  // Save trip to Firebase Firestore
  async saveTripToFirebase(trip: Trip, userId: string): Promise<string> {
    try {
      if (!userId || !db) {
        throw new Error('Missing userId or Firestore not initialized');
      }

      const tripId = this.generateTripId(trip);
      const tripRef = doc(db, 'trips', tripId);
      
      // Clean the trip data to avoid any undefined or problematic values
      const cleanedTrip = JSON.parse(JSON.stringify(trip));  // Remove undefined values
      
      const tripData = {
        ...cleanedTrip,
        id: tripId,
        userId,
        createdAt: trip.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(tripRef, tripData, { merge: true });
      
      console.log('✅ Trip saved to Firebase:', tripId);
      return tripId;
    } catch (error) {
      console.error('❌ Error saving trip to Firebase:', error);
      throw error;
    }
  }

  // Load user trips from Firebase
  async loadUserTripsFromFirebase(userId: string): Promise<Trip[]> {
    try {
      if (!userId || !db) {
        console.warn('⚠️ Missing userId or Firestore not initialized, returning empty array');
        return [];
      }

      const tripsRef = collection(db, 'trips');
      // Remove orderBy for now to avoid index issues
      const q = query(
        tripsRef, 
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const trips: Trip[] = [];
      
      querySnapshot.forEach((doc) => {
        const tripData = doc.data();
        trips.push({
          ...tripData,
          id: doc.id,
          // Convert Firestore timestamps to dates
          createdAt: tripData.createdAt?.toDate?.() || tripData.createdAt,
          updatedAt: tripData.updatedAt?.toDate?.() || tripData.updatedAt
        } as Trip);
      });

      // Sort in memory instead
      trips.sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt || new Date(0);
        const dateB = b.updatedAt || b.createdAt || new Date(0);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      console.log(`✅ Loaded ${trips.length} trips from Firebase for user ${userId}`);
      return trips;
    } catch (error) {
      console.error('❌ Error loading trips from Firebase:', error);
      return [];
    }
  }

  // Get trips from localStorage
  getTripsFromLocalStorage(): Trip[] {
    try {
      const tripsData = localStorage.getItem('trips');
      if (!tripsData) return [];
      
      const trips = JSON.parse(tripsData);
      return Array.isArray(trips) ? trips : [];
    } catch (error) {
      console.error('❌ Error reading trips from localStorage:', error);
      return [];
    }
  }

  // Save trips to localStorage (backup)
  saveTripsToLocalStorage(trips: Trip[]): void {
    try {
      localStorage.setItem('trips', JSON.stringify(trips));
      console.log('✅ Trips backed up to localStorage');
    } catch (error) {
      console.error('❌ Error saving trips to localStorage:', error);
    }
  }

  // Migrate localStorage trips to Firebase for authenticated user
  async migrateLocalStorageTripsToFirebase(userId: string): Promise<Trip[]> {
    try {
      const localTrips = this.getTripsFromLocalStorage();
      
      if (localTrips.length === 0) {
        console.log('📝 No local trips to migrate');
        return [];
      }

      console.log(`🔄 Migrating ${localTrips.length} trips from localStorage to Firebase...`);
      
      const migratedTrips: Trip[] = [];
      
      for (const trip of localTrips) {
        try {
          // Only migrate trips that don't already have a userId (weren't already migrated)
          if (!trip.userId) {
            const tripId = await this.saveTripToFirebase(trip, userId);
            migratedTrips.push({
              ...trip,
              id: tripId,
              userId
            });
          }
        } catch (error) {
          console.error('❌ Error migrating individual trip:', error);
          // Continue with other trips even if one fails
        }
      }

      if (migratedTrips.length > 0) {
        console.log(`✅ Successfully migrated ${migratedTrips.length} trips to Firebase`);
        
        // Clean up localStorage after successful migration
        // Keep the trips in localStorage as backup but mark them as migrated
        const updatedLocalTrips = localTrips.map(trip => {
          const migratedTrip = migratedTrips.find(mt => 
            this.generateTripId(mt) === this.generateTripId(trip)
          );
          return migratedTrip ? { ...trip, userId, migrated: true } : trip;
        });
        
        this.saveTripsToLocalStorage(updatedLocalTrips);
      }

      return migratedTrips;
    } catch (error) {
      console.error('❌ Error during trip migration:', error);
      return [];
    }
  }

  // Sync trips: Load from Firebase and merge with local if needed
  async syncUserTrips(userId: string): Promise<Trip[]> {
    try {
      console.log('🔄 Syncing trips for user:', userId);
      
      // 1. Load existing trips from Firebase
      const firebaseTrips = await this.loadUserTripsFromFirebase(userId);
      
      // 2. Migrate any localStorage trips that haven't been migrated yet
      const migratedTrips = await this.migrateLocalStorageTripsToFirebase(userId);
      
      // 3. Combine Firebase trips with newly migrated trips
      const allTrips = [...firebaseTrips];
      
      // Add migrated trips that aren't already in Firebase
      for (const migratedTrip of migratedTrips) {
        const exists = firebaseTrips.some(ft => 
          this.generateTripId(ft) === this.generateTripId(migratedTrip)
        );
        if (!exists) {
          allTrips.push(migratedTrip);
        }
      }
      
      // 4. Sort by most recent
      allTrips.sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt || new Date(0);
        const dateB = b.updatedAt || b.createdAt || new Date(0);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      
      // 5. Update localStorage as backup
      this.saveTripsToLocalStorage(allTrips);
      
      console.log(`✅ Trip sync complete. Total trips: ${allTrips.length}`);
      return allTrips;
      
    } catch (error) {
      console.error('❌ Error syncing trips:', error);
      
      // Fallback to localStorage if Firebase fails
      const localTrips = this.getTripsFromLocalStorage();
      console.log(`⚠️ Falling back to localStorage. Found ${localTrips.length} trips`);
      return localTrips;
    }
  }

  // Save a new trip (both Firebase and localStorage)
  async saveTrip(trip: Trip, userId?: string): Promise<Trip> {
    try {
      let savedTrip = { ...trip };
      
      // If user is authenticated, save to Firebase
      if (userId) {
        const tripId = await this.saveTripToFirebase(trip, userId);
        savedTrip = {
          ...savedTrip,
          id: tripId,
          userId
        };
      } else {
        // Generate ID for localStorage-only trip
        savedTrip.id = this.generateTripId(trip);
      }
      
      // Always backup to localStorage
      const existingTrips = this.getTripsFromLocalStorage();
      const updatedTrips = [savedTrip, ...existingTrips.filter(t => 
        this.generateTripId(t) !== this.generateTripId(savedTrip)
      )];
      
      this.saveTripsToLocalStorage(updatedTrips);
      
      console.log('✅ Trip saved successfully:', savedTrip.id);
      return savedTrip;
      
    } catch (error) {
      console.error('❌ Error saving trip:', error);
      
      // Fallback to localStorage only
      const tripWithId = {
        ...trip,
        id: this.generateTripId(trip)
      };
      
      const existingTrips = this.getTripsFromLocalStorage();
      const updatedTrips = [tripWithId, ...existingTrips.filter(t => 
        this.generateTripId(t) !== this.generateTripId(tripWithId)
      )];
      
      this.saveTripsToLocalStorage(updatedTrips);
      
      return tripWithId;
    }
  }
}

// Export singleton instance
export const tripPersistenceService = TripPersistenceService.getInstance();