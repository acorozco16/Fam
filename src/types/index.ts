// Core Types for FamApp
export interface FamilyMember {
  id: string;
  name: string;
  type: 'adult' | 'child';
  age?: string;
  email?: string;
  interests?: string;
  specialNeeds?: string;
  inviteStatus?: string;
  isConnection?: boolean;
  avatar?: string;
  role?: 'parent' | 'child' | 'collaborator';
  status?: 'online' | 'offline';
  lastActive?: string;
  // New profile fields
  healthInfo?: string;
  dietaryInfo?: string;
  parentId?: string; // For linking children to parents
  relationship?: string; // Mom, Dad, Son, Daughter, etc.
  createdAt?: string;
  updatedAt?: string;
  dateOfBirth?: string;
  energyLevel?: string[];
  activityPreferences?: string[];
  sleepSchedule?: string;
  bestTimes?: string;
  specialConsiderations?: string;
}

export interface Activity {
  id: string;
  name: string;
  date: string;
  time?: string;
  duration?: string;
  location?: string;
  status: 'Booked' | 'Planned' | 'Suggested';
  cost?: string;
  familyRating?: number;
  aiInsight?: string;
  participants?: string[];
  bookingRequired?: boolean;
  category?: string;
}

// Collaboration Types
export interface TripCollaborator {
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'collaborator' | 'viewer';
  joinedAt: string;
  lastActive?: string;
  avatar?: string;
  permissions?: TripPermissions;
}

export interface TripInvite {
  id: string;
  tripId: string;
  inviterEmail: string;
  inviterName: string;
  inviteeEmail: string;
  role: 'collaborator' | 'viewer';
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
  message?: string; // Optional personal message
}

export interface TripPermissions {
  canEdit: boolean;
  canInvite: boolean;
  canDelete: boolean;
  canManageTasks: boolean;
  canBookActivities: boolean;
  canViewBudget: boolean;
  canManageFamily: boolean;
}

export interface TripCollaboration {
  activeCollaborators: number;
  pendingInvites: number;
  contributors: FamilyMember[];
  // Enhanced collaboration data
  collaborators: TripCollaborator[];
  invites: TripInvite[];
  lastModified: string;
  modifiedBy: string;
}

// Collaborative Trip - extends TripData with collaboration features
export interface CollaborativeTrip extends TripData {
  ownerId: string;
  collaborators: TripCollaborator[];
  permissions: { [userId: string]: TripPermissions };
  invites: TripInvite[];
  lastModified: string;
  modifiedBy: string;
  isShared: boolean;
  shareCode?: string; // For easy sharing
}

export interface EnhancedTrip {
  id?: string;
  city?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  adults?: FamilyMember[];
  kids?: FamilyMember[];
  travelStyle?: string;
  concerns?: string[];
  budgetLevel?: string;
  bookings?: any;
  activities?: Activity[];
  additionalNotes?: string;
  activeCollaborators: number;
  pendingTasks: number;
  budget: { spent: number; total: number };
  highlights: string[];
  collaboration: TripCollaboration;
  daysUntil: number;
  progress: number;
  status: 'Planning' | 'Early Planning' | 'Ready' | 'In Progress' | 'Completed';
  completed: string[];
  nextSteps: string[];
  smartInsight: string;
}

export interface TripData {
  id?: string;
  city?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  adults?: FamilyMember[];
  kids?: FamilyMember[];
  travelStyle?: string;
  concerns?: string[];
  budgetLevel?: string;
  bookings?: any;
  activities?: Activity[];
  additionalNotes?: string;
  accommodations?: any[];
  hotels?: any[]; // Keep for backward compatibility
  customPackingItems?: { [listIndex: number]: Array<{ id: string; text: string; checked: boolean }> };
  packingLists?: { [listIndex: number]: { items: { [itemIndex: number]: { checked: boolean } } } };
  customReadinessItems?: Array<{
    id: string;
    title: string;
    subtitle: string;
    category: string;
    status: 'complete' | 'incomplete';
    urgent?: boolean;
    isCustom: boolean;
  }>;
  hiddenReadinessItems?: string[];
  // New dietary preferences fields
  optInDietary?: boolean;
  dietaryPreferences?: string[];
  // Trip purpose field
  tripPurpose?: string;
}

export interface TripTip {
  id: string;
  title: string;
  description: string;
  category: 'attraction' | 'restaurant' | 'transport' | 'cultural';
  ageRecommendation?: string;
  estimatedDuration?: string;
  cost?: string;
  canAddToItinerary: boolean;
  itineraryTemplate?: {
    name: string;
    location?: string;
    estimatedDuration: string;
    category: string;
  };
}

export interface ActivityItem {
  id: string;
  type: string;
  user: string;
  action: string;
  detail: string;
  time: string;
  tripId: string;
  icon: any;
  color: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  assignee: string;
}

// Form Types
export interface FlightFormData {
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  confirmationNumber: string;
  status: string;
  assignedMembers: string[];
}

export interface AccommodationFormData {
  type: string;
  name: string;
  address: string;
  checkIn: string;
  checkOut: string;
  details: string;
  roomQuantity: string;
  roomAssignment: string;
  assignedMembers: string[];
  status: string;
  confirmationNumber: string;
}

export interface TransportFormData {
  type: string;
  details: string;
  departure: string;
  arrival: string;
  date: string;
  time: string;
  assignedMembers: string[];
  confirmationNumber: string;
  status: string;
}

export interface NewTravelerForm {
  name: string;
  type: 'adult' | 'child';
  age: string;
  relationship: string;
  email: string;
}

// Wizard Step Types
export type WizardStep = 'destination' | 'dates' | 'travelers' | 'preferences' | 'review';

// Trip Status Types
export type TripStatus = 'Planning' | 'Early Planning' | 'Ready' | 'In Progress' | 'Completed';

// Activity Status Types
export type ActivityStatus = 'Booked' | 'Planned' | 'Suggested';

// Readiness Item Types with Task Assignment
export interface ReadinessItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  status: 'complete' | 'incomplete';
  urgent?: boolean;
  isCustom: boolean;
  priority?: 'high' | 'medium' | 'low';
  daysBeforeTrip?: number;
  intelligence?: {
    reasoning: string;
    source: string;
  };
  // Task assignment fields
  assignedTo?: string; // User ID or email of assigned family member
  assignedBy?: string; // Who assigned this task
  assignedAt?: string; // When task was assigned
  completedBy?: string; // Who completed the task
  completedAt?: string; // When task was completed
  comments?: TaskComment[]; // Family member comments on task
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// User/Auth Types for Collaboration
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  lastActive?: string;
}

// Collaboration Events for Real-time Updates
export interface CollaborationEvent {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  type: 'task_completed' | 'task_assigned' | 'trip_edited' | 'member_joined' | 'comment_added';
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}