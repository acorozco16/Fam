import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  AlertTriangle, Clock, CheckCircle, Zap, 
  Calendar, MapPin, Users, Phone, FileText, 
  Heart, Shield, Baby, Plane
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
}

export const MobileOverview: React.FC<MobileOverviewProps> = ({ trip, onQuickAction }) => {
  // Calculate trip stats
  const daysUntilTrip = Math.ceil((new Date(trip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isUpcoming = daysUntilTrip > 0;
  
  // Smart urgency detection
  const urgentItems = [
    {
      id: 'passport-expiry',
      title: 'Check Passport Expiration',
      detail: 'Some countries require 6+ months validity',
      type: 'critical',
      icon: FileText,
      action: 'Check Now',
      timeframe: 'Do today'
    },
    {
      id: 'flight-checkin',
      title: 'Flight Check-in Opens Soon',
      detail: 'Delta 2847 • Check-in opens in 18 hours',
      type: 'urgent',
      icon: Plane,
      action: 'Set Reminder',
      timeframe: '18 hours'
    }
  ];

  const upcomingItems = [
    {
      id: 'packing-deadline',
      title: 'Start Packing',
      detail: 'Recommended 3 days before departure',
      type: 'upcoming',
      icon: CheckCircle,
      action: 'View Lists',
      timeframe: '3 days left'
    },
    {
      id: 'kids-prep',
      title: 'Prepare Kids for Travel',
      detail: 'Download movies, pack comfort items',
      type: 'upcoming',
      icon: Baby,
      action: 'Plan Now',
      timeframe: '1 week left'
    }
  ];

  const completedItems = [
    {
      id: 'flights-booked',
      title: 'Flights Confirmed',
      detail: 'Delta 2847 & 2848 • All travelers',
      type: 'completed',
      icon: CheckCircle
    },
    {
      id: 'hotel-booked',
      title: 'Hotel Reserved',
      detail: 'Casa Fuster • 7 nights confirmed',
      type: 'completed',
      icon: CheckCircle
    }
  ];

  const smartSuggestions = [
    {
      id: 'weather-prep',
      title: 'Check Weather & Pack Accordingly',
      detail: 'Madrid forecast: 15-20°C, possible rain',
      icon: Calendar,
      priority: 'medium'
    },
    {
      id: 'family-meeting',
      title: 'Family Trip Meeting',
      detail: 'Review itinerary with kids, set expectations',
      icon: Users,
      priority: 'low'
    }
  ];

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
      {/* Clean Trip Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900 mb-2 truncate">{trip.tripName}</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{trip.destination}</span>
            <span className="text-gray-300">•</span>
            <span className="font-medium">{trip.travelers?.length || 3} travelers</span>
          </div>
          <div className="flex flex-col items-end text-right">
            <div className="text-sm font-semibold text-blue-600">
              {daysUntilTrip} days to go
            </div>
            <div className="text-xs text-gray-500">
              {new Date(trip.startDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })} - {new Date(trip.endDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* URGENT: What Needs Attention */}
        {urgentItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-red-800">Needs Your Attention</h2>
            </div>
            
            <div className="space-y-2">
              {urgentItems.map((item) => (
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
                      {getActionButton(item.type, item.action)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* UPCOMING: Deadlines Approaching */}
        {upcomingItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-bold text-orange-800">Coming Up</h2>
            </div>
            
            <div className="space-y-2">
              {upcomingItems.map((item) => (
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
                      {getActionButton(item.type, item.action)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* COMPLETED: What's Done */}
        {completedItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-green-800">Completed</h2>
              <Badge className="bg-green-100 text-green-800 ml-auto">{completedItems.length}</Badge>
            </div>
            
            <div className="space-y-2">
              {completedItems.map((item) => (
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
        {smartSuggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-blue-800">Suggested</h2>
            </div>
            
            <div className="space-y-2">
              {smartSuggestions.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-blue-300 bg-blue-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {getItemIcon('upcoming', item.icon)}
                      <div className="flex-1">
                        <div className="font-medium text-sm text-blue-900">{item.title}</div>
                        <div className="text-xs text-blue-700">{item.detail}</div>
                      </div>
                      <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                        Consider
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats Footer */}
        <Card className="bg-gray-100">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{completedItems.length}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">{urgentItems.length + upcomingItems.length}</div>
                <div className="text-xs text-gray-600">To Do</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{trip.travelers?.length || 0}</div>
                <div className="text-xs text-gray-600">Travelers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};