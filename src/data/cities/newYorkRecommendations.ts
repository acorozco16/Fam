/**
 * New York City Family Travel Intelligence - ESSENTIAL TASKS ONLY
 * Focus: Critical booking deadlines and trip-breaking logistics
 */

export function generateNewYorkTasks(familyProfile: any, daysUntilTrip: number) {
  const tasks = [];
  const kids = familyProfile.kids || [];
  const tripPurpose = familyProfile.tripPurpose;
  
  // ESSENTIAL: Broadway show (only for family vacation)
  if (tripPurpose === 'family-vacation' && daysUntilTrip >= 60) {
    tasks.push({
      id: 'broadway-family-show',
      title: 'Book Family Broadway Show',
      subtitle: 'Lion King, Aladdin, or Frozen - book 2-3 months ahead for good prices',
      category: 'essential',
      status: 'incomplete',
      urgent: daysUntilTrip <= 60,
      isCustom: false,
      priority: 'high',
      daysBeforeTrip: 60,
      intelligence: {
        reasoning: [
          '<­ Lion King: Best for all ages, amazing costumes',
          '>ÞB Aladdin: High energy, great for Disney fans',
          'D Frozen: Perfect for Frozen-obsessed kids',
          '<Ÿ Lottery tickets day-of for cheaper options'
        ].join('\n'),
        source: 'NYC Broadway intelligence'
      }
    });
  }

  return tasks;
}