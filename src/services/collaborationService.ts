// Collaboration Service - Handles trip sharing, invites, and real-time collaboration
import { 
  TripInvite, 
  TripCollaborator, 
  CollaborativeTrip, 
  TripPermissions, 
  User,
  CollaborationEvent
} from '../types';

interface InviteEmailData {
  inviterName: string;
  tripDestination: string;
  tripDates: string;
  inviteLink: string;
  personalMessage?: string;
}

class CollaborationService {
  private invites = new Map<string, TripInvite>();
  private collaborativeTrips = new Map<string, CollaborativeTrip>();
  private users = new Map<string, User>();

  // Default permissions for different roles
  private getDefaultPermissions(role: 'owner' | 'collaborator' | 'viewer'): TripPermissions {
    switch (role) {
      case 'owner':
        return {
          canEdit: true,
          canInvite: true,
          canDelete: true,
          canManageTasks: true,
          canBookActivities: true,
          canViewBudget: true,
          canManageFamily: true
        };
      case 'collaborator':
        return {
          canEdit: true,
          canInvite: false,
          canDelete: false,
          canManageTasks: true,
          canBookActivities: true,
          canViewBudget: true,
          canManageFamily: false
        };
      case 'viewer':
        return {
          canEdit: false,
          canInvite: false,
          canDelete: false,
          canManageTasks: false,
          canBookActivities: false,
          canViewBudget: true,
          canManageFamily: false
        };
    }
  }

  // Generate secure invite token
  private generateInviteToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Create and send trip invite
  async createTripInvite(
    tripId: string,
    inviterEmail: string,
    inviterName: string,
    inviteeEmail: string,
    role: 'collaborator' | 'viewer',
    personalMessage?: string
  ): Promise<TripInvite> {
    const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const token = this.generateInviteToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite: TripInvite = {
      id: inviteId,
      tripId,
      inviterEmail,
      inviterName,
      inviteeEmail,
      role,
      token,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      message: personalMessage
    };

    // Store invite
    this.invites.set(inviteId, invite);

    // In production, this would send an actual email
    await this.sendInviteEmail(invite);

    return invite;
  }

  // Send invite email (mock implementation)
  private async sendInviteEmail(invite: TripInvite): Promise<void> {
    // Get trip details for email
    const trip = this.collaborativeTrips.get(invite.tripId);
    
    const emailData: InviteEmailData = {
      inviterName: invite.inviterName,
      tripDestination: trip ? `${trip.city}, ${trip.country}` : 'your trip destination',
      tripDates: trip ? `${trip.startDate} to ${trip.endDate}` : 'your travel dates',
      inviteLink: `${window.location.origin}/invite/${invite.token}`,
      personalMessage: invite.message
    };

    // Mock email sending - in production use service like Resend, SendGrid, etc.
    console.log('📧 Sending invite email:', {
      to: invite.inviteeEmail,
      from: invite.inviterEmail,
      subject: `${invite.inviterName} invited you to collaborate on their family trip`,
      data: emailData
    });

    // Store in localStorage for demo purposes
    const pendingInvites = JSON.parse(localStorage.getItem('pendingInvites') || '[]');
    pendingInvites.push(invite);
    localStorage.setItem('pendingInvites', JSON.stringify(pendingInvites));
  }

  // Accept trip invite
  async acceptInvite(token: string, userEmail: string, userName: string): Promise<CollaborativeTrip | null> {
    const invite = Array.from(this.invites.values()).find(inv => inv.token === token);
    
    if (!invite) {
      throw new Error('Invalid invite token');
    }

    if (invite.status !== 'pending') {
      throw new Error('Invite has already been processed');
    }

    if (new Date(invite.expiresAt) < new Date()) {
      invite.status = 'expired';
      throw new Error('Invite has expired');
    }

    if (invite.inviteeEmail !== userEmail) {
      throw new Error('This invite is not for your email address');
    }

    // Update invite status
    invite.status = 'accepted';

    // Add user as collaborator to trip
    const trip = this.collaborativeTrips.get(invite.tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    const collaborator: TripCollaborator = {
      userId: userEmail, // Using email as userId for simplicity
      email: userEmail,
      name: userName,
      role: invite.role,
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      permissions: this.getDefaultPermissions(invite.role)
    };

    trip.collaborators.push(collaborator);
    trip.permissions[userEmail] = this.getDefaultPermissions(invite.role);
    trip.lastModified = new Date().toISOString();
    trip.modifiedBy = userEmail;

    // Create collaboration event
    const event: CollaborationEvent = {
      id: `event_${Date.now()}`,
      tripId: invite.tripId,
      userId: userEmail,
      userName: userName,
      type: 'member_joined',
      details: `${userName} joined the trip as a ${invite.role}`,
      timestamp: new Date().toISOString()
    };

    this.logCollaborationEvent(event);

    return trip;
  }

  // Decline trip invite
  async declineInvite(token: string): Promise<void> {
    const invite = Array.from(this.invites.values()).find(inv => inv.token === token);
    
    if (!invite) {
      throw new Error('Invalid invite token');
    }

    invite.status = 'declined';
  }

  // Get trip invites for a user
  getTripInvites(userEmail: string): TripInvite[] {
    return Array.from(this.invites.values()).filter(
      invite => invite.inviteeEmail === userEmail && invite.status === 'pending'
    );
  }

  // Get trip by ID
  getTrip(tripId: string): CollaborativeTrip | undefined {
    return this.collaborativeTrips.get(tripId);
  }

  // Update trip (with collaboration tracking)
  async updateTrip(tripId: string, updates: Partial<CollaborativeTrip>, userId: string): Promise<CollaborativeTrip> {
    const trip = this.collaborativeTrips.get(tripId);
    
    if (!trip) {
      throw new Error('Trip not found');
    }

    // Check permissions
    const userPermissions = trip.permissions[userId];
    if (!userPermissions?.canEdit && trip.ownerId !== userId) {
      throw new Error('Insufficient permissions to edit trip');
    }

    // Apply updates
    const updatedTrip = {
      ...trip,
      ...updates,
      lastModified: new Date().toISOString(),
      modifiedBy: userId
    };

    this.collaborativeTrips.set(tripId, updatedTrip);

    // Log collaboration event
    const event: CollaborationEvent = {
      id: `event_${Date.now()}`,
      tripId,
      userId,
      userName: this.getUserName(userId),
      type: 'trip_edited',
      details: 'Trip details updated',
      timestamp: new Date().toISOString(),
      metadata: { changes: Object.keys(updates) }
    };

    this.logCollaborationEvent(event);

    return updatedTrip;
  }

  // Assign task to family member
  async assignTask(
    tripId: string, 
    taskId: string, 
    assignedTo: string, 
    assignedBy: string
  ): Promise<void> {
    const trip = this.collaborativeTrips.get(tripId);
    
    if (!trip) {
      throw new Error('Trip not found');
    }

    // Check permissions
    const userPermissions = trip.permissions[assignedBy];
    if (!userPermissions?.canManageTasks && trip.ownerId !== assignedBy) {
      throw new Error('Insufficient permissions to assign tasks');
    }

    // Find and update the task
    // Note: This would need to be integrated with the actual task storage
    console.log(`Assigning task ${taskId} to ${assignedTo} by ${assignedBy}`);

    // Log collaboration event
    const event: CollaborationEvent = {
      id: `event_${Date.now()}`,
      tripId,
      userId: assignedBy,
      userName: this.getUserName(assignedBy),
      type: 'task_assigned',
      details: `Task assigned to ${this.getUserName(assignedTo)}`,
      timestamp: new Date().toISOString(),
      metadata: { taskId, assignedTo }
    };

    this.logCollaborationEvent(event);
  }

  // Remove collaborator from trip
  async removeCollaborator(tripId: string, userId: string, removedBy: string): Promise<void> {
    const trip = this.collaborativeTrips.get(tripId);
    
    if (!trip) {
      throw new Error('Trip not found');
    }

    // Only owner can remove collaborators
    if (trip.ownerId !== removedBy) {
      throw new Error('Only trip owner can remove collaborators');
    }

    // Remove collaborator
    trip.collaborators = trip.collaborators.filter(collab => collab.userId !== userId);
    delete trip.permissions[userId];
    trip.lastModified = new Date().toISOString();
    trip.modifiedBy = removedBy;

    // Log collaboration event
    const event: CollaborationEvent = {
      id: `event_${Date.now()}`,
      tripId,
      userId: removedBy,
      userName: this.getUserName(removedBy),
      type: 'member_joined', // We could add 'member_removed' type
      details: `${this.getUserName(userId)} was removed from the trip`,
      timestamp: new Date().toISOString(),
      metadata: { removedUserId: userId }
    };

    this.logCollaborationEvent(event);
  }

  // Get user trips (as owner or collaborator)
  getUserTrips(userEmail: string): CollaborativeTrip[] {
    return Array.from(this.collaborativeTrips.values()).filter(
      trip => trip.ownerId === userEmail || 
             trip.collaborators.some(collab => collab.email === userEmail)
    );
  }

  // Helper methods
  private getUserName(userId: string): string {
    const user = this.users.get(userId);
    return user?.name || userId;
  }

  private logCollaborationEvent(event: CollaborationEvent): void {
    // In production, this would be sent to real-time service (Firebase, Pusher, etc.)
    console.log('📝 Collaboration Event:', event);
    
    // Store in localStorage for demo
    const events = JSON.parse(localStorage.getItem('collaborationEvents') || '[]');
    events.push(event);
    localStorage.setItem('collaborationEvents', JSON.stringify(events));
  }

  // Convert regular trip to collaborative trip
  createCollaborativeTrip(tripData: any, ownerId: string, ownerName: string): CollaborativeTrip {
    const collaborativeTrip: CollaborativeTrip = {
      ...tripData,
      ownerId,
      collaborators: [{
        userId: ownerId,
        email: ownerId,
        name: ownerName,
        role: 'owner',
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        permissions: this.getDefaultPermissions('owner')
      }],
      permissions: {
        [ownerId]: this.getDefaultPermissions('owner')
      },
      invites: [],
      lastModified: new Date().toISOString(),
      modifiedBy: ownerId,
      isShared: false
    };

    this.collaborativeTrips.set(tripData.id, collaborativeTrip);
    return collaborativeTrip;
  }
}

// Export singleton instance
export const collaborationService = new CollaborationService();