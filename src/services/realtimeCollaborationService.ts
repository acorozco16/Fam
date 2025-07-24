import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { 
  ref, 
  set as rtdbSet, 
  push, 
  update, 
  remove, 
  onValue, 
  off, 
  onDisconnect,
  serverTimestamp as rtdbServerTimestamp
} from 'firebase/database';
import { db, rtdb } from '../firebase.js';
import { CollaborativeTrip, TripCollaborator, TripInvite } from '../types';

export interface RealtimeEvent {
  id: string;
  tripId: string;
  type: EventType;
  userId: string;
  userName: string;
  timestamp: number;
  payload: EventPayload;
}

export type EventType = 
  | 'trip_updated'
  | 'activity_created'
  | 'activity_updated' 
  | 'activity_completed'
  | 'comment_added'
  | 'user_joined'
  | 'user_left'
  | 'invite_sent'
  | 'invite_accepted'
  | 'typing_start'
  | 'typing_stop'
  | 'cursor_move'
  | 'resource_locked'
  | 'resource_unlocked';

export interface EventPayload {
  resourceId?: string;
  resourceType?: string;
  changes?: Record<string, any>;
  position?: { x: number; y: number };
  field?: string;
  message?: string;
}

export interface PresenceData {
  userId: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: number;
  currentPage?: string;
  isTyping?: boolean;
  cursor?: { x: number; y: number };
}

export interface TripDocument {
  id: string;
  ownerId: string;
  title: string;
  destination: {
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  dates: {
    startDate: string;
    endDate: string;
  };
  settings: {
    isPublic: boolean;
    allowInvites: boolean;
    requireApproval: boolean;
  };
  metadata: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastModifiedBy: string;
    version: number;
  };
  tripData: any; // Will be typed properly later
}

class RealtimeCollaborationService {
  private presenceListeners: Map<string, () => void> = new Map();
  private tripListeners: Map<string, () => void> = new Map();
  private currentUserId?: string;
  private currentUserName?: string;

  // Initialize user session
  initializeUser(userId: string, userName: string) {
    this.currentUserId = userId;
    this.currentUserName = userName;
  }

  // Trip Management
  async createTrip(tripData: any, ownerId: string): Promise<string> {
    try {
      const tripDoc: Omit<TripDocument, 'id'> = {
        ownerId,
        title: `${tripData.city}, ${tripData.country}`,
        destination: {
          city: tripData.city,
          country: tripData.country,
          coordinates: tripData.coordinates
        },
        dates: {
          startDate: tripData.startDate,
          endDate: tripData.endDate
        },
        settings: {
          isPublic: false,
          allowInvites: true,
          requireApproval: false
        },
        metadata: {
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
          lastModifiedBy: ownerId,
          version: 1
        },
        tripData
      };

      const docRef = await addDoc(collection(db, 'trips'), tripDoc);
      
      // Add owner as collaborator
      await this.addCollaborator(docRef.id, {
        userId: ownerId,
        email: tripData.ownerEmail || 'owner@example.com',
        name: tripData.ownerName || 'Trip Owner',
        role: 'owner',
        permissions: {
          canEdit: true,
          canInvite: true,
          canDelete: true,
          canManageRoles: true
        },
        status: 'active',
        joinedAt: serverTimestamp() as Timestamp,
        lastActive: serverTimestamp() as Timestamp
      });

      console.log('✅ Trip created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating trip:', error);
      throw error;
    }
  }

  async getTrip(tripId: string): Promise<TripDocument | null> {
    try {
      const docRef = doc(db, 'trips', tripId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as TripDocument;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting trip:', error);
      throw error;
    }
  }

  async updateTrip(tripId: string, updates: Partial<TripDocument>): Promise<void> {
    try {
      const docRef = doc(db, 'trips', tripId);
      const updateData = {
        ...updates,
        'metadata.updatedAt': serverTimestamp(),
        'metadata.lastModifiedBy': this.currentUserId,
        'metadata.version': (await getDoc(docRef)).data()?.metadata?.version + 1 || 1
      };
      
      await updateDoc(docRef, updateData);
      
      // Emit real-time event
      this.emitEvent(tripId, 'trip_updated', {
        changes: updates
      });
      
      console.log('✅ Trip updated:', tripId);
    } catch (error) {
      console.error('❌ Error updating trip:', error);
      throw error;
    }
  }

  // Collaborator Management
  async addCollaborator(tripId: string, collaborator: Omit<TripCollaborator, 'inviteToken'>): Promise<void> {
    try {
      const colRef = doc(db, 'trips', tripId, 'collaborators', collaborator.userId);
      await updateDoc(colRef, {
        ...collaborator,
        joinedAt: serverTimestamp(),
        lastActive: serverTimestamp()
      }).catch(async () => {
        // If document doesn't exist, create it
        await addDoc(collection(db, 'trips', tripId, 'collaborators'), {
          ...collaborator,
          joinedAt: serverTimestamp(),
          lastActive: serverTimestamp()
        });
      });
      
      console.log('✅ Collaborator added:', collaborator.userId);
    } catch (error) {
      console.error('❌ Error adding collaborator:', error);
      throw error;
    }
  }

  async getCollaborators(tripId: string): Promise<TripCollaborator[]> {
    try {
      const collabsRef = collection(db, 'trips', tripId, 'collaborators');
      const snapshot = await getDocs(collabsRef);
      
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        userId: doc.id
      })) as TripCollaborator[];
    } catch (error) {
      console.error('❌ Error getting collaborators:', error);
      throw error;
    }
  }

  async removeCollaborator(tripId: string, userId: string): Promise<void> {
    try {
      const colRef = doc(db, 'trips', tripId, 'collaborators', userId);
      await deleteDoc(colRef);
      
      // Remove from presence
      await this.updatePresence(tripId, userId, { status: 'offline' });
      
      this.emitEvent(tripId, 'user_left', {
        resourceId: userId
      });
      
      console.log('✅ Collaborator removed:', userId);
    } catch (error) {
      console.error('❌ Error removing collaborator:', error);
      throw error;
    }
  }

  // Invite Management
  async createInvite(
    tripId: string, 
    inviterUserId: string, 
    inviterName: string,
    inviteeEmail: string, 
    role: 'collaborator' | 'viewer',
    message?: string
  ): Promise<TripInvite> {
    try {
      const inviteId = crypto.randomUUID();
      const token = crypto.randomUUID(); // In production, use proper token generation
      
      const invite: Omit<TripInvite, 'id'> = {
        tripId,
        inviterUserId,
        inviterName,
        inviteeEmail,
        role,
        token,
        status: 'pending',
        message,
        createdAt: serverTimestamp() as Timestamp,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) as any, // 7 days
        metadata: {
          emailSent: false,
          remindersSent: 0
        }
      };

      const inviteRef = doc(db, 'trips', tripId, 'invites', inviteId);
      await updateDoc(inviteRef, invite).catch(async () => {
        // If document doesn't exist, create it
        await addDoc(collection(db, 'trips', tripId, 'invites'), invite);
      });
      
      // TODO: Send actual email
      console.log('📧 Email invite would be sent to:', inviteeEmail);
      console.log('🔗 Invite link:', `${window.location.origin}/invite/${token}`);
      
      this.emitEvent(tripId, 'invite_sent', {
        resourceId: inviteId,
        message: `Invited ${inviteeEmail} as ${role}`
      });

      return { id: inviteId, ...invite } as TripInvite;
    } catch (error) {
      console.error('❌ Error creating invite:', error);
      throw error;
    }
  }

  async acceptInvite(token: string): Promise<{ tripId: string; success: boolean }> {
    try {
      // TODO: Query by token across all trips
      // For now, return success for demo
      console.log('✅ Invite accepted:', token);
      return { tripId: 'demo-trip', success: true };
    } catch (error) {
      console.error('❌ Error accepting invite:', error);
      throw error;
    }
  }

  // Real-time Presence
  async updatePresence(tripId: string, userId: string, data: Partial<PresenceData>): Promise<void> {
    try {
      const presenceRef = ref(rtdb, `presence/${tripId}/users/${userId}`);
      const presenceData = {
        userId,
        name: this.currentUserName || 'Unknown User',
        status: 'online',
        lastSeen: rtdbServerTimestamp(),
        ...data
      };
      
      await rtdbSet(presenceRef, presenceData);
      
      // Set up disconnect handler
      onDisconnect(presenceRef).update({
        status: 'offline',
        lastSeen: rtdbServerTimestamp()
      });
      
    } catch (error) {
      console.error('❌ Error updating presence:', error);
      throw error;
    }
  }

  subscribeToPresence(tripId: string, callback: (users: PresenceData[]) => void): () => void {
    const presenceRef = ref(rtdb, `presence/${tripId}/users`);
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      const users = data ? Object.values(data) as PresenceData[] : [];
      callback(users);
    });

    this.presenceListeners.set(tripId, unsubscribe);
    return unsubscribe;
  }

  // Real-time Trip Updates
  subscribeToTrip(tripId: string, callback: (trip: TripDocument) => void): () => void {
    const tripRef = doc(db, 'trips', tripId);
    
    const unsubscribe = onSnapshot(tripRef, (doc) => {
      if (doc.exists()) {
        const tripData = { id: doc.id, ...doc.data() } as TripDocument;
        callback(tripData);
      }
    });

    this.tripListeners.set(tripId, unsubscribe);
    return unsubscribe;
  }

  subscribeToCollaborators(tripId: string, callback: (collaborators: TripCollaborator[]) => void): () => void {
    const collabsRef = collection(db, 'trips', tripId, 'collaborators');
    
    return onSnapshot(collabsRef, (snapshot) => {
      const collaborators = snapshot.docs.map(doc => ({
        ...doc.data(),
        userId: doc.id
      })) as TripCollaborator[];
      callback(collaborators);
    });
  }

  // Event Emission
  private async emitEvent(tripId: string, type: EventType, payload: EventPayload): Promise<void> {
    if (!this.currentUserId || !this.currentUserName) return;
    
    try {
      const event: Omit<RealtimeEvent, 'id'> = {
        tripId,
        type,
        userId: this.currentUserId,
        userName: this.currentUserName,
        timestamp: Date.now(),
        payload
      };

      // Store in Firestore for history
      await addDoc(collection(db, 'trips', tripId, 'events'), event);
      
      // Emit to real-time database for immediate updates
      const eventsRef = ref(rtdb, `events/${tripId}`);
      await push(eventsRef, event);
      
    } catch (error) {
      console.error('❌ Error emitting event:', error);
    }
  }

  // Cleanup
  cleanup(): void {
    // Unsubscribe from all listeners
    this.presenceListeners.forEach(unsubscribe => unsubscribe());
    this.tripListeners.forEach(unsubscribe => unsubscribe());
    
    this.presenceListeners.clear();
    this.tripListeners.clear();
  }

  // Typing indicators
  async setTyping(tripId: string, isTyping: boolean): Promise<void> {
    if (!this.currentUserId) return;
    
    try {
      const typingRef = ref(rtdb, `typing/${tripId}/${this.currentUserId}`);
      
      if (isTyping) {
        await rtdbSet(typingRef, {
          userId: this.currentUserId,
          name: this.currentUserName,
          timestamp: rtdbServerTimestamp()
        });
        
        // Auto-clear typing after 3 seconds
        setTimeout(() => {
          remove(typingRef);
        }, 3000);
      } else {
        await remove(typingRef);
      }
    } catch (error) {
      console.error('❌ Error setting typing status:', error);
    }
  }

  subscribeToTyping(tripId: string, callback: (typingUsers: string[]) => void): () => void {
    const typingRef = ref(rtdb, `typing/${tripId}`);
    
    return onValue(typingRef, (snapshot) => {
      const data = snapshot.val();
      const typingUsers = data ? Object.keys(data).filter(userId => userId !== this.currentUserId) : [];
      callback(typingUsers);
    });
  }
}

export const realtimeCollaborationService = new RealtimeCollaborationService();