import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { 
  Package, Plus, Trash2, CheckCircle, 
  Shirt, Shield, Stethoscope, Baby, Activity,
  FileText, Heart, MapPin, Plane
} from 'lucide-react';

interface MobilePackingProps {
  trip: any;
  onAddPackingItem: (listIndex: number) => void;
  onTogglePackingItem: (listIndex: number, itemIndex: number) => void;
  onDeletePackingItem: (listIndex: number, itemIndex: number) => void;
  onUpdateTrip?: (updatedTrip: any) => void;
}

export const MobilePacking: React.FC<MobilePackingProps> = ({ 
  trip, 
  onAddPackingItem,
  onTogglePackingItem,
  onDeletePackingItem,
  onUpdateTrip
}) => {
  const [newItemText, setNewItemText] = useState<{ [key: number]: string }>({});

  // Smart packing analysis based on trip data (matching desktop logic)
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

  const hasKids = trip.kids && trip.kids.length > 0;

  // Generate category-based packing lists (matching desktop)
  const getPackingCategories = () => {
    const duration = getTripDuration();
    const season = getTripSeason();
    const climate = getClimateCategory();
    
    const categories = [
      {
        id: 0,
        name: 'Travel Essentials',
        icon: FileText,
        color: 'bg-blue-500',
        items: [
          'Passport/ID',
          'Boarding passes',
          'Travel insurance',
          'Phone charger',
          'Portable battery',
          'Emergency contacts',
          'Copies of important documents',
          'Cash and cards',
          'Travel adapter'
        ]
      },
      {
        id: 1,
        name: 'Clothing & Shoes',
        icon: Shirt,
        color: 'bg-green-500',
        items: (() => {
          const baseItems = [
            `Underwear (${duration + 2} pairs)`,
            `Socks (${duration + 2} pairs)`,
            'Comfortable walking shoes',
            'Sleepwear'
          ];
          
          // Season-specific items
          const seasonalItems = {
            spring: ['Light jacket', 'Layers', 'Comfortable shoes', 'Umbrella (spring showers)'],
            summer: ['Light clothes', 'Swimwear', 'Sandals', 'Sun hat', 'Cooling towel'],
            fall: ['Warm jacket', 'Layers', 'Closed shoes', 'Umbrella', 'Light scarf'],
            winter: ['Winter coat', 'Warm layers', 'Gloves', 'Warm hat', 'Boots', 'Hand warmers']
          };
          
          // Climate-specific items
          const climateItems = {
            tropical: ['Light breathable clothes', 'Flip flops', 'Quick-dry towel', 'Cooling spray'],
            cold: ['Thermal underwear', 'Warm socks', 'Lip balm', 'Hand warmers'],
            arid: ['Lightweight long sleeves', 'Sun protection', 'Extra water bottle', 'Moisturizer'],
            temperate: ['Versatile layers', 'Light rain jacket']
          };

          // Trip duration specific items
          const durationItems = [];
          if (duration > 7) {
            durationItems.push('Laundry detergent pods', 'Extra phone charger', 'Backup medications');
          }
          if (duration > 14) {
            durationItems.push('First aid refills', 'Extra toiletries', 'Backup shoes');
          }

          // Destination-specific intelligence
          const destinationItems = [];
          const destination = trip.destination?.toLowerCase() || '';
          const country = trip.country?.toLowerCase() || '';
          
          // Beach destinations
          if (destination.includes('beach') || destination.includes('coast') || 
              ['hawaii', 'maldives', 'caribbean', 'bali', 'cancun', 'miami'].some(place => 
                destination.includes(place) || country.includes(place))) {
            destinationItems.push('Beach umbrella', 'Reef-safe sunscreen', 'Waterproof phone case', 
                                'Beach toys for kids', 'Snorkel gear', 'Beach towels');
          }

          // Mountain/hiking destinations  
          if (destination.includes('mountain') || destination.includes('hiking') ||
              ['alps', 'rockies', 'andes', 'himalayas'].some(place => 
                destination.includes(place))) {
            destinationItems.push('Hiking boots', 'Daypack', 'Water bottles', 'Energy bars', 
                                'First aid kit', 'Headlamp');
          }

          // City destinations
          if (destination.includes('city') || 
              ['paris', 'london', 'tokyo', 'new york', 'rome', 'barcelona'].some(city => 
                destination.includes(city))) {
            destinationItems.push('Comfortable walking shoes', 'Portable phone charger', 
                                'Day bag', 'City map offline', 'Metro card holder');
          }

          // International travel
          if (country && country !== 'united states' && country !== 'usa') {
            destinationItems.push('Travel adapter', 'Currency exchange', 'Translation app', 
                                'International phone plan', 'Travel insurance docs');
          }
          
          return [
            ...baseItems,
            ...seasonalItems[season as keyof typeof seasonalItems] || [],
            ...climateItems[climate as keyof typeof climateItems] || [],
            ...durationItems,
            ...destinationItems
          ];
        })()
      },
      {
        id: 2,
        name: 'Health & Hygiene',
        icon: Stethoscope,
        color: 'bg-red-500',
        items: [
          'Toothbrush',
          'Toothpaste',
          'Shampoo',
          'Soap/body wash',
          'Deodorant',
          'Sunscreen',
          'Any medications',
          'First aid kit',
          'Hand sanitizer',
          ...(climate === 'tropical' ? ['Mosquito repellent'] : [])
        ]
      }
    ];

    // Add kids items if family has children
    if (hasKids) {
      const kidsItems = [
        'Kids snacks',
        'Favorite toys',
        'Comfort items',
        'Kids medications',
        'Entertainment (books, tablets)'
      ];

      // Age-specific intelligence
      const ages = trip.kids?.map((kid: any) => parseInt(kid.age)).filter(Boolean) || [];
      const hasToddler = ages.some(age => age < 3);
      const hasSchoolAge = ages.some(age => age >= 5 && age <= 12);
      const hasTeen = ages.some(age => age >= 13);

      if (hasToddler) {
        kidsItems.push('Diapers/pull-ups', 'Baby wipes', 'Stroller/carrier', 
                      'Car seat (if needed)', 'Pacifiers', 'Baby formula/food',
                      'High chair travel seat');
      }

      if (hasSchoolAge) {
        kidsItems.push('School-age activities', 'Educational games', 
                      'Art supplies', 'Homework if needed');
      }

      if (hasTeen) {
        kidsItems.push('Teen entertainment', 'Portable chargers', 
                      'Headphones', 'Teen toiletries');
      }

      // Flight-specific for kids
      if (trip.flights && trip.flights.length > 0) {
        const flightDuration = trip.flights[0]?.duration || '';
        if (flightDuration.includes('3') || flightDuration.includes('4') || 
            flightDuration.includes('5') || flightDuration.includes('long')) {
          kidsItems.push('Flight entertainment extras', 'Kids headphones', 
                        'Motion sickness remedies', 'Extra snacks for flight');
        }
      }

      // International travel with kids
      if (trip.country && trip.country.toLowerCase() !== 'united states' && trip.country.toLowerCase() !== 'usa') {
        kidsItems.push('Kids passport copies', 'Emergency contact cards', 
                      'Kids medical info translated');
      }

      categories.push({
        id: 3,
        name: 'Kids Items',
        icon: Baby,
        color: 'bg-purple-500',
        items: kidsItems
      });
    }

    // Add activity gear based on planned activities
    const activityTypes = trip.activities?.map((a: any) => a.category || a.type).filter(Boolean) || [];
    if (activityTypes.length > 0) {
      const activityItems = [];
      
      if (activityTypes.includes('outdoor') || activityTypes.includes('nature')) {
        activityItems.push('Hiking shoes', 'Backpack', 'Water bottle');
      }
      if (activityTypes.includes('beach') || activityTypes.includes('water')) {
        activityItems.push('Beach towels', 'Swimwear', 'Snorkel gear');
      }
      if (activityTypes.includes('cultural') || activityTypes.includes('museum')) {
        activityItems.push('Comfortable walking shoes', 'Camera');
      }
      
      if (activityItems.length > 0) {
        categories.push({
          id: hasKids ? 4 : 3,
          name: 'Activity Gear',
          icon: Activity,
          color: 'bg-orange-500',
          items: activityItems
        });
      }
    }

    return categories;
  };

  const packingCategories = getPackingCategories();

  // Initialize packing lists if they don't exist
  if (!trip.packingLists) {
    trip.packingLists = {};
  }

  const getPackingListForCategory = (categoryId: number) => {
    if (!trip.packingLists[categoryId]) {
      const category = packingCategories.find(c => c.id === categoryId);
      if (category) {
        trip.packingLists[categoryId] = {
          items: category.items.reduce((acc, item, index) => {
            acc[index] = { checked: false };
            return acc;
          }, {} as { [key: number]: { checked: boolean } })
        };
      }
    }
    return trip.packingLists[categoryId];
  };

  const getCustomPackingItems = (categoryId: number) => {
    return trip.customPackingItems?.[categoryId] || [];
  };

  const getHiddenPackingItems = (categoryId: number) => {
    return trip.hiddenPackingItems?.[categoryId] || [];
  };

  const getCategoryProgress = (categoryId: number) => {
    const packingList = getPackingListForCategory(categoryId);
    const customItems = getCustomPackingItems(categoryId);
    const hiddenItems = getHiddenPackingItems(categoryId);
    const category = packingCategories.find(c => c.id === categoryId);
    
    if (!packingList || !category) return 0;
    
    const visibleGeneratedItems = category.items.filter((_, index) => 
      !hiddenItems.includes(index.toString())
    );
    const totalItems = visibleGeneratedItems.length + customItems.length;
    
    if (totalItems === 0) return 100;
    
    const checkedGeneratedItems = visibleGeneratedItems.filter((_, index) => 
      packingList.items[index]?.checked
    ).length;
    
    // Count checked custom items (handle both old string format and new object format)
    const checkedCustomItems = customItems.filter((item: any) => {
      if (typeof item === 'string') {
        return false; // Old string format items are not checked by default
      } else {
        return item.checked;
      }
    }).length;
    
    const checkedItems = checkedGeneratedItems + checkedCustomItems;
    
    return Math.round((checkedItems / totalItems) * 100);
  };

  const getOverallProgress = () => {
    const progresses = packingCategories.map(cat => getCategoryProgress(cat.id));
    return progresses.length > 0 ? Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length) : 0;
  };

  const addCustomItem = (categoryId: number) => {
    const text = newItemText[categoryId]?.trim();
    if (!text) return;
    
    const newItem = {
      id: `custom-${categoryId}-${Date.now()}`,
      text,
      checked: false
    };
    
    if (onUpdateTrip) {
      const existingItems = trip.customPackingItems?.[categoryId] || [];
      const updatedTrip = {
        ...trip,
        customPackingItems: {
          ...trip.customPackingItems,
          [categoryId]: [...existingItems, newItem]
        }
      };
      onUpdateTrip(updatedTrip);
    } else {
      // Fallback to direct modification
      if (!trip.customPackingItems) trip.customPackingItems = {};
      if (!trip.customPackingItems[categoryId]) trip.customPackingItems[categoryId] = [];
      trip.customPackingItems[categoryId].push(newItem);
    }
    
    setNewItemText({ ...newItemText, [categoryId]: '' });
  };

  const toggleCustomPackingItem = (categoryId: number, itemId: string) => {
    if (!onUpdateTrip) return;

    const existingItems = trip.customPackingItems?.[categoryId] || [];
    const updatedItems = existingItems.map((item: any) => {
      // Handle both old string format and new object format
      if (typeof item === 'string') {
        const convertedItem = { id: `custom-${categoryId}-${Date.now()}`, text: item, checked: false };
        return convertedItem.id === itemId ? { ...convertedItem, checked: !convertedItem.checked } : convertedItem;
      } else {
        return item.id === itemId ? { ...item, checked: !item.checked } : item;
      }
    });

    const updatedTrip = {
      ...trip,
      customPackingItems: {
        ...trip.customPackingItems,
        [categoryId]: updatedItems
      }
    };

    onUpdateTrip(updatedTrip);
  };

  const deleteCustomPackingItem = (categoryId: number, itemId: string) => {
    if (!onUpdateTrip) return;

    const existingItems = trip.customPackingItems?.[categoryId] || [];
    const updatedItems = existingItems.filter((item: any) => {
      if (typeof item === 'string') {
        return `custom-${categoryId}-${item}` !== itemId;
      } else {
        return item.id !== itemId;
      }
    });

    const updatedTrip = {
      ...trip,
      customPackingItems: {
        ...trip.customPackingItems,
        [categoryId]: updatedItems
      }
    };

    onUpdateTrip(updatedTrip);
  };

  const handleKeyPress = (e: React.KeyboardEvent, categoryId: number) => {
    if (e.key === 'Enter') {
      addCustomItem(categoryId);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Packing Lists</h1>
            <p className="text-sm text-gray-600">
              {getTripDuration()}-day {getTripSeason()} trip • {getOverallProgress()}% packed
            </p>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#e5e7eb"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#3b82f6"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - getOverallProgress() / 100)}`}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-900">{getOverallProgress()}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 space-y-4">
        {packingCategories.map(category => {
          const packingList = getPackingListForCategory(category.id);
          const customItems = getCustomPackingItems(category.id);
          const hiddenItems = getHiddenPackingItems(category.id);
          const progress = getCategoryProgress(category.id);
          const IconComponent = category.icon;

          return (
            <Card key={category.id} className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${category.color}`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <span>{category.name}</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {progress}%
                  </Badge>
                </CardTitle>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Generated Items */}
                  {category.items.map((item, index) => {
                    if (hiddenItems.includes(index.toString())) return null;
                    
                    const isChecked = packingList?.items[index]?.checked || false;
                    
                    return (
                      <div key={index} className="flex items-center space-x-3 group">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => onTogglePackingItem(category.id, index)}
                        />
                        <span className={`flex-1 ${isChecked ? 'line-through text-gray-500' : ''}`}>
                          {item}
                        </span>
                        {isChecked && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeletePackingItem(category.id, index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}

                  {/* Custom Items */}
                  {customItems.map((item: any, index: number) => {
                    // Handle both old string format and new object format for backward compatibility
                    const itemData = typeof item === 'string' 
                      ? { id: `custom-${category.id}-${index}`, text: item, checked: false }
                      : item;
                    
                    return (
                      <div key={itemData.id} className="flex items-center space-x-3 group">
                        <Checkbox 
                          checked={itemData.checked}
                          onCheckedChange={() => toggleCustomPackingItem(category.id, itemData.id)}
                        />
                        <span className={`flex-1 text-blue-700 font-medium ${itemData.checked ? 'line-through text-gray-500' : ''}`}>
                          {itemData.text}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCustomPackingItem(category.id, itemData.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}

                  {/* Add Custom Item */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                    <Input
                      placeholder="Add custom item..."
                      value={newItemText[category.id] || ''}
                      onChange={(e) => setNewItemText({ ...newItemText, [category.id]: e.target.value })}
                      onKeyPress={(e) => handleKeyPress(e, category.id)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => addCustomItem(category.id)}
                      disabled={!newItemText[category.id]?.trim()}
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom padding for safe area */}
      <div className="h-8" />
    </div>
  );
};