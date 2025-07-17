import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Clock, Calendar, MapPin, Users, Plus, 
  CheckCircle, AlertTriangle, Edit3, Trash2,
  Plane, Hotel, Car, Activity, Coffee, Building,
  TreePine, Baby, Play, Utensils, Camera, 
  Home, Compass, Phone
} from 'lucide-react';

interface MobileItineraryProps {
  trip: any;
  onAddActivity: () => void;
  onEditActivity: (activity: any) => void;
}

export const MobileItinerary: React.FC<MobileItineraryProps> = ({ 
  trip, 
  onAddActivity, 
  onEditActivity 
}) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  // Generate all dates for the trip (same as desktop)
  const getAllTripDates = () => {
    const allTripDates: string[] = [];
    
    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const current = new Date(start);
      
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        allTripDates.push(dateStr);
        current.setDate(current.getDate() + 1);
      }
    }
    
    return allTripDates;
  };

  // Group all itinerary items by date (same as desktop)
  const getItineraryItemsByDate = () => {
    const itineraryItemsByDate: Record<string, any[]> = {};
    
    // Add activities
    (trip.activities || []).forEach((activity: any) => {
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
    (trip.flights || []).forEach((flight: any) => {
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
    (trip.transportation || []).forEach((transport: any) => {
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
    (trip.accommodations || trip.hotels || []).forEach((accommodation: any) => {
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
      if (checkOutDate) {
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
      itineraryItemsByDate[date].sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
      });
    });
    
    return itineraryItemsByDate;
  };

  const allTripDates = getAllTripDates();
  const itineraryItemsByDate = getItineraryItemsByDate();
  const totalItems = Object.values(itineraryItemsByDate).flat().length;

  // Set first day as default if no day selected
  React.useEffect(() => {
    if (allTripDates.length > 0 && !selectedDay) {
      setSelectedDay(allTripDates[0]);
    }
  }, [allTripDates, selectedDay]);

  // Get data for selected day
  const selectedDayItems = selectedDay ? itineraryItemsByDate[selectedDay] || [] : [];
  const getDayNumber = (dateString: string) => {
    const tripStart = new Date(trip.startDate);
    const currentDate = new Date(dateString);
    const diffTime = currentDate.getTime() - tripStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Booked': return 'bg-green-100 text-green-800';
      case 'Planned': return 'bg-blue-100 text-blue-800';
      case 'Suggested': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemTypeIcon = (itemType: string) => {
    switch (itemType) {
      case 'flight': return Plane;
      case 'accommodation': return Hotel;
      case 'transportation': return Car;
      case 'activity': return Activity;
      default: return Activity;
    }
  };

  const getItemTypeColor = (itemType: string) => {
    switch (itemType) {
      case 'flight': return 'bg-blue-500';
      case 'accommodation': return 'bg-green-500';
      case 'transportation': return 'bg-purple-500';
      case 'activity': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Itinerary</h1>
            <p className="text-sm text-gray-600">
              {totalItems} items planned
            </p>
          </div>
          <Button onClick={onAddActivity} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </Button>
        </div>
      </div>

      {/* Day Selector */}
      {allTripDates.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allTripDates.map((date) => {
              const dayNumber = getDayNumber(date);
              const hasItems = itineraryItemsByDate[date] && itineraryItemsByDate[date].length > 0;
              
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDay(date)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedDay === date
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Day {dayNumber}</div>
                    <div className="text-xs opacity-75">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    {hasItems && (
                      <div className="text-xs mt-1">
                        {selectedDay === date ? '●' : '•'} {itineraryItemsByDate[date].length}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-4">
        {allTripDates.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No trip dates set
            </h3>
            <p className="text-gray-600 mb-6">
              Set your trip dates to start building your itinerary.
            </p>
          </div>
        ) : totalItems === 0 ? (
          // No items planned yet
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No activities planned yet
            </h3>
            <p className="text-gray-600">
              Start building your itinerary by adding activities, tours, and experiences.
            </p>
          </div>
        ) : selectedDay ? (
          // Show selected day
          <div className="space-y-4">
            {/* Date Header */}
            <div className="flex items-center space-x-3 py-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {getDayNumber(selectedDay)}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Day {getDayNumber(selectedDay)}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedDay)}
                  </p>
                </div>
              </div>

              {/* Items for this date */}
              <div className="space-y-3 ml-6">
                {selectedDayItems.length > 0 ? (
                  selectedDayItems.map((item, index) => {
                    const IconComponent = getItemTypeIcon(item.itemType);
                    const iconColor = getItemTypeColor(item.itemType);
                    
                    return (
                      <Card key={`${item.id}-${index}`} className="shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColor}`}>
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {item.name}
                                </h3>
                                {item.status && (
                                  <Badge className={getStatusColor(item.status)}>
                                    {item.status}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-600">
                                {item.time && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{item.time}</span>
                                    {item.duration && (
                                      <span className="text-gray-400">
                                        • {item.duration}
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                {item.location && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{item.location}</span>
                                  </div>
                                )}
                                
                                {item.participants && item.participants.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-4 h-4" />
                                    <span>{item.participants.join(', ')}</span>
                                  </div>
                                )}
                              </div>
                              
                              {item.cost && (
                                <div className="mt-2 text-sm font-medium text-green-600">
                                  {item.cost}
                                </div>
                              )}
                            </div>
                            
                            {item.itemType === 'activity' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => onEditActivity(item)}
                                className="ml-2"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          {item.bookingRequired && item.status !== 'Booked' && (
                            <div className="mt-3 flex items-center space-x-2 text-sm text-amber-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Booking required</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  // No items for this date
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No activities planned for this day</p>
                  </div>
                )}
              </div>
            </div>
        ) : null}
      </div>
    </div>
  );
};