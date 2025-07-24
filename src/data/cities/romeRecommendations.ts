/**
 * Rome Family Travel Intelligence - ESSENTIAL TASKS ONLY
 * Focus: Critical booking deadlines and trip-breaking logistics
 */

export function generateRomeTasks(familyProfile: any, daysUntilTrip: number) {
  const tasks = [];
  const kids = familyProfile.kids || [];
  const tripPurpose = familyProfile.tripPurpose;
  
  // ESSENTIAL: Colosseum (only for family vacation)
  if (tripPurpose === 'family-vacation' && daysUntilTrip >= 30) {
    tasks.push({
      id: 'colosseum-skip-line',
      title: 'Book Colosseum Skip-the-Line Tickets',
      subtitle: 'Lines can be 2+ hours - gladiator stories fascinate kids, underground tours for 8+',
      category: 'essential',
      status: 'incomplete',
      urgent: false,
      isCustom: false,
      priority: 'medium',
      daysBeforeTrip: 30,
      intelligence: {
        reasoning: [
          '” Gladiator stories fascinate kids of all ages',
          'ð Skip 2+ hour lines with advance booking',
          '<Û Combo tickets include Roman Forum and Palatine Hill',
          '=s Underground tours for kids 8+ (more dramatic)'
        ].join('\n'),
        source: 'Rome booking essentials'
      }
    });
  }

  return tasks;
}