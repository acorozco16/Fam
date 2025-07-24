// Synthetic Data Generation Script for 10k Family Scenarios
// Generates realistic family profiles and trip combinations for testing AI task generation
// Weight: 60% common families, 40% edge cases

import { TripData, FamilyMember } from '../types';
import { SmartTaskGenerator, TaskGenerationContext } from './smartTaskGenerator';
import { apiService } from './apiService';

export interface SyntheticScenario {
  id: string;
  familyType: string;
  scenario: string;
  tripData: TripData;
  daysUntilTrip: number;
  expectedTaskCount: number;
  notes: string;
}

export interface TestResults {
  scenarioId: string;
  familyType: string;
  tasksGenerated: number;
  taskTitles: string[];
  taskSources: string[];
  generationTimeMs: number;
  hasApiTasks: boolean;
  errors: string[];
}

class SyntheticDataGenerator {
  // Common family configurations (60% weight)
  private readonly commonFamilies = [
    {
      type: 'Nuclear Family 2 Kids',
      adults: [
        { id: '1', name: 'Parent 1', type: 'adult' as const, age: '35' },
        { id: '2', name: 'Parent 2', type: 'adult' as const, age: '33' }
      ],
      kids: [
        { id: '3', name: 'Kid 1', type: 'child' as const, age: '8' },
        { id: '4', name: 'Kid 2', type: 'child' as const, age: '5' }
      ]
    },
    {
      type: 'Single Parent 1 Kid',
      adults: [
        { id: '1', name: 'Single Parent', type: 'adult' as const, age: '32' }
      ],
      kids: [
        { id: '2', name: 'Kid', type: 'child' as const, age: '7' }
      ]
    },
    {
      type: 'Nuclear Family Teens',
      adults: [
        { id: '1', name: 'Parent 1', type: 'adult' as const, age: '45' },
        { id: '2', name: 'Parent 2', type: 'adult' as const, age: '43' }
      ],
      kids: [
        { id: '3', name: 'Teen 1', type: 'child' as const, age: '16' },
        { id: '4', name: 'Teen 2', type: 'child' as const, age: '14' }
      ]
    },
    {
      type: 'Family with Toddler',
      adults: [
        { id: '1', name: 'Parent 1', type: 'adult' as const, age: '30' },
        { id: '2', name: 'Parent 2', type: 'adult' as const, age: '28' }
      ],
      kids: [
        { id: '3', name: 'Toddler', type: 'child' as const, age: '3' },
        { id: '4', name: 'Baby', type: 'child' as const, age: '1' }
      ]
    }
  ];

  // Edge case families (40% weight)
  private readonly edgeCaseFamilies = [
    {
      type: 'Large Family 5+ Kids',
      adults: [
        { id: '1', name: 'Parent 1', type: 'adult' as const, age: '42' },
        { id: '2', name: 'Parent 2', type: 'adult' as const, age: '40' }
      ],
      kids: [
        { id: '3', name: 'Teen', type: 'child' as const, age: '17' },
        { id: '4', name: 'Kid 1', type: 'child' as const, age: '12' },
        { id: '5', name: 'Kid 2', type: 'child' as const, age: '9' },
        { id: '6', name: 'Kid 3', type: 'child' as const, age: '6' },
        { id: '7', name: 'Toddler', type: 'child' as const, age: '2' }
      ]
    },
    {
      type: 'Multi-Generational',
      adults: [
        { id: '1', name: 'Parent 1', type: 'adult' as const, age: '40' },
        { id: '2', name: 'Parent 2', type: 'adult' as const, age: '38' },
        { id: '3', name: 'Grandparent 1', type: 'adult' as const, age: '68' },
        { id: '4', name: 'Grandparent 2', type: 'adult' as const, age: '65' }
      ],
      kids: [
        { id: '5', name: 'Kid 1', type: 'child' as const, age: '10' },
        { id: '6', name: 'Kid 2', type: 'child' as const, age: '7' }
      ]
    },
    {
      type: 'Single Parent Multiple Kids',
      adults: [
        { id: '1', name: 'Single Parent', type: 'adult' as const, age: '38' }
      ],
      kids: [
        { id: '2', name: 'Teen', type: 'child' as const, age: '15' },
        { id: '3', name: 'Kid', type: 'child' as const, age: '10' },
        { id: '4', name: 'Toddler', type: 'child' as const, age: '4' }
      ]
    },
    {
      type: 'Childless Couple',
      adults: [
        { id: '1', name: 'Adult 1', type: 'adult' as const, age: '29' },
        { id: '2', name: 'Adult 2', type: 'adult' as const, age: '31' }
      ],
      kids: []
    }
  ];

  private readonly destinations = [
    { city: 'Madrid', country: 'Spain' },
    { city: 'Paris', country: 'France' },
    { city: 'Barcelona', country: 'Spain' },
    { city: 'London', country: 'United Kingdom' },
    { city: 'Rome', country: 'Italy' },
    { city: 'Tokyo', country: 'Japan' },
    { city: 'New York', country: 'United States' },
    { city: 'Los Angeles', country: 'United States' },
    { city: 'Orlando', country: 'United States' }, // Theme park destination
    { city: 'Amsterdam', country: 'Netherlands' },
    { city: 'Berlin', country: 'Germany' },
    { city: 'Copenhagen', country: 'Denmark' }
  ];

  private readonly tripPurposes = [
    'Family Vacation & Sightseeing',
    'Theme Parks & Entertainment',
    'Visiting Family & Friends',
    'Wedding, Celebration, or Event',
    'Business Trip + Family Extension',
    'Other Purpose'
  ];

  private readonly travelStyles = [
    'adventure',
    'culture', 
    'relaxed',
    'comfort'
  ];

  private readonly timeframes = [
    { days: 3, weight: 10 },   // Very soon - high urgency
    { days: 7, weight: 20 },   // Soon - some urgency
    { days: 14, weight: 30 },  // Common - moderate planning time
    { days: 21, weight: 25 },  // Standard - good planning time
    { days: 30, weight: 10 },  // Far out - early planning
    { days: 60, weight: 5 }    // Very far - very early planning
  ];

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getWeightedTimeframe(): number {
    const totalWeight = this.timeframes.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const timeframe of this.timeframes) {
      random -= timeframe.weight;
      if (random <= 0) {
        return timeframe.days;
      }
    }
    
    return 14; // fallback
  }

  private generateTripDates(daysUntilTrip: number): { startDate: string; endDate: string } {
    const startDate = new Date(Date.now() + daysUntilTrip * 24 * 60 * 60 * 1000);
    const tripDuration = Math.floor(Math.random() * 10) + 3; // 3-12 day trips
    const endDate = new Date(startDate.getTime() + tripDuration * 24 * 60 * 60 * 1000);
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  }

  private generateSyntheticScenario(id: string, isCommon: boolean): SyntheticScenario {
    // Select family type based on weight (60% common, 40% edge cases)
    const family = isCommon 
      ? this.getRandomElement(this.commonFamilies)
      : this.getRandomElement(this.edgeCaseFamilies);

    const destination = this.getRandomElement(this.destinations);
    const tripPurpose = this.getRandomElement(this.tripPurposes);
    const travelStyle = this.getRandomElement(this.travelStyles);
    const daysUntilTrip = this.getWeightedTimeframe();
    const { startDate, endDate } = this.generateTripDates(daysUntilTrip);

    // Add some variation for edge cases
    const hasAccommodation = Math.random() > 0.3; // 70% have accommodation booked
    const hasDietary = Math.random() > 0.7; // 30% have dietary preferences

    const tripData: TripData = {
      id: `synthetic_${id}`,
      city: destination.city,
      country: destination.country,
      startDate,
      endDate,
      adults: family.adults,
      kids: family.kids,
      travelStyle,
      tripPurpose,
      concerns: [],
      budgetLevel: this.getRandomElement(['budget', 'mid-range', 'luxury']),
      hotels: hasAccommodation ? [{ id: '1', name: 'Booked Hotel' }] : [],
      accommodations: hasAccommodation ? [{ id: '1', name: 'Booked Stay' }] : [],
      optInDietary: hasDietary,
      dietaryPreferences: hasDietary ? 
        [this.getRandomElement(['Vegetarian', 'Gluten-free', 'Nut allergies', 'Halal'])] : []
    };

    const scenario = `${family.type} - ${tripPurpose} - ${destination.city}, ${destination.country} - ${travelStyle} style - ${daysUntilTrip} days until trip`;

    return {
      id,
      familyType: family.type,
      scenario,
      tripData,
      daysUntilTrip,
      expectedTaskCount: this.estimateTaskCount(tripData, daysUntilTrip),
      notes: `${hasAccommodation ? 'Accommodation booked' : 'No accommodation'}, ${hasDietary ? 'Dietary preferences' : 'No dietary needs'}`
    };
  }

  private estimateTaskCount(trip: TripData, daysUntilTrip: number): number {
    let estimate = 2; // Base tasks
    
    // Trip purpose tasks
    if (trip.tripPurpose) estimate += 1;
    
    // Travel style tasks  
    if (trip.travelStyle) estimate += 2;
    
    // Family composition tasks
    if (trip.kids && trip.kids.length > 0) estimate += 1;
    
    // International travel
    const isInternational = trip.country && !['United States', 'US'].includes(trip.country);
    if (isInternational) estimate += 1;
    
    // API tasks (weather, holidays, country data)
    if (daysUntilTrip <= 14) estimate += 1; // Possible weather
    if (isInternational) estimate += 1; // Possible country/holiday
    
    return Math.min(estimate, 6); // Cap at 6
  }

  // Generate the full dataset
  generateDataset(totalScenarios: number = 10000): SyntheticScenario[] {
    const scenarios: SyntheticScenario[] = [];
    const commonCount = Math.floor(totalScenarios * 0.6); // 60% common
    const edgeCount = totalScenarios - commonCount; // 40% edge cases

    console.log(`Generating ${totalScenarios} synthetic scenarios...`);
    console.log(`- ${commonCount} common family scenarios (60%)`);
    console.log(`- ${edgeCount} edge case scenarios (40%)`);

    // Generate common scenarios
    for (let i = 0; i < commonCount; i++) {
      scenarios.push(this.generateSyntheticScenario(`common_${i}`, true));
      if (i % 1000 === 0 && i > 0) {
        console.log(`Generated ${i} common scenarios...`);
      }
    }

    // Generate edge case scenarios
    for (let i = 0; i < edgeCount; i++) {
      scenarios.push(this.generateSyntheticScenario(`edge_${i}`, false));
      if (i % 1000 === 0 && i > 0) {
        console.log(`Generated ${i} edge case scenarios...`);
      }
    }

    console.log(`✅ Generated ${scenarios.length} total synthetic scenarios`);
    return scenarios;
  }

  // Test scenarios with AI task generation
  async testScenarios(scenarios: SyntheticScenario[], maxTests: number = 100): Promise<TestResults[]> {
    console.log(`\nTesting ${Math.min(scenarios.length, maxTests)} scenarios with AI task generation...`);
    
    const results: TestResults[] = [];
    const testScenarios = scenarios.slice(0, maxTests);

    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      const startTime = Date.now();
      
      try {
        const context: TaskGenerationContext = {
          trip: scenario.tripData,
          daysUntilTrip: scenario.daysUntilTrip
        };

        const tasks = await SmartTaskGenerator.generateTasks(context);
        const endTime = Date.now();

        const hasApiTasks = tasks.some(t => 
          t.intelligence.source.includes('API') || 
          t.intelligence.source.includes('7Timer') ||
          t.intelligence.source.includes('Nager') ||
          t.intelligence.source.includes('REST Countries')
        );

        results.push({
          scenarioId: scenario.id,
          familyType: scenario.familyType,
          tasksGenerated: tasks.length,
          taskTitles: tasks.map(t => t.title),
          taskSources: tasks.map(t => t.intelligence.source),
          generationTimeMs: endTime - startTime,
          hasApiTasks,
          errors: []
        });

      } catch (error) {
        const endTime = Date.now();
        results.push({
          scenarioId: scenario.id,
          familyType: scenario.familyType,
          tasksGenerated: 0,
          taskTitles: [],
          taskSources: [],
          generationTimeMs: endTime - startTime,
          hasApiTasks: false,
          errors: [String(error)]
        });
      }

      if (i % 10 === 0 && i > 0) {
        console.log(`Tested ${i}/${testScenarios.length} scenarios...`);
      }
    }

    return results;
  }

  // Export to CSV for analysis
  exportToCSV(scenarios: SyntheticScenario[], results?: TestResults[]): { scenariosCsv: string; resultsCsv?: string } {
    // Scenarios CSV
    const scenarioHeaders = [
      'ID',
      'Family Type', 
      'City',
      'Country',
      'Trip Purpose',
      'Travel Style',
      'Days Until Trip',
      'Adult Count',
      'Kid Count',
      'Kid Ages',
      'Has Accommodation',
      'Has Dietary Prefs',
      'Expected Task Count',
      'Scenario Description'
    ];

    const scenarioRows = scenarios.map(s => [
      s.id,
      s.familyType,
      s.tripData.city || '',
      s.tripData.country || '',
      s.tripData.tripPurpose || '',
      s.tripData.travelStyle || '',
      s.daysUntilTrip.toString(),
      s.tripData.adults?.length.toString() || '0',
      s.tripData.kids?.length.toString() || '0',
      s.tripData.kids?.map(k => k.age).join(';') || '',
      ((s.tripData.hotels?.length || 0) + (s.tripData.accommodations?.length || 0) > 0).toString(),
      s.tripData.optInDietary?.toString() || 'false',
      s.expectedTaskCount.toString(),
      `"${s.scenario}"`
    ]);

    const scenariosCsv = [
      scenarioHeaders.join(','),
      ...scenarioRows.map(row => row.join(','))
    ].join('\n');

    // Results CSV (if provided)
    let resultsCsv: string | undefined;
    if (results) {
      const resultHeaders = [
        'Scenario ID',
        'Family Type',
        'Tasks Generated',
        'Generation Time (ms)',
        'Has API Tasks',
        'Task Titles',
        'Task Sources',
        'Errors'
      ];

      const resultRows = results.map(r => [
        r.scenarioId,
        r.familyType,
        r.tasksGenerated.toString(),
        r.generationTimeMs.toString(),
        r.hasApiTasks.toString(),
        `"${r.taskTitles.join('; ')}"`,
        `"${r.taskSources.join('; ')}"`,
        `"${r.errors.join('; ')}"`
      ]);

      resultsCsv = [
        resultHeaders.join(','),
        ...resultRows.map(row => row.join(','))
      ].join('\n');
    }

    return { scenariosCsv, resultsCsv };
  }
}

export const syntheticDataGenerator = new SyntheticDataGenerator();