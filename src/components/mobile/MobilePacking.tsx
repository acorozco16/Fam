import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { 
  Package, Users, Plus, Edit3, Trash2, 
  CheckCircle, Circle, User, Baby, 
  Shirt, Umbrella, Camera, Pill
} from 'lucide-react';

interface MobilePackingProps {
  trip: any;
  onAddPackingItem: (listIndex: number) => void;
  onTogglePackingItem: (listIndex: number, itemIndex: number) => void;
  onDeletePackingItem: (listIndex: number, itemIndex: number) => void;
}

export const MobilePacking: React.FC<MobilePackingProps> = ({ 
  trip, 
  onAddPackingItem,
  onTogglePackingItem,
  onDeletePackingItem
}) => {
  const [activePersonIndex, setActivePersonIndex] = useState(0);

  // Smart packing analysis based on trip data
  const getTripDuration = () => {
    if (!trip.startDate || !trip.endDate) return 0;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getTripSeason = () => {
    if (!trip.startDate) return 'unknown';
    const startDate = new Date(trip.startDate);
    const month = startDate.getMonth() + 1; // 1-12
    
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
  };

  const getClimateCategory = () => {
    const country = trip.country?.toLowerCase();
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

  // Generate smart packing lists based on trip data
  const generateSmartPackingLists = () => {
    const duration = getTripDuration();
    const season = getTripSeason();
    const climate = getClimateCategory();
    
    const baseItems = [
      'Underwear (' + (duration + 2) + ' pairs)',
      'Socks (' + (duration + 2) + ' pairs)',
      'Phone charger',
      'Toothbrush',
      'Toothpaste',
      'Shampoo',
      'Passport/ID',
      'Wallet/Credit cards',
      'Medications'
    ];
    
    // Season-specific items
    const seasonalItems = {
      spring: ['Light jacket', 'Umbrella', 'Comfortable walking shoes'],
      summer: ['Sunscreen', 'Sunglasses', 'Swimwear', 'Light clothes', 'Sandals'],
      fall: ['Warm jacket', 'Layers', 'Comfortable shoes', 'Umbrella'],
      winter: ['Winter coat', 'Warm layers', 'Gloves', 'Warm hat', 'Boots']
    };
    
    // Climate-specific items
    const climateItems = {
      tropical: ['Mosquito repellent', 'Light breathable clothes', 'Flip flops'],
      cold: ['Thermal underwear', 'Warm socks', 'Hand warmers'],
      arid: ['Extra sunscreen', 'Lip balm', 'Lightweight long sleeves'],
      temperate: ['Versatile layers', 'Comfortable shoes']
    };
    
    return [
      ...baseItems,
      ...seasonalItems[season as keyof typeof seasonalItems] || [],
      ...climateItems[climate as keyof typeof climateItems] || []
    ];
  };

  // Get all family members for packing lists
  const getAllTravelers = () => {
    const travelers = [];
    if (trip.adults) travelers.push(...trip.adults);
    if (trip.kids) travelers.push(...trip.kids);
    return travelers;
  };

  const travelers = getAllTravelers();
  const smartItems = generateSmartPackingLists();

  // Initialize packing lists if they don't exist
  if (!trip.packingLists) {
    trip.packingLists = {};
  }

  const getPackingListForPerson = (personIndex: number) => {
    if (!trip.packingLists[personIndex]) {
      // Initialize with smart suggestions
      trip.packingLists[personIndex] = {
        items: smartItems.reduce((acc, item, index) => {
          acc[index] = { checked: false };
          return acc;
        }, {} as { [key: number]: { checked: boolean } })
      };
    }
    return trip.packingLists[personIndex];
  };

  const getCustomPackingItems = (personIndex: number) => {
    return trip.customPackingItems?.[personIndex] || [];
  };

  const getPackingProgress = (personIndex: number) => {
    const packingList = getPackingListForPerson(personIndex);
    const customItems = getCustomPackingItems(personIndex);
    
    const smartItemsChecked = Object.values(packingList.items).filter(item => item.checked).length;
    const totalItems = smartItems.length + customItems.length;
    
    if (totalItems === 0) return 0;
    return Math.round((smartItemsChecked / totalItems) * 100);
  };

  const getPersonIcon = (person: any) => {
    if (person.type === 'child') return Baby;
    return User;
  };

  const getPersonColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    return colors[index % colors.length];
  };

  const currentPerson = travelers[activePersonIndex];
  const packingList = getPackingListForPerson(activePersonIndex);
  const customItems = getCustomPackingItems(activePersonIndex);
  const progress = getPackingProgress(activePersonIndex);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Packing Lists</h1>
            <p className="text-sm text-gray-600">
              {travelers.length} travelers • {progress}% complete
            </p>
          </div>
          <Button 
            onClick={() => onAddPackingItem(activePersonIndex)} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Person Tabs */}
      {travelers.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex space-x-2 overflow-x-auto">
            {travelers.map((person, index) => {
              const IconComponent = getPersonIcon(person);
              const personProgress = getPackingProgress(index);
              
              return (
                <button
                  key={index}
                  onClick={() => setActivePersonIndex(index)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    activePersonIndex === index 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getPersonColor(index)}`}>
                    <IconComponent className="w-3 h-3 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{person.name}</div>
                    <div className="text-xs">{personProgress}%</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {travelers.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No travelers added yet
            </h3>
            <p className="text-gray-600">
              Add family members to create personalized packing lists
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{currentPerson?.name}'s Packing</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {progress}% Complete
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Smart Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shirt className="w-5 h-5 mr-2" />
                  Smart Suggestions
                </CardTitle>
                <div className="text-sm text-gray-600">
                  Based on your {getTripDuration()}-day {getTripSeason()} trip to {trip.destination}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {smartItems.map((item, index) => {
                    const isChecked = packingList.items[index]?.checked || false;
                    
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => onTogglePackingItem(activePersonIndex, index)}
                        />
                        <span className={`flex-1 ${isChecked ? 'line-through text-gray-500' : ''}`}>
                          {item}
                        </span>
                        {isChecked && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Custom Items */}
            {customItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Custom Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Checkbox
                          checked={false} // Custom items tracking can be added
                          onCheckedChange={() => {
                            // TODO: Implement custom item checking
                          }}
                        />
                        <span className="flex-1">{item}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeletePackingItem(activePersonIndex, smartItems.length + index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Add Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Add</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Shirt, label: 'Clothing', color: 'bg-blue-500' },
                    { icon: Umbrella, label: 'Weather', color: 'bg-green-500' },
                    { icon: Camera, label: 'Electronics', color: 'bg-purple-500' },
                    { icon: Pill, label: 'Health', color: 'bg-red-500' }
                  ].map((category, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="flex items-center space-x-2 h-12"
                      onClick={() => onAddPackingItem(activePersonIndex)}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${category.color}`}>
                        <category.icon className="w-3 h-3 text-white" />
                      </div>
                      <span>{category.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};