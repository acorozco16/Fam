import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, Calendar, Users, Plus, Star, Clock, 
  Plane, CheckCircle, ArrowRight, X, Edit,
  Zap, AlertTriangle, Sparkles, Heart, Target
} from 'lucide-react';

import { 
  FamilyMember, 
  EnhancedTrip, 
  ActivityItem, 
  Reminder 
} from '../../types';
import { ProfileGamification } from '../gamification/ProfileGamification';

interface DashboardProps {
  user: any;
  trips: any[];
  onCreateTrip: () => void;
  onSelectTrip: (tripId: string) => void;
  familyProfiles: FamilyMember[];
  showFamilyProfiles: boolean;
  setShowFamilyProfiles: (show: boolean) => void;
  editingProfile: FamilyMember | null;
  setEditingProfile: (profile: FamilyMember | null) => void;
  showEditProfile: boolean;
  setShowEditProfile: (show: boolean) => void;
  setFamilyProfiles: (profiles: FamilyMember[]) => void;
}

// Helper function to calculate days until trip
const calculateDaysUntil = (startDate?: string): number => {
  if (!startDate) return 0;
  const today = new Date();
  const tripDate = new Date(startDate);
  const diffTime = tripDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Shared Trip Readiness Calculation
const calculateTripReadinessData = (trip: any) => {
  const items = [];
  const totalTravelers = (trip.adults?.length || 0) + (trip.kids?.length || 0);
  
  // Destination & Dates
  if (trip.city && trip.country && trip.startDate && trip.endDate) {
    items.push({
      id: 'destination',
      title: 'Destination & Dates Confirmed',
      subtitle: `${trip.city}, ${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${new Date(trip.endDate).toLocaleDateString('en-US', { day: 'numeric' })}`,
      status: 'complete',
      category: 'planning'
    });
  } else {
    items.push({
      id: 'destination',
      title: 'Destination & Dates Confirmed',
      subtitle: 'Complete trip wizard',
      status: 'incomplete',
      category: 'planning'
    });
  }
  
  // Primary Transportation (Flights or Alternative)
  const hasFlights = trip.flights && trip.flights.some((f: any) => f.status === 'booked' || f.status === 'confirmed');
  const hasPrimaryTransport = trip.transportation?.some((t: any) => 
    ['driving', 'train', 'bus'].includes(t.type) && (t.status === 'booked' || t.status === 'confirmed')
  );
  const hasTransportation = hasFlights || hasPrimaryTransport;
  
  items.push({
    id: 'airfare',
    title: hasFlights ? 'Flights Booked' : 'Transportation Arranged',
    subtitle: hasFlights 
      ? `${trip.flights.filter((f: any) => f.status === 'booked' || f.status === 'confirmed').length} flights booked`
      : hasPrimaryTransport 
        ? 'Primary transportation confirmed'
        : 'Need flights or transportation method',
    status: hasTransportation ? 'complete' : 'incomplete',
    category: 'travel',
    urgent: !hasTransportation
  });
  
  // Accommodations
  const hasAccommodations = trip.accommodations && trip.accommodations.some((a: any) => a.status === 'booked' || a.status === 'confirmed');
  items.push({
    id: 'hotel',
    title: 'Hotel Accommodations Secured',
    subtitle: hasAccommodations ? `${trip.accommodations.filter((a: any) => a.status === 'booked' || a.status === 'confirmed').length} accommodations booked` : 'No accommodations booked',
    status: hasAccommodations ? 'complete' : 'incomplete',
    category: 'travel'
  });
  
  // Transportation
  const hasTransport = trip.transportation && trip.transportation.some((t: any) => t.status === 'booked' || t.status === 'confirmed');
  items.push({
    id: 'transport',
    title: 'Transportation Arranged',
    subtitle: hasTransport ? `${trip.transportation.filter((t: any) => t.status === 'booked' || t.status === 'confirmed').length} bookings confirmed` : 'Local transport needed',
    status: hasTransport ? 'complete' : 'incomplete',
    category: 'travel'
  });
  
  // Packing
  const packingProgress = (() => {
    if (!trip.packingLists) return 0;
    
    let totalItems = 0;
    let checkedItems = 0;
    
    Object.values(trip.packingLists).forEach((list: any) => {
      if (list.items) {
        Object.values(list.items).forEach((item: any) => {
          totalItems++;
          if (item.checked) checkedItems++;
        });
      }
    });
    
    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  })();
  
  items.push({
    id: 'packing',
    title: 'Packing Lists Created',
    subtitle: packingProgress > 0 ? `${packingProgress}% of items packed` : 'Packing not started',
    status: packingProgress >= 80 ? 'complete' : 'incomplete',
    category: 'packing'
  });
  
  // Travel Insurance
  const hasInsurance = trip.documents?.insurance;
  items.push({
    id: 'insurance',
    title: 'Travel Insurance Purchased',
    subtitle: hasInsurance ? 'Coverage confirmed' : `Coverage needed for ${totalTravelers} travelers`,
    status: hasInsurance ? 'complete' : 'incomplete',
    category: 'travel',
    urgent: !hasInsurance
  });
  
  // Documents
  const documentsComplete = (() => {
    if (!trip.documents) return false;
    const requiredDocs = ['passport', 'insurance'];
    return requiredDocs.every(doc => trip.documents[doc]);
  })();
  
  items.push({
    id: 'documents',
    title: 'Passports/Documents Ready',
    subtitle: documentsComplete ? 'All documents confirmed' : 'Check document requirements',
    status: documentsComplete ? 'complete' : 'incomplete',
    category: 'planning'
  });
  
  // Activities
  const activitiesCount = trip.activities ? trip.activities.length : 0;
  items.push({
    id: 'activities',
    title: 'Activities & Reservations',
    subtitle: activitiesCount > 0 ? `${activitiesCount} planned, 0 more suggested` : '0 planned, 0 more suggested',
    status: activitiesCount > 0 ? 'complete' : 'incomplete',
    category: 'itinerary'
  });
  
  return items;
};

// Family Trip Card Component
const FamilyTripCard: React.FC<{ 
  trip: EnhancedTrip; 
  onSelectTrip: (tripId: string) => void; 
}> = ({ trip, onSelectTrip }) => {
  const getStatusBadge = (status: string) => {
    const badges = {
      'Planning': { color: 'bg-blue-100 text-blue-700' },
      'Early Planning': { color: 'bg-yellow-100 text-yellow-700' },
      'Ready': { color: 'bg-green-100 text-green-700' },
      'In Progress': { color: 'bg-orange-100 text-orange-700' },
      'Completed': { color: 'bg-gray-100 text-gray-700' }
    };
    return badges[status as keyof typeof badges] || badges['Early Planning'];
  };

  const badge = getStatusBadge(trip.status);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  {trip.city}{trip.country ? `, ${trip.country}` : ''}
                </h3>
                <Badge className={badge.color}>
                  {trip.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {trip.startDate && trip.endDate ? `${trip.startDate} to ${trip.endDate}` : 'Dates TBD'}
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {(trip.adults?.length || 0)} adults, {(trip.kids?.length || 0)} kids
                </span>
                {trip.daysUntil > 0 && (
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {trip.daysUntil} days
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{trip.progress}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${trip.progress}%` }}
              />
            </div>
          </div>

          {/* Completed vs Next Steps */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Completed</h4>
              <div className="space-y-1">
                {trip.completed.map((item, idx) => (
                  <div key={idx} className="flex items-center text-sm text-green-700">
                    <CheckCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
              <div className="space-y-1">
                {trip.nextSteps.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-600">
                    <AlertTriangle className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
                {trip.nextSteps.length > 2 && (
                  <div className="text-xs text-gray-500">+{trip.nextSteps.length - 2} more</div>
                )}
              </div>
            </div>
          </div>

          {/* Smart Insight */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Zap className="w-4 h-4 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">Smart Insight</span>
            </div>
            <p className="text-sm text-blue-800">{trip.smartInsight}</p>
          </div>

          {/* Family Members & Continue Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Family:</span>
              {trip.kids && trip.kids.map((kid, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {kid.name} ({kid.age}yr)
                </Badge>
              ))}
              {(!trip.kids || trip.kids.length === 0) && (
                <span className="text-xs text-gray-400">No kids added</span>
              )}
            </div>
            <Button 
              variant="outline" 
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => onSelectTrip(trip.id || '')}
            >
              Continue Planning
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  trips, 
  onCreateTrip, 
  onSelectTrip, 
  familyProfiles, 
  showFamilyProfiles, 
  setShowFamilyProfiles, 
  editingProfile, 
  setEditingProfile, 
  showEditProfile, 
  setShowEditProfile, 
  setFamilyProfiles 
}) => {
  // Helper function to get family members from trip data
  const getFamilyMembersFromTrips = (trips: any[]): FamilyMember[] => {
    const allMembers: FamilyMember[] = [];
    
    // Add current user
    allMembers.push({
      id: user?.uid || '1',
      name: user?.name || 'You',
      role: 'parent',
      status: 'online',
      lastActive: 'now',
      type: 'adult'
    });

    // Add family members from trip data
    trips.forEach(trip => {
      if (trip.adults) {
        trip.adults.forEach((adult: any, index: number) => {
          if (adult.name && adult.name !== user?.name) {
            allMembers.push({
              id: `adult-${trip.id}-${index}`,
              name: adult.name,
              role: 'parent',
              status: 'offline',
              lastActive: '1h ago',
              type: 'adult',
              age: adult.age,
              email: adult.email
            });
          }
        });
      }
      
      if (trip.kids) {
        trip.kids.forEach((kid: any, index: number) => {
          if (kid.name) {
            allMembers.push({
              id: `kid-${trip.id}-${index}`,
              name: kid.name,
              role: 'child',
              status: 'offline',
              lastActive: '2h ago',
              type: 'child',
              age: kid.age
            });
          }
        });
      }
    });

    // Remove duplicates based on name
    return allMembers.filter((member, index, self) => 
      index === self.findIndex(m => m.name === member.name)
    );
  };

  // Helper function to generate trip highlights from trip data
  const generateTripHighlights = (trip: any): string[] => {
    const highlights: string[] = [];
    
    if (trip.travelStyle) {
      const styleMap: { [key: string]: string } = {
        'adventure-seekers': 'Adventure-focused',
        'culture-enthusiasts': 'Cultural experiences',
        'relaxed-explorers': 'Relaxed pace',
        'comfort-convenience': 'Comfort-focused'
      };
      if (styleMap[trip.travelStyle]) {
        highlights.push(styleMap[trip.travelStyle]);
      }
    }
    
    if (trip.budgetLevel) {
      const budgetMap: { [key: string]: string } = {
        'budget-friendly': 'Budget-conscious',
        'mid-range': 'Mid-range comfort',
        'premium': 'Premium experience',
        'luxury': 'Luxury travel'
      };
      if (budgetMap[trip.budgetLevel]) {
        highlights.push(budgetMap[trip.budgetLevel]);
      }
    }
    
    if (trip.concerns && trip.concerns.length > 0) {
      highlights.push('Health considerations');
    }
    
    const familySize = (trip.adults?.length || 0) + (trip.kids?.length || 0);
    if (familySize > 4) {
      highlights.push('Large family group');
    } else if (trip.kids && trip.kids.length > 0) {
      highlights.push('Family-friendly');
    }
    
    return highlights;
  };

  // Helper function to generate smart insights based on family and trip data
  const generateSmartInsight = (trip: any): string => {
    const insights: string[] = [];
    
    // Family-specific insights
    if (trip.kids && trip.kids.length > 0) {
      const youngestAge = Math.min(...trip.kids.map((kid: any) => parseInt(kid.age) || 0));
      const oldestAge = Math.max(...trip.kids.map((kid: any) => parseInt(kid.age) || 0));
      
      if (youngestAge <= 3) {
        insights.push("Great timing for toddler-friendly morning activities");
      }
      if (oldestAge >= 5 && youngestAge >= 3) {
        insights.push("Perfect age range for interactive museums and cultural sites");
      }
      if (trip.kids.length > 2) {
        insights.push("Consider connecting hotel rooms for large family comfort");
      }
    }
    
    // Travel style insights
    if (trip.travelStyle === 'relaxed-explorers') {
      insights.push("Relaxed pace perfect for family with built-in rest time");
    } else if (trip.travelStyle === 'adventure-seekers') {
      insights.push("Active adventures planned - great for energetic family");
    } else if (trip.travelStyle === 'culture-enthusiasts') {
      insights.push("Cultural experiences with family-friendly learning opportunities");
    }
    
    // Destination + season insights
    if (trip.city && trip.startDate) {
      const month = new Date(trip.startDate).getMonth();
      if (trip.city.toLowerCase().includes('barcelona') || trip.city.toLowerCase().includes('madrid')) {
        if (month >= 3 && month <= 5) {
          insights.push("Spring weather perfect for walking tours and outdoor dining");
        }
      }
    }
    
    // Budget insights
    if (trip.budgetLevel === 'budget-friendly') {
      insights.push("Budget-friendly options include free museums and local markets");
    } else if (trip.budgetLevel === 'luxury') {
      insights.push("Premium experiences will include skip-the-line access and private guides");
    }
    
    return insights[0] || "Family trip planning is on track for a memorable experience";
  };

  // Helper function to calculate completion tracking based on Trip Readiness
  const calculateCompletionTracking = (trip: any) => {
    const readinessItems = calculateTripReadinessData(trip);
    const completedItems = readinessItems.filter(item => item.status === 'complete');
    const incompleteItems = readinessItems.filter(item => item.status === 'incomplete');
    
    const completed = completedItems.map(item => item.title.replace(' Confirmed', '').replace(' Booked', '').replace(' Secured', ''));
    const nextSteps = incompleteItems.slice(0, 3).map(item => {
      if (item.id === 'airfare') return item.title.includes('Flights') ? 'Book flights' : 'Plan transportation';
      if (item.id === 'hotel') return 'Book accommodations';
      if (item.id === 'transport') return 'Arrange local transportation';
      if (item.id === 'insurance') return 'Get travel insurance';
      if (item.id === 'packing') return 'Complete packing checklist';
      if (item.id === 'documents') return 'Prepare travel documents';
      if (item.id === 'health-info') return 'Add health info for all family members';
      return item.title;
    });
    
    const progressPercentage = Math.round((completedItems.length / readinessItems.length) * 100);
    
    return {
      completed,
      nextSteps,
      progress: progressPercentage
    };
  };

  // Convert existing trips to enhanced trips with real data
  const enhancedTrips: EnhancedTrip[] = trips.map(trip => {
    const familyMembers = getFamilyMembersFromTrips([trip]);
    const daysUntil = calculateDaysUntil(trip.startDate);
    const tracking = calculateCompletionTracking(trip);
    const smartInsight = generateSmartInsight(trip);
    
    return {
      ...trip,
      activeCollaborators: familyMembers.length,
      pendingTasks: tracking.nextSteps.length,
      budget: { spent: 0, total: 0 },
      highlights: generateTripHighlights(trip),
      collaboration: {
        activeCollaborators: familyMembers.length,
        pendingInvites: 0,
        contributors: familyMembers
      },
      daysUntil,
      progress: tracking.progress,
      status: tracking.progress < 30 ? 'Early Planning' : tracking.progress < 70 ? 'Planning' : 'Ready' as any,
      completed: tracking.completed,
      nextSteps: tracking.nextSteps,
      smartInsight
    };
  });

  const activeTrips = enhancedTrips.filter(trip => trip.status === 'Planning' || trip.status === 'Early Planning' || trip.status === 'Ready');

  // New User Dashboard (No Trips)
  if (trips.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">FamApp</h1>
                  <p className="text-xs text-blue-700">Family Travel Made Simple</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{user.name?.[0] || 'U'}</span>
                    </div>
                  )}
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-8 px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Welcome Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to FamApp, {user.name}! 👋
              </h1>
              <p className="text-lg text-gray-600">
                Ready to coordinate your first amazing family trip?
              </p>
            </div>

            {/* Main CTA */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Create Your First Trip
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Let me help you coordinate all the chaos - from grandparents' accessibility needs 
                  to toddler nap schedules. It takes about 2 minutes to set up.
                </p>
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
                  onClick={onCreateTrip}
                >
                  Start Planning
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Family Profiles</h3>
                  <p className="text-sm text-gray-600">
                    Tell me about your family and I'll suggest activities perfect for everyone's ages and interests.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Smart Suggestions</h3>
                  <p className="text-sm text-gray-600">
                    Get AI recommendations that actually consider grandpa's mobility and Emma's nap time.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Easy Sharing</h3>
                  <p className="text-sm text-gray-600">
                    Share the final trip details with everyone without them needing to download anything.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Simple Benefits Card for New Users */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Better recommendations for your family</h3>
                  <p className="text-gray-600">
                    The more we know about your family's ages, interests, and needs, the better suggestions we can give you for activities, restaurants, and logistics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Three-column hub layout for users with trips
  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FamApp</h1>
                <p className="text-xs text-blue-700">Family Travel Coordination Hub</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowFamilyProfiles(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Users className="w-4 h-4 mr-2" />
                Family Profiles
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={onCreateTrip}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Trip
              </Button>
              <div className="flex items-center space-x-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{user.name?.[0]}</span>
                  </div>
                )}
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Hub Content */}
      <div className="py-6 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600">
              {activeTrips.length > 0 
                ? `You have ${activeTrips.length} trip${activeTrips.length > 1 ? 's' : ''} in progress`
                : 'Ready to plan your next family adventure?'
              }
            </p>
          </div>

          {/* Single Column Family-Focused Layout */}
          <div className="max-w-4xl mx-auto">
            {/* Trip Portfolio */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Your Trips</h2>
                <div className="text-sm text-gray-500">{activeTrips.length} active trip{activeTrips.length !== 1 ? 's' : ''}</div>
              </div>

              {/* Contextual Family Profile Completion Prompts */}
              {(() => {
                // Calculate profile completeness for contextual prompts
                const calculateProfileCompleteness = (profile: FamilyMember): number => {
                  const essentialFields = ['name', 'age', 'relationship'];
                  const detailedFields = ['interests', 'dietaryInfo', 'healthInfo', 'energyLevel', 'activityPreferences', 'sleepSchedule'];
                  
                  let score = 0;
                  let maxScore = 0;
                  
                  essentialFields.forEach(field => {
                    maxScore += 60;
                    if (profile[field as keyof FamilyMember] && profile[field as keyof FamilyMember] !== '') {
                      score += 60;
                    }
                  });
                  
                  const detailedWeight = 40 / detailedFields.length;
                  detailedFields.forEach(field => {
                    maxScore += detailedWeight;
                    const value = profile[field as keyof FamilyMember];
                    if (value && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
                      score += detailedWeight;
                    }
                  });
                  
                  return Math.round((score / maxScore) * 100);
                };

                const incompleteProfiles = familyProfiles.filter(profile => calculateProfileCompleteness(profile) < 70);
                const overallCompleteness = familyProfiles.length > 0 
                  ? Math.round(familyProfiles.reduce((sum, profile) => sum + calculateProfileCompleteness(profile), 0) / familyProfiles.length)
                  : 0;

                // Show contextual prompts based on different scenarios
                if (familyProfiles.length === 0 && activeTrips.length > 0) {
                  // User has trips but no family profiles
                  return (
                    <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Create Family Profiles for Better Recommendations</h3>
                            <p className="text-gray-600 text-sm mb-3">
                              Add family members to get personalized activity suggestions, dining recommendations, and travel tips tailored to your family's ages and interests.
                            </p>
                            <Button 
                              size="sm" 
                              onClick={() => setShowFamilyProfiles(true)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Create Family Profiles
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                } else if (incompleteProfiles.length > 0 && incompleteProfiles.length <= 2) {
                  // User has some incomplete profiles (1-2 people)
                  return (
                    <Card className="border-l-4 border-orange-400 bg-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Target className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Complete {incompleteProfiles[0].name}'s Profile</h3>
                            <p className="text-gray-600 text-sm mb-3">
                              Add interests, dietary preferences, and activity levels to unlock personalized recommendations for your trips.
                            </p>
                            <div className="flex items-center space-x-3">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setShowFamilyProfiles(true)}
                                className="border-orange-300 text-orange-700 hover:bg-orange-100"
                              >
                                Complete Profile
                              </Button>
                              <span className="text-xs text-orange-600">
                                {calculateProfileCompleteness(incompleteProfiles[0])}% complete
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                } else if (incompleteProfiles.length > 2) {
                  // User has many incomplete profiles
                  return (
                    <Card className="border-l-4 border-amber-400 bg-amber-50">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Complete Your Family Profiles</h3>
                            <p className="text-gray-600 text-sm mb-3">
                              {incompleteProfiles.length} family members need complete profiles to unlock personalized trip recommendations.
                            </p>
                            <div className="flex items-center space-x-3">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setShowFamilyProfiles(true)}
                                className="border-amber-300 text-amber-700 hover:bg-amber-100"
                              >
                                Complete Profiles
                              </Button>
                              <span className="text-xs text-amber-600">
                                {overallCompleteness}% family completion
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                } else if (overallCompleteness >= 70 && activeTrips.length > 0) {
                  // Profiles are complete - show achievement
                  return (
                    <Card className="border-l-4 border-green-400 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">✨ Personalized Recommendations Unlocked!</h3>
                            <p className="text-gray-600 text-sm">
                              Your family profiles are complete. Check your trip overviews for personalized activity and dining suggestions.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
                
                return null;
              })()}

              {/* Active Trips */}
              <div className="space-y-4">
                {activeTrips.map((trip) => (
                  <FamilyTripCard 
                    key={trip.id} 
                    trip={trip} 
                    onSelectTrip={onSelectTrip} 
                  />
                ))}
              </div>

              {/* Profile Progress Section */}
              {familyProfiles.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Family Information</h2>
                  <ProfileGamification
                    familyProfiles={familyProfiles}
                    onOpenFamilyProfiles={() => setShowFamilyProfiles(true)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Family Profiles Modal - Dashboard */}
    {showFamilyProfiles && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Family Profiles</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowFamilyProfiles(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="p-6">
            {familyProfiles.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Family Profiles Yet</h3>
                <p className="text-gray-500 mb-6">Family profiles are automatically created when you plan trips. Start your first trip to get started!</p>
                <Button onClick={() => {
                  setShowFamilyProfiles(false);
                  onCreateTrip();
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Plan Your First Trip
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">
                    {familyProfiles.length} family member{familyProfiles.length !== 1 ? 's' : ''}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingProfile({
                        id: '',
                        name: '',
                        type: 'adult',
                        relationship: '',
                        email: '',
                        dateOfBirth: '',
                        age: '',
                        interests: '',
                        specialNeeds: '',
                        healthInfo: '',
                        dietaryInfo: '',
                        energyLevel: [],
                        activityPreferences: [],
                        sleepSchedule: '',
                        bestTimes: '',
                        specialConsiderations: '',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      });
                      setShowEditProfile(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Family Member
                  </Button>
                </div>
                
                {/* Adults Section */}
                {familyProfiles.some(p => p.type === 'adult') && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Adults</h3>
                    <div className="grid gap-4">
                      {familyProfiles
                        .filter(profile => profile.type === 'adult')
                        .map(profile => (
                          <div key={profile.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-lg font-medium text-blue-700">
                                    {profile.name?.[0] || 'A'}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{profile.name}</h4>
                                  <p className="text-sm text-gray-500">{profile.relationship || 'Parent'}</p>
                                  {profile.healthInfo && (
                                    <Badge variant="secondary" className="mt-1">
                                      Health info provided
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    console.log('Adult edit clicked:', profile);
                                    setEditingProfile(profile);
                                    setShowEditProfile(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            {profile.interests && (
                              <div className="mt-3 text-sm text-gray-600">
                                <strong>Interests:</strong> {profile.interests}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                {/* Children Section */}
                {familyProfiles.some(p => p.type === 'child') && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Children</h3>
                    <div className="grid gap-4">
                      {familyProfiles
                        .filter(profile => profile.type === 'child')
                        .map(profile => {
                          const parent = familyProfiles.find(p => p.id === profile.parentId);
                          return (
                            <div key={profile.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                                    <span className="text-lg font-medium text-pink-700">
                                      {profile.name?.[0] || 'C'}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {profile.name} {profile.age && `(${profile.age}yr)`}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      {profile.relationship || 'Child'} 
                                      {parent && ` • Managed by ${parent.name}`}
                                    </p>
                                    {profile.healthInfo && (
                                      <Badge variant="secondary" className="mt-1">
                                        Health info provided
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      console.log('Child edit clicked:', profile);
                                      setEditingProfile(profile);
                                      setShowEditProfile(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              {profile.interests && (
                                <div className="mt-3 text-sm text-gray-600">
                                  <strong>Interests:</strong> {profile.interests}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    
    {/* Edit Profile Modal - Dashboard */}
    {showEditProfile && editingProfile && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {editingProfile.id ? `Edit ${editingProfile.name}'s Profile` : 'Create New Family Member'}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => {
              setShowEditProfile(false);
              setEditingProfile(null);
            }}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profile-name-dash">Name *</Label>
                  <Input
                    id="profile-name-dash"
                    value={editingProfile.name}
                    onChange={(e) => setEditingProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="profile-dob-dash">Date of Birth</Label>
                  <Input
                    id="profile-dob-dash"
                    type="date"
                    value={editingProfile.dateOfBirth || ''}
                    onChange={(e) => setEditingProfile(prev => prev ? {...prev, dateOfBirth: e.target.value} : null)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {editingProfile.type === 'adult' && (
                  <div>
                    <Label htmlFor="profile-email-dash">Email</Label>
                    <Input
                      id="profile-email-dash"
                      type="email"
                      value={editingProfile.email || ''}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, email: e.target.value} : null)}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="profile-relationship-dash">Relationship</Label>
                  <Select 
                    value={editingProfile.relationship || ''} 
                    onValueChange={(value) => setEditingProfile(prev => prev ? {...prev, relationship: value} : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {editingProfile.type === 'adult' ? (
                        <>
                          <SelectItem value="Mom">Mom</SelectItem>
                          <SelectItem value="Dad">Dad</SelectItem>
                          <SelectItem value="Parent">Parent</SelectItem>
                          <SelectItem value="Guardian">Guardian</SelectItem>
                          <SelectItem value="Grandma">Grandma</SelectItem>
                          <SelectItem value="Grandpa">Grandpa</SelectItem>
                          <SelectItem value="Aunt">Aunt</SelectItem>
                          <SelectItem value="Uncle">Uncle</SelectItem>
                          <SelectItem value="Sister">Sister</SelectItem>
                          <SelectItem value="Brother">Brother</SelectItem>
                          <SelectItem value="Cousin">Cousin</SelectItem>
                          <SelectItem value="Friend">Friend</SelectItem>
                          <SelectItem value="Family Friend">Family Friend</SelectItem>
                          <SelectItem value="Godparent">Godparent</SelectItem>
                          <SelectItem value="Stepparent">Stepparent</SelectItem>
                          <SelectItem value="Partner">Partner</SelectItem>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Son">Son</SelectItem>
                          <SelectItem value="Daughter">Daughter</SelectItem>
                          <SelectItem value="Child">Child</SelectItem>
                          <SelectItem value="Stepchild">Stepchild</SelectItem>
                          <SelectItem value="Grandchild">Grandchild</SelectItem>
                          <SelectItem value="Nephew">Nephew</SelectItem>
                          <SelectItem value="Niece">Niece</SelectItem>
                          <SelectItem value="Cousin">Cousin</SelectItem>
                          <SelectItem value="Godchild">Godchild</SelectItem>
                          <SelectItem value="Family Friend's Child">Family Friend's Child</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Health & Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Health & Medical Information</h3>
              <div>
                <Label htmlFor="health-info-dash">Health Information We Should Know</Label>
                <Textarea
                  id="health-info-dash"
                  rows={4}
                  placeholder="Tell us about any allergies, medical conditions, or health considerations that might affect travel planning."
                  value={editingProfile.healthInfo || ''}
                  onChange={(e) => setEditingProfile(prev => prev ? {...prev, healthInfo: e.target.value} : null)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditProfile(false);
                  setEditingProfile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingProfile) {
                    if (editingProfile.id) {
                      // Update existing profile
                      const updatedProfiles = familyProfiles.map(profile => 
                        profile.id === editingProfile.id 
                          ? { ...editingProfile, updatedAt: new Date().toISOString() }
                          : profile
                      );
                      setFamilyProfiles(updatedProfiles);
                      localStorage.setItem('famapp-family-profiles', JSON.stringify(updatedProfiles));
                    } else {
                      // Create new profile
                      const newProfile = {
                        ...editingProfile,
                        id: Date.now().toString(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      };
                      const updatedProfiles = [...familyProfiles, newProfile];
                      setFamilyProfiles(updatedProfiles);
                      localStorage.setItem('famapp-family-profiles', JSON.stringify(updatedProfiles));
                    }
                    
                    setShowEditProfile(false);
                    setEditingProfile(null);
                  }
                }}
              >
                {editingProfile.id ? 'Save Changes' : 'Create Profile'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};