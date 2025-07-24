/**
 * Barcelona Family Travel Intelligence - ESSENTIAL TASKS ONLY
 * Focus: Critical booking deadlines and trip-breaking logistics
 */

export function generateBarcelonaTasks(familyProfile: any, daysUntilTrip: number) {
  const tasks = [];
  const kids = familyProfile.kids || [];
  const tripPurpose = familyProfile.tripPurpose;
  
  // ESSENTIAL: Sagrada Familia (only for family vacation)
  if (tripPurpose === 'family-vacation' && daysUntilTrip >= 14) {
    tasks.push({
      id: 'sagrada-familia-tickets',
      title: 'Book Sagrada Familia Tickets',
      subtitle: 'Sells out daily - book skip-the-line tickets with tower access in advance',
      category: 'essential',
      status: 'incomplete',
      urgent: false,
      isCustom: false,
      priority: 'medium',
      daysBeforeTrip: 14,
      intelligence: {
        reasoning: [
          '<× Iconic Gaudí masterpiece - must-see in Barcelona',
          '<« Sells out daily, especially with tower access',
          'ð Time slots required - plan your day around this',
          '=h=i=g=f Kids find the architecture fascinating'
        ].join('\n'),
        source: 'Barcelona booking essentials'
      }
    });
  }

  return tasks;
}