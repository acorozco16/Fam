import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Utensils,
  Car,
  Info
} from 'lucide-react';
import { TripTip } from '../types';

interface TripTipsProps {
  cityName: string;
  tips: TripTip[];
  onAddToItinerary?: (tip: TripTip) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'attraction': return <MapPin className="w-4 h-4" />;
    case 'restaurant': return <Utensils className="w-4 h-4" />;
    case 'transport': return <Car className="w-4 h-4" />;
    case 'cultural': return <Info className="w-4 h-4" />;
    default: return <MapPin className="w-4 h-4" />;
  }
};

const getCategoryName = (category: string) => {
  switch (category) {
    case 'attraction': return 'Parks & Activities';
    case 'restaurant': return 'Family Restaurants';
    case 'transport': return 'Getting Around';
    case 'cultural': return 'Cultural Tips';
    default: return 'Other';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'attraction': return 'bg-green-50 text-green-700 border-green-200';
    case 'restaurant': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'transport': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'cultural': return 'bg-purple-50 text-purple-700 border-purple-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export const TripTips: React.FC<TripTipsProps> = ({ cityName, tips, onAddToItinerary }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Group tips by category
  const tipsByCategory = tips.reduce((acc, tip) => {
    if (!acc[tip.category]) {
      acc[tip.category] = [];
    }
    acc[tip.category].push(tip);
    return acc;
  }, {} as Record<string, TripTip[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddToItinerary = (tip: TripTip) => {
    if (onAddToItinerary) {
      onAddToItinerary(tip);
    }
  };

  if (tips.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        {/* Header */}
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Tips for your {cityName} trip
              </h3>
              <p className="text-sm text-gray-600">
                {tips.length} recommendations from families who've been there
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="mt-6 space-y-4">
            {Object.entries(tipsByCategory).map(([category, categoryTips]) => (
              <div key={category} className="border rounded-lg">
                {/* Category Header */}
                <div 
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${getCategoryColor(category)}`}
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <span className="font-medium">{getCategoryName(category)}</span>
                      <Badge variant="secondary" className="ml-2">
                        {categoryTips.length}
                      </Badge>
                    </div>
                    {expandedCategories.has(category) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Category Tips */}
                {expandedCategories.has(category) && (
                  <div className="divide-y">
                    {categoryTips.map((tip) => (
                      <div key={tip.id} className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {tip.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              {tip.description}
                            </p>
                            
                            {/* Tip Metadata */}
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              {tip.ageRecommendation && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {tip.ageRecommendation}
                                </div>
                              )}
                              {tip.estimatedDuration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {tip.estimatedDuration}
                                </div>
                              )}
                              {tip.cost && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {tip.cost}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Add to Itinerary Button */}
                          {tip.canAddToItinerary && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAddToItinerary(tip)}
                              className="shrink-0"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};