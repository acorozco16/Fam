import React, { useState, useEffect, useRef } from 'react';
import { signInWithGoogle } from './firebase';
import { Loader } from '@googlemaps/js-api-loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

declare const google: any;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MapPin, Calendar, Users, Plus, Trash2, Star, Clock, 
  Plane, Hotel, Car, Sparkles, Share2, MessageCircle,
  Mail, CheckCircle, Heart, Compass, DollarSign, Zap,
  Shield, Stethoscope, User, UserCheck, Baby, Send,
  FileText, ArrowRight, ArrowLeft, Home, AlertTriangle,
  UserPlus, Save, X, Utensils, Check, AlertCircle, Bell,
  Settings, ChevronRight, Target, Edit, ChevronDown
} from 'lucide-react';

// Types
interface FamilyMember {
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

interface Activity {
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

interface TripCollaboration {
  activeCollaborators: number;
  pendingInvites: number;
  contributors: FamilyMember[];
}

interface EnhancedTrip {
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

interface TripData {
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
  hiddenPackingItems?: { [listIndex: number]: string[] };
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
  readinessItemStatus?: { [itemId: string]: 'complete' | 'incomplete' };
}

interface ActivityItem {
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

interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  assignee: string;
}

// Helper functions - Defined outside components
const calculateDaysUntil = (startDate?: string): number => {
  if (!startDate) return 0;
  const today = new Date();
  const tripDate = new Date(startDate);
  const diffTime = tripDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Shared Trip Readiness Calculation - used by both dashboard and trip details
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
  
  // Emergency Contacts
  const emergencyCount = trip.emergencyContacts ? trip.emergencyContacts.length : 0;
  items.push({
    id: 'emergency',
    title: 'Emergency Contacts Shared',
    subtitle: emergencyCount > 0 ? 'Local contacts added' : 'Local contacts needed',
    status: emergencyCount > 0 ? 'complete' : 'incomplete',
    category: 'planning'
  });
  
  // Currency
  items.push({
    id: 'currency',
    title: 'Currency & Payment Methods',
    subtitle: trip.currencyReady ? 'Bank notified, cards activated' : 'Bank notified, cards activated',
    status: trip.currencyReady ? 'complete' : 'incomplete',
    category: 'planning'
  });
  
  // Health Information
  const familyProfiles = JSON.parse(localStorage.getItem('familyProfiles') || '[]');
  const healthInfoComplete = familyProfiles.length > 0 && familyProfiles.every((profile: FamilyMember) => 
    profile.healthInfo && profile.healthInfo.trim() !== ''
  );
  items.push({
    id: 'health-info',
    title: 'Health Information Complete',
    subtitle: healthInfoComplete ? 'All family members have health info' : 'Add health info for all family members',
    status: healthInfoComplete ? 'complete' : 'incomplete',
    category: 'planning'
  });
  
  // Add custom readiness items
  if (trip.customReadinessItems) {
    items.push(...trip.customReadinessItems);
  }
  
  // Apply manual status overrides
  const itemsWithOverrides = items.map(item => {
    const manualStatus = trip.readinessItemStatus?.[item.id];
    return manualStatus ? { ...item, status: manualStatus } : item;
  });
  
  // Filter out hidden items
  const visibleItems = itemsWithOverrides.filter(item => 
    !trip.hiddenReadinessItems?.includes(item.id)
  );
  
  return visibleItems;
};

// Step Components - Defined outside main component
const DestinationStep: React.FC<{ 
  tripData: TripData; 
  setTripData: React.Dispatch<React.SetStateAction<TripData>>;
  validationErrors: Record<string, string>;
}> = ({ tripData, setTripData, validationErrors }) => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 text-blue-600 mr-2" />
          Where are you heading?
        </CardTitle>
        <CardDescription>Tell us your destination and travel dates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input 
              id="city"
              placeholder="e.g., Madrid, Paris"
              value={tripData.city || ''}
              onChange={(e) => setTripData(prev => ({...prev, city: e.target.value}))}
              className={validationErrors.city ? 'border-red-500' : ''}
            />
            {validationErrors.city && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.city}</p>
            )}
          </div>
          <div>
            <Label htmlFor="country">Country *</Label>
            <Input 
              id="country"
              placeholder="e.g., Spain, France"
              value={tripData.country || ''}
              onChange={(e) => setTripData(prev => ({...prev, country: e.target.value}))}
              className={validationErrors.country ? 'border-red-500' : ''}
            />
            {validationErrors.country && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.country}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date *</Label>
            <Input 
              id="startDate"
              type="date"
              value={tripData.startDate || ''}
              onChange={(e) => setTripData(prev => ({...prev, startDate: e.target.value}))}
              className={validationErrors.startDate ? 'border-red-500' : ''}
            />
            {validationErrors.startDate && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.startDate}</p>
            )}
          </div>
          <div>
            <Label htmlFor="endDate">End Date *</Label>
            <Input 
              id="endDate"
              type="date"
              value={tripData.endDate || ''}
              onChange={(e) => setTripData(prev => ({...prev, endDate: e.target.value}))}
              className={validationErrors.endDate ? 'border-red-500' : ''}
            />
            {validationErrors.endDate && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.endDate}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FamilyProfilesStep: React.FC<{ 
  tripData: TripData; 
  setTripData: React.Dispatch<React.SetStateAction<TripData>>;
  validationErrors: Record<string, string>;
}> = ({ tripData, setTripData, validationErrors }) => {
  const [adults, setAdults] = useState<FamilyMember[]>(tripData.adults || []);
  const [kids, setKids] = useState<FamilyMember[]>(tripData.kids || []);

  const familyRoles = {
    adult: ['Mom', 'Dad', 'Grandma', 'Grandpa', 'Aunt', 'Uncle', 'Guardian', 'Other'],
    child: ['Son', 'Daughter', 'Grandson', 'Granddaughter', 'Niece', 'Nephew', 'Other']
  };

  const addFamilyMember = (type: 'adult' | 'child') => {
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: '',
      type,
      age: type === 'child' ? '' : undefined
    };
    
    if (type === 'adult') {
      setAdults([...adults, newMember]);
    } else {
      setKids([...kids, newMember]);
    }
  };

  const removeFamilyMember = (id: string, type: 'adult' | 'child') => {
    if (type === 'adult') {
      setAdults(adults.filter(a => a.id !== id));
    } else {
      setKids(kids.filter(k => k.id !== id));
    }
  };

  // Update tripData when moving to next step
  const updateFamilyData = () => {
    setTripData(prev => ({...prev, adults, kids}));
  };

  // Call this before navigating away
  React.useEffect(() => {
    return () => {
      setTripData(prev => ({...prev, adults, kids}));
    };
  }, [adults, kids]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 italic">
          Just the basics for now - I'll ask for more details later to give better recommendations
        </p>
      </div>
      
      <Tabs defaultValue="adults" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="adults">Adults ({adults.length})</TabsTrigger>
          <TabsTrigger value="children">Children ({kids.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="adults" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Adult Travelers</h3>
            <Button onClick={() => addFamilyMember('adult')} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Adult
            </Button>
          </div>
          
          {adults.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No adults added yet. Click "Add Adult" to get started.</p>
              </CardContent>
            </Card>
          )}

          {adults.length === 0 && validationErrors.adults && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.adults}</p>
          )}

          {adults.map((adult, index) => (
            <Card key={adult.id} className="relative">
              <Button
                onClick={() => removeFamilyMember(adult.id, 'adult')}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name <span className="text-red-500">*</span></Label>
                    <Input 
                      value={adult.name}
                      onChange={(e) => {
                        const updated = adults.map(a => a.id === adult.id ? {...a, name: e.target.value} : a);
                        setAdults(updated);
                      }}
                      placeholder="e.g., Sarah"
                      className={validationErrors[`adult-${index}-name`] ? 'border-red-500' : ''}
                      required
                    />
                    {validationErrors[`adult-${index}-name`] && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors[`adult-${index}-name`]}</p>
                    )}
                  </div>
                  <div>
                    <Label>Relationship (optional)</Label>
                    <Select
                      value={adult.inviteStatus}
                      onValueChange={(value) => {
                        const updated = adults.map(a => a.id === adult.id ? {...a, inviteStatus: value} : a);
                        setAdults(updated);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {familyRoles.adult.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="children" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Children</h3>
            <Button onClick={() => addFamilyMember('child')} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Child
            </Button>
          </div>
          
          {kids.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center text-gray-500">
                <Baby className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No children in your group? No problem!</p>
                <p className="text-sm">Click "Add Child" if you're traveling with kids.</p>
              </CardContent>
            </Card>
          )}

          {kids.map((kid, index) => (
            <Card key={kid.id} className="relative">
              <Button
                onClick={() => removeFamilyMember(kid.id, 'child')}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Name <span className="text-red-500">*</span></Label>
                    <Input 
                      value={kid.name}
                      onChange={(e) => {
                        const updated = kids.map(k => k.id === kid.id ? {...k, name: e.target.value} : k);
                        setKids(updated);
                      }}
                      placeholder="e.g., Emma"
                      className={validationErrors[`kid-${index}-name`] ? 'border-red-500' : ''}
                      required
                    />
                    {validationErrors[`kid-${index}-name`] && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors[`kid-${index}-name`]}</p>
                    )}
                  </div>
                  <div>
                    <Label>Age <span className="text-red-500">*</span></Label>
                    <Input 
                      value={kid.age || ''}
                      onChange={(e) => {
                        const updated = kids.map(k => k.id === kid.id ? {...k, age: e.target.value} : k);
                        setKids(updated);
                      }}
                      placeholder="e.g., 7"
                      className={validationErrors[`kid-${index}-age`] ? 'border-red-500' : ''}
                      type="number"
                      min="0"
                      max="17"
                      required
                    />
                    {validationErrors[`kid-${index}-age`] && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors[`kid-${index}-age`]}</p>
                    )}
                  </div>
                  <div>
                    <Label>Relationship (optional)</Label>
                    <Select
                      value={kid.inviteStatus}
                      onValueChange={(value) => {
                        const updated = kids.map(k => k.id === kid.id ? {...k, inviteStatus: value} : k);
                        setKids(updated);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {familyRoles.child.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const TravelStyleStep: React.FC<{ tripData: TripData; setTripData: React.Dispatch<React.SetStateAction<TripData>> }> = ({ tripData, setTripData }) => {
  const travelStyles = [
    {
      id: 'adventure',
      name: 'Adventure Seekers',
      subtitle: 'Go-go-go families',
      description: 'You want to see it all and do it all. Your kids love trying new things and you don\'t mind a packed schedule.',
      icon: Compass,
      color: 'green',
      features: [
        'Hiking trails that work for all ages',
        'Water activities and outdoor adventures', 
        'Active exploration over lounging',
        'Energy-burning activities for restless kids'
      ],
      perfect_for: 'Families with active kids who get bored easily',
      ai_example: '"Perfect hiking trail - paved path for strollers, playground at the end for the kids"'
    },
    {
      id: 'culture',
      name: 'Culture Enthusiasts', 
      subtitle: 'Learning vacation mode',
      description: 'Museums, history, local experiences. You want your kids to learn something AND have fun doing it.',
      icon: Heart,
      color: 'purple',
      features: [
        'Interactive museums with kid sections',
        'Historical sites with family audio guides',
        'Local cooking classes and cultural workshops',
        'Educational activities disguised as fun'
      ],
      perfect_for: 'Families who love learning together',
      ai_example: '"This museum has a hands-on kids area where Emma can touch real artifacts"'
    },
    {
      id: 'relaxed',
      name: 'Relaxed Explorers',
      subtitle: 'Vacation = actual relaxation', 
      description: 'You want to see cool stuff but also need time to breathe. Especially important with little ones and grandparents.',
      icon: Clock,
      color: 'blue',
      features: [
        'Flexible schedule with built-in rest time',
        'Easy-going pace between activities',
        'Backup plans for tired/cranky moments',
        'Plenty of downtime for naps and recharging'
      ],
      perfect_for: 'Multi-generational trips or families with young kids',
      ai_example: '"I scheduled 2 hours between activities so grandpa can rest and the baby can nap"'
    },
    {
      id: 'comfort',
      name: 'Comfort & Convenience',
      subtitle: 'Make it easy on everyone',
      description: 'Life is complicated enough. You want amazing experiences without the logistics headaches.',
      icon: Zap,
      color: 'indigo',
      features: [
        'Skip-the-line tickets and VIP access',
        'Private transportation and easy transfers',
        'Hotels with all the family amenities',
        'Stress-free experiences, premium comfort'
      ],
      perfect_for: 'Families who value smooth, hassle-free experiences',
      ai_example: '"Private car will pick you up at the hotel - no figuring out public transit with luggage"'
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      green: isSelected 
        ? 'border-green-500 bg-green-50 shadow-lg' 
        : 'border-gray-200 hover:border-green-300 hover:shadow-md',
      purple: isSelected 
        ? 'border-purple-500 bg-purple-50 shadow-lg' 
        : 'border-gray-200 hover:border-purple-300 hover:shadow-md',
      blue: isSelected 
        ? 'border-blue-500 bg-blue-50 shadow-lg' 
        : 'border-gray-200 hover:border-blue-300 hover:shadow-md',
      indigo: isSelected 
        ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
        : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
    };
    return colors[color as keyof typeof colors];
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      green: 'text-green-600',
      purple: 'text-purple-600', 
      blue: 'text-blue-600',
      indigo: 'text-indigo-600'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        {travelStyles.map((style) => {
          const IconComponent = style.icon;
          const isSelected = tripData.travelStyle === style.id;
          
          return (
            <Card
              key={style.id}
              className={`cursor-pointer transition-all duration-200 ${getColorClasses(style.color, isSelected)}`}
              onClick={() => setTripData(prev => ({...prev, travelStyle: style.id}))}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <IconComponent className={`w-7 h-7 ${getIconColorClasses(style.color)}`} />
                  {isSelected && (
                    <Badge className="bg-blue-600 text-white">
                      That's us!
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl mb-1">{style.name}</CardTitle>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {style.subtitle}
                </div>
                <CardDescription className="text-base leading-relaxed">
                  {style.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 text-gray-800">What this means for your trip:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {style.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-1">Perfect for:</p>
                  <p className="text-xs text-gray-600">{style.perfect_for}</p>
                </div>

                {isSelected && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-800 mb-1">AI suggestion example:</p>
                    <p className="text-xs text-blue-700 italic">{style.ai_example}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tripData.travelStyle && (
        <div className="text-center">
          <Card className="max-w-2xl mx-auto border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-4">
                {(() => {
                  const selected = travelStyles.find(s => s.id === tripData.travelStyle);
                  const IconComponent = selected?.icon;
                  return IconComponent ? (
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-green-600" />
                    </div>
                  ) : null;
                })()}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-900">
                Got it! You're {travelStyles.find(s => s.id === tripData.travelStyle)?.name}
              </h3>
              <p className="text-green-800 mb-4">
                I'll focus on recommendations that match your {tripData.travelStyle} style. 
                No suggesting 5-mile hikes for relaxed families or all-day museum marathons for adventure seekers!
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const ConcernsStep: React.FC<{ tripData: TripData; setTripData: React.Dispatch<React.SetStateAction<TripData>> }> = ({ tripData, setTripData }) => {
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(tripData.concerns || []);
  const [additionalNotes, setAdditionalNotes] = useState(tripData.additionalNotes || '');

  const concernCategories = [
    {
      id: 'safety',
      title: 'Safety & Security',
      subtitle: 'Extra peace of mind features',
      description: 'Special security considerations beyond our standard safety practices.',
      icon: Shield,
      color: 'red',
      concerns: [
        {
          id: 'emergency-access',
          label: 'Priority for nearby medical facilities',
          detail: 'Hospitals and urgent care within quick reach - especially important with kids or elderly'
        },
        {
          id: 'secure-transport',
          label: 'Secure transportation options',
          detail: 'Trusted drivers, official taxi services, well-lit pickup areas'
        }
      ],
      ai_example: '"I found activities near the medical district with a children\'s hospital 5 minutes away"'
    },
    {
      id: 'health',
      title: 'Health & Dietary',
      subtitle: 'Everyone needs to eat and feel good',
      description: 'Food allergies, medical needs, and dietary restrictions can make or break a family trip.',
      icon: Heart,
      color: 'green',
      concerns: [
        {
          id: 'food-allergies',
          label: 'Food allergies and dietary restrictions',
          detail: 'Nut-free, gluten-free, vegetarian, halal, kosher options'
        },
        {
          id: 'medical-needs',
          label: 'Special medical needs',
          detail: 'Pharmacy access, medical equipment, medication storage'
        },
        {
          id: 'kid-friendly-food',
          label: 'Kid-friendly food options',
          detail: 'Places that actually have food your kids will eat'
        }
      ],
      ai_example: '"This restaurant has a dedicated gluten-free menu and the staff is trained on allergies"'
    },
    {
      id: 'comfort',
      title: 'Comfort & Convenience',
      subtitle: 'Making life easier for everyone',
      description: 'Sleep schedules, nap times, and comfort needs - the little things that make a big difference.',
      icon: Clock,
      color: 'blue',
      concerns: [
        {
          id: 'sleep-schedules',
          label: 'Protecting sleep and nap schedules',
          detail: 'Quiet rooms, blackout curtains, respect for bedtime routines'
        },
        {
          id: 'accessibility',
          label: 'Wheelchair and stroller accessibility',
          detail: 'Ramps, elevators, wide paths for mobility needs'
        },
        {
          id: 'family-bathrooms',
          label: 'Family-friendly bathrooms',
          detail: 'Changing tables, family restrooms, easy access'
        }
      ],
      ai_example: '"I scheduled afternoon activities around naptime and found hotels with blackout curtains"'
    },
    {
      id: 'activities',
      title: 'Age-Appropriate Activities',
      subtitle: 'Something fun for everyone',
      description: 'Finding activities that work for toddlers AND grandparents? That\'s the real challenge.',
      icon: Utensils,
      color: 'orange',
      concerns: [
        {
          id: 'multi-generational',
          label: 'Activities that work for all ages',
          detail: 'From toddlers to grandparents - everyone stays engaged'
        },
        {
          id: 'weather-backup',
          label: 'Indoor backup plans',
          detail: 'Rain happens - need activities that work in any weather'
        },
        {
          id: 'attention-spans',
          label: 'Respect for different attention spans',
          detail: 'Some family members need breaks more than others'
        }
      ],
      ai_example: '"The zoo has both outdoor animals and an indoor aquarium - perfect if it rains"'
    },
    {
      id: 'transportation',
      title: 'Easy Transportation',
      subtitle: 'Getting around without the hassle',
      description: 'Moving a whole family is hard enough without dealing with complicated transportation.',
      icon: Car,
      color: 'purple',
      concerns: [
        {
          id: 'public-transit',
          label: 'Family-friendly public transportation',
          detail: 'Elevators, space for strollers, not too complicated'
        },
        {
          id: 'walkable-distances',
          label: 'Reasonable walking distances',
          detail: 'Activities close together - grandparents and little legs in mind'
        },
        {
          id: 'luggage-friendly',
          label: 'Easy luggage management',
          detail: 'Minimal transfers, porter services, accessible storage'
        }
      ],
      ai_example: '"All your activities are within a 3-block radius - perfect for walking with the stroller"'
    }
  ];

  const toggleConcern = (concernId: string) => {
    const newSelected = selectedConcerns.includes(concernId)
      ? selectedConcerns.filter(id => id !== concernId)
      : [...selectedConcerns, concernId];
    
    setSelectedConcerns(newSelected);
    setTripData(prev => ({...prev, concerns: newSelected}));
  };

  const handleNotesChange = (value: string) => {
    setAdditionalNotes(value);
    setTripData(prev => ({...prev, additionalNotes: value}));
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      red: isSelected ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-red-200',
      green: isSelected ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-green-200',
      blue: isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-200',
      orange: isSelected ? 'border-orange-300 bg-orange-50' : 'border-gray-200 hover:border-orange-200',
      purple: isSelected ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:border-purple-200'
    };
    return colors[color as keyof typeof colors];
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      red: 'text-red-600',
      green: 'text-green-600',
      blue: 'text-blue-600',
      orange: 'text-orange-600',
      purple: 'text-purple-600'
    };
    return colors[color as keyof typeof colors];
  };


  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-6">
        {concernCategories.map((category) => {
          const IconComponent = category.icon;
          const categorySelected = category.concerns.some(concern => 
            selectedConcerns.includes(concern.id)
          );
          
          return (
            <Card key={category.id} className={categorySelected ? 'border-blue-200 bg-blue-50/30' : ''}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full bg-gray-100 ${categorySelected ? 'bg-blue-100' : ''}`}>
                      <IconComponent className={`w-6 h-6 ${getIconColorClasses(category.color)}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{category.title}</CardTitle>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        {category.subtitle}
                      </div>
                      <CardDescription className="text-base">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                  {categorySelected && (
                    <Badge className="bg-blue-100 text-blue-700">
                      {category.concerns.filter(c => selectedConcerns.includes(c.id)).length} selected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-1 gap-3">
                  {category.concerns.map((concern) => {
                    const isSelected = selectedConcerns.includes(concern.id);
                    
                    return (
                      <div
                        key={concern.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        onClick={() => toggleConcern(concern.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={isSelected}
                            className="mt-1"
                            onCheckedChange={() => {}} // Prevent double-triggering
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{concern.label}</h4>
                            <p className="text-sm text-gray-600">{concern.detail}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Health details message */}
                {categorySelected && category.id === 'health' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <Sparkles className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-blue-800 mb-1">What happens next:</p>
                        <p className="text-xs text-blue-700">
                          After you complete the wizard, I'll ask for specific health details to give you better restaurant and activity recommendations. You can add details for each family member then.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {categorySelected && category.id !== 'health' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <Sparkles className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-blue-800 mb-1">AI suggestion example:</p>
                        <p className="text-xs text-blue-700 italic">{category.ai_example}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>


      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Anything else I should know?</CardTitle>
          <CardDescription>
            Special circumstances, quirks, or anything that would help me suggest better options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="additional-notes" className="sr-only">Additional notes</Label>
          <Textarea
            id="additional-notes"
            placeholder="e.g., 'Emma gets car sick on winding roads,' 'Grandpa needs to sit down every 30 minutes,' 'We're celebrating our anniversary so one romantic dinner would be nice'..."
            value={additionalNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={4}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Summary */}
      {selectedConcerns.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3 text-green-900">Perfect! I'll keep these priorities in mind:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedConcerns.map((concernId) => {
                const concern = concernCategories
                  .flatMap(cat => cat.concerns)
                  .find(c => c.id === concernId);
                return concern ? (
                  <Badge key={concernId} className="bg-green-100 text-green-700">
                    {concern.label}
                  </Badge>
                ) : null;
              })}
            </div>
            <p className="text-sm text-green-800 mt-3">
              I'll prioritize suggestions that address these concerns and avoid recommendations that don't fit your family's needs.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const BudgetStep: React.FC<{ tripData: TripData; setTripData: React.Dispatch<React.SetStateAction<TripData>> }> = ({ tripData, setTripData }) => {
  const budgetLevels = [
    {
      id: 'budget-friendly',
      title: 'Budget-Friendly',
      subtitle: 'Smart spending, great experiences',
      icon: DollarSign,
      color: 'green',
      description: 'You want amazing family memories without breaking the bank. Focus on value and finding the best deals.',
      whatThisMeans: [
        'Public transportation and budget accommodations',
        'Free activities and local markets',
        'Self-catered meals and picnic lunches'
      ],
      perfectFor: 'Families who love adventure on a budget',
      aiExample: '"I found free museum days and a beautiful park with playground - total cost under $50 for the whole day"'
    },
    {
      id: 'mid-range',
      title: 'Mid-Range Comfort',
      subtitle: 'Balance of comfort and value',
      icon: Heart,
      color: 'blue',
      description: 'You\'re willing to spend a bit more for comfort and convenience, but still want good value for money.',
      whatThisMeans: [
        'Mix of public transport and taxis when needed',
        'Mid-range hotels with family amenities',
        'Combination of dining out and self-catering'
      ],
      perfectFor: 'Families who want comfort without overspending',
      aiExample: '"Hotel has a pool for the kids, walking distance to attractions, and breakfast included - perfect balance"'
    },
    {
      id: 'premium',
      title: 'Premium Experience',
      subtitle: 'Comfort and convenience first',
      icon: Star,
      color: 'purple',
      description: 'You value comfort, convenience, and premium experiences. Money is less of a concern than having everything run smoothly.',
      whatThisMeans: [
        'Private transfers and premium accommodations',
        'Skip-the-line access and guided tours',
        'Fine dining and room service when desired'
      ],
      perfectFor: 'Families who prioritize seamless, stress-free travel',
      aiExample: '"Private guide will meet you at the hotel - no crowds, perfect timing, and the kids loved the personalized attention"'
    },
    {
      id: 'luxury',
      title: 'Luxury',
      subtitle: 'The ultimate family experience',
      icon: Sparkles,
      color: 'yellow',
      description: 'Money is no object - you want the absolute best experiences for your family with white-glove service.',
      whatThisMeans: [
        'Luxury resorts and exclusive experiences',
        'Private jets, yachts, and VIP access',
        'Personal concierge and 24/7 support'
      ],
      perfectFor: 'Families who want unforgettable, once-in-a-lifetime experiences',
      aiExample: '"Private chef will prepare meals in your villa while you enjoy exclusive after-hours access to the museum"'
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      green: isSelected 
        ? 'border-green-500 bg-green-50 shadow-lg' 
        : 'border-gray-200 hover:border-green-300 hover:shadow-md',
      blue: isSelected 
        ? 'border-blue-500 bg-blue-50 shadow-lg' 
        : 'border-gray-200 hover:border-blue-300 hover:shadow-md',
      purple: isSelected 
        ? 'border-purple-500 bg-purple-50 shadow-lg' 
        : 'border-gray-200 hover:border-purple-300 hover:shadow-md',
      yellow: isSelected 
        ? 'border-yellow-500 bg-yellow-50 shadow-lg' 
        : 'border-gray-200 hover:border-yellow-300 hover:shadow-md'
    };
    return colors[color as keyof typeof colors];
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      green: 'text-green-600 bg-green-100',
      blue: 'text-blue-600 bg-blue-100',
      purple: 'text-purple-600 bg-purple-100',
      yellow: 'text-yellow-600 bg-yellow-100'
    };
    return colors[color as keyof typeof colors];
  };

  const handleComfortLevelSelect = (levelId: string) => {
    setTripData(prev => ({...prev, budgetLevel: levelId}));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        {budgetLevels.map((level) => {
          const IconComponent = level.icon;
          const isSelected = tripData.budgetLevel === level.id;
          
          return (
            <Card 
              key={level.id} 
              className={`cursor-pointer transition-all duration-200 ${getColorClasses(level.color, isSelected)}`}
              onClick={() => handleComfortLevelSelect(level.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getIconColorClasses(level.color)}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-1">{level.title}</CardTitle>
                      <CardDescription className="text-sm font-medium text-gray-600">
                        {level.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isSelected && (
                      <Badge className="bg-blue-100 text-blue-700">
                        That's us!
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  {level.description}
                </p>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What this means for your trip:</h4>
                  <ul className="space-y-1">
                    {level.whatThisMeans.map((item, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Perfect for:</span>
                    <br />
                    <span className="text-gray-700">{level.perfectFor}</span>
                  </div>
                </div>

                {level.aiExample && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="text-sm">
                      <span className="font-medium text-blue-900">AI suggestion example:</span>
                      <br />
                      <span className="text-blue-800 italic">{level.aiExample}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      {tripData.budgetLevel && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">
                  Perfect! I'll tailor suggestions for {budgetLevels.find(l => l.id === tripData.budgetLevel)?.title}
                </h3>
                <p className="text-sm text-green-800 mt-1">
                  I'll prioritize activities and experiences that match your budget preferences.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const FamilyDetailsStep: React.FC<{ tripData: TripData; setTripData: React.Dispatch<React.SetStateAction<TripData>>; onSkip: () => void; onContinue: () => void }> = ({ tripData, setTripData, onSkip, onContinue }) => {
  const allMembers = [...(tripData.adults || []), ...(tripData.kids || [])];
  const [memberDetails, setMemberDetails] = useState<Record<string, { interests?: string; specialNeeds?: string }>>({});

  useEffect(() => {
    // Initialize member details from existing data
    const details: Record<string, { interests?: string; specialNeeds?: string }> = {};
    allMembers.forEach(member => {
      details[member.id] = {
        interests: member.interests || '',
        specialNeeds: member.specialNeeds || ''
      };
    });
    setMemberDetails(details);
  }, [allMembers.length]); // Re-run only when number of members changes

  const updateMemberDetail = (memberId: string, field: 'interests' | 'specialNeeds', value: string) => {
    setMemberDetails(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value
      }
    }));
  };

  const saveDetails = () => {
    // Update the actual trip data with the details
    const updatedAdults = (tripData.adults || []).map(adult => ({
      ...adult,
      interests: memberDetails[adult.id]?.interests || adult.interests,
      specialNeeds: memberDetails[adult.id]?.specialNeeds || adult.specialNeeds
    }));

    const updatedKids = (tripData.kids || []).map(kid => ({
      ...kid,
      interests: memberDetails[kid.id]?.interests || kid.interests,
      specialNeeds: memberDetails[kid.id]?.specialNeeds || kid.specialNeeds
    }));

    setTripData(prev => ({
      ...prev,
      adults: updatedAdults,
      kids: updatedKids
    }));
  };

  const handleContinue = () => {
    saveDetails();
    onContinue(); // Continue to next step
  };

  const handleSkip = () => {
    // Don't save details, just move to next step
    onSkip();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Want Smarter Suggestions?</h2>
        <p className="text-gray-600">Tell me more about your family for personalized recommendations</p>
        <Badge variant="outline" className="mt-2">
          <Sparkles className="w-3 h-3 mr-1" />
          Optional but helpful
        </Badge>
      </div>

      <div className="space-y-4">
        {allMembers.map((member) => {
          const isKid = member.type === 'child';
          const role = member.inviteStatus || (isKid ? 'Child' : 'Adult');
          
          return (
            <Card key={member.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isKid ? <Baby className="w-5 h-5 text-blue-600" /> : <User className="w-5 h-5 text-blue-600" />}
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    {member.age && <Badge variant="secondary">{member.age} years</Badge>}
                    {role !== 'Adult' && role !== 'Child' && <Badge variant="outline">{role}</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Interests</Label>
                  <Input
                    value={memberDetails[member.id]?.interests || ''}
                    onChange={(e) => updateMemberDetail(member.id, 'interests', e.target.value)}
                    placeholder={isKid ? "e.g., dinosaurs, swimming, legos" : "e.g., history, food, photography"}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {isKid ? "What does " + member.name + " love?" : "What excites " + member.name + " when traveling?"}
                  </p>
                </div>
                <div>
                  <Label>Special Needs or Considerations</Label>
                  <Input
                    value={memberDetails[member.id]?.specialNeeds || ''}
                    onChange={(e) => updateMemberDetail(member.id, 'specialNeeds', e.target.value)}
                    placeholder="e.g., vegetarian, wheelchair access, nap times"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dietary restrictions, mobility needs, medical conditions, etc.
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between mt-8">
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-gray-600"
        >
          Skip for now
        </Button>
        <Button onClick={handleContinue}>
          Save & Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const CompletionStep: React.FC<{ tripData: TripData; onTripComplete: (tripData: TripData) => void }> = ({ tripData, onTripComplete }) => (
  <div className="max-w-2xl mx-auto text-center space-y-6">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
      <CheckCircle className="w-8 h-8 text-green-600" />
    </div>
    <div>
      <h2 className="text-2xl font-bold mb-2">Your Trip Command Center is Ready!</h2>
      <p className="text-gray-600">
        Perfect! I've set up your family profile and I'm ready to help coordinate your {tripData.city} trip.
      </p>
    </div>
    
    <Card className="bg-gradient-to-r from-green-50 to-blue-50">
      <CardContent className="pt-6">
        <h3 className="font-semibold mb-2">What's Next:</h3>
        <ul className="text-sm space-y-1 text-left">
          <li>• Start adding your bookings and activities</li>
          <li>• Get AI suggestions tailored to your family</li>
          <li>• Share the trip details with everyone</li>
          <li>• Let me handle the coordination headaches!</li>
        </ul>
      </CardContent>
    </Card>
    
    <Button 
      onClick={() => onTripComplete(tripData)}
      className="bg-blue-600 hover:bg-blue-700"
      size="lg"
    >
      Open Trip Dashboard
    </Button>
  </div>
);

// Welcome Flow Components
const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    {/* Header */}
    <div className="bg-white/80 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FamApp</h1>
            <p className="text-xs text-blue-700">Family Travel Made Simple</p>
          </div>
        </div>
        <Button variant="outline" onClick={onGetStarted}>
          Sign In
        </Button>
      </div>
    </div>

    {/* Hero Section */}
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <div className="inline-flex items-center bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4 mr-2" />
          You don't have to remember EVERYTHING
        </div>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Finally! Someone Who Gets
          <span className="text-blue-600 block">Family Trip Chaos</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Planning for grandparents AND toddlers AND everyone's dietary restrictions AND nap schedules? 
          I see you. Let me help with all that mental load.
        </p>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            onClick={onGetStarted}
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const SignupPage: React.FC<{ onSignupComplete: (userData: any) => void }> = ({ onSignupComplete }) => {
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = () => {
    if (signupData.name && signupData.email && signupData.password) {
      onSignupComplete({
        ...signupData,
        isGoogleUser: false
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        // Google sign-in successful - pass user data and skip manual form
        onSignupComplete(result.user);
      } else {
        setError(result.error || 'Failed to sign in with Google');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Hey! I'm here to help with your family trips.</CardTitle>
          <CardDescription className="text-base">
            You know that feeling when you're coordinating EVERYONE's needs and schedules? Let me handle the chaos so you can actually enjoy planning.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Google Sign In - Prioritized */}
          <div className="pt-2">
            <Button 
              variant="outline" 
              className="w-full border-2 hover:bg-gray-50"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </div>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>

          <div>
            <Label htmlFor="name">What should I call you?</Label>
            <Input
              id="name"
              placeholder="Your first name"
              value={signupData.name}
              onChange={(e) => setSignupData({...signupData, name: e.target.value})}
              className="mt-1"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Your email (for saving your trips)</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={signupData.email}
              onChange={(e) => setSignupData({...signupData, email: e.target.value})}
              className="mt-1"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="password">Create a password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Secure password"
              value={signupData.password}
              onChange={(e) => setSignupData({...signupData, password: e.target.value})}
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          <div className="pt-2">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleSignup}
              disabled={!signupData.name || !signupData.email || !signupData.password || isLoading}
            >
              Ready to plan your first trip together
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button className="text-blue-600 hover:underline">Sign in</button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hub-Style Dashboard Components

// Family Members Card Component
const FamilyMembersCard: React.FC<{ familyMembers: FamilyMember[] }> = ({ familyMembers }) => {
  const getStatusColor = (status: string) => status === 'online' ? 'bg-green-500' : 'bg-gray-400';
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'parent': return 'bg-blue-500';
      case 'child': return 'bg-green-500';
      case 'collaborator': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Family Members</CardTitle>
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {familyMembers.map((member) => (
          <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
            <div className="relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getRoleColor(member.role || 'collaborator')}`}>
                {getInitials(member.name)}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status || 'offline')}`}></div>
              {member.role === 'parent' && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs">👑</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
              <p className="text-xs text-gray-500">
                {member.status === 'online' ? 'Active now' : `Last active ${member.lastActive || '2h ago'}`}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Family-Focused Trip Card Component for Dashboard
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

// Enhanced Trip Card Component (for Trip Details page)
const EnhancedTripCard: React.FC<{ 
  trip: EnhancedTrip; 
  onSelectTrip: (tripId: string) => void; 
}> = ({ trip, onSelectTrip }) => {
  const getStatusBadge = (status: string) => {
    const badges = {
      'Planning': { color: 'bg-blue-100 text-blue-700', icon: '📋' },
      'Early Planning': { color: 'bg-purple-100 text-purple-700', icon: '💭' },
      'Ready': { color: 'bg-green-100 text-green-700', icon: '✅' },
      'In Progress': { color: 'bg-orange-100 text-orange-700', icon: '✈️' },
      'Completed': { color: 'bg-gray-100 text-gray-700', icon: '🏁' }
    };
    return badges[status as keyof typeof badges] || badges['Planning'];
  };

  const badge = getStatusBadge(trip.status);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Badge className={`${badge.color} mb-2`}>
              <span className="mr-1">{badge.icon}</span>
              {trip.status}
            </Badge>
            <h3 className="text-xl font-bold">{trip.city}{trip.country ? `, ${trip.country}` : ''}</h3>
            <p className="text-sm text-gray-600">
              {trip.startDate && trip.endDate ? `${trip.startDate} to ${trip.endDate}` : 'Dates TBD'} • {trip.daysUntil > 0 ? `${trip.daysUntil} days until` : 'In progress'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{trip.progress}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Trip Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{trip.activeCollaborators}</div>
            <div className="text-xs text-gray-600">Active Collaborators</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{trip.pendingTasks}</div>
            <div className="text-xs text-gray-600">Pending Tasks</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {trip.budget.total > 0 ? `$${trip.budget.spent}/$${trip.budget.total}` : 'Not set'}
            </div>
            <div className="text-xs text-gray-600">Budget</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{(trip.adults?.length || 0) + (trip.kids?.length || 0)}</div>
            <div className="text-xs text-gray-600">Travelers</div>
          </div>
        </div>

        {/* Trip Highlights */}
        <div className="flex flex-wrap gap-2">
          {trip.highlights.map((highlight, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {highlight}
            </Badge>
          ))}
        </div>

        {/* Collaboration Avatars */}
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {trip.collaboration.contributors.slice(0, 3).map((contributor, index) => (
              <div key={index} className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                {contributor.name?.[0] || 'C'}
              </div>
            ))}
          </div>
          <span className="text-xs text-gray-600">
            {trip.collaboration.activeCollaborators} active collaborators
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            onClick={() => onSelectTrip(trip.id || '')}
            className="flex-1"
          >
            Continue Planning
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <FileText className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Activity Feed Component
const ActivityFeed: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          {activities.length > 0 && (
            <Button variant="ghost" size="sm">
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No recent activity</p>
            <p className="text-xs text-gray-400 mt-1">Activity will appear here as you plan your trips</p>
          </div>
        ) : (
          activities.slice(0, 5).map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-600">{activity.detail}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

// Reminders Card Component
const RemindersCard: React.FC<{ reminders: Reminder[] }> = ({ reminders }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Upcoming Reminders</CardTitle>
          {reminders.length > 0 && (
            <Button variant="ghost" size="sm">
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No reminders yet</p>
            <p className="text-xs text-gray-400 mt-1">Create reminders to stay on top of your trip planning</p>
          </div>
        ) : (
          reminders.slice(0, 4).map((reminder) => (
            <div key={reminder.id} className={`p-3 rounded-lg border-l-4 ${getPriorityColor(reminder.priority)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{reminder.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{reminder.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Due: {reminder.dueDate}</span>
                    <span className="text-xs text-gray-500">Assigned to: {reminder.assignee}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

// Quick Actions Component
const QuickActions: React.FC = () => {
  const actions = [
    { icon: FileText, label: 'Add Photos', color: 'bg-blue-500' },
    { icon: MessageCircle, label: 'Family Chat', color: 'bg-green-500' },
    { icon: DollarSign, label: 'Add Expense', color: 'bg-red-500' },
    { icon: MapPin, label: 'Save Place', color: 'bg-purple-500' }
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-16 flex-col space-y-2 hover:shadow-md transition-shadow"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${action.color}`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Hub-Style Dashboard Component
const Dashboard: React.FC<{ 
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
}> = ({ 
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

  const familyMembers = getFamilyMembersFromTrips(trips);
  const activities: ActivityItem[] = []; // Start with empty - will be populated as user interacts
  const reminders: Reminder[] = []; // Start with empty - will be populated as user adds reminders

  const activeTrips = enhancedTrips.filter(trip => trip.status === 'Planning' || trip.status === 'Early Planning' || trip.status === 'Ready');
  const completedTrips = enhancedTrips.filter(trip => trip.status === 'Completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Clock className="w-4 h-4" />;
      case 'active': return <Plane className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

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
          </div>
        </div>
      </div>
    );
  }

  // Returning User Dashboard (Has Trips)
  // Show new user state if no trips
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
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowFamilyProfiles(true)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Family Profiles
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

        {/* Welcome Content for New Users */}
        <div className="py-8 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to FamApp, {user.name}!
              </h1>
              <p className="text-xl text-gray-600">
                Let's plan your first amazing family trip together
              </p>
            </div>
            
            <Button 
              onClick={onCreateTrip}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Plan Your First Trip
            </Button>
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
            <h2 className="text-xl font-bold">Edit {editingProfile.name}'s Profile</h2>
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
                    // Update the profile in the array
                    const updatedProfiles = familyProfiles.map(profile => 
                      profile.id === editingProfile.id 
                        ? { ...editingProfile, updatedAt: new Date().toISOString() }
                        : profile
                    );
                    setFamilyProfiles(updatedProfiles);
                    
                    // Save to localStorage
                    localStorage.setItem('famapp-family-profiles', JSON.stringify(updatedProfiles));
                    
                    // Close modal
                    setShowEditProfile(false);
                    setEditingProfile(null);
                  }
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

const CreateTripFlow: React.FC<{ 
  userName: string; 
  onStartWizard: () => void;
  onBackToDashboard: () => void;
}> = ({ userName, onStartWizard, onBackToDashboard }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <Card className="max-w-lg w-full">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Perfect! Let's plan your trip.</CardTitle>
        <CardDescription className="text-base">
          Hi {userName}! I'll help you coordinate an amazing family trip. This will take about 2 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">What I'll help you with:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Smart suggestions based on your family's needs</li>
            <li>• Schedule optimization and conflict detection</li>
            <li>• Easy sharing that works without app downloads</li>
            <li>• Ongoing coordination as your trip evolves</li>
          </ul>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onBackToDashboard}
          >
            Back to Dashboard
          </Button>
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={onStartWizard}
          >
            Start Trip Wizard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Wizard error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">We encountered an error. Please refresh the page to try again.</p>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component
const FamApp = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tripData, setTripData] = useState<TripData>({});
  const [currentView, setCurrentView] = useState<'landing' | 'signup' | 'dashboard' | 'createTripFlow' | 'wizard' | 'trip-details'>('dashboard');
  
  const [userData, setUserData] = useState<{ 
    name: string; 
    email: string; 
    password?: string; 
    uid?: string; 
    photoURL?: string; 
    isGoogleUser?: boolean; 
  } | null>(null);
  
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});
  const [familyProfiles, setFamilyProfiles] = useState<FamilyMember[]>([]);
  const [showFamilyProfiles, setShowFamilyProfiles] = useState(false);
  const [editingProfile, setEditingProfile] = useState<FamilyMember | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddTravelerModal, setShowAddTravelerModal] = useState(false);
  const [newTravelerForm, setNewTravelerForm] = useState({
    name: '',
    type: 'adult' as 'adult' | 'child',
    age: '',
    relationship: '',
    email: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [activityValidationErrors, setActivityValidationErrors] = useState<Record<string, string>>({});
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showReadinessEditMode, setShowReadinessEditMode] = useState(false);
  
  // Edit state for travel items
  const [editingFlightIndex, setEditingFlightIndex] = useState<number | null>(null);
  const [editingAccommodationIndex, setEditingAccommodationIndex] = useState<number | null>(null);
  const [editingTransportationIndex, setEditingTransportationIndex] = useState<number | null>(null);
  
  // Modal form data state
  const [flightFormData, setFlightFormData] = useState({
    airline: '',
    flightNumber: '',
    departure: '',
    arrival: '',
    departureTime: '',
    arrivalTime: '',
    confirmationNumber: '',
    status: 'confirmed',
    assignedMembers: [] as string[]
  });
  
  const [accommodationFormData, setAccommodationFormData] = useState({
    type: 'hotel',
    name: '',
    address: '',
    checkIn: '',
    checkOut: '',
    details: '',
    roomQuantity: '1',
    roomAssignment: '',
    assignedMembers: [] as string[],
    status: 'confirmed',
    confirmationNumber: ''
  });
  
  const [transportFormData, setTransportFormData] = useState({
    type: 'driving',
    details: '',
    departure: '',
    arrival: '',
    date: '',
    time: '',
    assignedMembers: [] as string[],
    confirmationNumber: '',
    status: 'confirmed'
  });

  // Helper function to reset transportation modal
  const resetTransportationModal = () => {
    setShowTransportModal(false);
    setEditingTransportationIndex(null);
    setTransportFormData({
      type: 'driving',
      details: '',
      departure: '',
      arrival: '',
      date: '',
      time: '',
      assignedMembers: [],
      confirmationNumber: '',
      status: 'confirmed'
    });
  };
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [newActivity, setNewActivity] = useState({
    name: '',
    type: '',
    date: '',
    time: '',
    duration: '',
    location: '',
    address: '',
    coordinates: null, // {lat: number, lng: number}
    cost: '',
    costType: 'per-person', // 'per-person', 'total', 'free'
    bookingRequired: false,
    bookingUrl: '',
    notes: '',
    familyNotes: '',
    participants: [], // Will be populated with all family members by default
    ageAppropriate: [],
    accessibility: [],
    weatherDependent: false,
    priority: 'medium' // 'high', 'medium', 'low'
  });

  // Initialize collapsed days when trip data changes
  useEffect(() => {
    if (tripData.startDate && tripData.endDate) {
      const allTripDates: string[] = [];
      const start = new Date(tripData.startDate);
      const end = new Date(tripData.endDate);
      const current = new Date(start);
      
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        allTripDates.push(dateStr);
        current.setDate(current.getDate() + 1);
      }
      
      // Group activities by date
      const activitiesByDate = (tripData.activities || [])
        .reduce((groups: Record<string, any[]>, activity) => {
          const date = activity.date;
          if (!groups[date]) {
            groups[date] = [];
          }
          groups[date].push(activity);
          return groups;
        }, {} as Record<string, any[]>);
      
      const newCollapsedState: Record<string, boolean> = {};
      allTripDates.forEach(date => {
        if (!(date in collapsedDays)) {
          // Collapse days without activities, expand days with activities
          newCollapsedState[date] = !activitiesByDate[date] || activitiesByDate[date].length === 0;
        }
      });
      
      if (Object.keys(newCollapsedState).length > 0) {
        setCollapsedDays(prev => ({ ...prev, ...newCollapsedState }));
      }
    }
  }, [tripData.startDate, tripData.endDate, tripData.activities]);

  // Load family profiles from localStorage
  useEffect(() => {
    const savedProfiles = localStorage.getItem('famapp-family-profiles');
    if (savedProfiles) {
      try {
        setFamilyProfiles(JSON.parse(savedProfiles));
      } catch (error) {
        console.error('Error loading family profiles from localStorage:', error);
      }
    }
  }, []);

  // Auto-migrate family data from existing trips to profiles
  useEffect(() => {
    const migrateFromTripsToProfiles = () => {
      if (familyProfiles.length > 0 || userTrips.length === 0) {
        return; // Already have profiles or no trips to migrate from
      }

      const allFamilyMembers: FamilyMember[] = [];
      const memberMap = new Map<string, FamilyMember>();

      // Extract family members from all trips
      userTrips.forEach(trip => {
        if (trip.adults) {
          trip.adults.forEach((adult: any) => {
            const memberId = `adult-${adult.name?.toLowerCase().replace(/\s+/g, '-') || 'unnamed'}`;
            if (!memberMap.has(memberId)) {
              memberMap.set(memberId, {
                id: memberId,
                name: adult.name || 'Unnamed Adult',
                type: 'adult',
                age: adult.age,
                email: adult.email,
                interests: adult.interests,
                specialNeeds: adult.specialNeeds,
                relationship: adult.relationship || 'Parent',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
          });
        }

        if (trip.kids) {
          trip.kids.forEach((kid: any) => {
            const memberId = `child-${kid.name?.toLowerCase().replace(/\s+/g, '-') || 'unnamed'}`;
            if (!memberMap.has(memberId)) {
              // Try to assign to first parent as default
              const firstParent = Array.from(memberMap.values()).find(m => m.type === 'adult');
              
              memberMap.set(memberId, {
                id: memberId,
                name: kid.name || 'Unnamed Child',
                type: 'child',
                age: kid.age,
                interests: kid.interests,
                specialNeeds: kid.specialNeeds,
                relationship: kid.relationship || 'Child',
                parentId: firstParent?.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
          });
        }
      });

      const migratedProfiles = Array.from(memberMap.values());
      
      if (migratedProfiles.length > 0) {
        setFamilyProfiles(migratedProfiles);
        // Save to localStorage
        localStorage.setItem('famapp-family-profiles', JSON.stringify(migratedProfiles));
      }
    };

    migrateFromTripsToProfiles();
  }, [userTrips, familyProfiles]);

  // Load trips from localStorage on component mount
  useEffect(() => {
    const savedTrips = localStorage.getItem('famapp-trips');
    if (savedTrips) {
      try {
        setUserTrips(JSON.parse(savedTrips));
      } catch (error) {
        console.error('Error loading trips from localStorage:', error);
      }
    }
  }, []);

  // Pre-select all family members when modal opens (add mode) or populate form (edit mode)
  useEffect(() => {
    if (showAddActivityModal && tripData) {
      if (editingActivity) {
        // Editing mode - populate form with existing activity data
        setNewActivity({
          name: editingActivity.name || '',
          type: editingActivity.type || '',
          date: editingActivity.date || '',
          time: editingActivity.time || '',
          duration: editingActivity.duration || '',
          location: editingActivity.location || '',
          address: editingActivity.address || '',
          coordinates: editingActivity.coordinates || null,
          cost: editingActivity.cost || '',
          costType: editingActivity.costType || 'per-person',
          bookingRequired: editingActivity.bookingRequired || false,
          bookingUrl: editingActivity.bookingUrl || '',
          notes: editingActivity.notes || '',
          familyNotes: editingActivity.familyNotes || '',
          participants: editingActivity.participants || [],
          ageAppropriate: editingActivity.ageAppropriate || [],
          accessibility: editingActivity.accessibility || [],
          weatherDependent: editingActivity.weatherDependent || false,
          priority: editingActivity.priority || 'medium'
        });
      } else {
        // Add mode - pre-select all family members
        const allParticipants = [];
        if (tripData.adults) {
          tripData.adults.forEach((_, idx) => allParticipants.push(`adult-${idx}`));
        }
        if (tripData.kids) {
          tripData.kids.forEach((_, idx) => allParticipants.push(`kid-${idx}`));
        }
        setNewActivity(prev => ({...prev, participants: allParticipants}));
      }
    }
  }, [showAddActivityModal, tripData, editingActivity]);

  // Initialize Google Maps Autocomplete (temporarily disabled)
  useEffect(() => {
    if (showAddActivityModal && addressInputRef.current && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["places"]
      });

      loader.load().then(() => {
        if (addressInputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
            types: ['establishment', 'geocode'],
            // Restrict to trip destination country if available
            componentRestrictions: tripData.country ? { 
              country: tripData.country.toLowerCase().slice(0, 2) // Get country code
            } : undefined
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              setNewActivity(prev => ({
                ...prev,
                address: place.formatted_address || '',
                location: place.name || prev.location,
                coordinates: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                }
              }));
            }
          });
        }
      }).catch(error => {
        console.warn('Google Maps failed to load:', error);
        // Graceful fallback - form still works without autocomplete
      });
    }
    // If no API key, Google Maps autocomplete is disabled but form still works
  }, [showAddActivityModal, tripData.country]);


  // Save trips to localStorage whenever userTrips changes
  useEffect(() => {
    localStorage.setItem('famapp-trips', JSON.stringify(userTrips));
  }, [userTrips]);

  const steps = [
    { title: 'Destination' },
    { title: 'Family' },
    { title: 'Style' },
    { title: 'Concerns' },
    { title: 'Budget' },
    { title: 'Complete' }
  ];

  const nextStep = () => {
    setIsValidating(true);
    
    // Clear previous errors
    clearValidationErrors();
    
    // Validate current step
    if (!isCurrentStepValid()) {
      setIsValidating(false);
      return; // Don't proceed if validation fails
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
    
    setIsValidating(false);
  };

  const prevStep = () => {
    clearValidationErrors(); // Clear errors when going back
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validation helper functions
  const validateDestinationStep = (data: TripData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!data.city?.trim()) {
      errors.city = 'City is required';
    }
    
    if (!data.country?.trim()) {
      errors.country = 'Country is required';
    }
    
    if (!data.startDate) {
      errors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(data.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        errors.startDate = 'Start date cannot be in the past';
      }
    }
    
    if (!data.endDate) {
      errors.endDate = 'End date is required';
    } else if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (endDate <= startDate) {
        errors.endDate = 'End date must be after start date';
      }
    }
    
    return errors;
  };

  const validateFamilyProfilesStep = (data: TripData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    // Check if at least one adult exists
    if (!data.adults || data.adults.length === 0) {
      errors.adults = 'At least one adult is required';
    } else {
      // Validate each adult
      data.adults.forEach((adult, index) => {
        if (!adult.name?.trim()) {
          errors[`adult-${index}-name`] = 'Adult name is required';
        }
      });
    }
    
    // Validate children if they exist
    if (data.kids && data.kids.length > 0) {
      data.kids.forEach((kid, index) => {
        if (!kid.name?.trim()) {
          errors[`kid-${index}-name`] = 'Child name is required';
        }
        if (!kid.age || isNaN(Number(kid.age)) || Number(kid.age) < 0 || Number(kid.age) > 17) {
          errors[`kid-${index}-age`] = 'Valid age (0-17) is required for children';
        }
      });
    }
    
    return errors;
  };

  const validateActivityForm = (activity: any): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!activity.name?.trim()) {
      errors.name = 'Activity name is required';
    }
    
    if (!activity.date) {
      errors.date = 'Date is required';
    }
    
    if (activity.time && activity.date) {
      const activityDateTime = new Date(`${activity.date}T${activity.time}`);
      const now = new Date();
      
      if (activityDateTime < now) {
        errors.time = 'Activity time cannot be in the past';
      }
    }
    
    return errors;
  };

  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  // Helper function to check if current step is valid
  const isCurrentStepValid = (): boolean => {
    let stepErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0:
        stepErrors = validateDestinationStep(tripData);
        break;
      case 1:
        stepErrors = validateFamilyProfilesStep(tripData);
        break;
      default:
        return true; // Other steps are optional
    }
    
    setValidationErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };


  // Welcome flow navigation
  const handleGetStarted = () => {
    setCurrentView('signup');
  };

  const handleSignupComplete = (signupData: any) => {
    setUserData(signupData);
    setCurrentView('dashboard');
  };

  const handleStartWizard = () => {
    setCurrentView('wizard');
  };

  // Dashboard navigation handlers
  const handleCreateTrip = () => {
    setTripData({}); // Reset trip data for new trip
    setCurrentStep(0); // Reset to first step
    setCurrentView('wizard');
  };

  const handleSelectTrip = (tripId: string) => {
    const selectedTrip = userTrips.find(trip => trip.id === tripId);
    if (selectedTrip) {
      setTripData(selectedTrip);
      setCurrentView('trip-details');
    }
  };

  // Save trip when wizard completes
  const handleTripComplete = (completedTripData: TripData) => {
    const tripToSave = {
      ...completedTripData,
      id: completedTripData.id || Date.now().toString(),
      status: 'planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setUserTrips(prev => [...prev, tripToSave]);
    setTripData(tripToSave); // Update tripData for dashboard view
    setCurrentView('dashboard');
  };

  // Render based on current view
  if (currentView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (currentView === 'signup') {
    return <SignupPage onSignupComplete={handleSignupComplete} />;
  }

  if (currentView === 'dashboard') {
    return (
      <>
        <Dashboard 
          user={userData || { name: 'Guest User', email: 'guest@example.com' }}
          trips={userTrips}
          onCreateTrip={handleCreateTrip}
          onSelectTrip={handleSelectTrip}
          familyProfiles={familyProfiles}
          showFamilyProfiles={showFamilyProfiles}
          setShowFamilyProfiles={setShowFamilyProfiles}
          editingProfile={editingProfile}
          setEditingProfile={setEditingProfile}
          showEditProfile={showEditProfile}
          setShowEditProfile={setShowEditProfile}
          setFamilyProfiles={setFamilyProfiles}
        />
        
        
        {/* Edit Profile Modal */}
        {showEditProfile && editingProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Edit {editingProfile.name}'s Profile</h2>
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
                      <Label htmlFor="profile-name">Name *</Label>
                      <Input
                        id="profile-name"
                        value={editingProfile.name}
                        onChange={(e) => setEditingProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="profile-dob">Date of Birth</Label>
                      <Input
                        id="profile-dob"
                        type="date"
                        value={editingProfile.dateOfBirth || ''}
                        onChange={(e) => setEditingProfile(prev => prev ? {...prev, dateOfBirth: e.target.value} : null)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {editingProfile.type === 'adult' && (
                      <div>
                        <Label htmlFor="profile-email">Email</Label>
                        <Input
                          id="profile-email"
                          type="email"
                          value={editingProfile.email || ''}
                          onChange={(e) => setEditingProfile(prev => prev ? {...prev, email: e.target.value} : null)}
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="profile-relationship">Relationship</Label>
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
                    <Label htmlFor="health-info">Health Information We Should Know</Label>
                    <Textarea
                      id="health-info"
                      rows={4}
                      placeholder="Tell us about any allergies, medical conditions, or health considerations that might affect travel planning. For example: 'severe nut allergy - needs EpiPen', 'diabetes - needs to eat every 3 hours', 'uses wheelchair', etc."
                      value={editingProfile.healthInfo || ''}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, healthInfo: e.target.value} : null)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Only share what you're comfortable with and what would help us make better recommendations
                    </p>
                  </div>
                </div>

                {/* Travel Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Travel Preferences</h3>
                  
                  <div>
                    <Label className="text-sm font-medium">Energy Level</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { value: 'high-energy', label: 'High energy - loves active adventures' },
                        { value: 'moderate-energy', label: 'Moderate energy - mix of active and relaxing' },
                        { value: 'low-energy', label: 'Low energy - prefers leisurely activities' },
                        { value: 'needs-breaks', label: 'Needs frequent breaks' }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`energy-${option.value}`}
                            checked={editingProfile.energyLevel?.includes(option.value) || false}
                            onCheckedChange={(checked) => {
                              const currentLevels = editingProfile.energyLevel || [];
                              if (checked) {
                                setEditingProfile(prev => prev ? {
                                  ...prev, 
                                  energyLevel: [...currentLevels, option.value]
                                } : null);
                              } else {
                                setEditingProfile(prev => prev ? {
                                  ...prev,
                                  energyLevel: currentLevels.filter(level => level !== option.value)
                                } : null);
                              }
                            }}
                          />
                          <Label htmlFor={`energy-${option.value}`} className="text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Activity Preferences</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {[
                        { value: 'museums-culture', label: 'Loves museums and cultural sites' },
                        { value: 'outdoor-nature', label: 'Enjoys outdoor activities and nature' },
                        { value: 'hands-on', label: 'Prefers hands-on experiences' },
                        { value: 'food-cooking', label: 'Likes food and cooking experiences' },
                        { value: 'shows-entertainment', label: 'Enjoys shows and entertainment' }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`activity-${option.value}`}
                            checked={editingProfile.activityPreferences?.includes(option.value) || false}
                            onCheckedChange={(checked) => {
                              const currentPrefs = editingProfile.activityPreferences || [];
                              if (checked) {
                                setEditingProfile(prev => prev ? {
                                  ...prev, 
                                  activityPreferences: [...currentPrefs, option.value]
                                } : null);
                              } else {
                                setEditingProfile(prev => prev ? {
                                  ...prev,
                                  activityPreferences: currentPrefs.filter(pref => pref !== option.value)
                                } : null);
                              }
                            }}
                          />
                          <Label htmlFor={`activity-${option.value}`} className="text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sleep & Schedule - Children Only */}
                {editingProfile.type === 'child' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sleep & Schedule</h3>
                  
                  <div>
                    <Label htmlFor="sleep-schedule">Sleep Schedule</Label>
                    <Input
                      id="sleep-schedule"
                      placeholder="e.g., sleeps 8pm-7am, needs 2-hour nap around 1pm"
                      value={editingProfile.sleepSchedule || ''}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, sleepSchedule: e.target.value} : null)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="best-times">Best Times</Label>
                    <Input
                      id="best-times"
                      placeholder="e.g., morning person, cranky after 6pm"
                      value={editingProfile.bestTimes || ''}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, bestTimes: e.target.value} : null)}
                    />
                  </div>
                  </div>
                )}

                {/* Special Considerations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Special Considerations</h3>
                  <div>
                    <Label htmlFor="special-considerations">Anything Else We Should Know?</Label>
                    <Textarea
                      id="special-considerations"
                      rows={3}
                      placeholder="e.g., 'gets motion sick in cars', 'afraid of heights', 'overwhelmed by crowds', 'can't handle loud noises', 'loves animals', etc."
                      value={editingProfile.specialConsiderations || ''}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, specialConsiderations: e.target.value} : null)}
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
                        // Update the profile in the array
                        const updatedProfiles = familyProfiles.map(profile => 
                          profile.id === editingProfile.id 
                            ? { ...editingProfile, updatedAt: new Date().toISOString() }
                            : profile
                        );
                        setFamilyProfiles(updatedProfiles);
                        
                        // Save to localStorage
                        localStorage.setItem('famapp-family-profiles', JSON.stringify(updatedProfiles));
                        
                        // Close modal
                        setShowEditProfile(false);
                        setEditingProfile(null);
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (currentView === 'wizardStart') {
    return (
      <WizardStart 
        userName={userData?.name || 'there'} 
        userPhoto={userData?.photoURL}
        isGoogleUser={userData?.isGoogleUser}
        onStartWizard={handleStartWizard} 
      />
    );
  }

  // Removed debug banner - trying different approach

  if (currentView === 'trip-details') {
    const tripReadinessItems = calculateTripReadinessData(tripData);
    const completedCount = tripReadinessItems.filter(item => item.status === 'complete').length;
    const totalCount = tripReadinessItems.length;
    
    // Calculate days until trip
    const daysUntil = calculateDaysUntil(tripData.startDate);
    
    // Handle sidebar item clicks - navigate to appropriate tab
    const handleSidebarItemClick = (item: any) => {
      // Map categories to tabs
      if (item.category === 'itinerary') {
        setActiveTab('itinerary');
      } else if (item.category === 'travel') {
        setActiveTab('travel');
      } else if (item.category === 'packing') {
        setActiveTab('packing');
      } else if (item.category === 'planning') {
        // Planning items could go to different tabs based on the specific item
        if (item.id === 'documents') {
          setActiveTab('travel');
        } else {
          setActiveTab('itinerary'); // Default for planning items
        }
      }
    };
    
    return (
      <>
      <ResponsiveTripDetails 
        trip={tripData} 
        onBack={() => setCurrentView('dashboard')}
      >
          {/* Desktop Header - only shows on desktop */}
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentView('dashboard')}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {tripData.city || 'Trip'} Family Adventure
                  </h1>
                  <div className="flex items-center space-x-6 text-sm text-gray-600 mt-1">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {tripData.city}, {tripData.country}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {tripData.startDate && tripData.endDate
                        ? `${new Date(tripData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${new Date(tripData.endDate).toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`
                        : 'Dates TBD'}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {(tripData.adults?.length || 0) + (tripData.kids?.length || 0)} travelers
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {daysUntil > 0 ? `${daysUntil} days to go` : 'Trip date passed'}
                    </span>
                    <span className="text-gray-400">
                      Last updated 2 hours ago
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowFamilyProfiles(true)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Family Profiles
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Trip
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Bell className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Trip Readiness Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Trip Readiness</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowReadinessEditMode(!showReadinessEditMode)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-2xl font-bold">{Math.round((completedCount / totalCount) * 100)}%</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {completedCount} of {totalCount} essentials complete
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {tripReadinessItems.map((item) => (
                      <div key={item.id} className="group">
                        <div 
                          className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => !showReadinessEditMode && handleSidebarItemClick(item)}
                        >
                          <div 
                            className="mt-0.5 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!(item as any).isCustom) {
                                // Toggle completion status for regular items
                                const updatedTripData = {
                                  ...tripData,
                                  readinessItemStatus: {
                                    ...tripData.readinessItemStatus,
                                    [item.id]: item.status === 'complete' ? 'incomplete' : 'complete'
                                  }
                                };
                                setTripData(updatedTripData);
                                const updatedTrips = userTrips.map(trip => 
                                  trip.id === tripData.id ? updatedTripData : trip
                                );
                                setUserTrips(updatedTrips);
                              } else {
                                // Toggle completion status for custom items
                                const updatedCustomItems = (tripData.customReadinessItems || []).map(customItem => 
                                  customItem.id === item.id 
                                    ? { ...customItem, status: customItem.status === 'complete' ? 'incomplete' : 'complete' }
                                    : customItem
                                );
                                const updatedTripData = {
                                  ...tripData,
                                  customReadinessItems: updatedCustomItems
                                };
                                setTripData(updatedTripData);
                                const updatedTrips = userTrips.map(trip => 
                                  trip.id === tripData.id ? updatedTripData : trip
                                );
                                setUserTrips(updatedTrips);
                              }
                            }}
                          >
                            {item.status === 'complete' ? (
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            ) : item.urgent ? (
                              <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center hover:bg-amber-50 transition-colors">
                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
                                <X className="w-3 h-3 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">{item.title}</span>
                              {item.urgent && (
                                <Badge variant="destructive" className="ml-2 text-xs px-1.5 py-0">
                                  Urgent
                                </Badge>
                              )}
                              {(item as any).isCustom && (
                                <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0">
                                  Custom
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{item.subtitle}</span>
                          </div>
                          {showReadinessEditMode && !(item as any).isCustom && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                const hiddenItems = tripData.hiddenReadinessItems || [];
                                const updatedHiddenItems = [...hiddenItems, item.id];
                                
                                const updatedTripData = {
                                  ...tripData,
                                  hiddenReadinessItems: updatedHiddenItems
                                };
                                setTripData(updatedTripData);
                                const updatedTrips = userTrips.map(trip => 
                                  trip.id === tripData.id ? updatedTripData : trip
                                );
                                setUserTrips(updatedTrips);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                          {showReadinessEditMode && (item as any).isCustom && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedCustomItems = (tripData.customReadinessItems || []).filter(customItem => customItem.id !== item.id);
                                const updatedTripData = {
                                  ...tripData,
                                  customReadinessItems: updatedCustomItems
                                };
                                setTripData(updatedTripData);
                                const updatedTrips = userTrips.map(trip => 
                                  trip.id === tripData.id ? updatedTripData : trip
                                );
                                setUserTrips(updatedTrips);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                          {!showReadinessEditMode && (
                            <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {showReadinessEditMode && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Add custom reminder..."
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              const newItem = input.value.trim();
                              if (newItem) {
                                const customItem = {
                                  id: `custom-${Date.now()}`,
                                  title: newItem,
                                  subtitle: 'Custom reminder',
                                  category: 'planning',
                                  status: 'incomplete' as const,
                                  isCustom: true
                                };
                                
                                const updatedCustomItems = [...(tripData.customReadinessItems || []), customItem];
                                const updatedTripData = {
                                  ...tripData,
                                  customReadinessItems: updatedCustomItems
                                };
                                setTripData(updatedTripData);
                                const updatedTrips = userTrips.map(trip => 
                                  trip.id === tripData.id ? updatedTripData : trip
                                );
                                setUserTrips(updatedTrips);
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            const newItem = input.value.trim();
                            if (newItem) {
                              const customItem = {
                                id: `custom-${Date.now()}`,
                                title: newItem,
                                subtitle: 'Custom reminder',
                                category: 'planning',
                                status: 'incomplete' as const,
                                isCustom: true
                              };
                              
                              const updatedCustomItems = [...(tripData.customReadinessItems || []), customItem];
                              const updatedTripData = {
                                ...tripData,
                                customReadinessItems: updatedCustomItems
                              };
                              setTripData(updatedTripData);
                              const updatedTrips = userTrips.map(trip => 
                                trip.id === tripData.id ? updatedTripData : trip
                              );
                              setUserTrips(updatedTrips);
                              input.value = '';
                            }
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                </CardContent>
              </Card>
              
              {/* Who's Going Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Who's Going</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tripData.adults && tripData.adults.map((adult, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">{adult.name?.[0] || 'A'}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{adult.name || 'Adult'}</div>
                          <div className="text-xs text-gray-500">Organizer</div>
                        </div>
                      </div>
                    ))}
                    {tripData.kids && tripData.kids.map((kid, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-pink-700">{kid.name?.[0] || 'K'}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{kid.name || 'Child'} ({kid.age}yr)</div>
                          <div className="text-xs text-gray-500">Traveler</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Traveler Button */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setShowAddTravelerModal(true);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Traveler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                  <TabsTrigger value="travel">Travel</TabsTrigger>
                  <TabsTrigger value="packing">Packing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="itinerary" className="mt-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Daily Itinerary</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            View Calendar
                          </Button>
                          <Button size="sm" onClick={() => setShowAddActivityModal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Activity
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        // Generate all dates for the trip
                        const allTripDates: string[] = [];
                        
                        if (tripData.startDate && tripData.endDate) {
                          const start = new Date(tripData.startDate);
                          const end = new Date(tripData.endDate);
                          const current = new Date(start);
                          
                          while (current <= end) {
                            const dateStr = current.toISOString().split('T')[0];
                            allTripDates.push(dateStr);
                            current.setDate(current.getDate() + 1);
                          }
                        }
                        
                        // Group all itinerary items by date (activities, flights, transportation, accommodations)
                        const itineraryItemsByDate = {} as Record<string, any[]>;
                        
                        // Add activities
                        (tripData.activities || []).forEach(activity => {
                          const date = activity.date;
                          if (!itineraryItemsByDate[date]) {
                            itineraryItemsByDate[date] = [];
                          }
                          itineraryItemsByDate[date].push({
                            ...activity,
                            itemType: 'activity',
                            time: activity.time || '00:00'
                          });
                        });
                        
                        // Add flights
                        (tripData.flights || []).forEach(flight => {
                          const date = flight.date || flight.departureTime?.split('T')[0];
                          if (date) {
                            if (!itineraryItemsByDate[date]) {
                              itineraryItemsByDate[date] = [];
                            }
                            const time = flight.departureTime?.split('T')[1]?.substring(0, 5) || flight.time || '00:00';
                            itineraryItemsByDate[date].push({
                              ...flight,
                              itemType: 'flight',
                              time: time,
                              name: `${flight.departure || flight.from} → ${flight.arrival || flight.to}`,
                              location: `Flight ${flight.flightNumber || ''}`
                            });
                          }
                        });
                        
                        // Add transportation
                        (tripData.transportation || []).forEach(transport => {
                          const date = transport.date;
                          if (date) {
                            if (!itineraryItemsByDate[date]) {
                              itineraryItemsByDate[date] = [];
                            }
                            itineraryItemsByDate[date].push({
                              ...transport,
                              itemType: 'transportation',
                              time: transport.time || '00:00',
                              name: transport.details || transport.type || 'Transportation'
                            });
                          }
                        });
                        
                        // Add accommodations (check-in dates)
                        (tripData.accommodations || tripData.hotels || []).forEach(accommodation => {
                          const checkInDate = accommodation.checkIn;
                          if (checkInDate) {
                            if (!itineraryItemsByDate[checkInDate]) {
                              itineraryItemsByDate[checkInDate] = [];
                            }
                            itineraryItemsByDate[checkInDate].push({
                              ...accommodation,
                              itemType: 'accommodation',
                              time: '15:00', // Default check-in time
                              name: `Check-in: ${accommodation.name || 'Accommodation'}`
                            });
                          }
                          
                          // Also add check-out dates
                          const checkOutDate = accommodation.checkOut;
                          if (checkOutDate && checkOutDate !== checkInDate) {
                            if (!itineraryItemsByDate[checkOutDate]) {
                              itineraryItemsByDate[checkOutDate] = [];
                            }
                            itineraryItemsByDate[checkOutDate].push({
                              ...accommodation,
                              itemType: 'accommodation',
                              time: '11:00', // Default check-out time
                              name: `Check-out: ${accommodation.name || 'Accommodation'}`
                            });
                          }
                        });
                        
                        // Sort items within each date by time
                        Object.keys(itineraryItemsByDate).forEach(date => {
                          itineraryItemsByDate[date].sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
                        });
                        
                                                
                        const toggleDay = (date: string) => {
                          setCollapsedDays(prev => ({ ...prev, [date]: !prev[date] }));
                        };
                        
                        if (allTripDates.length === 0) {
                          return (
                            <div className="text-center py-12">
                              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500">Please set trip dates in the trip wizard</p>
                              <p className="text-sm text-gray-400 mt-1">We'll generate your daily itinerary once dates are set</p>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="space-y-4">
                            {allTripDates.map((date, index) => {
                              const itineraryItems = itineraryItemsByDate[date] || [];
                              const activities = itineraryItems.filter(item => item.itemType === 'activity');
                              const dayNumber = index + 1;
                              const formatDate = new Date(date).toLocaleDateString('en-US', { 
                                month: 'numeric', 
                                day: 'numeric' 
                              });
                              const dayName = new Date(date).toLocaleDateString('en-US', { 
                                weekday: 'long' 
                              });
                              const isCollapsed = collapsedDays[date] ?? (itineraryItems.length === 0);
                              
                              return (
                                <div key={date} className="border rounded-lg overflow-hidden">
                                  {/* Collapsible Day Header */}
                                  <button
                                    onClick={() => toggleDay(date)}
                                    className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors p-4"
                                  >
                                    <div className="flex items-center space-x-4">
                                      <div className="text-left">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                          Day {dayNumber} - {formatDate}
                                        </h3>
                                        <p className="text-sm text-gray-600">{dayName}</p>
                                      </div>
                                      {itineraryItems.length > 0 && (
                                        <Badge variant="secondary">
                                          {itineraryItems.length} {itineraryItems.length === 1 ? 'item' : 'items'}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      {itineraryItems.length === 0 && (
                                        <span className="text-sm text-gray-400 mr-2">No items yet</span>
                                      )}
                                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${!isCollapsed ? 'rotate-90' : ''}`} />
                                    </div>
                                  </button>
                                  
                                  {/* Expandable Content */}
                                  {!isCollapsed && (
                                    <div className="p-4 bg-white border-t">
                                      {itineraryItems.length === 0 ? (
                                        <div className="text-center py-8">
                                          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                          <p className="text-gray-500 mb-3">No items planned for this day</p>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => {
                                              // Pre-fill the date in the add activity modal
                                              setNewActivity(prev => ({ ...prev, date }));
                                              setShowAddActivityModal(true);
                                            }}
                                          >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Activity for Day {dayNumber}
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="space-y-3">
                                          {itineraryItems.map((item) => (
                                            <div key={item.id || `${item.itemType}-${item.name}`} className="border rounded-lg p-4">
                                              <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                  <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="font-medium text-lg">{item.name}</h3>
                                                    {item.priority === 'high' && (
                                                      <Badge variant="destructive">Must do</Badge>
                                                    )}
                                                    {item.bookingRequired && (
                                                      <Badge variant="outline">Booking required</Badge>
                                                    )}
                                                  </div>
                                                  
                                                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                                    <div className="flex items-center">
                                                      <Calendar className="w-4 h-4 mr-1" />
                                                      {new Date(date).toLocaleDateString()}
                                                      {item.time && ` at ${item.time}`}
                                                    </div>
                                                    {item.duration && (
                                                      <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {item.duration}
                                                      </div>
                                                    )}
                                                    {item.location && (
                                                      <div className="flex items-center">
                                                        <MapPin className="w-4 h-4 mr-1" />
                                                        {item.location}
                                                      </div>
                                                    )}
                                                    {item.cost && (
                                                      <div className="flex items-center">
                                                        <DollarSign className="w-4 h-4 mr-1" />
                                                        {item.cost} {item.costType === 'per-person' ? 'per person' : item.costType === 'total' ? 'total' : ''}
                                                      </div>
                                                    )}
                                                  </div>
                                                  
                                                  {item.familyNotes && (
                                                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                                                      <div className="flex items-start">
                                                        <Users className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                                                        <p className="text-sm text-blue-700"><strong>Family Notes:</strong> {item.familyNotes}</p>
                                                      </div>
                                                    </div>
                                                  )}
                                                  
                                                  {item.participants && item.participants.length > 0 && (
                                                    <div className="flex items-center space-x-2">
                                                      <span className="text-sm text-gray-500">Participants:</span>
                                                      <div className="flex space-x-1">
                                                        {item.participants.map((participantId, idx) => {
                                                          const [type, index] = participantId.split('-');
                                                          const member = type === 'adult' 
                                                            ? tripData.adults?.[parseInt(index)]
                                                            : tripData.kids?.[parseInt(index)];
                                                          
                                                          return member ? (
                                                            <div key={idx} className={`w-6 h-6 ${type === 'adult' ? 'bg-blue-100' : 'bg-pink-100'} rounded-full flex items-center justify-center`}>
                                                              <span className={`text-xs font-medium ${type === 'adult' ? 'text-blue-700' : 'text-pink-700'}`}>
                                                                {member.name?.[0] || (type === 'adult' ? 'A' : 'K')}
                                                              </span>
                                                            </div>
                                                          ) : null;
                                                        })}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                                
                                                <div className="flex items-center space-x-2">
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => {
                                                      if (item.itemType === 'activity') {
                                                        setEditingActivity(item);
                                                        setShowAddActivityModal(true);
                                                      }
                                                    }}
                                                    disabled={item.itemType !== 'activity'}
                                                  >
                                                    <Edit className="w-4 h-4" />
                                                  </Button>
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => {
                                                      let updatedTripData = { ...tripData };
                                                      
                                                      if (item.itemType === 'activity') {
                                                        const updatedActivities = tripData.activities?.filter(a => a.id !== item.id) || [];
                                                        updatedTripData = { ...tripData, activities: updatedActivities };
                                                      } else if (item.itemType === 'flight') {
                                                        const updatedFlights = tripData.flights?.filter(f => f.id !== item.id) || [];
                                                        updatedTripData = { ...tripData, flights: updatedFlights };
                                                      } else if (item.itemType === 'transportation') {
                                                        const updatedTransportation = tripData.transportation?.filter(t => t.id !== item.id) || [];
                                                        updatedTripData = { ...tripData, transportation: updatedTransportation };
                                                      } else if (item.itemType === 'accommodation') {
                                                        const updatedAccommodations = (tripData.accommodations || tripData.hotels || []).filter(h => h.id !== item.id);
                                                        updatedTripData = { ...tripData, accommodations: updatedAccommodations, hotels: updatedAccommodations };
                                                      }
                                                      
                                                      setTripData(updatedTripData);
                                                      
                                                      const updatedTrips = userTrips.map(trip => 
                                                        trip.id === tripData.id ? updatedTripData : trip
                                                      );
                                                      setUserTrips(updatedTrips);
                                                    }}
                                                    disabled={item.itemType === 'accommodation'}
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="travel" className="mt-6">
                  <div className="space-y-6">
                    {/* Flights Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Compass className="w-5 h-5 mr-2" />
                          Getting There
                        </CardTitle>
                        <CardDescription>
                          How will you travel to {tripData.city}?
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {(!tripData.flights || tripData.flights.length === 0) && (!tripData.transportation?.some((t: any) => ['driving', 'train', 'bus'].includes(t.type))) ? (
                          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                            <Compass className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Choose your travel method</h3>
                            <p className="text-gray-500 mb-6">
                              Add flights, or if you're driving/taking the train, add that transportation instead
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <Button onClick={() => {
                                setShowFlightModal(true);
                              }}>
                                <Plane className="w-4 h-4 mr-2" />
                                Add Flight (MAIN)
                              </Button>
                              <Button variant="outline" onClick={() => setShowTransportModal(true)}>
                                <Car className="w-4 h-4 mr-2" />
                                Driving/Train
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Show flights if any */}
                            {tripData.flights?.map((flight: any, index: number) => (
                              <div key={`flight-${index}`} className="border rounded-lg p-4 relative">
                                {/* Edit and Delete buttons in top right corner */}
                                <div className="absolute top-3 right-3 flex space-x-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => {
                                      setEditingFlightIndex(index);
                                      setFlightFormData({
                                        airline: flight.airline || '',
                                        flightNumber: flight.flightNumber || '',
                                        departure: flight.departure || flight.from || '',
                                        arrival: flight.arrival || flight.to || '',
                                        departureTime: flight.departureTime || (flight.date + 'T' + (flight.time || '')),
                                        arrivalTime: flight.arrivalTime || '',
                                        confirmationNumber: flight.confirmationNumber || '',
                                        status: flight.status || 'confirmed'
                                      });
                                      setShowFlightModal(true);
                                    }}
                                    className="h-8 w-8 p-0 hover:bg-gray-100"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => {
                                      const updatedFlights = (tripData.flights || []).filter((f: any, i: number) => i !== index);
                                      const updatedTripData = { ...tripData, flights: updatedFlights };
                                      setTripData(updatedTripData);
                                      
                                      const updatedTrips = userTrips.map(trip => 
                                        trip.id === tripData.id ? updatedTripData : trip
                                      );
                                      setUserTrips(updatedTrips);
                                    }}
                                    className="h-8 w-8 p-0 hover:bg-gray-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                
                                {/* Main flight info */}
                                <div className="pr-12">
                                  <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                      <Plane className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                      {/* Flight route and airline */}
                                      <div className="flex items-center space-x-2 mb-1">
                                        <h4 className="font-semibold text-lg">{flight.departure || flight.from} → {flight.arrival || flight.to}</h4>
                                        <Badge variant={flight.status === 'booked' || flight.status === 'confirmed' ? 'default' : 'secondary'}>
                                          {flight.status || 'planned'}
                                        </Badge>
                                      </div>
                                      
                                      {/* Airline and flight number */}
                                      {(flight.airline || flight.flightNumber) && (
                                        <p className="text-sm text-gray-600 mb-1">
                                          {flight.airline && <span className="font-medium">{flight.airline}</span>}
                                          {flight.airline && flight.flightNumber && <span> • </span>}
                                          {flight.flightNumber && <span>Flight {flight.flightNumber}</span>}
                                        </p>
                                      )}
                                      
                                      {/* Date and time */}
                                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        {flight.departureTime && (
                                          <span>
                                            <strong>Departure:</strong> {new Date(flight.departureTime).toLocaleDateString()} at {new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                          </span>
                                        )}
                                        {!flight.departureTime && flight.date && (
                                          <span>
                                            <strong>Date:</strong> {flight.date} {flight.time && `at ${flight.time}`}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Confirmation number */}
                                      {flight.confirmationNumber && (
                                        <div className="mt-2 text-sm">
                                          <span className="text-gray-600">Confirmation: </span>
                                          <span className="font-medium text-gray-900">{flight.confirmationNumber}</span>
                                        </div>
                                      )}
                                      
                                      {/* Assigned Family Members */}
                                      {flight.assignedMembers && flight.assignedMembers.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-sm text-gray-600 mb-2">
                                            <strong>Using this flight:</strong>
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            {flight.assignedMembers.map((memberId: string) => {
                                              // Parse member ID to get type and index
                                              const [memberType, memberIndex] = memberId.split('-');
                                              let member = null;
                                              let bgColor = '';
                                              
                                              if (memberType === 'adult' && tripData.adults) {
                                                member = tripData.adults[parseInt(memberIndex)];
                                                bgColor = 'bg-blue-100 text-blue-700';
                                              } else if (memberType === 'kid' && tripData.kids) {
                                                member = tripData.kids[parseInt(memberIndex)];
                                                bgColor = 'bg-pink-100 text-pink-700';
                                              }
                                              
                                              if (!member) return null;
                                              
                                              return (
                                                <div key={memberId} className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${bgColor}`}>
                                                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-medium">{member.name?.[0] || (memberType === 'adult' ? 'A' : 'K')}</span>
                                                  </div>
                                                  <span className="font-medium">{member.name || (memberType === 'adult' ? 'Adult' : 'Kid')}</span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Show primary transportation (driving/train/bus) */}
                            {tripData.transportation?.filter((t: any) => ['driving', 'train', 'bus'].includes(t.type)).map((transport: any, originalIndex: number) => {
                              const getTransportIcon = (type: string) => {
                                switch (type) {
                                  case 'driving': return <Car className="w-6 h-6 text-green-600" />;
                                  case 'train': return <span className="text-xl">🚄</span>;
                                  case 'bus': return <span className="text-xl">🚌</span>;
                                  default: return <Car className="w-6 h-6 text-green-600" />;
                                }
                              };
                              
                              const getTypeLabel = (type: string) => {
                                switch (type) {
                                  case 'driving': return 'Driving';
                                  case 'train': return 'Train';
                                  case 'bus': return 'Bus';
                                  default: return transport.type;
                                }
                              };
                              
                              // Find the actual index in the full transportation array
                              const actualIndex = tripData.transportation.findIndex((t: any) => t === transport);
                              
                              return (
                                <div key={`primary-transport-${originalIndex}`} className="border rounded-lg p-4 relative">
                                  {/* Edit and Delete buttons in top right corner */}
                                  <div className="absolute top-3 right-3 flex space-x-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => {
                                        setEditingTransportationIndex(actualIndex);
                                        setTransportFormData({
                                          type: transport.type || 'driving',
                                          details: transport.details || '',
                                          departure: transport.departure || '',
                                          arrival: transport.arrival || '',
                                          date: transport.date || transport.dates || '',
                                          time: transport.time || '',
                                          assignedMembers: transport.assignedMembers || [],
                                          confirmationNumber: transport.confirmationNumber || '',
                                          status: transport.status || 'confirmed'
                                        });
                                        setShowTransportModal(true);
                                      }}
                                      className="h-8 w-8 p-0 hover:bg-gray-100"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => {
                                        const updatedTransportation = tripData.transportation?.filter((t: any, index: number) => index !== actualIndex) || [];
                                        const updatedTripData = { ...tripData, transportation: updatedTransportation };
                                        setTripData(updatedTripData);
                                        
                                        const updatedTrips = userTrips.map(trip => 
                                          trip.id === tripData.id ? updatedTripData : trip
                                        );
                                        setUserTrips(updatedTrips);
                                      }}
                                      className="h-8 w-8 p-0 hover:bg-gray-100"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  
                                  {/* Main transportation info */}
                                  <div className="pr-12">
                                    <div className="flex items-start space-x-4">
                                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        {getTransportIcon(transport.type)}
                                      </div>
                                      <div className="flex-1">
                                        {/* Transport type and status */}
                                        <div className="flex items-center space-x-2 mb-1">
                                          <h4 className="font-semibold text-lg">{getTypeLabel(transport.type)}</h4>
                                          <Badge variant={transport.status === 'booked' || transport.status === 'confirmed' ? 'default' : 'secondary'}>
                                            {transport.status || 'planned'}
                                          </Badge>
                                        </div>
                                        
                                        {/* Details */}
                                        {transport.details && (
                                          <p className="text-sm text-gray-600 mb-1">
                                            <strong>Details:</strong> {transport.details}
                                          </p>
                                        )}
                                        
                                        {/* Route information */}
                                        {transport.departure && transport.arrival && (
                                          <p className="text-sm text-gray-600 mb-1">
                                            <strong>Route:</strong> {transport.departure} → {transport.arrival}
                                          </p>
                                        )}
                                        
                                        {/* Date and time */}
                                        {(transport.date || transport.dates) && (
                                          <p className="text-sm text-gray-600 mb-1">
                                            <strong>Date:</strong> {transport.date || transport.dates}
                                            {transport.time && <span> at {transport.time}</span>}
                                          </p>
                                        )}
                                        
                                        {/* Assigned Family Members */}
                                        {transport.assignedMembers && transport.assignedMembers.length > 0 && (
                                          <div className="mt-2">
                                            <p className="text-sm text-gray-600 mb-2">
                                              <strong>Using this transport:</strong>
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                              {transport.assignedMembers.map((memberId: string) => {
                                                // Parse member ID to get type and index
                                                const [memberType, memberIndex] = memberId.split('-');
                                                let member = null;
                                                let bgColor = '';
                                                
                                                if (memberType === 'adult' && tripData.adults) {
                                                  member = tripData.adults[parseInt(memberIndex)];
                                                  bgColor = 'bg-blue-100 text-blue-700';
                                                } else if (memberType === 'kid' && tripData.kids) {
                                                  member = tripData.kids[parseInt(memberIndex)];
                                                  bgColor = 'bg-pink-100 text-pink-700';
                                                }
                                                
                                                if (!member) return null;
                                                
                                                return (
                                                  <div key={memberId} className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${bgColor}`}>
                                                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                                      <span className="text-xs font-medium">{member.name?.[0] || (memberType === 'adult' ? 'A' : 'K')}</span>
                                                    </div>
                                                    <span>{member.name || (memberType === 'adult' ? 'Adult' : 'Kid')}</span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Confirmation number */}
                                        {transport.confirmationNumber && (
                                          <div className="mt-2 text-sm">
                                            <span className="text-gray-600">Confirmation: </span>
                                            <span className="font-medium text-gray-900">{transport.confirmationNumber}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            
                            <div className="flex gap-2">
                              {(!tripData.flights || tripData.flights.length === 0) && (
                                <Button variant="outline" onClick={() => setShowFlightModal(true)}>
                                  <Plane className="w-4 h-4 mr-2" />
                                  Add Flight
                                </Button>
                              )}
                              {tripData.flights?.length > 0 && (
                                <Button variant="outline" onClick={() => setShowFlightModal(true)}>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Another Flight
                                </Button>
                              )}
                              <Button variant="outline" onClick={() => setShowTransportModal(true)}>
                                <Car className="w-4 h-4 mr-2" />
                                Add Transportation
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Accommodations Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Home className="w-5 h-5 mr-2" />
                          Accommodations
                        </CardTitle>
                        <CardDescription>
                          Where will you stay in {tripData.city}?
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {(!tripData.accommodations || tripData.accommodations.length === 0) ? (
                          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                            <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No accommodations planned</h3>
                            <p className="text-gray-500 mb-6">
                              Add hotels, rentals, or family stays for your {tripData.kids?.length ? 'family' : 'group'} in {tripData.city}
                            </p>
                            <Button onClick={() => setShowHotelModal(true)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Accommodation
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {(tripData.accommodations || tripData.hotels || []).map((accommodation: any, index: number) => {
                              // Get accommodation type and icon
                              const getAccommodationIcon = (type: string) => {
                                switch (type) {
                                  case 'hotel': return <Hotel className="w-5 h-5 text-blue-600" />;
                                  case 'rental': return <Home className="w-5 h-5 text-green-600" />;
                                  case 'family': return <Users className="w-5 h-5 text-purple-600" />;
                                  case 'hostel': return <Hotel className="w-5 h-5 text-orange-600" />;
                                  case 'camping': return <span className="text-lg">🏕️</span>;
                                  default: return <Home className="w-5 h-5 text-gray-600" />;
                                }
                              };

                              const getAccommodationBg = (type: string) => {
                                switch (type) {
                                  case 'hotel': return 'bg-blue-100';
                                  case 'rental': return 'bg-green-100';
                                  case 'family': return 'bg-purple-100';
                                  case 'hostel': return 'bg-orange-100';
                                  case 'camping': return 'bg-green-100';
                                  default: return 'bg-gray-100';
                                }
                              };

                              const getTypeLabel = (type: string) => {
                                switch (type) {
                                  case 'hotel': return 'Hotel';
                                  case 'rental': return 'Rental';
                                  case 'family': return 'Family/Friends';
                                  case 'hostel': return 'Hostel';
                                  case 'camping': return 'Camping';
                                  default: return 'Accommodation';
                                }
                              };

                              const type = accommodation.type || 'hotel'; // Default to hotel for backward compatibility
                              
                              return (
                                <div key={index} className="border rounded-lg p-4 relative">
                                  {/* Edit and Delete buttons in top right corner */}
                                  <div className="absolute top-3 right-3 flex space-x-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => {
                                        setEditingAccommodationIndex(index);
                                        setAccommodationFormData({
                                          type: accommodation.type || 'hotel',
                                          name: accommodation.name || '',
                                          address: accommodation.address || '',
                                          checkIn: accommodation.checkIn || '',
                                          checkOut: accommodation.checkOut || '',
                                          details: accommodation.roomType || accommodation.details || '',
                                          roomQuantity: accommodation.roomQuantity || '1',
                                          roomAssignment: accommodation.roomAssignment || '',
                                          assignedMembers: accommodation.assignedMembers || [],
                                          status: accommodation.status || 'confirmed',
                                          confirmationNumber: accommodation.confirmationNumber || ''
                                        });
                                        setShowHotelModal(true);
                                      }}
                                      className="h-8 w-8 p-0 hover:bg-gray-100"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => {
                                        const updatedAccommodations = (tripData.accommodations || tripData.hotels || []).filter((a: any, i: number) => i !== index);
                                        const updatedTripData = { ...tripData, accommodations: updatedAccommodations };
                                        setTripData(updatedTripData);
                                        
                                        const updatedTrips = userTrips.map(trip => 
                                          trip.id === tripData.id ? updatedTripData : trip
                                        );
                                        setUserTrips(updatedTrips);
                                      }}
                                      className="h-8 w-8 p-0 hover:bg-gray-100"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  
                                  {/* Main accommodation info */}
                                  <div className="pr-12">
                                    <div className="flex items-start space-x-4">
                                      <div className={`w-12 h-12 ${getAccommodationBg(type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                                        {getAccommodationIcon(type)}
                                      </div>
                                      <div className="flex-1">
                                        {/* Accommodation name and type */}
                                        <div className="flex items-center space-x-2 mb-1">
                                          <h4 className="font-semibold text-lg">{accommodation.name}</h4>
                                          <Badge variant={accommodation.status === 'confirmed' || accommodation.status === 'booked' ? 'default' : 'secondary'}>
                                            {accommodation.status || 'planned'}
                                          </Badge>
                                        </div>
                                        
                                        {/* Type and details */}
                                        <p className="text-sm text-gray-600 mb-1">
                                          <span className="font-medium">{getTypeLabel(type)}</span>
                                          {accommodation.roomQuantity && parseInt(accommodation.roomQuantity) > 1 && <span> • {accommodation.roomQuantity} rooms</span>}
                                          {accommodation.details && <span> • {accommodation.details}</span>}
                                          {accommodation.roomType && <span> • {accommodation.roomType}</span>}
                                        </p>
                                        
                                        {/* Address */}
                                        {accommodation.address && (
                                          <p className="text-sm text-gray-600 mb-1">
                                            <strong>Address:</strong> {accommodation.address}
                                          </p>
                                        )}
                                        
                                        {/* Room Assignment */}
                                        {accommodation.roomAssignment && (
                                          <p className="text-sm text-gray-600 mb-1">
                                            <strong>Room:</strong> {accommodation.roomAssignment}
                                          </p>
                                        )}
                                        
                                        {/* Assigned Family Members */}
                                        {accommodation.assignedMembers && accommodation.assignedMembers.length > 0 && (
                                          <div className="mt-2">
                                            <p className="text-sm text-gray-600 mb-2">
                                              <strong>Staying here:</strong>
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                              {accommodation.assignedMembers.map((memberId: string) => {
                                                // Parse member ID to get type and index
                                                const [memberType, memberIndex] = memberId.split('-');
                                                let member = null;
                                                let bgColor = '';
                                                
                                                if (memberType === 'adult' && tripData.adults) {
                                                  member = tripData.adults[parseInt(memberIndex)];
                                                  bgColor = 'bg-blue-100 text-blue-700';
                                                } else if (memberType === 'kid' && tripData.kids) {
                                                  member = tripData.kids[parseInt(memberIndex)];
                                                  bgColor = 'bg-pink-100 text-pink-700';
                                                }
                                                
                                                if (!member) return null;
                                                
                                                return (
                                                  <div key={memberId} className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${bgColor}`}>
                                                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                                      <span className="text-xs font-medium">{member.name?.[0] || (memberType === 'adult' ? 'A' : 'K')}</span>
                                                    </div>
                                                    <span>{member.name || (memberType === 'adult' ? 'Adult' : 'Kid')}</span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Check-in/out dates */}
                                        {accommodation.checkIn && accommodation.checkOut && (
                                          <p className="text-sm text-gray-600 mb-1">
                                            <strong>Stay:</strong> {new Date(accommodation.checkIn).toLocaleDateString()} - {new Date(accommodation.checkOut).toLocaleDateString()}
                                            {accommodation.nights && <span> ({accommodation.nights} nights)</span>}
                                          </p>
                                        )}
                                        
                                        {/* Confirmation number */}
                                        {accommodation.confirmationNumber && (
                                          <div className="mt-2 text-sm">
                                            <span className="text-gray-600">Confirmation: </span>
                                            <span className="font-medium text-gray-900">{accommodation.confirmationNumber}</span>
                                          </div>
                                        )}
                                        
                                        {/* Notes */}
                                        {accommodation.notes && (
                                          <div className="mt-2 text-sm text-gray-600">
                                            <strong>Notes:</strong> {accommodation.notes}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <Button variant="outline" onClick={() => setShowHotelModal(true)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Another Accommodation
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Transportation Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Car className="w-5 h-5 mr-2" />
                          Local Transportation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(!tripData.transportation || tripData.transportation.length === 0) ? (
                          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                            <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No transportation arranged</h3>
                            <p className="text-gray-500 mb-4">
                              Add rental cars, train tickets, or other local transport
                            </p>
                            <Button variant="outline" onClick={() => setShowTransportModal(true)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Transportation
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {tripData.transportation.map((transport: any, index: number) => {
                              const getTransportIcon = (type: string) => {
                                switch (type) {
                                  case 'driving': return <Car className="w-6 h-6 text-orange-600" />;
                                  case 'train': return <span className="text-xl">🚄</span>;
                                  case 'bus': return <span className="text-xl">🚌</span>;
                                  case 'rental': return <Car className="w-6 h-6 text-blue-600" />;
                                  case 'taxi': return <span className="text-xl">🚕</span>;
                                  case 'subway': return <span className="text-xl">🚇</span>;
                                  default: return <Car className="w-6 h-6 text-orange-600" />;
                                }
                              };
                              
                              const getTypeLabel = (type: string) => {
                                switch (type) {
                                  case 'driving': return 'Personal Car';
                                  case 'train': return 'Train/Railway';
                                  case 'bus': return 'Bus/Coach';
                                  case 'rental': return 'Rental Car';
                                  case 'taxi': return 'Taxi/Rideshare';
                                  case 'subway': return 'Subway/Metro';
                                  default: return transport.type;
                                }
                              };
                              
                              return (
                                <div key={index} className="border rounded-lg p-4 relative">
                                  {/* Edit and Delete buttons in top right corner */}
                                  <div className="absolute top-3 right-3 flex space-x-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => {
                                        setEditingTransportationIndex(index);
                                        setTransportFormData({
                                          type: transport.type || 'driving',
                                          details: transport.details || '',
                                          departure: transport.departure || '',
                                          arrival: transport.arrival || '',
                                          date: transport.date || transport.dates || '',
                                          time: transport.time || '',
                                          assignedMembers: transport.assignedMembers || [],
                                          confirmationNumber: transport.confirmationNumber || '',
                                          status: transport.status || 'confirmed'
                                        });
                                        setShowTransportModal(true);
                                      }}
                                      className="h-8 w-8 p-0 hover:bg-gray-100"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => {
                                        const updatedTransportation = tripData.transportation?.filter((t: any, i: number) => i !== index) || [];
                                        const updatedTripData = { ...tripData, transportation: updatedTransportation };
                                        setTripData(updatedTripData);
                                        
                                        const updatedTrips = userTrips.map(trip => 
                                          trip.id === tripData.id ? updatedTripData : trip
                                        );
                                        setUserTrips(updatedTrips);
                                      }}
                                      className="h-8 w-8 p-0 hover:bg-gray-100"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  
                                  {/* Main transportation info */}
                                  <div className="pr-12">
                                    <div className="flex items-start space-x-4">
                                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        {getTransportIcon(transport.type)}
                                      </div>
                                      <div className="flex-1">
                                        {/* Transport type and status */}
                                        <div className="flex items-center space-x-2 mb-1">
                                          <h4 className="font-semibold text-lg">{getTypeLabel(transport.type)}</h4>
                                          <Badge variant={transport.status === 'booked' || transport.status === 'confirmed' ? 'default' : 'secondary'}>
                                            {transport.status || 'planned'}
                                          </Badge>
                                        </div>
                                        
                                        {/* Details */}
                                        {transport.details && (
                                          <p className="text-sm text-gray-600 mb-1">
                                            <strong>Details:</strong> {transport.details}
                                          </p>
                                        )}
                                        
                                        {/* Route information */}
                                        {transport.departure && transport.arrival && (
                                          <p className="text-sm text-gray-600 mb-1">
                                            <strong>Route:</strong> {transport.departure} → {transport.arrival}
                                          </p>
                                        )}
                                        
                                        {/* Date and time */}
                                        {(transport.date || transport.dates) && (
                                          <p className="text-sm text-gray-600 mb-1">
                                            <strong>Date:</strong> {transport.date || transport.dates}
                                            {transport.time && <span> at {transport.time}</span>}
                                          </p>
                                        )}
                                        
                                        {/* Assigned Family Members */}
                                        {transport.assignedMembers && transport.assignedMembers.length > 0 && (
                                          <div className="mt-2">
                                            <p className="text-sm text-gray-600 mb-2">
                                              <strong>Using this transport:</strong>
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                              {transport.assignedMembers.map((memberId: string) => {
                                                // Parse member ID to get type and index
                                                const [memberType, memberIndex] = memberId.split('-');
                                                let member = null;
                                                let bgColor = '';
                                                
                                                if (memberType === 'adult' && tripData.adults) {
                                                  member = tripData.adults[parseInt(memberIndex)];
                                                  bgColor = 'bg-blue-100 text-blue-700';
                                                } else if (memberType === 'kid' && tripData.kids) {
                                                  member = tripData.kids[parseInt(memberIndex)];
                                                  bgColor = 'bg-pink-100 text-pink-700';
                                                }
                                                
                                                if (!member) return null;
                                                
                                                return (
                                                  <div key={memberId} className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${bgColor}`}>
                                                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                                      <span className="text-xs font-medium">{member.name?.[0] || (memberType === 'adult' ? 'A' : 'K')}</span>
                                                    </div>
                                                    <span>{member.name || (memberType === 'adult' ? 'Adult' : 'Kid')}</span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Confirmation number */}
                                        {transport.confirmationNumber && (
                                          <div className="mt-2 text-sm">
                                            <span className="text-gray-600">Confirmation: </span>
                                            <span className="font-medium text-gray-900">{transport.confirmationNumber}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <Button variant="outline" onClick={() => setShowTransportModal(true)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add More Transportation
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                  </div>
                </TabsContent>
                
                <TabsContent value="packing" className="mt-6">
                  {(() => {
                    // Smart packing analysis based on trip data
                    const getTripDuration = () => {
                      if (!tripData.startDate || !tripData.endDate) return 0;
                      const start = new Date(tripData.startDate);
                      const end = new Date(tripData.endDate);
                      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                    };

                    const getTripSeason = () => {
                      if (!tripData.startDate) return 'unknown';
                      const startDate = new Date(tripData.startDate);
                      const month = startDate.getMonth() + 1; // 1-12
                      
                      if (month >= 3 && month <= 5) return 'spring';
                      if (month >= 6 && month <= 8) return 'summer';
                      if (month >= 9 && month <= 11) return 'fall';
                      return 'winter';
                    };

                    const getClimateCategory = () => {
                      const country = tripData.country?.toLowerCase();
                      if (!country) return 'temperate';
                      
                      // Simplified climate categorization
                      const tropical = ['thailand', 'malaysia', 'indonesia', 'philippines', 'vietnam', 'costa rica', 'colombia', 'brazil'];
                      const cold = ['norway', 'sweden', 'finland', 'iceland', 'russia', 'canada', 'alaska'];
                      const arid = ['egypt', 'morocco', 'jordan', 'israel', 'uae', 'saudi arabia', 'australia'];
                      
                      if (tropical.some(c => country.includes(c))) return 'tropical';
                      if (cold.some(c => country.includes(c))) return 'cold';
                      if (arid.some(c => country.includes(c))) return 'arid';
                      return 'temperate';
                    };

                    const duration = getTripDuration();
                    const season = getTripSeason();
                    const climate = getClimateCategory();
                    const hasKids = tripData.kids && tripData.kids.length > 0;
                    const adultsCount = tripData.adults?.length || 0;
                    const kidsCount = tripData.kids?.length || 0;

                    // Generate smart packing lists
                    const essentialItems = (() => {
                      const base = [
                        'Phone charger',
                        'Camera/phone for photos',
                        'Credit cards & cash',
                        'Emergency contact information'
                      ];

                      // Add travel documents based on destination
                      if (tripData.country && tripData.country !== 'United States') {
                        base.unshift('Passport/ID', 'Visa/Travel Authorization (if required)');
                      } else {
                        base.unshift('Driver\'s License/ID');
                      }

                      // Add booking confirmations
                      if (tripData.flights && tripData.flights.length > 0) {
                        base.push('Flight confirmations');
                      }
                      if (tripData.accommodations && tripData.accommodations.length > 0) {
                        base.push('Accommodation reservations');
                      }

                      // Always recommend insurance
                      base.push('Travel insurance documents');

                      return base;
                    })();

                    const clothingItems = (() => {
                      const base = [
                        `Underwear (${duration + 2} pairs)`,
                        `Socks (${duration + 2} pairs)`,
                        `T-shirts/tops (${Math.max(3, Math.ceil(duration / 2))})`,
                        `Pants/shorts (${Math.max(2, Math.ceil(duration / 3))})`,
                        'Comfortable walking shoes',
                        'Sleepwear'
                      ];

                      if (season === 'winter' || climate === 'cold') {
                        base.push('Warm jacket/coat', 'Sweaters/hoodies', 'Warm hat & gloves', 'Scarf', 'Warm boots');
                      } else if (season === 'summer' || climate === 'tropical') {
                        base.push('Swimwear', 'Sun hat', 'Sandals', 'Light jacket for AC');
                      } else {
                        base.push('Light jacket', 'Versatile layers');
                      }

                      if (climate === 'arid') {
                        base.push('Sun protection clothing', 'Closed-toe shoes for desert');
                      }

                      return base;
                    })();

                    const healthItems = [
                      'Prescription medications',
                      'First aid kit',
                      'Sunscreen',
                      'Personal hygiene items',
                      'Hand sanitizer',
                      'Face masks'
                    ];

                    if (hasKids) {
                      healthItems.push('Children\'s medications', 'Thermometer', 'Kids\' specific toiletries');
                    }

                    const kidsItems = hasKids ? [
                      'Favorite toys/comfort items',
                      'Tablet/entertainment for travel',
                      'Snacks for journey',
                      'Extra clothes (accidents happen)',
                      'Car seat (if needed)',
                      'Stroller/carrier',
                      'Baby wipes',
                      'Diapers (if applicable)'
                    ] : [];

                    const activityItems = (() => {
                      const items = [];
                      const activities = tripData.activities || [];
                      
                      if (activities.some(a => a.name?.toLowerCase().includes('swim') || a.name?.toLowerCase().includes('beach'))) {
                        items.push('Swimwear', 'Beach towel', 'Waterproof bag');
                      }
                      
                      if (activities.some(a => a.name?.toLowerCase().includes('hik') || a.name?.toLowerCase().includes('outdoor'))) {
                        items.push('Hiking shoes', 'Daypack', 'Water bottle', 'Weather protection');
                      }
                      
                      if (activities.some(a => a.name?.toLowerCase().includes('dinner') || a.name?.toLowerCase().includes('restaurant'))) {
                        items.push('Dressy outfit', 'Nice shoes');
                      }

                      if (activities.some(a => a.name?.toLowerCase().includes('museum') || a.name?.toLowerCase().includes('tour'))) {
                        items.push('Comfortable walking shoes', 'Small daypack', 'Portable charger');
                      }

                      return items;
                    })();

                    const packingLists = [
                      { title: 'Travel Essentials', items: [...essentialItems.filter(item => !(tripData.hiddenPackingItems?.[0] || []).includes(item)), ...(tripData.customPackingItems?.[0] || [])], icon: '✈️', color: 'blue' },
                      { title: 'Clothing & Shoes', items: [...clothingItems.filter(item => !(tripData.hiddenPackingItems?.[1] || []).includes(item)), ...(tripData.customPackingItems?.[1] || [])], icon: '👕', color: 'green' },
                      { title: 'Health & Hygiene', items: [...healthItems.filter(item => !(tripData.hiddenPackingItems?.[2] || []).includes(item)), ...(tripData.customPackingItems?.[2] || [])], icon: '🏥', color: 'red' },
                      ...(hasKids ? [{ title: 'Kids Items', items: [...kidsItems.filter(item => !(tripData.hiddenPackingItems?.[3] || []).includes(item)), ...(tripData.customPackingItems?.[3] || [])], icon: '🧸', color: 'pink' }] : []),
                      ...(activityItems.length > 0 ? [{ title: 'Activity Gear', items: [...activityItems.filter(item => !(tripData.hiddenPackingItems?.[hasKids ? 4 : 3] || []).includes(item)), ...(tripData.customPackingItems?.[hasKids ? 4 : 3] || [])], icon: '🎒', color: 'orange' }] : [])
                    ];

                    return (
                      <div className="space-y-6">
                        {/* Trip Summary */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Target className="w-5 h-5 mr-2" />
                              Smart Packing for {tripData.city}
                            </CardTitle>
                            <CardDescription>
                              {duration}-day trip • {season} season • {climate} climate • {adultsCount} adult{adultsCount !== 1 ? 's' : ''}{hasKids ? ` & ${kidsCount} kid${kidsCount !== 1 ? 's' : ''}` : ''}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                              <div>
                                <p className="text-2xl font-bold text-blue-600">{duration}</p>
                                <p className="text-sm text-gray-500">Days</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-green-600">{packingLists.reduce((sum, list) => sum + list.items.length, 0)}</p>
                                <p className="text-sm text-gray-500">Items</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-orange-600">{(tripData.activities || []).length}</p>
                                <p className="text-sm text-gray-500">Activities</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-purple-600">{season.charAt(0).toUpperCase() + season.slice(1)}</p>
                                <p className="text-sm text-gray-500">Season</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Packing Lists */}
                        <div className="grid gap-6">
                          {packingLists.map((list, listIndex) => (
                            <Card key={listIndex}>
                              <CardHeader>
                                <CardTitle className="flex items-center">
                                  <span className="text-xl mr-2">{list.icon}</span>
                                  {list.title}
                                  <Badge variant="secondary" className="ml-auto">
                                    {list.items.length} items
                                  </Badge>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {list.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex items-center space-x-2 group">
                                      <Checkbox 
                                        id={`${listIndex}-${itemIndex}`}
                                        checked={tripData.packingLists?.[listIndex]?.items?.[itemIndex]?.checked || false}
                                        onCheckedChange={(checked) => {
                                          const updatedTripData = {
                                            ...tripData,
                                            packingLists: {
                                              ...tripData.packingLists,
                                              [listIndex]: {
                                                ...tripData.packingLists?.[listIndex],
                                                items: {
                                                  ...tripData.packingLists?.[listIndex]?.items,
                                                  [itemIndex]: { checked }
                                                }
                                              }
                                            }
                                          };
                                          setTripData(updatedTripData);
                                          const updatedTrips = userTrips.map(trip => 
                                            trip.id === tripData.id ? updatedTripData : trip
                                          );
                                          setUserTrips(updatedTrips);
                                        }}
                                      />
                                      <Label 
                                        htmlFor={`${listIndex}-${itemIndex}`} 
                                        className={`text-sm flex-1 cursor-pointer ${tripData.packingLists?.[listIndex]?.items?.[itemIndex]?.checked ? 'line-through text-gray-500' : ''}`}
                                      >
                                        {item}
                                      </Label>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                        onClick={() => {
                                          // Determine if this is a generated item or custom item
                                          const originalGeneratedItems = listIndex === 0 ? essentialItems : 
                                                               listIndex === 1 ? clothingItems :
                                                               listIndex === 2 ? healthItems :
                                                               listIndex === 3 && hasKids ? kidsItems :
                                                               listIndex === (hasKids ? 4 : 3) ? activityItems : [];
                                          
                                          const filteredGeneratedItems = originalGeneratedItems.filter(item => 
                                            !(tripData.hiddenPackingItems?.[listIndex] || []).includes(item)
                                          );
                                          
                                          const isGeneratedItem = itemIndex < filteredGeneratedItems.length;
                                          
                                          // Update packing lists state for checkbox tracking first
                                          const currentPackingLists = tripData.packingLists || {};
                                          const updatedPackingLists = { ...currentPackingLists };
                                          
                                          if (updatedPackingLists[listIndex]) {
                                            const listItems = { ...updatedPackingLists[listIndex].items };
                                            // Remove the deleted item
                                            delete listItems[itemIndex];
                                            // Shift all items after the deleted one
                                            for (let i = itemIndex + 1; i < list.items.length; i++) {
                                              if (listItems[i]) {
                                                listItems[i - 1] = listItems[i];
                                                delete listItems[i];
                                              }
                                            }
                                            updatedPackingLists[listIndex] = {
                                              ...updatedPackingLists[listIndex],
                                              items: listItems
                                            };
                                          }

                                          let finalTripData;
                                          
                                          if (isGeneratedItem) {
                                            // For generated items, add to hidden items list
                                            const hiddenItems = tripData.hiddenPackingItems || {};
                                            const updatedHiddenItems = {
                                              ...hiddenItems,
                                              [listIndex]: [...(hiddenItems[listIndex] || []), item]
                                            };
                                            
                                            finalTripData = {
                                              ...tripData,
                                              hiddenPackingItems: updatedHiddenItems,
                                              packingLists: updatedPackingLists
                                            };
                                          } else {
                                            // For custom items, remove from customPackingItems
                                            const customItems = tripData.customPackingItems?.[listIndex] || [];
                                            const customItemIndex = itemIndex - filteredGeneratedItems.length;
                                            const updatedCustomItems = [...customItems];
                                            updatedCustomItems.splice(customItemIndex, 1);
                                            
                                            finalTripData = {
                                              ...tripData,
                                              customPackingItems: {
                                                ...tripData.customPackingItems,
                                                [listIndex]: updatedCustomItems
                                              },
                                              packingLists: updatedPackingLists
                                            };
                                          }
                                          
                                          setTripData(finalTripData);
                                          const updatedTrips = userTrips.map(trip => 
                                            trip.id === tripData.id ? finalTripData : trip
                                          );
                                          setUserTrips(updatedTrips);
                                        }}
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Add Custom Item */}
                                <div className="mt-4 pt-4 border-t">
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      placeholder="Add custom item..."
                                      className="flex-1"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          const input = e.target as HTMLInputElement;
                                          const newItem = input.value.trim();
                                          if (newItem) {
                                            // Add only to custom items, not the entire list
                                            const currentCustomItems = tripData.customPackingItems?.[listIndex] || [];
                                            const updatedCustomItems = [...currentCustomItems, newItem];
                                            
                                            const updatedTripData = {
                                              ...tripData,
                                              customPackingItems: {
                                                ...tripData.customPackingItems,
                                                [listIndex]: updatedCustomItems
                                              }
                                            };
                                            setTripData(updatedTripData);
                                            const updatedTrips = userTrips.map(trip => 
                                              trip.id === tripData.id ? updatedTripData : trip
                                            );
                                            setUserTrips(updatedTrips);
                                            input.value = '';
                                          }
                                        }
                                      }}
                                    />
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                        const newItem = input.value.trim();
                                        if (newItem) {
                                          // Add only to custom items, not the entire list
                                          const currentCustomItems = tripData.customPackingItems?.[listIndex] || [];
                                          const updatedCustomItems = [...currentCustomItems, newItem];
                                          
                                          const updatedTripData = {
                                            ...tripData,
                                            customPackingItems: {
                                              ...tripData.customPackingItems,
                                              [listIndex]: updatedCustomItems
                                            }
                                          };
                                          setTripData(updatedTripData);
                                          const updatedTrips = userTrips.map(trip => 
                                            trip.id === tripData.id ? updatedTripData : trip
                                          );
                                          setUserTrips(updatedTrips);
                                          input.value = '';
                                        }
                                      }}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {/* Packing Tips */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Sparkles className="w-5 h-5 mr-2" />
                              Packing Tips for {tripData.city}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2 text-blue-600">Weather Considerations</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {season === 'summer' && climate === 'tropical' && (
                                    <>
                                      <li>• Pack lightweight, breathable fabrics</li>
                                      <li>• Bring extra sunscreen (SPF 30+)</li>
                                      <li>• Consider mosquito repellent</li>
                                    </>
                                  )}
                                  {season === 'winter' || climate === 'cold' ? (
                                    <>
                                      <li>• Layer clothing for warmth</li>
                                      <li>• Waterproof outerwear recommended</li>
                                      <li>• Pack warm accessories</li>
                                    </>
                                  ) : (
                                    <>
                                      <li>• Check weather forecast before packing</li>
                                      <li>• Bring versatile layers</li>
                                      <li>• Comfortable walking shoes essential</li>
                                    </>
                                  )}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2 text-green-600">Travel Tips</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  <li>• Pack essentials in carry-on</li>
                                  <li>• Roll clothes to save space</li>
                                  <li>• Leave room for souvenirs</li>
                                  {hasKids && <li>• Pack extra kids' clothes in carry-on</li>}
                                  {duration > 7 && <li>• Consider doing laundry mid-trip</li>}
                                  <li>• Take photos of important documents</li>
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })()}
                </TabsContent>
                
              </Tabs>
            </div>
          </div>
        </div>
        
        {/* Add Activity Modal */}
        {showAddActivityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingActivity ? 'Edit Activity' : 'Add Activity'}</h2>
                <Button variant="ghost" size="sm" onClick={() => {
                  setShowAddActivityModal(false);
                  setEditingActivity(null);
                  setActivityValidationErrors({});
                }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Activity Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="activity-name">Activity Name *</Label>
                      <Input
                        id="activity-name"
                        placeholder="e.g., Santiago Bernabéu Stadium Tour"
                        value={newActivity.name}
                        onChange={(e) => setNewActivity(prev => ({...prev, name: e.target.value}))}
                        className={activityValidationErrors.name ? 'border-red-500' : ''}
                      />
                      {activityValidationErrors.name && (
                        <p className="text-sm text-red-500 mt-1">{activityValidationErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="activity-type">Category</Label>
                      <Select value={newActivity.type} onValueChange={(value) => setNewActivity(prev => ({...prev, type: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="attraction">Attraction/Museum</SelectItem>
                          <SelectItem value="restaurant">Restaurant/Dining</SelectItem>
                          <SelectItem value="entertainment">Entertainment/Show</SelectItem>
                          <SelectItem value="outdoor">Outdoor/Park</SelectItem>
                          <SelectItem value="shopping">Shopping</SelectItem>
                          <SelectItem value="transportation">Transportation</SelectItem>
                          <SelectItem value="accommodation">Hotel/Check-in</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="activity-date">Date *</Label>
                      <Input
                        id="activity-date"
                        type="date"
                        value={newActivity.date}
                        onChange={(e) => setNewActivity(prev => ({...prev, date: e.target.value}))}
                        className={activityValidationErrors.date ? 'border-red-500' : ''}
                      />
                      {activityValidationErrors.date && (
                        <p className="text-sm text-red-500 mt-1">{activityValidationErrors.date}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="activity-time">Time</Label>
                      <Input
                        id="activity-time"
                        type="time"
                        value={newActivity.time}
                        onChange={(e) => setNewActivity(prev => ({...prev, time: e.target.value}))}
                        className={activityValidationErrors.time ? 'border-red-500' : ''}
                      />
                      {activityValidationErrors.time && (
                        <p className="text-sm text-red-500 mt-1">{activityValidationErrors.time}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="activity-duration">Duration</Label>
                      <Select value={newActivity.duration} onValueChange={(value) => setNewActivity(prev => ({...prev, duration: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="How long?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30min">30 minutes</SelectItem>
                          <SelectItem value="1hr">1 hour</SelectItem>
                          <SelectItem value="1.5hr">1.5 hours</SelectItem>
                          <SelectItem value="2hr">2 hours</SelectItem>
                          <SelectItem value="3hr">3 hours</SelectItem>
                          <SelectItem value="4hr">4 hours</SelectItem>
                          <SelectItem value="half-day">Half day</SelectItem>
                          <SelectItem value="full-day">Full day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Location</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="activity-location">Location/Venue</Label>
                      <Input
                        id="activity-location"
                        placeholder="e.g., Santiago Bernabéu Stadium"
                        value={newActivity.location}
                        onChange={(e) => setNewActivity(prev => ({...prev, location: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="activity-address">Address</Label>
                      <Input
                        ref={addressInputRef}
                        id="activity-address"
                        placeholder="Full address (optional)"
                        value={newActivity.address}
                        onChange={(e) => setNewActivity(prev => ({...prev, address: e.target.value}))}
                      />
                      {import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                        <p className="text-xs text-gray-500 mt-1">Google Maps will suggest verified addresses</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Cost & Booking */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Cost & Booking</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="activity-cost">Cost</Label>
                      <Input
                        id="activity-cost"
                        placeholder="€25"
                        value={newActivity.cost}
                        onChange={(e) => setNewActivity(prev => ({...prev, cost: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label>Cost Type</Label>
                      <Select value={newActivity.costType} onValueChange={(value) => setNewActivity(prev => ({...prev, costType: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per-person">Per person</SelectItem>
                          <SelectItem value="total">Total cost</SelectItem>
                          <SelectItem value="free">Free</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select value={newActivity.priority} onValueChange={(value) => setNewActivity(prev => ({...prev, priority: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Must do</SelectItem>
                          <SelectItem value="medium">Nice to have</SelectItem>
                          <SelectItem value="low">If time allows</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="booking-required"
                      checked={newActivity.bookingRequired}
                      onCheckedChange={(checked) => setNewActivity(prev => ({...prev, bookingRequired: !!checked}))}
                    />
                    <Label htmlFor="booking-required">Advance booking required</Label>
                  </div>
                  
                  {newActivity.bookingRequired && (
                    <div>
                      <Label htmlFor="booking-url">Booking URL</Label>
                      <Input
                        id="booking-url"
                        placeholder="https://tickets.sagradafamilia.org"
                        value={newActivity.bookingUrl}
                        onChange={(e) => setNewActivity(prev => ({...prev, bookingUrl: e.target.value}))}
                      />
                    </div>
                  )}
                </div>
                
                {/* Family Members & Notes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Family Participation</h3>
                  
                  <div>
                    <Label>Who's participating?</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {/* Adults */}
                      {tripData.adults && tripData.adults.map((adult, idx) => (
                        <div key={`adult-${idx}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`participant-adult-${idx}`}
                            checked={newActivity.participants.includes(`adult-${idx}`)}
                            onCheckedChange={(checked) => {
                              const participantId = `adult-${idx}`;
                              const updated = checked 
                                ? [...newActivity.participants, participantId]
                                : newActivity.participants.filter(p => p !== participantId);
                              setNewActivity(prev => ({...prev, participants: updated}));
                            }}
                          />
                          <Label htmlFor={`participant-adult-${idx}`} className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-700">{adult.name?.[0] || 'A'}</span>
                            </div>
                            <span>{adult.name || 'Adult'}</span>
                          </Label>
                        </div>
                      ))}
                      
                      {/* Kids */}
                      {tripData.kids && tripData.kids.map((kid, idx) => (
                        <div key={`kid-${idx}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`participant-kid-${idx}`}
                            checked={newActivity.participants.includes(`kid-${idx}`)}
                            onCheckedChange={(checked) => {
                              const participantId = `kid-${idx}`;
                              const updated = checked 
                                ? [...newActivity.participants, participantId]
                                : newActivity.participants.filter(p => p !== participantId);
                              setNewActivity(prev => ({...prev, participants: updated}));
                            }}
                          />
                          <Label htmlFor={`participant-kid-${idx}`} className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-pink-700">{kid.name?.[0] || 'K'}</span>
                            </div>
                            <span>{kid.name || 'Child'} ({kid.age}yr)</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="family-notes">Family Notes</Label>
                    <Textarea
                      id="family-notes"
                      placeholder="e.g., Emma might get tired after 2 hours, Lucas loves interactive exhibits"
                      value={newActivity.familyNotes}
                      onChange={(e) => setNewActivity(prev => ({...prev, familyNotes: e.target.value}))}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">These notes will appear in your daily itinerary</p>
                  </div>
                </div>
                
                {/* General Notes */}
                <div>
                  <Label htmlFor="activity-notes">Additional Notes</Label>
                  <Textarea
                    id="activity-notes"
                    placeholder="Any other important details, tips, or reminders"
                    value={newActivity.notes}
                    onChange={(e) => setNewActivity(prev => ({...prev, notes: e.target.value}))}
                    rows={3}
                  />
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                <Button variant="outline" onClick={() => setShowAddActivityModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // Validate activity before saving
                    const errors = validateActivityForm(newActivity);
                    setActivityValidationErrors(errors);
                    
                    if (Object.keys(errors).length > 0) {
                      return; // Don't save if there are validation errors
                    }
                    
                    if (editingActivity) {
                      // Edit mode - update existing activity
                      const updatedActivity = {
                        ...editingActivity,
                        ...newActivity,
                        id: editingActivity.id, // Keep original ID
                        status: editingActivity.status || 'planned'
                      };
                      
                      const updatedActivities = tripData.activities?.map(activity => 
                        activity.id === editingActivity.id ? updatedActivity : activity
                      ) || [];
                      
                      const updatedTripData = {
                        ...tripData,
                        activities: updatedActivities
                      };
                      
                      setTripData(updatedTripData);
                      
                      const updatedTrips = userTrips.map(trip => 
                        trip.id === tripData.id ? updatedTripData : trip
                      );
                      setUserTrips(updatedTrips);
                      
                    } else {
                      // Add mode - create new activity
                      const activityWithId = {
                        ...newActivity,
                        id: Date.now().toString(),
                        status: 'planned'
                      };
                      
                      const updatedTripData = {
                        ...tripData,
                        activities: [...(tripData.activities || []), activityWithId]
                      };
                      
                      setTripData(updatedTripData);
                      
                      const updatedTrips = userTrips.map(trip => 
                        trip.id === tripData.id ? updatedTripData : trip
                      );
                      setUserTrips(updatedTrips);
                      
                    }
                    
                    setShowAddActivityModal(false);
                    setEditingActivity(null);
                    setActivityValidationErrors({});
                    // Reset form
                    setNewActivity({
                      name: '',
                      type: '',
                      date: '',
                      time: '',
                      duration: '',
                      location: '',
                      address: '',
                      coordinates: null,
                      cost: '',
                      costType: 'per-person',
                      bookingRequired: false,
                      bookingUrl: '',
                      notes: '',
                      familyNotes: '',
                      participants: [],
                      ageAppropriate: [],
                      accessibility: [],
                      weatherDependent: false,
                      priority: 'medium'
                    });
                  }}
                  disabled={!newActivity.name || !newActivity.date}
                >
                  {editingActivity ? 'Update Activity' : 'Add Activity'}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Flight Modal */}
        {showFlightModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingFlightIndex !== null ? 'Edit Flight' : 'Add Flight'}</h2>
                <Button variant="ghost" size="sm" onClick={() => {
                  setShowFlightModal(false);
                  setEditingFlightIndex(null);
                  setFlightFormData({
                    airline: '',
                    flightNumber: '',
                    departure: '',
                    arrival: '',
                    departureTime: '',
                    arrivalTime: '',
                    confirmationNumber: '',
                    status: 'confirmed',
                    assignedMembers: []
                  });
                }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <Label htmlFor="flight-type">Flight Type</Label>
                  <Select onValueChange={(value) => setFlightFormData(prev => ({...prev, type: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select flight type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outbound">Outbound Flight</SelectItem>
                      <SelectItem value="return">Return Flight</SelectItem>
                      <SelectItem value="one-way">One-way Flight</SelectItem>
                      <SelectItem value="connecting">Connecting Flight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="airline">Airline</Label>
                    <Input 
                      id="airline" 
                      placeholder="e.g., American Airlines" 
                      value={flightFormData.airline}
                      onChange={(e) => setFlightFormData(prev => ({...prev, airline: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="flight-number">Flight Number</Label>
                    <Input 
                      id="flight-number" 
                      placeholder="e.g., AA123" 
                      value={flightFormData.flightNumber}
                      onChange={(e) => setFlightFormData(prev => ({...prev, flightNumber: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="flight-from">From</Label>
                    <Input 
                      id="flight-from" 
                      placeholder="Departure airport" 
                      value={flightFormData.departure}
                      onChange={(e) => setFlightFormData(prev => ({...prev, departure: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="flight-to">To</Label>
                    <Input 
                      id="flight-to" 
                      placeholder="Arrival airport" 
                      value={flightFormData.arrival}
                      onChange={(e) => setFlightFormData(prev => ({...prev, arrival: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="flight-date">Date</Label>
                    <Input 
                      id="flight-date" 
                      type="date" 
                      value={flightFormData.departureTime.split('T')[0] || ''}
                      onChange={(e) => setFlightFormData(prev => ({...prev, departureTime: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="flight-time">Time</Label>
                    <Input 
                      id="flight-time" 
                      type="time" 
                      value={flightFormData.departureTime.split('T')[1]?.substring(0,5) || ''}
                      onChange={(e) => {
                        const date = flightFormData.departureTime.split('T')[0] || '';
                        const datetime = date + 'T' + e.target.value;
                        setFlightFormData(prev => ({...prev, departureTime: datetime}));
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="flight-status">Status</Label>
                  <Select onValueChange={(value) => setFlightFormData(prev => ({...prev, status: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="researching">Researching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Who's Taking This Flight?</Label>
                  <div className="space-y-2 mt-2">
                    {/* Adults */}
                    {tripData.adults && tripData.adults.length > 0 ? tripData.adults.map((adult, idx) => (
                      <div key={`adult-${idx}`} className="flex items-center space-x-2">
                        <Checkbox
                          checked={flightFormData.assignedMembers?.includes(`adult-${idx}`) || false}
                          onCheckedChange={(checked) => {
                            const currentAssigned = flightFormData.assignedMembers || [];
                            const memberId = `adult-${idx}`;
                            const updatedAssigned = checked
                              ? [...currentAssigned, memberId]
                              : currentAssigned.filter(id => id !== memberId);
                            setFlightFormData(prev => ({...prev, assignedMembers: updatedAssigned}));
                          }}
                        />
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-700">{adult.name?.[0] || 'A'}</span>
                          </div>
                          <span className="text-sm">{adult.name || 'Adult'}</span>
                        </div>
                      </div>
                    )) : null}
                    
                    {/* Kids */}
                    {tripData.kids && tripData.kids.length > 0 ? tripData.kids.map((kid, idx) => (
                      <div key={`kid-${idx}`} className="flex items-center space-x-2">
                        <Checkbox
                          checked={flightFormData.assignedMembers?.includes(`kid-${idx}`) || false}
                          onCheckedChange={(checked) => {
                            const currentAssigned = flightFormData.assignedMembers || [];
                            const memberId = `kid-${idx}`;
                            const updatedAssigned = checked
                              ? [...currentAssigned, memberId]
                              : currentAssigned.filter(id => id !== memberId);
                            setFlightFormData(prev => ({...prev, assignedMembers: updatedAssigned}));
                          }}
                        />
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-pink-700">{kid.name?.[0] || 'K'}</span>
                          </div>
                          <span className="text-sm">{kid.name || 'Kid'}</span>
                        </div>
                      </div>
                    )) : null}
                    
                    {/* Show message if no family members */}
                    {(!tripData.adults || tripData.adults.length === 0) && (!tripData.kids || tripData.kids.length === 0) && (
                      <div className="text-sm text-gray-500 italic">
                        No family members added yet. Add family members in the trip setup to assign them to flights.
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmation-number">Confirmation Number (optional)</Label>
                  <Input 
                    id="confirmation-number" 
                    placeholder="e.g., ABC123" 
                    value={flightFormData.confirmationNumber}
                    onChange={(e) => setFlightFormData(prev => ({...prev, confirmationNumber: e.target.value}))}
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => {
                  setShowFlightModal(false);
                  setEditingFlightIndex(null);
                  setFlightFormData({
                    airline: '',
                    flightNumber: '',
                    departure: '',
                    arrival: '',
                    departureTime: '',
                    arrivalTime: '',
                    confirmationNumber: '',
                    status: 'confirmed',
                    assignedMembers: []
                  });
                }}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  if (editingFlightIndex !== null) {
                    // Edit mode - update existing flight
                    const updatedFlights = [...(tripData.flights || [])];
                    updatedFlights[editingFlightIndex] = {
                      ...updatedFlights[editingFlightIndex],
                      ...flightFormData,
                      updatedAt: new Date().toISOString()
                    };
                    
                    const updatedTripData = {
                      ...tripData,
                      flights: updatedFlights
                    };
                    
                    setTripData(updatedTripData);
                    
                    const updatedTrips = userTrips.map(trip => 
                      trip.id === tripData.id ? updatedTripData : trip
                    );
                    setUserTrips(updatedTrips);
                    
                    setEditingFlightIndex(null);
                  } else {
                    // Add mode - create new flight
                    const newFlight = {
                      id: Date.now().toString(),
                      ...flightFormData,
                      createdAt: new Date().toISOString()
                    };
                    
                    const updatedTripData = {
                      ...tripData,
                      flights: [...(tripData.flights || []), newFlight]
                    };
                    
                    setTripData(updatedTripData);
                    
                    const updatedTrips = userTrips.map(trip => 
                      trip.id === tripData.id ? updatedTripData : trip
                    );
                    setUserTrips(updatedTrips);
                  }
                  
                  // Reset form and close modal
                  setFlightFormData({
                    airline: '',
                    flightNumber: '',
                    departure: '',
                    arrival: '',
                    departureTime: '',
                    arrivalTime: '',
                    confirmationNumber: '',
                    status: 'confirmed',
                    assignedMembers: []
                  });
                  setShowFlightModal(false);
                }}>
                  {editingFlightIndex !== null ? 'Save Changes' : 'Add Flight'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Accommodation Modal */}
        {showHotelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingAccommodationIndex !== null ? 'Edit Accommodation' : 'Add Accommodation'}</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowHotelModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <Label htmlFor="accommodation-type">Accommodation Type</Label>
                  <Select value={accommodationFormData.type} onValueChange={(value) => setAccommodationFormData(prev => ({...prev, type: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select accommodation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="rental">Rental (Airbnb, VRBO)</SelectItem>
                      <SelectItem value="family">Staying with Family/Friends</SelectItem>
                      <SelectItem value="hostel">Hostel</SelectItem>
                      <SelectItem value="camping">Camping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="accommodation-room-quantity">Number of Rooms</Label>
                  <Input 
                    id="accommodation-room-quantity" 
                    type="number"
                    min="1"
                    placeholder="1" 
                    value={accommodationFormData.roomQuantity}
                    onChange={(e) => setAccommodationFormData(prev => ({...prev, roomQuantity: e.target.value}))}
                  />
                </div>

                <div>
                  <Label htmlFor="accommodation-name">Name</Label>
                  <Input 
                    id="accommodation-name" 
                    placeholder="e.g., Hotel Barcelona Center, Sarah's House" 
                    value={accommodationFormData.name}
                    onChange={(e) => setAccommodationFormData(prev => ({...prev, name: e.target.value}))}
                  />
                </div>

                <div>
                  <Label htmlFor="accommodation-address">Address</Label>
                  <Input 
                    id="accommodation-address" 
                    placeholder="Full address or area" 
                    value={accommodationFormData.address}
                    onChange={(e) => setAccommodationFormData(prev => ({...prev, address: e.target.value}))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="check-in">Check-in Date</Label>
                    <Input 
                      id="check-in" 
                      type="date" 
                      value={accommodationFormData.checkIn}
                      onChange={(e) => setAccommodationFormData(prev => ({...prev, checkIn: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="check-out">Check-out Date</Label>
                    <Input 
                      id="check-out" 
                      type="date" 
                      value={accommodationFormData.checkOut}
                      onChange={(e) => setAccommodationFormData(prev => ({...prev, checkOut: e.target.value}))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accommodation-details">Details</Label>
                  <Select value={accommodationFormData.details} onValueChange={(value) => setAccommodationFormData(prev => ({...prev, details: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select details" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Room</SelectItem>
                      <SelectItem value="double">Double Room</SelectItem>
                      <SelectItem value="family">Family Room</SelectItem>
                      <SelectItem value="suite">Suite</SelectItem>
                      <SelectItem value="connecting">Connecting Rooms</SelectItem>
                      <SelectItem value="entire-place">Entire Place</SelectItem>
                      <SelectItem value="shared">Shared Space</SelectItem>
                      <SelectItem value="guest-room">Guest Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="accommodation-status">Status</Label>
                  <Select value={accommodationFormData.status} onValueChange={(value) => setAccommodationFormData(prev => ({...prev, status: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="researching">Researching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="accommodation-room-assignment">Room Assignment (optional)</Label>
                  <Input 
                    id="accommodation-room-assignment" 
                    placeholder="e.g., Room 101, Suite A, Floor 3" 
                    value={accommodationFormData.roomAssignment || ''}
                    onChange={(e) => setAccommodationFormData(prev => ({...prev, roomAssignment: e.target.value}))}
                  />
                </div>

                <div>
                  <Label>Who's Staying Here?</Label>
                  <div className="space-y-2 mt-2">
                    {/* Adults */}
                    {tripData.adults && tripData.adults.map((adult, idx) => (
                      <div key={`adult-${idx}`} className="flex items-center space-x-2">
                        <Checkbox
                          checked={accommodationFormData.assignedMembers?.includes(`adult-${idx}`) || false}
                          onCheckedChange={(checked) => {
                            const currentAssigned = accommodationFormData.assignedMembers || [];
                            const memberId = `adult-${idx}`;
                            const updatedAssigned = checked
                              ? [...currentAssigned, memberId]
                              : currentAssigned.filter(id => id !== memberId);
                            setAccommodationFormData(prev => ({...prev, assignedMembers: updatedAssigned}));
                          }}
                        />
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-700">{adult.name?.[0] || 'A'}</span>
                          </div>
                          <span className="text-sm">{adult.name || 'Adult'}</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Kids */}
                    {tripData.kids && tripData.kids.map((kid, idx) => (
                      <div key={`kid-${idx}`} className="flex items-center space-x-2">
                        <Checkbox
                          checked={accommodationFormData.assignedMembers?.includes(`kid-${idx}`) || false}
                          onCheckedChange={(checked) => {
                            const currentAssigned = accommodationFormData.assignedMembers || [];
                            const memberId = `kid-${idx}`;
                            const updatedAssigned = checked
                              ? [...currentAssigned, memberId]
                              : currentAssigned.filter(id => id !== memberId);
                            setAccommodationFormData(prev => ({...prev, assignedMembers: updatedAssigned}));
                          }}
                        />
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-pink-700">{kid.name?.[0] || 'K'}</span>
                          </div>
                          <span className="text-sm">{kid.name || 'Kid'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="accommodation-confirmation">Confirmation Number (optional)</Label>
                  <Input 
                    id="accommodation-confirmation" 
                    placeholder="e.g., HTL456, ABC123" 
                    value={accommodationFormData.confirmationNumber}
                    onChange={(e) => setAccommodationFormData(prev => ({...prev, confirmationNumber: e.target.value}))}
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => {
                  setAccommodationFormData({
                    type: 'hotel',
                    name: '',
                    address: '',
                    checkIn: '',
                    checkOut: '',
                    details: '',
                    roomQuantity: '1',
                    roomAssignment: '',
                    assignedMembers: [],
                    status: 'confirmed',
                    confirmationNumber: ''
                  });
                  setEditingAccommodationIndex(null);
                  setShowHotelModal(false);
                }}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  if (editingAccommodationIndex !== null) {
                    // Editing existing accommodation
                    const updatedAccommodations = [...(tripData.accommodations || [])];
                    updatedAccommodations[editingAccommodationIndex] = {
                      ...updatedAccommodations[editingAccommodationIndex],
                      ...accommodationFormData,
                      updatedAt: new Date().toISOString()
                    };
                    
                    const updatedTripData = {
                      ...tripData,
                      accommodations: updatedAccommodations
                    };
                    
                    setTripData(updatedTripData);
                    
                    // Update user trips
                    const updatedTrips = userTrips.map(trip => 
                      trip.id === tripData.id ? updatedTripData : trip
                    );
                    setUserTrips(updatedTrips);
                  } else {
                    // Adding new accommodation
                    const newAccommodation = {
                      id: Date.now().toString(),
                      ...accommodationFormData,
                      createdAt: new Date().toISOString()
                    };
                    
                    const updatedTripData = {
                      ...tripData,
                      accommodations: [...(tripData.accommodations || []), newAccommodation]
                    };
                    
                    setTripData(updatedTripData);
                    
                    // Update user trips
                    const updatedTrips = userTrips.map(trip => 
                      trip.id === tripData.id ? updatedTripData : trip
                    );
                    setUserTrips(updatedTrips);
                  }
                  
                  // Reset form and close modal
                  setAccommodationFormData({
                    type: 'hotel',
                    name: '',
                    address: '',
                    checkIn: '',
                    checkOut: '',
                    details: '',
                    roomQuantity: '1',
                    roomAssignment: '',
                    assignedMembers: [],
                    status: 'confirmed',
                    confirmationNumber: ''
                  });
                  setEditingAccommodationIndex(null);
                  setShowHotelModal(false);
                }}>
                  {editingAccommodationIndex !== null ? 'Save Changes' : 'Add Accommodation'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Transportation Modal */}
        {showTransportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingTransportationIndex !== null ? 'Edit Transportation' : 'Add Transportation'}</h2>
                <Button variant="ghost" size="sm" onClick={resetTransportationModal}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <Label htmlFor="transport-type">Transportation Type</Label>
                  <Select value={transportFormData.type} onValueChange={(value) => setTransportFormData(prev => ({...prev, type: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transportation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driving">Driving (Personal Car)</SelectItem>
                      <SelectItem value="train">Train/Railway</SelectItem>
                      <SelectItem value="bus">Bus/Coach</SelectItem>
                      <SelectItem value="rental-car">Rental Car (At Destination)</SelectItem>
                      <SelectItem value="subway-pass">Subway/Metro Pass</SelectItem>
                      <SelectItem value="taxi-uber">Taxi/Rideshare</SelectItem>
                      <SelectItem value="airport-transfer">Airport Transfer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="transport-details">Details</Label>
                  <Input 
                    id="transport-details" 
                    placeholder="e.g., Compact car from Hertz" 
                    value={transportFormData.details}
                    onChange={(e) => setTransportFormData(prev => ({...prev, details: e.target.value}))}
                  />
                </div>

                <div>
                  <Label htmlFor="transport-dates">Date</Label>
                  <Input 
                    id="transport-dates" 
                    type="date"
                    value={transportFormData.date}
                    onChange={(e) => setTransportFormData(prev => ({...prev, date: e.target.value}))}
                  />
                </div>

                <div>
                  <Label htmlFor="transport-status">Status</Label>
                  <Select value={transportFormData.status} onValueChange={(value) => setTransportFormData(prev => ({...prev, status: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="researching">Researching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Who's Using This Transportation?</Label>
                  <div className="space-y-2 mt-2">
                    {/* Adults */}
                    {tripData.adults && tripData.adults.map((adult, idx) => (
                      <div key={`adult-${idx}`} className="flex items-center space-x-2">
                        <Checkbox
                          checked={transportFormData.assignedMembers?.includes(`adult-${idx}`) || false}
                          onCheckedChange={(checked) => {
                            const currentAssigned = transportFormData.assignedMembers || [];
                            const memberId = `adult-${idx}`;
                            const updatedAssigned = checked
                              ? [...currentAssigned, memberId]
                              : currentAssigned.filter(id => id !== memberId);
                            setTransportFormData(prev => ({...prev, assignedMembers: updatedAssigned}));
                          }}
                        />
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-700">{adult.name?.[0] || 'A'}</span>
                          </div>
                          <span className="text-sm">{adult.name || 'Adult'}</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Kids */}
                    {tripData.kids && tripData.kids.map((kid, idx) => (
                      <div key={`kid-${idx}`} className="flex items-center space-x-2">
                        <Checkbox
                          checked={transportFormData.assignedMembers?.includes(`kid-${idx}`) || false}
                          onCheckedChange={(checked) => {
                            const currentAssigned = transportFormData.assignedMembers || [];
                            const memberId = `kid-${idx}`;
                            const updatedAssigned = checked
                              ? [...currentAssigned, memberId]
                              : currentAssigned.filter(id => id !== memberId);
                            setTransportFormData(prev => ({...prev, assignedMembers: updatedAssigned}));
                          }}
                        />
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-pink-700">{kid.name?.[0] || 'K'}</span>
                          </div>
                          <span className="text-sm">{kid.name || 'Kid'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="transport-confirmation">Confirmation/Reference (optional)</Label>
                  <Input 
                    id="transport-confirmation" 
                    placeholder="e.g., CAR789" 
                    value={transportFormData.confirmationNumber}
                    onChange={(e) => setTransportFormData(prev => ({...prev, confirmationNumber: e.target.value}))}
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-3">
                <Button variant="outline" onClick={resetTransportationModal}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  if (editingTransportationIndex !== null) {
                    // Edit mode - update existing transportation
                    const updatedTransportation = [...(tripData.transportation || [])];
                    updatedTransportation[editingTransportationIndex] = {
                      ...updatedTransportation[editingTransportationIndex],
                      ...transportFormData,
                      updatedAt: new Date().toISOString()
                    };
                    
                    const updatedTripData = {
                      ...tripData,
                      transportation: updatedTransportation
                    };
                    
                    setTripData(updatedTripData);
                    
                    const updatedTrips = userTrips.map(trip => 
                      trip.id === tripData.id ? updatedTripData : trip
                    );
                    setUserTrips(updatedTrips);
                    
                    setEditingTransportationIndex(null);
                  } else {
                    // Add mode - create new transportation
                    const newTransportation = {
                      id: Date.now().toString(),
                      ...transportFormData,
                      createdAt: new Date().toISOString()
                    };
                    
                    const updatedTripData = {
                      ...tripData,
                      transportation: [...(tripData.transportation || []), newTransportation]
                    };
                    
                    setTripData(updatedTripData);
                    
                    const updatedTrips = userTrips.map(trip => 
                      trip.id === tripData.id ? updatedTripData : trip
                    );
                    setUserTrips(updatedTrips);
                  }
                  
                  // Reset form and close modal
                  setTransportFormData({
                    type: 'driving',
                    details: '',
                    departure: '',
                    arrival: '',
                    date: '',
                    time: '',
                    assignedMembers: [],
                    confirmationNumber: '',
                    status: 'confirmed'
                  });
                  setShowTransportModal(false);
                }}>
                  {editingTransportationIndex !== null ? 'Update Transportation' : 'Add Transportation'}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Family Profiles Modal for Trip Details */}
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
                      setCurrentView('dashboard');
                    }}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Dashboard
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
        
        {/* Edit Profile Modal for Trip Details */}
        {showEditProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingProfile?.id ? `Edit ${editingProfile.name}'s Profile` : 'Add New Family Member'}</h2>
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
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="profile-name-trip">Name *</Label>
                      <Input
                        id="profile-name-trip"
                        value={editingProfile.name}
                        onChange={(e) => setEditingProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="profile-type-trip">Type</Label>
                      <Select 
                        value={editingProfile.type} 
                        onValueChange={(value) => setEditingProfile(prev => prev ? {...prev, type: value as 'adult' | 'child'} : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adult">Adult</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="profile-dob-trip">Date of Birth</Label>
                      <Input
                        id="profile-dob-trip"
                        type="date"
                        value={editingProfile.dateOfBirth || ''}
                        onChange={(e) => setEditingProfile(prev => prev ? {...prev, dateOfBirth: e.target.value} : null)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {editingProfile.type === 'adult' && (
                      <div>
                        <Label htmlFor="profile-email-trip">Email</Label>
                        <Input
                          id="profile-email-trip"
                          type="email"
                          value={editingProfile.email || ''}
                          onChange={(e) => setEditingProfile(prev => prev ? {...prev, email: e.target.value} : null)}
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="profile-relationship-trip">Relationship</Label>
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
                    <Label htmlFor="health-info-trip">Health Information We Should Know</Label>
                    <Textarea
                      id="health-info-trip"
                      rows={4}
                      placeholder="Tell us about any allergies, medical conditions, or health considerations that might affect travel planning. For example: 'severe nut allergy - needs EpiPen', 'diabetes - needs to eat every 3 hours', 'uses wheelchair', etc."
                      value={editingProfile.healthInfo || ''}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, healthInfo: e.target.value} : null)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Only share what you're comfortable with and what would help us make better recommendations
                    </p>
                  </div>
                </div>

                {/* Travel Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Travel Preferences</h3>
                  
                  <div>
                    <Label className="text-sm font-medium">Energy Level</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { value: 'high-energy', label: 'High energy - loves active adventures' },
                        { value: 'moderate-energy', label: 'Moderate energy - mix of active and relaxing' },
                        { value: 'low-energy', label: 'Low energy - prefers leisurely activities' },
                        { value: 'needs-breaks', label: 'Needs frequent breaks' }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`energy-trip-${option.value}`}
                            checked={editingProfile.energyLevel?.includes(option.value) || false}
                            onCheckedChange={(checked) => {
                              const currentLevels = editingProfile.energyLevel || [];
                              if (checked) {
                                setEditingProfile(prev => prev ? {
                                  ...prev, 
                                  energyLevel: [...currentLevels, option.value]
                                } : null);
                              } else {
                                setEditingProfile(prev => prev ? {
                                  ...prev,
                                  energyLevel: currentLevels.filter(level => level !== option.value)
                                } : null);
                              }
                            }}
                          />
                          <Label htmlFor={`energy-trip-${option.value}`} className="text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Activity Preferences</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {[
                        { value: 'museums-culture', label: 'Loves museums and cultural sites' },
                        { value: 'outdoor-nature', label: 'Enjoys outdoor activities and nature' },
                        { value: 'hands-on', label: 'Prefers hands-on experiences' },
                        { value: 'food-cooking', label: 'Likes food and cooking experiences' },
                        { value: 'shows-entertainment', label: 'Enjoys shows and entertainment' }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`activity-trip-${option.value}`}
                            checked={editingProfile.activityPreferences?.includes(option.value) || false}
                            onCheckedChange={(checked) => {
                              const currentPrefs = editingProfile.activityPreferences || [];
                              if (checked) {
                                setEditingProfile(prev => prev ? {
                                  ...prev, 
                                  activityPreferences: [...currentPrefs, option.value]
                                } : null);
                              } else {
                                setEditingProfile(prev => prev ? {
                                  ...prev,
                                  activityPreferences: currentPrefs.filter(pref => pref !== option.value)
                                } : null);
                              }
                            }}
                          />
                          <Label htmlFor={`activity-trip-${option.value}`} className="text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sleep & Schedule - Children Only */}
                {editingProfile.type === 'child' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sleep & Schedule</h3>
                  
                  <div>
                    <Label htmlFor="sleep-schedule-trip">Sleep Schedule</Label>
                    <Input
                      id="sleep-schedule-trip"
                      placeholder="e.g., sleeps 8pm-7am, needs 2-hour nap around 1pm"
                      value={editingProfile.sleepSchedule || ''}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, sleepSchedule: e.target.value} : null)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="best-times-trip">Best Times</Label>
                    <Input
                      id="best-times-trip"
                      placeholder="e.g., morning person, cranky after 6pm"
                      value={editingProfile.bestTimes || ''}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, bestTimes: e.target.value} : null)}
                    />
                  </div>
                  </div>
                )}

                {/* Special Considerations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Special Considerations</h3>
                  <div>
                    <Label htmlFor="special-considerations-trip">Anything Else We Should Know?</Label>
                    <Textarea
                      id="special-considerations-trip"
                      rows={3}
                      placeholder="e.g., 'gets motion sick in cars', 'afraid of heights', 'overwhelmed by crowds', 'can't handle loud noises', 'loves animals', etc."
                      value={editingProfile.specialConsiderations || ''}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, specialConsiderations: e.target.value} : null)}
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
                          // Edit existing profile
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
                        
                        // Close modal
                        setShowEditProfile(false);
                        setEditingProfile(null);
                      }
                    }}
                  >
                    {editingProfile?.id ? 'Save Changes' : 'Create Family Member'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        </ResponsiveTripDetails>
        
        {/* Add Traveler Modal */}
      {showAddTravelerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Traveler</h2>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowAddTravelerModal(false);
                setNewTravelerForm({
                  name: '',
                  type: 'adult',
                  age: '',
                  relationship: '',
                  email: ''
                });
              }}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6">
              {/* Existing Family Members */}
              {(() => {
                // Get all family profiles not currently on the trip
                const availableProfiles = familyProfiles.filter(profile => {
                  // Check if this profile is already on the trip
                  const isAdult = profile.type === 'adult';
                  const currentMembers = isAdult ? (tripData.adults || []) : (tripData.kids || []);
                  return !currentMembers.some(member => member.name === profile.name);
                });
                
                if (availableProfiles.length > 0) {
                  return (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">
                        {availableProfiles.length === 1 
                          ? 'Add Family Member to Trip' 
                          : `Add Family Members to Trip (${availableProfiles.length} available)`
                        }
                      </h3>
                      <div className="space-y-3">
                        {availableProfiles.map((profile) => (
                          <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                profile.type === 'adult' ? 'bg-blue-100' : 'bg-pink-100'
                              }`}>
                                <span className={`text-sm font-medium ${
                                  profile.type === 'adult' ? 'text-blue-700' : 'text-pink-700'
                                }`}>
                                  {profile.name?.[0] || (profile.type === 'adult' ? 'A' : 'K')}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{profile.name}</div>
                                <div className="text-sm text-gray-500">
                                  {profile.relationship || (profile.type === 'adult' ? 'Adult' : 'Child')}
                                  {profile.age && ` (${profile.age})`}
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Add this profile to the current trip
                                const updatedTripData = { ...tripData };
                                
                                if (profile.type === 'adult') {
                                  updatedTripData.adults = [...(tripData.adults || []), profile];
                                } else {
                                  updatedTripData.kids = [...(tripData.kids || []), profile];
                                }
                                
                                setTripData(updatedTripData);
                                
                                // Update user trips
                                const updatedTrips = userTrips.map(trip => 
                                  trip.id === tripData.id ? updatedTripData : trip
                                );
                                setUserTrips(updatedTrips);
                                
                                // Save to localStorage
                                localStorage.setItem('famapp-trips', JSON.stringify(updatedTrips));
                                
                                // Auto-close modal after adding existing person
                                setShowAddTravelerModal(false);
                              }}
                            >
                              Add to Trip
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              {/* Create New Family Member */}
              <div>
                {(() => {
                  // Get available profiles count for context-aware heading
                  const availableProfiles = familyProfiles.filter(profile => {
                    const isAdult = profile.type === 'adult';
                    const currentMembers = isAdult ? (tripData.adults || []) : (tripData.kids || []);
                    return !currentMembers.some(member => member.name === profile.name);
                  });
                  
                  const hasAvailableProfiles = availableProfiles.length > 0;
                  
                  return (
                    <h3 className="text-lg font-medium mb-4">
                      {hasAvailableProfiles ? 'Or Create New Family Member' : 'Create New Family Member'}
                    </h3>
                  );
                })()}
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new-traveler-name">Name *</Label>
                      <Input
                        id="new-traveler-name"
                        value={newTravelerForm.name}
                        onChange={(e) => setNewTravelerForm(prev => ({...prev, name: e.target.value}))}
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-traveler-type">Type</Label>
                      <Select 
                        value={newTravelerForm.type} 
                        onValueChange={(value: 'adult' | 'child') => setNewTravelerForm(prev => ({...prev, type: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adult">Adult</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new-traveler-age">Age</Label>
                      <Input
                        id="new-traveler-age"
                        value={newTravelerForm.age}
                        onChange={(e) => setNewTravelerForm(prev => ({...prev, age: e.target.value}))}
                        placeholder="e.g., 32, 8 years old"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-traveler-relationship">Relationship</Label>
                      <Select 
                        value={newTravelerForm.relationship} 
                        onValueChange={(value) => setNewTravelerForm(prev => ({...prev, relationship: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent className="z-[10000]">
                          {newTravelerForm.type === 'adult' ? (
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
                  
                  {newTravelerForm.type === 'adult' && (
                    <div>
                      <Label htmlFor="new-traveler-email">Email</Label>
                      <Input
                        id="new-traveler-email"
                        type="email"
                        value={newTravelerForm.email}
                        onChange={(e) => setNewTravelerForm(prev => ({...prev, email: e.target.value}))}
                        placeholder="email@example.com"
                      />
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => {
                      if (!newTravelerForm.name.trim()) return;
                      
                      // Create new family member
                      const newMember: FamilyMember = {
                        id: Date.now().toString(),
                        name: newTravelerForm.name,
                        type: newTravelerForm.type,
                        age: newTravelerForm.age,
                        relationship: newTravelerForm.relationship,
                        email: newTravelerForm.email,
                        createdAt: new Date().toISOString()
                      };
                      
                      // Add to family profiles
                      const updatedProfiles = [...familyProfiles, newMember];
                      setFamilyProfiles(updatedProfiles);
                      localStorage.setItem('famapp-family-profiles', JSON.stringify(updatedProfiles));
                      
                      // Add to current trip
                      const updatedTripData = { ...tripData };
                      if (newTravelerForm.type === 'adult') {
                        updatedTripData.adults = [...(tripData.adults || []), newMember];
                      } else {
                        updatedTripData.kids = [...(tripData.kids || []), newMember];
                      }
                      
                      setTripData(updatedTripData);
                      
                      // Update user trips
                      const updatedTrips = userTrips.map(trip => 
                        trip.id === tripData.id ? updatedTripData : trip
                      );
                      setUserTrips(updatedTrips);
                      localStorage.setItem('famapp-trips', JSON.stringify(updatedTrips));
                      
                      // Reset form and close modal
                      setNewTravelerForm({
                        name: '',
                        type: 'adult',
                        age: '',
                        relationship: '',
                        email: ''
                      });
                      setShowAddTravelerModal(false);
                    }}
                    disabled={!newTravelerForm.name.trim()}
                    className="w-full"
                  >
                    Create & Add to Trip
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }
  // Trip wizard view

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FamApp</h1>
                <p className="text-xs text-blue-700">Family Travel Made Simple</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {currentStep === 0 ? "Let's plan your family trip" :
             currentStep === 1 ? "Who's coming along?" :
             currentStep === 2 ? "What's your family's travel style?" :
             currentStep === 3 ? "What matters most to your family?" :
             currentStep === 4 ? "How much are you planning to spend?" :
             "Almost done!"}
          </h2>
          <p className="text-lg text-gray-600">
            {currentStep === 0 ? "Stop being the human travel database. Let AI help coordinate your trip." :
             currentStep === 1 ? "Just the basics - I'll learn more about your family later" :
             currentStep === 2 ? "This helps me suggest activities that actually work for your crew" :
             currentStep === 3 ? "Help me understand your priorities and concerns for the trip" :
             currentStep === 4 ? "We'll suggest activities and experiences that fit your family's budget" :
             "Your family trip coordinator is ready to help!"}
          </p>
        </div>

        {/* Render current step */}
        {currentStep === 0 && <DestinationStep tripData={tripData} setTripData={setTripData} validationErrors={validationErrors} />}
        {currentStep === 1 && <FamilyProfilesStep tripData={tripData} setTripData={setTripData} validationErrors={validationErrors} />}
        {currentStep === 2 && <TravelStyleStep tripData={tripData} setTripData={setTripData} />}
        {currentStep === 3 && <ConcernsStep tripData={tripData} setTripData={setTripData} />}
        {currentStep === 4 && <BudgetStep tripData={tripData} setTripData={setTripData} />}
        {currentStep === 5 && <CompletionStep tripData={tripData} onTripComplete={handleTripComplete} />}

        {/* Navigation buttons */}
        {currentStep !== 5 && (
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button onClick={nextStep} disabled={isValidating}>
                {isValidating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Validating...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

import { AppWithAuth } from './components/auth/AppWithAuth';
import { ResponsiveTripDetails } from './components/trip/ResponsiveTripDetails';

// Wrap App in Error Boundary and Authentication
const App = () => (
  <ErrorBoundary>
    <AppWithAuth>
      <FamApp />
    </AppWithAuth>
  </ErrorBoundary>
);

export default App;