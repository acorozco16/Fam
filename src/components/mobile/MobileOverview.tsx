import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { TripTips } from '../TripTips';
import { 
  AlertTriangle, Clock, CheckCircle, Zap, 
  Calendar, MapPin, Users, Phone, FileText, 
  Heart, Shield, Baby, Plane, ArrowLeft,
  Plus, Edit, Trash2, X, ChevronDown, ChevronRight
} from 'lucide-react';

interface TripData {
  id: string;
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: any[];
  flights: any[];
  accommodations: any[];
  activities: any[];
  packingItems: any[];
  [key: string]: any;
}

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
  healthInfo?: string;
  dietaryInfo?: string;
  parentId?: string;
  relationship?: string;
  createdAt?: string;
  updatedAt?: string;
  dateOfBirth?: string;
  energyLevel?: string[];
  activityPreferences?: string[];
  sleepSchedule?: string;
  bestTimes?: string;
  specialConsiderations?: string;
}

interface MobileOverviewProps {
  trip: TripData;
  onQuickAction: (action: string) => void;
  onBack?: () => void;
  onUpdateTrip?: (updatedTrip: TripData) => void;
  familyProfiles?: FamilyMember[];
  onOpenFamilyProfiles?: () => void;
}

export const MobileOverview: React.FC<MobileOverviewProps> = ({ 
  trip, 
  onQuickAction, 
  onBack, 
  onUpdateTrip, 
  familyProfiles = [], 
  onOpenFamilyProfiles 
}) => {
  const [dismissedSuggestions, setDismissedSuggestions] = React.useState<string[]>([]);
  const [showAddTask, setShowAddTask] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<any>(null);
  const [newTaskForm, setNewTaskForm] = React.useState({
    title: '',
    subtitle: '',
    category: '',
    urgent: false
  });
  const [collapsedCategories, setCollapsedCategories] = React.useState<Set<string>>(new Set());
  
  // Family Profile Completeness Helper Functions
  const calculateProfileCompleteness = (profile: FamilyMember): number => {
    const essentialFields = ['name', 'age', 'relationship'];
    const detailedFields = ['interests', 'dietaryInfo', 'healthInfo', 'energyLevel', 'activityPreferences', 'sleepSchedule'];
    
    let score = 0;
    let maxScore = 0;
    
    // Essential fields (60% weight)
    essentialFields.forEach(field => {
      maxScore += 60;
      if (profile[field as keyof FamilyMember] && profile[field as keyof FamilyMember] !== '') {
        score += 60;
      }
    });
    
    // Detailed fields (40% weight divided among fields)
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

  const getFamilyProfilesCompleteness = (familyProfiles: FamilyMember[], tripMembers: any[]): {
    overallCompleteness: number;
    tripMemberCompleteness: number;
    incompleteProfiles: FamilyMember[];
    canUnlockPersonalization: boolean;
  } => {
    if (familyProfiles.length === 0) {
      return {
        overallCompleteness: 0,
        tripMemberCompleteness: 0,
        incompleteProfiles: [],
        canUnlockPersonalization: false
      };
    }
    
    // Calculate overall completeness
    const overallScores = familyProfiles.map(calculateProfileCompleteness);
    const overallCompleteness = Math.round(overallScores.reduce((a, b) => a + b, 0) / overallScores.length);
    
    // Calculate trip member completeness
    const tripMemberProfiles = familyProfiles.filter(profile => 
      tripMembers.some((member: any) => member.name === profile.name || member.id === profile.id)
    );
    
    const tripMemberScores = tripMemberProfiles.map(calculateProfileCompleteness);
    const tripMemberCompleteness = tripMemberProfiles.length > 0 
      ? Math.round(tripMemberScores.reduce((a, b) => a + b, 0) / tripMemberScores.length)
      : 0;
    
    // Find incomplete profiles (less than 70% complete)
    const incompleteProfiles = tripMemberProfiles.filter(profile => 
      calculateProfileCompleteness(profile) < 70
    );
    
    // Can unlock personalization if trip members are 70%+ complete
    const canUnlockPersonalization = tripMemberCompleteness >= 70 && incompleteProfiles.length === 0;
    
    return {
      overallCompleteness,
      tripMemberCompleteness,
      incompleteProfiles,
      canUnlockPersonalization
    };
  };

  // Check personalization eligibility
  const tripMembers = [...(trip.travelers || []), ...(trip.adults || []), ...(trip.kids || [])];
  const profileCompleteness = getFamilyProfilesCompleteness(familyProfiles, tripMembers);
  
  // Calculate trip stats
  const daysUntilTrip = Math.ceil((new Date(trip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isUpcoming = daysUntilTrip > 0;

  // Load city tips
  const getCityTips = () => {
    const cityName = trip.destination?.toLowerCase();
    if (!cityName) return [];
    
    // Import city tips dynamically based on destination
    try {
      if (cityName.includes('madrid')) {
        // We'll import this dynamically
        const { madridTripTips } = require('../../data/cities/madridRecommendations');
        return madridTripTips;
      }
      // Add other cities as needed
    } catch (error) {
      console.warn('No city tips found for:', cityName);
    }
    
    return [];
  };

  const cityTips = getCityTips();

  const handleAddToItinerary = (tip: any) => {
    if (!onUpdateTrip || !tip.itineraryTemplate) return;

    const newActivity = {
      id: `tip-${tip.id}-${Date.now()}`,
      name: tip.itineraryTemplate.name,
      location: tip.itineraryTemplate.location || '',
      duration: tip.itineraryTemplate.estimatedDuration,
      category: tip.itineraryTemplate.category,
      status: 'Planned',
      date: trip.startDate, // Default to first day
      fromTip: true
    };

    const updatedTrip = {
      ...trip,
      activities: [...(trip.activities || []), newActivity]
    };

    onUpdateTrip(updatedTrip);
  };

  const dismissSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => [...prev, suggestionId]);
  };

  // Category management functions
  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Group tasks by category
  const groupTasksByCategory = (tasks: any[]) => {
    const categories: Record<string, any[]> = {};
    
    tasks.forEach(task => {
      const category = task.category || 'general';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(task);
    });

    // Sort tasks within each category by priority
    Object.keys(categories).forEach(cat => {
      categories[cat].sort((a, b) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (a.priority !== 'high' && b.priority === 'high') return 1;
        return 0;
      });
    });

    return categories;
  };

  // Category metadata
  const getCategoryInfo = (category: string) => {
    const categoryMap: Record<string, {name: string, icon: any, color: string, description: string}> = {
      'packing': { name: 'Packing', icon: Heart, color: 'green', description: 'What to bring' },
      'planning': { name: 'Planning', icon: Calendar, color: 'blue', description: 'Research & bookings' },
      'travel': { name: 'Travel', icon: Plane, color: 'purple', description: 'Flights & transport' },
      'health': { name: 'Health & Safety', icon: Shield, color: 'red', description: 'Medical & emergency prep' },
      'cultural': { name: 'Cultural', icon: Users, color: 'orange', description: 'Local customs & language' },
      'financial': { name: 'Financial', icon: Phone, color: 'yellow', description: 'Money & banking' },
      'technology': { name: 'Technology', icon: Phone, color: 'gray', description: 'Apps & connectivity' },
      'general': { name: 'General', icon: CheckCircle, color: 'gray', description: 'Other tasks' }
    };
    
    return categoryMap[category] || categoryMap['general'];
  };

  // Custom task management functions
  const addCustomTask = () => {
    if (!newTaskForm.title.trim() || !onUpdateTrip) return;
    
    const newTask = {
      id: Date.now().toString(),
      title: newTaskForm.title.trim(),
      subtitle: newTaskForm.subtitle.trim(),
      category: newTaskForm.category || 'custom',
      status: 'incomplete' as const,
      urgent: newTaskForm.urgent,
      isCustom: true
    };

    const updatedTrip = {
      ...trip,
      customReadinessItems: [...(trip.customReadinessItems || []), newTask]
    };

    onUpdateTrip(updatedTrip);
    setShowAddTask(false);
    setNewTaskForm({ title: '', subtitle: '', category: '', urgent: false });
  };

  const editCustomTask = (taskId: string) => {
    const task = trip.customReadinessItems?.find(t => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setNewTaskForm({
        title: task.title,
        subtitle: task.subtitle,
        category: task.category,
        urgent: task.urgent || false
      });
      setShowAddTask(true);
    }
  };

  const updateCustomTask = () => {
    if (!editingTask || !newTaskForm.title.trim() || !onUpdateTrip) return;

    const updatedTask = {
      ...editingTask,
      title: newTaskForm.title.trim(),
      subtitle: newTaskForm.subtitle.trim(),
      category: newTaskForm.category || 'custom',
      urgent: newTaskForm.urgent
    };

    const updatedTasks = trip.customReadinessItems?.map(task => 
      task.id === editingTask.id ? updatedTask : task
    ) || [];

    const updatedTrip = {
      ...trip,
      customReadinessItems: updatedTasks
    };

    onUpdateTrip(updatedTrip);
    setShowAddTask(false);
    setEditingTask(null);
    setNewTaskForm({ title: '', subtitle: '', category: '', urgent: false });
  };

  const toggleCustomTask = (taskId: string) => {
    if (!onUpdateTrip) return;

    const updatedTasks = trip.customReadinessItems?.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'complete' ? 'incomplete' : 'complete' }
        : task
    ) || [];

    const updatedTrip = {
      ...trip,
      customReadinessItems: updatedTasks
    };

    onUpdateTrip(updatedTrip);
  };

  const deleteCustomTask = (taskId: string) => {
    if (!onUpdateTrip) return;

    const updatedTasks = trip.customReadinessItems?.filter(task => task.id !== taskId) || [];

    const updatedTrip = {
      ...trip,
      customReadinessItems: updatedTasks
    };

    onUpdateTrip(updatedTrip);
  };

  // Trip readiness calculation (matching desktop logic)
  const calculateTripReadiness = () => {
    const readinessItems = [];

    // Planning Category
    if (trip.city && trip.country && trip.startDate && trip.endDate) {
      readinessItems.push({ status: 'complete', category: 'planning' });
    } else {
      readinessItems.push({ status: 'incomplete', category: 'planning' });
    }

    // Travel Category
    const hasFlights = trip.flights && trip.flights.length > 0;
    const hasAccommodations = trip.accommodations && trip.accommodations.length > 0;
    
    readinessItems.push({ 
      status: hasFlights ? 'complete' : 'incomplete', 
      category: 'travel' 
    });
    readinessItems.push({ 
      status: hasAccommodations ? 'complete' : 'incomplete', 
      category: 'travel' 
    });

    // Packing Category
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

    readinessItems.push({ 
      status: packingProgress >= 80 ? 'complete' : 'incomplete', 
      category: 'packing' 
    });

    // Activities/Itinerary
    const hasActivities = trip.activities && trip.activities.length > 0;
    readinessItems.push({ 
      status: hasActivities ? 'complete' : 'incomplete', 
      category: 'itinerary' 
    });

    // Custom readiness items
    const customItems = trip.customReadinessItems || [];
    customItems.forEach(item => {
      readinessItems.push({
        status: item.status,
        category: item.category
      });
    });

    const completedCount = readinessItems.filter(item => item.status === 'complete').length;
    const progressPercentage = Math.round((completedCount / readinessItems.length) * 100);

    return { 
      completed: completedCount, 
      total: readinessItems.length, 
      percentage: progressPercentage,
      packingProgress 
    };
  };

  const tripReadiness = calculateTripReadiness();
  
  // Dynamic smart suggestions based on trip data
  const generateSmartSuggestions = () => {
    const urgent = [];
    const upcoming = [];
    const completed = [];
    const suggestions = [];

    const country = trip.country?.toLowerCase() || '';
    const destination = trip.destination?.toLowerCase() || '';
    const hasKids = trip.kids && trip.kids.length > 0;
    const hasFlights = trip.flights && trip.flights.length > 0;
    const isInternational = country && country !== 'united states' && country !== 'usa';

    // URGENT ITEMS (Dynamic based on trip data)
    
    // International travel passport check
    if (isInternational && !dismissedSuggestions.includes('passport-check')) {
      urgent.push({
        id: 'passport-check',
        title: 'Check Passport Expiration',
        detail: `${trip.country} requires 6+ months validity`,
        type: 'critical',
        icon: FileText,
        action: 'Check Now',
        timeframe: 'Do today'
      });
    }

    // Flight check-in (if flights exist)
    if (hasFlights && daysUntilTrip <= 2 && !dismissedSuggestions.includes('flight-checkin')) {
      urgent.push({
        id: 'flight-checkin',
        title: 'Flight Check-in Opens Soon',
        detail: 'Check-in typically opens 24 hours before',
        type: 'urgent',
        icon: Plane,
        action: 'Set Reminder',
        timeframe: `${daysUntilTrip} days left`
      });
    }

    // Weather check for packing
    if (daysUntilTrip <= 5 && !dismissedSuggestions.includes('weather-check')) {
      urgent.push({
        id: 'weather-check',
        title: 'Check Weather Forecast',
        detail: `Update packing list based on ${trip.destination} weather`,
        type: 'urgent',
        icon: AlertTriangle,
        action: 'Check Weather',
        timeframe: `${daysUntilTrip} days left`
      });
    }

    // UPCOMING ITEMS (Dynamic)

    // Packing deadline
    if (daysUntilTrip <= 7 && tripReadiness.packingProgress < 50 && !dismissedSuggestions.includes('packing-start')) {
      upcoming.push({
        id: 'packing-start',
        title: 'Start Packing',
        detail: `Only ${tripReadiness.packingProgress}% packed - recommended to start now`,
        type: 'upcoming',
        icon: CheckCircle,
        action: 'View Lists',
        timeframe: `${daysUntilTrip} days left`
      });
    }

    // Kids preparation (if family has children)
    if (hasKids && daysUntilTrip <= 7 && !dismissedSuggestions.includes('kids-prep')) {
      upcoming.push({
        id: 'kids-prep',
        title: 'Prepare Kids for Travel',
        detail: 'Download movies, pack comfort items, explain the trip',
        type: 'upcoming',
        icon: Baby,
        action: 'Plan Now',
        timeframe: `${daysUntilTrip} days left`
      });
    }

    // Download offline content
    if (isInternational && daysUntilTrip <= 5 && !dismissedSuggestions.includes('offline-content')) {
      upcoming.push({
        id: 'offline-content',
        title: 'Download Offline Content',
        detail: 'Maps, translation apps, entertainment for flights',
        type: 'upcoming',
        icon: Phone,
        action: 'Download',
        timeframe: `${daysUntilTrip} days left`
      });
    }

    // COMPLETED ITEMS (Based on actual trip data)

    if (hasFlights) {
      completed.push({
        id: 'flights-booked',
        title: 'Flights Confirmed',
        detail: `${trip.flights.length} flight${trip.flights.length > 1 ? 's' : ''} booked`,
        type: 'completed',
        icon: CheckCircle
      });
    }

    if (trip.accommodations && trip.accommodations.length > 0) {
      completed.push({
        id: 'hotel-booked',
        title: 'Accommodations Reserved',
        detail: `${trip.accommodations.length} place${trip.accommodations.length > 1 ? 's' : ''} confirmed`,
        type: 'completed',
        icon: CheckCircle
      });
    }

    if (trip.activities && trip.activities.length > 0) {
      completed.push({
        id: 'activities-planned',
        title: 'Activities Planned',
        detail: `${trip.activities.length} experience${trip.activities.length > 1 ? 's' : ''} ready`,
        type: 'completed',
        icon: CheckCircle
      });
    }

    // SMART SUGGESTIONS (Trip-specific)

    // Destination-specific suggestions
    if (destination.includes('beach') && !dismissedSuggestions.includes('beach-prep')) {
      suggestions.push({
        id: 'beach-prep',
        title: 'Beach Trip Preparation',
        detail: 'Reef-safe sunscreen, beach toys, waterproof gear',
        icon: Calendar,
        priority: 'medium'
      });
    }

    if (destination.includes('mountain') && !dismissedSuggestions.includes('mountain-prep')) {
      suggestions.push({
        id: 'mountain-prep',
        title: 'Mountain Trip Essentials',
        detail: 'Check hiking gear, weather layers, altitude prep',
        icon: Calendar,
        priority: 'medium'
      });
    }

    // Multi-generational travel
    if (trip.adults && trip.adults.length > 2 && !dismissedSuggestions.includes('family-meeting')) {
      suggestions.push({
        id: 'family-meeting',
        title: 'Family Coordination Meeting',
        detail: 'Review plans with all travelers, assign responsibilities',
        icon: Users,
        priority: 'low'
      });
    }

    return { urgent, upcoming, completed, suggestions };
  };

  const smartItems = generateSmartSuggestions();

  const getItemIcon = (type: string, icon: any) => {
    const IconComponent = icon;
    const baseClasses = "w-5 h-5";
    
    switch (type) {
      case 'critical': return <IconComponent className={`${baseClasses} text-red-600`} />;
      case 'urgent': return <IconComponent className={`${baseClasses} text-orange-600`} />;
      case 'upcoming': return <IconComponent className={`${baseClasses} text-blue-600`} />;
      case 'completed': return <IconComponent className={`${baseClasses} text-green-600`} />;
      default: return <IconComponent className={`${baseClasses} text-gray-600`} />;
    }
  };

  const getItemBorder = (type: string) => {
    switch (type) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'urgent': return 'border-l-orange-500 bg-orange-50';
      case 'upcoming': return 'border-l-blue-500 bg-blue-50';
      case 'completed': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-300 bg-gray-50';
    }
  };

  const getActionButton = (type: string, action?: string) => {
    if (!action) return null;
    
    const buttonClasses = {
      'critical': 'bg-red-600 text-white hover:bg-red-700',
      'urgent': 'bg-orange-600 text-white hover:bg-orange-700',
      'upcoming': 'bg-blue-600 text-white hover:bg-blue-700',
      'completed': 'bg-green-600 text-white hover:bg-green-700'
    };

    return (
      <Button 
        size="sm" 
        className={buttonClasses[type as keyof typeof buttonClasses] || buttonClasses.upcoming}
        onClick={() => onQuickAction(action.toLowerCase().replace(' ', '-'))}
      >
        {action}
      </Button>
    );
  };

  
  return (
    <div className="bg-gray-50 min-h-screen max-w-full overflow-x-hidden">
      {/* Mobile App Header - matches desktop style */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">FamApp</h1>
                <p className="text-xs text-blue-700">Family Travel Made Simple</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium">G</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trip Info Section */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-base font-semibold text-gray-900 mb-1 truncate">
                {trip.destination || 'Madrid, Spain'}
              </h2>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(trip.startDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })} - {new Date(trip.endDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <button 
                  className="flex items-center hover:text-blue-600 transition-colors"
                  onClick={() => onQuickAction('manage-family')}
                >
                  <Users className="w-4 h-4 mr-1" />
                  {trip.travelers?.length || 3} travelers
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                {daysUntilTrip}
              </div>
              <div className="text-xs text-gray-500">
                days to go
              </div>
            </div>
          </div>

          {/* Trip Readiness Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Trip Readiness</span>
              <span className="text-blue-600 font-semibold">{tripReadiness.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${tripReadiness.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{tripReadiness.completed} of {tripReadiness.total} complete</span>
              <span>Packing: {tripReadiness.packingProgress}%</span>
            </div>
          </div>

          {/* Profile Status (simplified) */}
          {familyProfiles.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Family Profiles</span>
                <span className="text-xs text-gray-500">{familyProfiles.length} profiles created</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* URGENT: What Needs Attention */}
        {smartItems.urgent.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-red-800">Needs Your Attention</h2>
            </div>
            
            <div className="space-y-2">
              {smartItems.urgent.map((item) => (
                <Card key={item.id} className={`border-l-4 ${getItemBorder(item.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getItemIcon(item.type, item.icon)}
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{item.title}</div>
                          <div className="text-xs text-gray-600 mt-1">{item.detail}</div>
                          <div className="text-xs font-medium text-red-600 mt-1">{item.timeframe}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getActionButton(item.type, item.action)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissSuggestion(item.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* UPCOMING: Deadlines Approaching */}
        {smartItems.upcoming.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-bold text-orange-800">Coming Up</h2>
            </div>
            
            <div className="space-y-2">
              {smartItems.upcoming.map((item) => (
                <Card key={item.id} className={`border-l-4 ${getItemBorder(item.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getItemIcon(item.type, item.icon)}
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{item.title}</div>
                          <div className="text-xs text-gray-600 mt-1">{item.detail}</div>
                          <div className="text-xs font-medium text-orange-600 mt-1">{item.timeframe}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getActionButton(item.type, item.action)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissSuggestion(item.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* COMPLETED: What's Done */}
        {smartItems.completed.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-green-800">Completed</h2>
              <Badge className="bg-green-100 text-green-800 ml-auto">{smartItems.completed.length}</Badge>
            </div>
            
            <div className="space-y-2">
              {smartItems.completed.map((item) => (
                <Card key={item.id} className={`border-l-4 ${getItemBorder(item.type)}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {getItemIcon(item.type, item.icon)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-gray-600">{item.detail}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Profile Completion Prompt for Better Suggestions */}
        {!profileCompleteness.canUnlockPersonalization && profileCompleteness.incompleteProfiles.length > 0 && smartItems.suggestions.length > 0 && (
          <Card className="border-2 border-dashed border-purple-200 bg-purple-50 mb-4">
            <CardContent className="p-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Get 3+ More Personalized Tasks</h3>
                  <p className="text-gray-600 text-xs mb-2">
                    Complete {profileCompleteness.incompleteProfiles[0]?.name}'s profile to unlock family-specific recommendations for activities, dining, and timing.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={onOpenFamilyProfiles}
                      className="text-xs border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      Complete Profile
                    </Button>
                    <span className="text-xs text-purple-600">
                      {calculateProfileCompleteness(profileCompleteness.incompleteProfiles[0] || {} as FamilyMember)}% complete
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SUGGESTED: Smart Next Steps */}
        {smartItems.suggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-blue-800">
                Suggested
                {!profileCompleteness.canUnlockPersonalization && (
                  <span className="text-xs font-normal text-gray-500 ml-2">
                    (Basic recommendations)
                  </span>
                )}
              </h2>
            </div>
            
            <div className="space-y-2">
              {smartItems.suggestions.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-blue-300 bg-blue-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {getItemIcon('upcoming', item.icon)}
                      <div className="flex-1">
                        <div className="font-medium text-sm text-blue-900">{item.title}</div>
                        <div className="text-xs text-blue-700">{item.detail}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-700 border-blue-300"
                          onClick={() => onQuickAction('consider')}
                        >
                          Consider
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissSuggestion(item.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOM TASKS: User-defined readiness items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-purple-800">My Tasks</h2>
              {trip.customReadinessItems && trip.customReadinessItems.length > 0 && (
                <Badge className="bg-purple-100 text-purple-800">
                  {trip.customReadinessItems.filter(t => t.status === 'complete').length} / {trip.customReadinessItems.length}
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddTask(true)}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>
          
          {trip.customReadinessItems && trip.customReadinessItems.length > 0 ? (
            <div className="space-y-4">
              {/* AI-Generated Tasks - Grouped by Category */}
              {trip.customReadinessItems.filter(task => !task.isCustom).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-medium text-blue-800">AI Recommendations</h3>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {trip.customReadinessItems.filter(task => !task.isCustom).length} tasks
                    </Badge>
                  </div>
                  
                  {(() => {
                    const aiTasks = trip.customReadinessItems.filter(task => !task.isCustom);
                    const groupedTasks = groupTasksByCategory(aiTasks);
                    
                    return (
                      <div className="space-y-3">
                        {Object.entries(groupedTasks).map(([category, tasks]) => {
                          const categoryInfo = getCategoryInfo(category);
                          const isCollapsed = collapsedCategories.has(category);
                          const completedCount = tasks.filter(t => t.status === 'complete').length;
                          
                          return (
                            <Card key={category} className="border border-gray-200">
                              <CardContent className="p-0">
                                {/* Category Header */}
                                <Button
                                  variant="ghost"
                                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                                  onClick={() => toggleCategory(category)}
                                >
                                  <div className="flex items-center gap-3">
                                    <categoryInfo.icon className={`w-4 h-4 text-${categoryInfo.color}-600`} />
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium text-sm">{categoryInfo.name}</span>
                                      <span className="text-xs text-gray-500">{categoryInfo.description}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {completedCount}/{tasks.length}
                                    </Badge>
                                    {isCollapsed ? (
                                      <ChevronRight className="w-4 h-4 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-400" />
                                    )}
                                  </div>
                                </Button>
                                
                                {/* Category Tasks */}
                                {!isCollapsed && (
                                  <div className="px-4 pb-4 space-y-2">
                                    {tasks.map((task) => (
                                      <div key={task.id} className={`p-3 rounded-lg border ${task.urgent ? 'border-red-200 bg-red-50' : task.priority === 'high' ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-start gap-3 flex-1">
                                            <Checkbox 
                                              checked={task.status === 'complete'}
                                              onCheckedChange={() => toggleCustomTask(task.id)}
                                            />
                                            <div className="flex-1">
                                              <div className={`font-medium text-sm ${task.status === 'complete' ? 'line-through text-gray-500' : ''}`}>
                                                {task.title}
                                                {task.urgent && <span className="text-red-500 ml-1">⚠️</span>}
                                                {task.priority === 'high' && !task.urgent && <span className="text-orange-500 ml-1">🔺</span>}
                                              </div>
                                              {task.subtitle && (
                                                <div className={`text-xs text-gray-600 mt-1 ${task.status === 'complete' ? 'line-through' : ''}`}>
                                                  {task.subtitle}
                                                </div>
                                              )}
                                              {task.intelligence && (
                                                <div className="text-xs text-blue-600 mt-2 bg-blue-100 px-2 py-1 rounded">
                                                  💡 {task.intelligence.reasoning}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteCustomTask(task.id)}
                                            className="text-gray-400 hover:text-red-600 p-1"
                                            title="Dismiss this suggestion"
                                          >
                                            <X className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Custom Tasks */}
              {trip.customReadinessItems.filter(task => task.isCustom).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-medium text-purple-800">Your Custom Tasks</h3>
                  </div>
                  <div className="space-y-2">
                    {trip.customReadinessItems
                      .filter(task => task.isCustom)
                      .map((task) => (
                        <Card key={task.id} className="border-l-4 border-l-purple-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <Checkbox 
                                  checked={task.status === 'complete'}
                                  onCheckedChange={() => toggleCustomTask(task.id)}
                                />
                                <div className="flex-1">
                                  <div className={`font-semibold text-sm ${task.status === 'complete' ? 'line-through text-gray-500' : ''}`}>
                                    {task.title}
                                    {task.urgent && <span className="text-red-500 ml-1">⚠️</span>}
                                  </div>
                                  {task.subtitle && (
                                    <div className={`text-xs text-gray-600 mt-1 ${task.status === 'complete' ? 'line-through' : ''}`}>
                                      {task.subtitle}
                                    </div>
                                  )}
                                  {task.category && task.category !== 'custom' && (
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {task.category}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => editCustomTask(task.id)}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteCustomTask(task.id)}
                                  className="text-gray-400 hover:text-red-600 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card className="border-dashed border-gray-300">
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">No custom tasks yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add your own tasks to track trip preparation progress
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddTask(true)}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Your First Task
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Personalized Trip Recommendations Section */}
        {cityTips.length > 0 && (
          profileCompleteness.canUnlockPersonalization ? (
            <TripTips 
              cityName={trip.destination || 'your destination'}
              tips={cityTips}
              onAddToItinerary={handleAddToItinerary}
            />
          ) : (
            <Card className="mt-6 border-2 border-dashed border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Unlock Personalized Recommendations
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Complete your family profiles to get intelligent suggestions tailored specifically to your family's interests, ages, and preferences.
                    </p>
                    
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Family Profile Completion</span>
                        <span className="text-sm font-bold text-blue-600">{profileCompleteness.tripMemberCompleteness}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${profileCompleteness.tripMemberCompleteness}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Need 70% completion to unlock personalized features
                      </p>
                    </div>

                    {profileCompleteness.incompleteProfiles.length > 0 && (
                      <div className="text-left mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Incomplete profiles:</p>
                        <div className="space-y-1">
                          {profileCompleteness.incompleteProfiles.map(profile => (
                            <div key={profile.id} className="flex items-center justify-between bg-white rounded p-2">
                              <span className="text-sm text-gray-600">{profile.name}</span>
                              <span className="text-xs text-orange-600 font-medium">
                                {calculateProfileCompleteness(profile)}% complete
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={onOpenFamilyProfiles}
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                  >
                    Complete Family Profiles
                  </Button>
                  
                  <div className="text-xs text-gray-500">
                    ✨ Get recommendations for kid-friendly activities, restaurants, and timing that work for your specific family
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        )}

      </div>

      {/* Add/Edit Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowAddTask(false);
                  setEditingTask(null);
                  setNewTaskForm({ title: '', subtitle: '', category: '', urgent: false });
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <Input
                  placeholder="e.g., Book travel insurance"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <Input
                  placeholder="Additional details..."
                  value={newTaskForm.subtitle}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, subtitle: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category (optional)
                </label>
                <Input
                  placeholder="e.g., documents, health, planning"
                  value={newTaskForm.category}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, category: e.target.value })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={newTaskForm.urgent}
                  onCheckedChange={(checked) => setNewTaskForm({ ...newTaskForm, urgent: !!checked })}
                />
                <label className="text-sm font-medium text-gray-700">
                  Mark as urgent
                </label>
              </div>
            </div>
            
            <div className="border-t px-6 py-4 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddTask(false);
                  setEditingTask(null);
                  setNewTaskForm({ title: '', subtitle: '', category: '', urgent: false });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingTask ? updateCustomTask : addCustomTask}
                disabled={!newTaskForm.title.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};