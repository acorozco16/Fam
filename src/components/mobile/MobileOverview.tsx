import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Plane, Hotel, Calendar, Car, Users, MapPin, 
  CheckCircle, Clock, AlertTriangle, Plus
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
  const activitiesCount = trip.activities?.length || 0;
  const flightsBooked = trip.flights?.filter(f => f.confirmationNumber).length || 0;
  
  // Calculate completion percentage
  const totalTasks = 10; // Example: flights, hotels, activities, packing, etc.
  const completedTasks = 7; // Calculate based on actual data
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

  const quickActions = [
    { id: 'flight', icon: Plane, title: 'Add Flight', color: 'bg-blue-500' },
    { id: 'hotel', icon: Hotel, title: 'Book Hotel', color: 'bg-purple-500' },
    { id: 'activity', icon: Calendar, title: 'Add Activity', color: 'bg-green-500' },
    { id: 'packing', icon: CheckCircle, title: 'Packing List', color: 'bg-orange-500' }
  ];

  const statusItems = [
    {
      id: 1,
      title: 'Flights Confirmed',
      detail: `${flightsBooked} of ${trip.travelers?.length || 1} travelers`,
      status: flightsBooked > 0 ? 'completed' : 'pending',
      action: flightsBooked === 0 ? 'Add Flight' : null
    },
    {
      id: 2,
      title: 'Hotel Reservations',
      detail: trip.accommodations?.length > 0 ? 'Confirmed' : 'Need booking',
      status: trip.accommodations?.length > 0 ? 'completed' : 'warning',
      action: trip.accommodations?.length === 0 ? 'Book Hotel' : null
    },
    {
      id: 3,
      title: 'Travel Insurance',
      detail: 'Not purchased',
      status: 'error',
      action: 'Get Quote'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500';
      case 'warning': return 'border-yellow-500';
      case 'error': return 'border-red-500';
      default: return 'border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Trip Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-4 pb-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold mb-1">{trip.tripName}</h1>
          <p className="text-blue-100 text-sm flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {trip.destination} • {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-2xl font-bold">{daysUntilTrip}</div>
            <div className="text-xs text-blue-200">DAYS LEFT</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{activitiesCount}</div>
            <div className="text-xs text-blue-200">ACTIVITIES</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{flightsBooked}</div>
            <div className="text-xs text-blue-200">FLIGHTS</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{completionPercentage}%</div>
            <div className="text-xs text-blue-200">COMPLETE</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-blue-800 bg-opacity-50 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Card 
                key={action.id}
                className="cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => onQuickAction(action.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-semibold text-sm">{action.title}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trip Status */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Trip Status</h2>
            <Button variant="ghost" size="sm" className="text-blue-600">
              View All
            </Button>
          </div>
          
          <div className="space-y-2">
            {statusItems.map((item) => (
              <Card key={item.id} className={`border-l-4 ${getStatusColor(item.status)}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(item.status)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-gray-600">{item.detail}</div>
                      </div>
                    </div>
                    {item.action && (
                      <Button 
                        size="sm" 
                        variant="default"
                        className="ml-3"
                        onClick={() => onQuickAction(item.action.toLowerCase().replace(' ', '-'))}
                      >
                        {item.action}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Who's Going */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Who's Going
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600">
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex -space-x-2">
              {trip.travelers?.slice(0, 4).map((traveler, index) => (
                <div
                  key={index}
                  className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold border-2 border-white"
                  title={traveler.name}
                >
                  {traveler.name?.charAt(0) || 'U'}
                </div>
              ))}
              {trip.travelers?.length > 4 && (
                <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-semibold border-2 border-white">
                  +{trip.travelers.length - 4}
                </div>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {trip.travelers?.length || 0} travelers
            </div>
          </CardContent>
        </Card>

        {/* Next Activity */}
        {trip.activities?.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Next Activity</h3>
              <div className="text-sm text-blue-800">
                <div className="font-medium">{trip.activities[0].name}</div>
                <div className="text-xs text-blue-600 mt-1">
                  {new Date(trip.activities[0].date).toLocaleDateString()} at {trip.activities[0].time}
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                View Itinerary
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};