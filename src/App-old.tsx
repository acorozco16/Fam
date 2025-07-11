import React, { useState, useEffect } from 'react';
import { TestInput } from './TestInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  FileText, ArrowRight, ArrowLeft, Home
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
}

// Mock AI Chat Component
const AIChat = ({ tripData, onSuggestion }: { tripData: TripData; onSuggestion: (suggestion: any) => void }) => {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: "Hi! I'm your family trip coordinator assistant. I can help optimize your schedule, suggest activities, and handle logistics. What would you like help with?"
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Mock AI response based on context
    setTimeout(() => {
      let aiResponse = '';
      
      if (input.toLowerCase().includes('restaurant') || input.toLowerCase().includes('lunch')) {
        aiResponse = `For your family with ${tripData.kids?.length || 0} kids and elderly members, I'd recommend Casa Botín near the cathedral - ground floor seating, kid-friendly, and wheelchair accessible. Opens at 1pm (most places close for siesta).`;
      } else if (input.toLowerCase().includes('museum') || input.toLowerCase().includes('prado')) {
        aiResponse = `With your family mix, I'd book Prado for 10am. Museums take 3+ hours with kids, and you'll want energy for afternoon activities. Plus morning crowds are lighter.`;
      } else if (input.toLowerCase().includes('schedule') || input.toLowerCase().includes('time')) {
        aiResponse = `Looking at your itinerary, you have a 2-hour gap Tuesday afternoon. Perfect for Retiro Park - kids can run around while grandparents rest on benches. It's a 10-minute walk from your morning activity.`;
      } else {
        aiResponse = `Got it! Based on your family profile (multi-generational with accessibility needs), I can help optimize that. Would you like specific recommendations or schedule adjustments?`;
      }
      
      setMessages(prev => [...prev, { type: 'ai', content: aiResponse }]);
    }, 1000);
    
    setInput('');
  };

  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
          AI Coordinator Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-80">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-3 rounded-lg ${
                msg.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-purple-50 text-purple-900 border border-purple-200'
              }`}>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about schedules, restaurants, activities..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const FamApp = () => {
  // Temporary test - comment this out to see the full app
  // return <TestInput />;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [tripData, setTripData] = useState<TripData>({});
  const [currentView, setCurrentView] = useState<'wizard' | 'dashboard' | 'itinerary'>('wizard');

  // Sample data for demo
  const sampleActivities: Activity[] = [
    {
      id: '1',
      name: 'Prado Museum Tour',
      date: '2024-03-15',
      time: '10:00',
      duration: '3 hours',
      location: 'Museo del Prado, Madrid',
      status: 'Booked',
      cost: '€60 family ticket',
      familyRating: 4.5,
      aiInsight: 'Perfect timing - morning visits are less crowded and work better with Emma\'s energy levels. The family audio guide includes kid-friendly explanations.',
      participants: ['sarah', 'mike', 'emma'],
      bookingRequired: true
    },
    {
      id: '2',
      name: 'Retiro Park Picnic',
      date: '2024-03-15',
      time: '14:00',
      duration: '2 hours',
      location: 'Parque del Retiro, Madrid',
      status: 'Planned',
      familyRating: 4.8,
      aiInsight: 'Great for the whole family! Kids can play while grandparents rest. There are accessible paths and plenty of benches. Perfect break between museum and dinner.',
      participants: ['sarah', 'mike', 'emma', 'grandpa', 'grandma']
    }
  ];

  // Trip Creation Steps
  const DestinationStep = () => {
    const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTripData(prev => ({...prev, city: e.target.value}));
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTripData(prev => ({...prev, country: e.target.value}));
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTripData(prev => ({...prev, startDate: e.target.value}));
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTripData(prev => ({...prev, endDate: e.target.value}));
    };

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
              <Label>City</Label>
              <Input 
                placeholder="e.g., Madrid, Paris"
                value={tripData.city || ''}
                onChange={handleCityChange}
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input 
                placeholder="e.g., Spain, France"
                value={tripData.country || ''}
                onChange={handleCountryChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input 
                type="date"
                value={tripData.startDate || ''}
                onChange={handleStartDateChange}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input 
                type="date"
                value={tripData.endDate || ''}
                onChange={handleEndDateChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const FamilyProfilesStep = () => {
    const [adults, setAdults] = useState<FamilyMember[]>(tripData.adults || []);
    const [kids, setKids] = useState<FamilyMember[]>(tripData.kids || []);

    const addFamilyMember = (type: 'adult' | 'child') => {
      const newMember: FamilyMember = {
        id: Date.now().toString(),
        name: '',
        type,
        age: type === 'child' ? '' : undefined,
        email: type === 'adult' ? '' : undefined,
        interests: '',
        specialNeeds: '',
        inviteStatus: type === 'adult' ? 'pending' : undefined
      };
      
      if (type === 'adult') {
        setAdults([...adults, newMember]);
      } else {
        setKids([...kids, newMember]);
      }
    };

    useEffect(() => {
      setTripData(prev => ({...prev, adults, kids}));
    }, [adults, kids]);

    return (
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="adults" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="adults">Adults ({adults.length})</TabsTrigger>
            <TabsTrigger value="children">Children ({kids.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="adults" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Adult Travelers</h3>
              <Button onClick={() => addFamilyMember('adult')} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Adult
              </Button>
            </div>
            
            {adults.map((adult, idx) => (
              <Card key={adult.id}>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input 
                        value={adult.name}
                        onChange={(e) => {
                          const updated = adults.map(a => a.id === adult.id ? {...a, name: e.target.value} : a);
                          setAdults(updated);
                        }}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input 
                        value={adult.email || ''}
                        onChange={(e) => {
                          const updated = adults.map(a => a.id === adult.id ? {...a, email: e.target.value} : a);
                          setAdults(updated);
                        }}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Interests</Label>
                    <Input 
                      value={adult.interests || ''}
                      onChange={(e) => {
                        const updated = adults.map(a => a.id === adult.id ? {...a, interests: e.target.value} : a);
                        setAdults(updated);
                      }}
                      placeholder="e.g., history, food, photography"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="children" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Children</h3>
              <Button onClick={() => addFamilyMember('child')} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Child
              </Button>
            </div>
            
            {kids.map((kid) => (
              <Card key={kid.id}>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input 
                        value={kid.name}
                        onChange={(e) => {
                          const updated = kids.map(k => k.id === kid.id ? {...k, name: e.target.value} : k);
                          setKids(updated);
                        }}
                        placeholder="Child's name"
                      />
                    </div>
                    <div>
                      <Label>Age</Label>
                      <Input 
                        value={kid.age || ''}
                        onChange={(e) => {
                          const updated = kids.map(k => k.id === kid.id ? {...k, age: e.target.value} : k);
                          setKids(updated);
                        }}
                        placeholder="Age"
                        type="number"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Interests</Label>
                    <Input 
                      value={kid.interests || ''}
                      onChange={(e) => {
                        const updated = kids.map(k => k.id === kid.id ? {...k, interests: e.target.value} : k);
                        setKids(updated);
                      }}
                      placeholder="e.g., animals, art, sports"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const TravelStyleStep = () => {
    const styles = [
      { id: 'adventure', name: 'Adventure Seekers', icon: Compass, color: 'green', desc: 'Active families who love outdoor activities' },
      { id: 'culture', name: 'Culture Enthusiasts', icon: Heart, color: 'purple', desc: 'Interested in history, art, and local traditions' },
      { id: 'relaxed', name: 'Relaxed Explorers', icon: Clock, color: 'blue', desc: 'Balanced pace with plenty of downtime' },
      { id: 'comfort', name: 'Comfort & Convenience', icon: Zap, color: 'indigo', desc: 'Prioritizing ease and seamless experiences' }
    ];

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">What's your family's travel style?</h2>
          <p className="text-gray-600">Choose the style that best describes how your family likes to travel</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {styles.map((style) => {
            const IconComponent = style.icon;
            const isSelected = tripData.travelStyle === style.id;
            
            return (
              <Card 
                key={style.id}
                className={`cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
                onClick={() => setTripData(prev => ({...prev, travelStyle: style.id}))}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                    {isSelected && <Badge>Selected</Badge>}
                  </div>
                  <CardTitle>{style.name}</CardTitle>
                  <CardDescription>{style.desc}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const ConcernsStep = () => {
    const [selectedConcerns, setSelectedConcerns] = useState<string[]>(tripData.concerns || []);
    
    const concerns = [
      { id: 'safety', label: 'Safety & Security', desc: 'Safe neighborhoods, emergency access' },
      { id: 'health', label: 'Health & Dietary', desc: 'Food allergies, medical needs' },
      { id: 'comfort', label: 'Comfort & Convenience', desc: 'Sleep schedules, accessibility' },
      { id: 'activities', label: 'Age-Appropriate Activities', desc: 'Suitable for all family members' },
      { id: 'logistics', label: 'Easy Transportation', desc: 'Public transit, walkable distances' }
    ];

    const toggleConcern = (concernId: string) => {
      const updated = selectedConcerns.includes(concernId)
        ? selectedConcerns.filter(id => id !== concernId)
        : [...selectedConcerns, concernId];
      setSelectedConcerns(updated);
      setTripData(prev => ({...prev, concerns: updated}));
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">What matters most to your family?</h2>
          <p className="text-gray-600">Help us understand your priorities and concerns</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {concerns.map((concern) => (
            <Card 
              key={concern.id}
              className={`cursor-pointer transition-all ${selectedConcerns.includes(concern.id) ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
              onClick={() => toggleConcern(concern.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <Checkbox checked={selectedConcerns.includes(concern.id)} />
                  <div>
                    <h4 className="font-medium">{concern.label}</h4>
                    <p className="text-sm text-gray-600">{concern.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const BudgetStep = () => {
    const budgets = [
      { id: 'budget', name: 'Budget-Friendly', icon: DollarSign, desc: 'Great value without breaking the bank' },
      { id: 'comfort', name: 'Comfort & Convenience', icon: Heart, desc: 'Balance of comfort and value' },
      { id: 'premium', name: 'Premium Experience', icon: Star, desc: 'High-quality accommodations and experiences' },
      { id: 'luxury', name: 'Luxury & Exclusive', icon: Sparkles, desc: 'The finest experiences money can buy' }
    ];

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">What's your comfort level?</h2>
          <p className="text-gray-600">Choose the experience level that matches your preferences</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {budgets.map((budget) => {
            const IconComponent = budget.icon;
            const isSelected = tripData.budgetLevel === budget.id;
            
            return (
              <Card 
                key={budget.id}
                className={`cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
                onClick={() => setTripData(prev => ({...prev, budgetLevel: budget.id}))}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                    {isSelected && <Badge>Selected</Badge>}
                  </div>
                  <CardTitle>{budget.name}</CardTitle>
                  <CardDescription>{budget.desc}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const CompletionStep = () => (
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
            <li>• Share the itinerary with everyone</li>
            <li>• Let me handle the coordination headaches!</li>
          </ul>
        </CardContent>
      </Card>
      
      <Button 
        onClick={() => setCurrentView('itinerary')}
        className="bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        Open Trip Dashboard
      </Button>
    </div>
  );

  // Main Itinerary/Dashboard View
  const ItineraryView = () => {
    const [activities, setActivities] = useState<Activity[]>(tripData.activities || sampleActivities);
    const [showAddActivity, setShowAddActivity] = useState(false);
    const [newActivity, setNewActivity] = useState<Partial<Activity>>({
      name: '',
      date: '',
      time: '',
      location: '',
      status: 'Planned'
    });

    const addActivity = () => {
      if (newActivity.name && newActivity.date) {
        const activity: Activity = {
          id: Date.now().toString(),
          name: newActivity.name,
          date: newActivity.date,
          time: newActivity.time,
          location: newActivity.location,
          status: newActivity.status as Activity['status'],
          aiInsight: `Great addition! This activity fits well with your family's ${tripData.travelStyle} style.`
        };
        setActivities([...activities, activity]);
        setNewActivity({ name: '', date: '', time: '', location: '', status: 'Planned' });
        setShowAddActivity(false);
      }
    };

    const groupedActivities = activities.reduce((acc, activity) => {
      if (!acc[activity.date]) acc[activity.date] = [];
      acc[activity.date].push(activity);
      return acc;
    }, {} as Record<string, Activity[]>);

    return (
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Itinerary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Command Center */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-900">
                <Mail className="w-5 h-5 mr-2" />
                Email Command Center
              </CardTitle>
              <CardDescription>
                Forward confirmations to organize everything automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-purple-300 mb-4">
                <p className="font-mono text-lg text-center text-purple-700">
                  {(tripData.city || 'madrid').toLowerCase()}2024@familytripcommand.com
                </p>
                <p className="text-sm text-center text-gray-600 mt-2">
                  Forward hotel, flight, restaurant confirmations here
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  3 hotels parsed
                </div>
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  2 flights added
                </div>
                <div className="flex items-center text-blue-600">
                  <Clock className="w-4 h-4 mr-2" />
                  1 processing...
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
                    AI-Optimized Family Itinerary
                  </CardTitle>
                  <CardDescription>
                    Personalized for your {tripData.travelStyle} family
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddActivity(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add Activity Modal */}
              {showAddActivity && (
                <Card className="mb-6 border-blue-200 bg-blue-50">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Activity Name</Label>
                        <Input 
                          value={newActivity.name || ''}
                          onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                          placeholder="e.g., Prado Museum"
                        />
                      </div>
                      <div>
                        <Label>Date</Label>
                        <Input 
                          type="date"
                          value={newActivity.date || ''}
                          onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Time</Label>
                        <Input 
                          type="time"
                          value={newActivity.time || ''}
                          onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input 
                          value={newActivity.location || ''}
                          onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                          placeholder="Address or venue"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={addActivity}>Add Activity</Button>
                      <Button variant="outline" onClick={() => setShowAddActivity(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Activities Timeline */}
              <div className="space-y-6">
                {Object.entries(groupedActivities).map(([date, dayActivities]) => (
                  <div key={date} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-4">{date}</h3>
                    <div className="space-y-4">
                      {dayActivities.map((activity) => (
                        <div key={activity.id} className="border rounded-lg p-4 bg-white shadow-sm">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{activity.name}</h4>
                                <Badge className={
                                  activity.status === 'Booked' ? 'bg-green-100 text-green-700' :
                                  activity.status === 'Planned' ? 'bg-blue-100 text-blue-700' :
                                  'bg-purple-100 text-purple-700'
                                }>
                                  {activity.status}
                                </Badge>
                                {activity.familyRating && (
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-sm ml-1">{activity.familyRating}/5</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                {activity.time && (
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {activity.time} {activity.duration && `(${activity.duration})`}
                                  </div>
                                )}
                                {activity.location && (
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {activity.location}
                                  </div>
                                )}
                              </div>
                              
                              {activity.aiInsight && (
                                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                  <div className="flex items-start">
                                    <Sparkles className="w-4 h-4 text-purple-600 mr-2 mt-0.5" />
                                    <p className="text-sm text-purple-800">{activity.aiInsight}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {activity.cost && (
                              <div className="ml-4 text-right">
                                <p className="text-sm font-medium">{activity.cost}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Family Sharing */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="w-5 h-5 text-blue-600 mr-2" />
                Share Your Masterpiece
              </CardTitle>
              <CardDescription>
                You did the hard work - now get everyone on the same page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col">
                  <MessageCircle className="w-6 h-6 mb-2" />
                  <span className="text-sm">WhatsApp</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col">
                  <Calendar className="w-6 h-6 mb-2" />
                  <span className="text-sm">Calendar</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col">
                  <FileText className="w-6 h-6 mb-2" />
                  <span className="text-sm">PDF</span>
                </Button>
              </div>
              <div className="mt-4 p-3 bg-white rounded-lg border">
                <p className="text-sm font-medium">Family Link:</p>
                <p className="text-xs text-gray-600 font-mono">familytripcommand.com/trip/share/xyz123</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Chat */}
          <AIChat tripData={tripData} onSuggestion={() => {}} />

          {/* Trip Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Trip Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Destination</p>
                  <p className="text-gray-600">{tripData.city}, {tripData.country}</p>
                </div>
                <div>
                  <p className="font-medium">Travelers</p>
                  <p className="text-gray-600">{(tripData.adults?.length || 0) + (tripData.kids?.length || 0)} people</p>
                </div>
                <div>
                  <p className="font-medium">Style</p>
                  <p className="text-gray-600 capitalize">{tripData.travelStyle}</p>
                </div>
                <div>
                  <p className="font-medium">Budget</p>
                  <p className="text-gray-600 capitalize">{tripData.budgetLevel}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Smart Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border border-dashed border-purple-300 rounded-lg bg-purple-50">
                <p className="font-medium text-purple-900 text-sm">Schedule Gap Alert</p>
                <p className="text-xs text-purple-700">You have 2 hours between activities Tuesday. Perfect for Retiro Park!</p>
                <Button size="sm" variant="outline" className="mt-2 text-xs">
                  Add to Itinerary
                </Button>
              </div>
              <div className="p-3 border border-dashed border-green-300 rounded-lg bg-green-50">
                <p className="font-medium text-green-900 text-sm">Family-Friendly Spot</p>
                <p className="text-xs text-green-700">Casa Botín near cathedral has high chairs and wheelchair access.</p>
                <Button size="sm" variant="outline" className="mt-2 text-xs">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch(currentStep) {
      case 0: return <DestinationStep />;
      case 1: return <FamilyProfilesStep />;
      case 2: return <TravelStyleStep />;
      case 3: return <ConcernsStep />;
      case 4: return <BudgetStep />;
      case 5: return <CompletionStep />;
      default: return <DestinationStep />;
    }
  };

  const steps = [
    { title: 'Destination' },
    { title: 'Family' },
    { title: 'Style' },
    { title: 'Concerns' },
    { title: 'Budget' },
    { title: 'Complete' }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (currentView === 'itinerary') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <MapPin className="w-8 h-8 text-blue-600 mr-3" />
                {tripData.city}, {tripData.country}
              </h1>
              <p className="text-gray-600">
                {tripData.startDate} to {tripData.endDate} • {(tripData.adults?.length || 0) + (tripData.kids?.length || 0)} travelers
              </p>
            </div>
            <Button variant="outline" onClick={() => setCurrentView('wizard')}>
              <Home className="w-4 h-4 mr-2" />
              Back to Setup
            </Button>
          </div>
        </div>
        <ItineraryView />
      </div>
    );
  }

  return (
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
            
            {currentView === 'wizard' && (
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
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'wizard' && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {currentStep === 0 ? "Let's plan your family trip" :
                 currentStep === 1 ? "Tell us about your travel party" :
                 currentStep === 2 ? "What's your family's travel style?" :
                 currentStep === 3 ? "What matters most to your family?" :
                 currentStep === 4 ? "What's your comfort level?" :
                 "Almost done!"}
              </h2>
              <p className="text-lg text-gray-600">
                {currentStep === 0 ? "Stop being the human travel database. Let AI help coordinate your trip." :
                 currentStep === 1 ? "Add profiles for all travelers so I can give personalized suggestions" :
                 currentStep === 2 ? "This helps me recommend activities that match your preferences" :
                 currentStep === 3 ? "Help me understand your priorities and concerns for the trip" :
                 currentStep === 4 ? "Choose the experience level that matches your family's preferences" :
                 "Your family trip coordinator is ready to help!"}
              </p>
            </div>

            {renderCurrentStep()}

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
                <Button onClick={nextStep}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FamApp;