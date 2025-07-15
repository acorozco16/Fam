import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MapPin, Calendar, Users, Plus, Trash2, Star, 
  Plane, Hotel, Car, Sparkles, Heart, Compass, DollarSign, 
  Shield, Stethoscope, User, UserCheck, Baby,
  ArrowRight, ArrowLeft, Check, CheckCircle, AlertCircle
} from 'lucide-react';

import { TripData, FamilyMember, WizardStep } from '../../types';

interface TripWizardProps {
  onTripComplete: (tripData: TripData) => void;
  onBackToDashboard: () => void;
  userData?: {
    name?: string;
    email?: string;
    photoURL?: string;
  };
}

// Step Components
const DestinationStep: React.FC<{ 
  tripData: TripData; 
  setTripData: React.Dispatch<React.SetStateAction<TripData>>;
  validationErrors: Record<string, string>;
}> = ({ tripData, setTripData, validationErrors }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g., Madrid"
                value={tripData.city || ''}
                onChange={(e) => setTripData(prev => ({ ...prev, city: e.target.value }))}
                className={validationErrors.city ? 'border-red-500' : ''}
              />
              {validationErrors.city && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
              )}
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g., Spain"
                value={tripData.country || ''}
                onChange={(e) => setTripData(prev => ({ ...prev, country: e.target.value }))}
                className={validationErrors.country ? 'border-red-500' : ''}
              />
              {validationErrors.country && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.country}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={tripData.startDate || ''}
                onChange={(e) => setTripData(prev => ({ ...prev, startDate: e.target.value }))}
                className={validationErrors.startDate ? 'border-red-500' : ''}
              />
              {validationErrors.startDate && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.startDate}</p>
              )}
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={tripData.endDate || ''}
                onChange={(e) => setTripData(prev => ({ ...prev, endDate: e.target.value }))}
                className={validationErrors.endDate ? 'border-red-500' : ''}
              />
              {validationErrors.endDate && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.endDate}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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
      age: '',
      relationship: type === 'adult' ? 'Parent' : 'Child'
    };

    if (type === 'adult') {
      const updatedAdults = [...adults, newMember];
      setAdults(updatedAdults);
      setTripData(prev => ({ ...prev, adults: updatedAdults }));
    } else {
      const updatedKids = [...kids, newMember];
      setKids(updatedKids);
      setTripData(prev => ({ ...prev, kids: updatedKids }));
    }
  };

  const removeFamilyMember = (id: string, type: 'adult' | 'child') => {
    if (type === 'adult') {
      const updatedAdults = adults.filter(member => member.id !== id);
      setAdults(updatedAdults);
      setTripData(prev => ({ ...prev, adults: updatedAdults }));
    } else {
      const updatedKids = kids.filter(member => member.id !== id);
      setKids(updatedKids);
      setTripData(prev => ({ ...prev, kids: updatedKids }));
    }
  };

  const updateFamilyMember = (id: string, updates: Partial<FamilyMember>, type: 'adult' | 'child') => {
    if (type === 'adult') {
      const updatedAdults = adults.map(member => 
        member.id === id ? { ...member, ...updates } : member
      );
      setAdults(updatedAdults);
      setTripData(prev => ({ ...prev, adults: updatedAdults }));
    } else {
      const updatedKids = kids.map(member => 
        member.id === id ? { ...member, ...updates } : member
      );
      setKids(updatedKids);
      setTripData(prev => ({ ...prev, kids: updatedKids }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Adults Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <CardTitle>Adults (18+)</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addFamilyMember('adult')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Adult
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {adults.map((adult) => (
            <div key={adult.id} className="p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Name"
                  value={adult.name}
                  onChange={(e) => updateFamilyMember(adult.id, { name: e.target.value }, 'adult')}
                />
                <Input
                  placeholder="Age"
                  type="number"
                  value={adult.age}
                  onChange={(e) => updateFamilyMember(adult.id, { age: e.target.value }, 'adult')}
                />
                <Select
                  value={adult.relationship || ''}
                  onValueChange={(value) => updateFamilyMember(adult.id, { relationship: value }, 'adult')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {familyRoles.adult.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFamilyMember(adult.id, 'adult')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {adults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No adults added yet. Add at least one adult to continue.</p>
            </div>
          )}
          {validationErrors.adults && (
            <p className="text-red-500 text-sm">{validationErrors.adults}</p>
          )}
        </CardContent>
      </Card>

      {/* Kids Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Baby className="w-5 h-5 text-pink-600" />
              <CardTitle>Children (Under 18)</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addFamilyMember('child')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Child
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {kids.map((kid) => (
            <div key={kid.id} className="p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Name"
                  value={kid.name}
                  onChange={(e) => updateFamilyMember(kid.id, { name: e.target.value }, 'child')}
                />
                <Input
                  placeholder="Age"
                  type="number"
                  max="17"
                  value={kid.age}
                  onChange={(e) => updateFamilyMember(kid.id, { age: e.target.value }, 'child')}
                />
                <Select
                  value={kid.relationship || ''}
                  onValueChange={(value) => updateFamilyMember(kid.id, { relationship: value }, 'child')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {familyRoles.child.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFamilyMember(kid.id, 'child')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {kids.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Baby className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No children added yet. Add children if any are joining the trip.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TravelStyleStep: React.FC<{ tripData: TripData; setTripData: React.Dispatch<React.SetStateAction<TripData>> }> = ({ tripData, setTripData }) => {
  const travelStyles = [
    {
      id: 'adventure-seekers',
      title: 'Adventure Seekers',
      subtitle: 'Active & Energetic',
      description: 'Hiking, outdoor activities, action-packed days with lots of movement and exploration.',
      icon: Compass,
      color: 'green'
    },
    {
      id: 'culture-enthusiasts',
      title: 'Culture Enthusiasts',
      subtitle: 'Museums & History',
      description: 'Museums, historical sites, local experiences, and deep cultural immersion.',
      icon: Star,
      color: 'purple'
    },
    {
      id: 'relaxed-explorers',
      title: 'Relaxed Explorers',
      subtitle: 'Balanced & Comfortable',
      description: 'Mix of sightseeing and rest, moderate pace with plenty of downtime.',
      icon: Heart,
      color: 'blue'
    },
    {
      id: 'comfort-convenience',
      title: 'Comfort & Convenience',
      subtitle: 'Ease & Accessibility',
      description: 'Comfortable transportation, accessible attractions, minimal walking.',
      icon: Hotel,
      color: 'orange'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {travelStyles.map(style => (
          <Card 
            key={style.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              tripData.travelStyle === style.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setTripData(prev => ({ ...prev, travelStyle: style.id }))}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${style.color}-100`}>
                  <style.icon className={`w-6 h-6 text-${style.color}-600`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{style.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{style.subtitle}</p>
                  <p className="text-sm text-gray-500">{style.description}</p>
                </div>
                {tripData.travelStyle === style.id && (
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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
        'Political instability concerns',
        'High crime rate areas',
        'Natural disaster risks',
        'Health & safety protocols',
        'Emergency medical access'
      ]
    },
    {
      id: 'health',
      title: 'Health & Medical',
      subtitle: 'Health considerations for family',
      description: 'Medical needs, accessibility, and health-related travel considerations.',
      icon: Stethoscope,
      color: 'blue',
      concerns: [
        'Mobility/accessibility needs',
        'Chronic medical conditions',
        'Medication availability',
        'Elderly family member needs',
        'Pregnancy considerations',
        'Food allergies or restrictions'
      ]
    }
  ];

  const toggleConcern = (concern: string) => {
    const updatedConcerns = selectedConcerns.includes(concern)
      ? selectedConcerns.filter(c => c !== concern)
      : [...selectedConcerns, concern];
    
    setSelectedConcerns(updatedConcerns);
    setTripData(prev => ({ ...prev, concerns: updatedConcerns }));
  };

  useEffect(() => {
    setTripData(prev => ({ ...prev, additionalNotes }));
  }, [additionalNotes, setTripData]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {concernCategories.map(category => (
        <Card key={category.id}>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${category.color}-100`}>
                <category.icon className={`w-5 h-5 text-${category.color}-600`} />
              </div>
              <div>
                <CardTitle className="text-lg">{category.title}</CardTitle>
                <p className="text-sm text-gray-600">{category.subtitle}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.concerns.map(concern => (
                <div key={concern} className="flex items-center space-x-2">
                  <Checkbox
                    id={concern}
                    checked={selectedConcerns.includes(concern)}
                    onCheckedChange={() => toggleConcern(concern)}
                  />
                  <Label htmlFor={concern} className="text-sm cursor-pointer">
                    {concern}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <p className="text-sm text-gray-600">
            Anything else we should know about your family's needs or preferences?
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Tell us about any specific requirements, preferences, or concerns..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const BudgetStep: React.FC<{ tripData: TripData; setTripData: React.Dispatch<React.SetStateAction<TripData>> }> = ({ tripData, setTripData }) => {
  const budgetLevels = [
    {
      id: 'budget-friendly',
      title: 'Budget-Friendly',
      subtitle: 'Value-conscious travel',
      description: 'Focus on free activities, local transportation, budget accommodations.',
      icon: DollarSign,
      color: 'green',
      range: 'Under $100/day per person'
    },
    {
      id: 'mid-range',
      title: 'Mid-Range Comfort',
      subtitle: 'Balanced experience',
      description: 'Mix of paid attractions, comfortable hotels, some dining experiences.',
      icon: Hotel,
      color: 'blue',
      range: '$100-250/day per person'
    },
    {
      id: 'premium',
      title: 'Premium Experience',
      subtitle: 'Higher-end comfort',
      description: 'Quality accommodations, skip-the-line tickets, guided experiences.',
      icon: Star,
      color: 'purple',
      range: '$250-500/day per person'
    },
    {
      id: 'luxury',
      title: 'Luxury Travel',
      subtitle: 'No expense spared',
      description: 'Luxury hotels, private guides, exclusive experiences, first-class everything.',
      icon: Sparkles,
      color: 'yellow',
      range: '$500+/day per person'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetLevels.map(level => (
          <Card 
            key={level.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              tripData.budgetLevel === level.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setTripData(prev => ({ ...prev, budgetLevel: level.id }))}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${level.color}-100`}>
                  <level.icon className={`w-6 h-6 text-${level.color}-600`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{level.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">{level.subtitle}</p>
                  <p className="text-sm text-gray-500 mb-2">{level.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {level.range}
                  </Badge>
                </div>
                {tripData.budgetLevel === level.id && (
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const CompletionStep: React.FC<{ tripData: TripData; onTripComplete: (tripData: TripData) => void }> = ({ tripData, onTripComplete }) => (
  <div className="max-w-2xl mx-auto text-center space-y-6">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
      <CheckCircle className="w-10 h-10 text-green-600" />
    </div>
    
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Perfect! Your trip is ready to plan.</h3>
      <p className="text-gray-600">
        I'll help you coordinate everything from flights to family-friendly activities in {tripData.city}.
      </p>
    </div>

    <Card className="text-left">
      <CardContent className="p-6">
        <h4 className="font-semibold mb-4">Trip Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Destination:</span>
            <span>{tripData.city}, {tripData.country}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Dates:</span>
            <span>{tripData.startDate} to {tripData.endDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Family Size:</span>
            <span>{(tripData.adults?.length || 0)} adults, {(tripData.kids?.length || 0)} children</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Travel Style:</span>
            <span className="capitalize">{tripData.travelStyle?.replace('-', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Budget Level:</span>
            <span className="capitalize">{tripData.budgetLevel?.replace('-', ' ')}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <Button 
      size="lg" 
      className="w-full bg-blue-600 hover:bg-blue-700"
      onClick={() => onTripComplete(tripData)}
    >
      Start Planning Your Trip
      <ArrowRight className="w-5 h-5 ml-2" />
    </Button>
  </div>
);

export const TripWizard: React.FC<TripWizardProps> = ({ 
  onTripComplete, 
  onBackToDashboard, 
  userData 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tripData, setTripData] = useState<TripData>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const steps = [
    { title: 'Destination' },
    { title: 'Family' },
    { title: 'Style' },
    { title: 'Concerns' },
    { title: 'Budget' },
    { title: 'Complete' }
  ];

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
      // Check if all adults have required fields
      const invalidAdults = data.adults.some(adult => !adult.name.trim() || !adult.age);
      if (invalidAdults) {
        errors.adults = 'All adults must have a name and age';
      }
    }
    
    // Check if all kids have required fields (if any kids exist)
    if (data.kids && data.kids.length > 0) {
      const invalidKids = data.kids.some(kid => !kid.name.trim() || !kid.age);
      if (invalidKids) {
        errors.kids = 'All children must have a name and age';
      }
    }
    
    return errors;
  };

  const isCurrentStepValid = (): boolean => {
    let stepErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0:
        stepErrors = validateDestinationStep(tripData);
        break;
      case 1:
        stepErrors = validateFamilyProfilesStep(tripData);
        break;
      case 2:
        // Travel style is optional, no validation needed
        break;
      case 3:
        // Concerns are optional, no validation needed
        break;
      case 4:
        // Budget is optional, no validation needed
        break;
      default:
        break;
    }
    
    setValidationErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const clearValidationErrors = () => {
    setValidationErrors({});
  };

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

  const handleTripComplete = (tripData: TripData) => {
    // Generate a unique ID for the trip
    const tripWithId = {
      ...tripData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    onTripComplete(tripWithId);
  };

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
              onClick={currentStep === 0 ? onBackToDashboard : prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 0 ? 'Back to Dashboard' : 'Previous'}
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
  );
};