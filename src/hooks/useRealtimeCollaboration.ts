import { useState, useEffect, useCallback } from 'react';
import { 
  realtimeCollaborationService, 
  PresenceData, 
  TripDocument 
} from '../services/realtimeCollaborationService';
import { TripCollaborator } from '../types';

export interface UseRealtimeCollaborationProps {
  tripId: string;
  userId: string;
  userName: string;
}

export interface UseRealtimeCollaborationReturn {
  // Trip data
  trip: TripDocument | null;
  collaborators: TripCollaborator[];
  isLoading: boolean;
  error: string | null;
  
  // Real-time features
  presenceUsers: PresenceData[];
  typingUsers: string[];
  isOnline: boolean;
  
  // Actions
  updateTrip: (updates: Partial<TripDocument>) => Promise<void>;
  inviteUser: (email: string, role: 'collaborator' | 'viewer', message?: string) => Promise<void>;
  removeCollaborator: (userId: string) => Promise<void>;
  setTyping: (isTyping: boolean) => Promise<void>;
  updatePresence: (data: Partial<PresenceData>) => Promise<void>;
  
  // Connection status
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

export const useRealtimeCollaboration = ({
  tripId,
  userId,
  userName
}: UseRealtimeCollaborationProps): UseRealtimeCollaborationReturn => {
  // State
  const [trip, setTrip] = useState<TripDocument | null>(null);
  const [collaborators, setCollaborators] = useState<TripCollaborator[]>([]);
  const [presenceUsers, setPresenceUsers] = useState<PresenceData[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize service (only if tripId is not inactive)
  useEffect(() => {
    if (tripId !== 'inactive-trip') {
      realtimeCollaborationService.initializeUser(userId, userName);
    }
  }, [userId, userName, tripId]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionStatus('connected');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus('disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to trip updates
  useEffect(() => {
    if (!tripId || tripId === 'inactive-trip') return;

    setIsLoading(true);
    setConnectionStatus('connecting');

    const unsubscribeTrip = realtimeCollaborationService.subscribeToTrip(tripId, (tripData) => {
      console.log('🔄 Trip updated:', tripData.id);
      setTrip(tripData);
      setIsLoading(false);
      setConnectionStatus('connected');
      setError(null);
    });

    // Handle subscription errors
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setError('Failed to connect to trip data');
        setConnectionStatus('disconnected');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => {
      unsubscribeTrip();
      clearTimeout(timeoutId);
    };
  }, [tripId, isLoading]);

  // Subscribe to collaborators
  useEffect(() => {
    if (!tripId || tripId === 'inactive-trip') return;

    const unsubscribeCollaborators = realtimeCollaborationService.subscribeToCollaborators(tripId, (collabData) => {
      console.log('👥 Collaborators updated:', collabData.length);
      setCollaborators(collabData);
    });

    return unsubscribeCollaborators;
  }, [tripId]);

  // Subscribe to presence
  useEffect(() => {
    if (!tripId || tripId === 'inactive-trip' || !userId) return;

    // Set initial presence
    realtimeCollaborationService.updatePresence(tripId, userId, {
      status: 'online',
      currentPage: window.location.pathname
    });

    const unsubscribePresence = realtimeCollaborationService.subscribeToPresence(tripId, (users) => {
      console.log('👁️ Presence updated:', users.length, 'users online');
      setPresenceUsers(users);
    });

    // Update presence on page visibility change
    const handleVisibilityChange = () => {
      const status = document.hidden ? 'away' : 'online';
      realtimeCollaborationService.updatePresence(tripId, userId, { status });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribePresence();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Set offline status on cleanup
      realtimeCollaborationService.updatePresence(tripId, userId, { status: 'offline' });
    };
  }, [tripId, userId]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!tripId || tripId === 'inactive-trip') return;

    const unsubscribeTyping = realtimeCollaborationService.subscribeToTyping(tripId, (users) => {
      setTypingUsers(users);
    });

    return unsubscribeTyping;
  }, [tripId]);

  // Actions
  const updateTrip = useCallback(async (updates: Partial<TripDocument>) => {
    try {
      setError(null);
      await realtimeCollaborationService.updateTrip(tripId, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update trip';
      setError(errorMessage);
      throw err;
    }
  }, [tripId]);

  const inviteUser = useCallback(async (email: string, role: 'collaborator' | 'viewer', message?: string) => {
    try {
      setError(null);
      await realtimeCollaborationService.createInvite(tripId, userId, userName, email, role, message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invite';
      setError(errorMessage);
      throw err;
    }
  }, [tripId, userId, userName]);

  const removeCollaborator = useCallback(async (collaboratorId: string) => {
    try {
      setError(null);
      await realtimeCollaborationService.removeCollaborator(tripId, collaboratorId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove collaborator';
      setError(errorMessage);
      throw err;
    }
  }, [tripId]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    try {
      await realtimeCollaborationService.setTyping(tripId, isTyping);
    } catch (err) {
      console.warn('Failed to update typing status:', err);
    }
  }, [tripId]);

  const updatePresence = useCallback(async (data: Partial<PresenceData>) => {
    try {
      await realtimeCollaborationService.updatePresence(tripId, userId, data);
    } catch (err) {
      console.warn('Failed to update presence:', err);
    }
  }, [tripId, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      realtimeCollaborationService.cleanup();
    };
  }, []);

  return {
    // Trip data
    trip,
    collaborators,
    isLoading,
    error,
    
    // Real-time features
    presenceUsers,
    typingUsers,
    isOnline,
    
    // Actions
    updateTrip,
    inviteUser,
    removeCollaborator,
    setTyping,
    updatePresence,
    
    // Connection status
    connectionStatus
  };
};

// Hook for trip creation
export const useCreateTrip = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrip = useCallback(async (tripData: any, ownerId: string): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const tripId = await realtimeCollaborationService.createTrip(tripData, ownerId);
      return tripId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create trip';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createTrip,
    isLoading,
    error
  };
};