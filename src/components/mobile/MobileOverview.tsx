import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  AlertTriangle, Clock, CheckCircle, Zap, 
  Calendar, MapPin, Users, Phone, FileText, 
  Heart, Shield, Baby, Plane, ArrowLeft
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

interface MobileOverviewProps {
  trip: TripData;
  onQuickAction: (action: string) => void;
  onBack?: () => void;
}

export const MobileOverview: React.FC<MobileOverviewProps> = ({ trip, onQuickAction, onBack }) => {
  const [dismissedSuggestions, setDismissedSuggestions] = React.useState<string[]>([]);
  
  // Calculate trip stats
  const daysUntilTrip = Math.ceil((new Date(trip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isUpcoming = daysUntilTrip > 0;

  const dismissSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => [...prev, suggestionId]);
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

        {/* SUGGESTED: Smart Next Steps */}
        {smartItems.suggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-blue-800">Suggested</h2>
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

      </div>
    </div>
  );
};