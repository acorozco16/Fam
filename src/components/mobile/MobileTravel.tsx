import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Plane, Hotel, Car, MapPin, Clock, Users, 
  Plus, Edit3, Trash2, Calendar, Phone, 
  AlertTriangle, CheckCircle, Compass, Sparkles, User
} from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  type: 'adult' | 'child';
  age?: string;
  relationship?: string;
  interests?: string;
  dietaryInfo?: string;
  healthInfo?: string;
  energyLevel?: string[];
  activityPreferences?: string[];
  sleepSchedule?: string;
}

interface MobileTravelProps {
  trip: any;
  onAddFlight: () => void;
  onEditFlight: (flight: any, index: number) => void;
  onAddAccommodation: () => void;
  onEditAccommodation: (accommodation: any, index: number) => void;
  onAddTransportation: () => void;
  onEditTransportation: (transport: any, index: number) => void;
  familyProfiles?: FamilyMember[];
  onOpenFamilyProfiles?: () => void;
}

export const MobileTravel: React.FC<MobileTravelProps> = ({ 
  trip, 
  onAddFlight,
  onEditFlight,
  onAddAccommodation,
  onEditAccommodation,
  onAddTransportation,
  onEditTransportation,
  familyProfiles = [],
  onOpenFamilyProfiles
}) => {
  const [activeSection, setActiveSection] = useState<'flights' | 'accommodations' | 'transportation'>('flights');

  const flights = trip.flights || [];
  const accommodations = trip.accommodations || trip.hotels || [];
  const transportation = trip.transportation || [];

  // Profile completeness calculation
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
    
    // Detailed fields (40% weight)
    detailedFields.forEach(field => {
      maxScore += 40;
      const value = profile[field as keyof FamilyMember];
      if (value && (Array.isArray(value) ? value.length > 0 : value !== '')) {
        score += 40;
      }
    });
    
    return Math.round((score / maxScore) * 100);
  };

  const getProfileCompleteness = () => {
    if (familyProfiles.length === 0) {
      return { percentage: 0, canUnlockPersonalization: false, incompleteCount: 0 };
    }
    
    const completenessScores = familyProfiles.map(calculateProfileCompleteness);
    const averageCompleteness = Math.round(
      completenessScores.reduce((sum, score) => sum + score, 0) / completenessScores.length
    );
    const incompleteCount = completenessScores.filter(score => score < 70).length;
    
    return {
      percentage: averageCompleteness,
      canUnlockPersonalization: averageCompleteness >= 70,
      incompleteCount
    };
  };

  const profileCompleteness = getProfileCompleteness();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Format HH:MM
  };

  const FlightSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Flights</h2>
          <p className="text-sm text-gray-600">{flights.length} flights</p>
        </div>
        <Button onClick={onAddFlight} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Flight
        </Button>
      </div>

      {flights.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No flights added yet</h3>
          <p className="text-gray-500 mb-4">
            Add your flight details to keep track of your travel plans
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
            <p className="text-sm text-blue-800 font-medium mb-1">✈️ Pro tip:</p>
            <p className="text-sm text-blue-700">Book flights 6-8 weeks ahead for best prices. For families, consider direct flights to reduce travel stress.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {flights.map((flight: any, index: number) => (
            <Card key={`flight-${index}`} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Plane className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {flight.airline} {flight.flightNumber}
                        </h3>
                        {flight.status && (
                          <Badge className={getStatusColor(flight.status)}>
                            {flight.status}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{flight.departure || flight.from}</span>
                          </div>
                          <span className="text-gray-400">→</span>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{flight.arrival || flight.to}</span>
                          </div>
                        </div>
                        
                        {flight.date && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(flight.date)}</span>
                          </div>
                        )}
                        
                        {flight.departureTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Departure: {formatTime(flight.departureTime)}</span>
                          </div>
                        )}
                        
                        {flight.familyAssignments && flight.familyAssignments.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{flight.familyAssignments.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditFlight(flight, index)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const AccommodationSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Accommodations</h2>
          <p className="text-sm text-gray-600">{accommodations.length} places</p>
        </div>
        <Button onClick={onAddAccommodation} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Place
        </Button>
      </div>

      {accommodations.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <Hotel className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No accommodations added yet</h3>
          <p className="text-gray-500 mb-4">
            Add hotels, Airbnb, or other places you'll be staying
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-left">
            <p className="text-sm text-green-800 font-medium mb-1">🏨 Family tip:</p>
            <p className="text-sm text-green-700">Look for hotels with connecting rooms, cribs available, and kid-friendly amenities like pools or play areas.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {accommodations.map((accommodation: any, index: number) => (
            <Card key={`accommodation-${index}`} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Hotel className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {accommodation.name}
                        </h3>
                        {accommodation.status && (
                          <Badge className={getStatusColor(accommodation.status)}>
                            {accommodation.status}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        {accommodation.address && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{accommodation.address}</span>
                          </div>
                        )}
                        
                        {accommodation.checkIn && accommodation.checkOut && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(accommodation.checkIn)} - {formatDate(accommodation.checkOut)}
                            </span>
                          </div>
                        )}
                        
                        {accommodation.familyAssignments && accommodation.familyAssignments.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{accommodation.familyAssignments.join(', ')}</span>
                          </div>
                        )}
                        
                        {accommodation.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{accommodation.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditAccommodation(accommodation, index)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const TransportationSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Transportation</h2>
          <p className="text-sm text-gray-600">{transportation.length} items</p>
        </div>
        <Button onClick={onAddTransportation} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Transport
        </Button>
      </div>

      {transportation.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transportation added yet</h3>
          <p className="text-gray-500 mb-4">
            Add rental cars, trains, buses, or other transportation
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-left">
            <p className="text-sm text-purple-800 font-medium mb-1">🚗 Travel tip:</p>
            <p className="text-sm text-purple-700">For families, ensure car seats are available with rentals, or consider ride-sharing with car seats in cities.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {transportation.map((transport: any, index: number) => (
            <Card key={`transport-${index}`} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Car className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {transport.type} - {transport.details}
                        </h3>
                        {transport.status && (
                          <Badge className={getStatusColor(transport.status)}>
                            {transport.status}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        {transport.date && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(transport.date)}</span>
                          </div>
                        )}
                        
                        {transport.time && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(transport.time)}</span>
                          </div>
                        )}
                        
                        {transport.familyAssignments && transport.familyAssignments.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{transport.familyAssignments.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditTransportation(transport, index)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Travel</h1>
            <p className="text-sm text-gray-600">
              {flights.length + accommodations.length + transportation.length} items
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant={activeSection === 'flights' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveSection('flights')}
            >
              <Plane className="w-4 h-4" />
            </Button>
            <Button
              variant={activeSection === 'accommodations' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveSection('accommodations')}
            >
              <Hotel className="w-4 h-4" />
            </Button>
            <Button
              variant={activeSection === 'transportation' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveSection('transportation')}
            >
              <Car className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Completion Prompt */}
      {!profileCompleteness.canUnlockPersonalization && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200 px-4 py-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-purple-900 mb-1">
                Get Family-Optimized Travel Recommendations
              </h3>
              <p className="text-xs text-purple-700 mb-3">
                Complete family profiles to unlock personalized travel suggestions based on family size, ages, accessibility needs, and travel preferences.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-purple-600">
                  <User className="w-4 h-4" />
                  <span>{profileCompleteness.percentage}% complete</span>
                  {profileCompleteness.incompleteCount > 0 && (
                    <span className="text-purple-500">
                      • {profileCompleteness.incompleteCount} profiles need completion
                    </span>
                  )}
                </div>
                {onOpenFamilyProfiles && (
                  <Button 
                    onClick={onOpenFamilyProfiles}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs"
                  >
                    Complete Profiles
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {activeSection === 'flights' && <FlightSection />}
        {activeSection === 'accommodations' && <AccommodationSection />}
        {activeSection === 'transportation' && <TransportationSection />}
      </div>
    </div>
  );
};