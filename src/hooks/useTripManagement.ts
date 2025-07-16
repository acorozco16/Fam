import { useState, useEffect } from 'react';
import { TripData } from '../types';

/**
 * Custom hook for managing trip data and user trips
 */
export const useTripManagement = () => {
  const [tripData, setTripData] = useState<TripData>({});
  const [userTrips, setUserTrips] = useState<any[]>([]);

  // Load user trips from localStorage on mount
  useEffect(() => {
    const savedTrips = localStorage.getItem('userTrips');
    if (savedTrips) {
      try {
        setUserTrips(JSON.parse(savedTrips));
      } catch (error) {
        console.error('Error loading user trips:', error);
        setUserTrips([]);
      }
    }
  }, []);

  // Save user trips to localStorage when trips change
  useEffect(() => {
    if (userTrips.length > 0) {
      localStorage.setItem('userTrips', JSON.stringify(userTrips));
    }
  }, [userTrips]);

  const saveTrip = (trip: any) => {
    const tripToSave = {
      ...trip,
      id: trip.id || Date.now().toString(),
      lastModified: new Date().toISOString()
    };

    setUserTrips(prev => {
      const existingIndex = prev.findIndex(t => t.id === tripToSave.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = tripToSave;
        return updated;
      } else {
        return [...prev, tripToSave];
      }
    });

    return tripToSave;
  };

  const deleteTrip = (tripId: string) => {
    setUserTrips(prev => prev.filter(trip => trip.id !== tripId));
  };

  const selectTrip = (tripId: string) => {
    const trip = userTrips.find(t => t.id === tripId);
    if (trip) {
      setTripData(trip);
      return trip;
    }
    return null;
  };

  return {
    tripData,
    setTripData,
    userTrips,
    setUserTrips,
    saveTrip,
    deleteTrip,
    selectTrip
  };
};