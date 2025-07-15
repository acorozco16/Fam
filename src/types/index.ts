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

export interface TripCollaboration {
  activeCollaborators: number;
  pendingInvites: number;
  contributors: FamilyMember[];
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
  customPackingItems?: { [listIndex: number]: string[] };
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

// Readiness Item Types
export interface ReadinessItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  status: 'complete' | 'incomplete';
  urgent?: boolean;
  isCustom: boolean;
}