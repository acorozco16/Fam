import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Trip Service - Handles all trip-related database operations
 */
export class TripService {
  constructor() {
    this.tripsCollection = 'trips';
  }

  /**
   * Create a new trip
   * @param {Object} tripData - Trip data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created trip with ID
   */
  async createTrip(tripData, userId) {
    try {
      const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const tripWithMetadata = {
        ...tripData,
        id: tripId,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const tripRef = doc(db, this.tripsCollection, tripId);
      await setDoc(tripRef, tripWithMetadata);
      
      return { success: true, tripId, trip: tripWithMetadata };
    } catch (error) {
      console.error('Error creating trip:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all trips for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of trips
   */
  async getUserTrips(userId) {
    try {
      const q = query(
        collection(db, this.tripsCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const trips = [];
      
      querySnapshot.forEach((doc) => {
        trips.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, trips };
    } catch (error) {
      console.error('Error getting trips:', error);
      return { success: false, error: error.message, trips: [] };
    }
  }

  /**
   * Get a specific trip
   * @param {string} tripId - Trip ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object>} Trip data
   */
  async getTrip(tripId, userId) {
    try {
      const tripRef = doc(db, this.tripsCollection, tripId);
      const tripDoc = await getDoc(tripRef);
      
      if (!tripDoc.exists()) {
        return { success: false, error: 'Trip not found' };
      }
      
      const tripData = tripDoc.data();
      
      // Security check - ensure user owns this trip
      if (tripData.userId !== userId) {
        return { success: false, error: 'Unauthorized access' };
      }
      
      return { success: true, trip: { id: tripDoc.id, ...tripData } };
    } catch (error) {
      console.error('Error getting trip:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a trip
   * @param {string} tripId - Trip ID
   * @param {Object} updates - Data to update
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object>} Update result
   */
  async updateTrip(tripId, updates, userId) {
    try {
      // First verify the trip exists and user owns it
      const tripCheck = await this.getTrip(tripId, userId);
      if (!tripCheck.success) {
        return tripCheck;
      }
      
      const tripRef = doc(db, this.tripsCollection, tripId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(tripRef, updateData);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating trip:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a trip
   * @param {string} tripId - Trip ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object>} Delete result
   */
  async deleteTrip(tripId, userId) {
    try {
      // First verify the trip exists and user owns it
      const tripCheck = await this.getTrip(tripId, userId);
      if (!tripCheck.success) {
        return tripCheck;
      }
      
      const tripRef = doc(db, this.tripsCollection, tripId);
      await deleteDoc(tripRef);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting trip:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Migrate local storage trips to Firestore
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Migration result
   */
  async migrateLocalTrips(userId) {
    try {
      const localTrips = JSON.parse(localStorage.getItem('famapp_trips') || '[]');
      
      if (localTrips.length === 0) {
        return { success: true, migratedCount: 0 };
      }
      
      const migrationPromises = localTrips.map(trip => 
        this.createTrip(trip, userId)
      );
      
      const results = await Promise.all(migrationPromises);
      const successCount = results.filter(r => r.success).length;
      
      // Clear local storage after successful migration
      if (successCount > 0) {
        localStorage.removeItem('famapp_trips');
      }
      
      return { success: true, migratedCount: successCount };
    } catch (error) {
      console.error('Error migrating trips:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const tripService = new TripService();