/**
 * Amsterdam Family Travel Intelligence - ESSENTIAL TASKS ONLY
 * Focus: Critical logistics and trip-breaking considerations
 */

export function generateAmsterdamTasks(familyProfile: any, daysUntilTrip: number) {
  const tasks = [];
  const kids = familyProfile.kids || [];
  const tripPurpose = familyProfile.tripPurpose;
  
  // ESSENTIAL: Anne Frank House (only for family vacation with school-age kids)
  const hasSchoolAge = kids.some((kid: any) => {
    const age = parseInt(kid.age);
    return age >= 8 && age <= 16;
  });
  
  if (hasSchoolAge && tripPurpose === 'family-vacation' && daysUntilTrip >= 60) {
    tasks.push({
      id: 'anne-frank-house-tickets',
      title: 'Book Anne Frank House Online',
      subtitle: 'Releases tickets 2 months ahead - sells out within hours, not suitable for young kids',
      category: 'essential',
      status: 'incomplete',
      urgent: false,
      isCustom: false,
      priority: 'medium',
      daysBeforeTrip: 60,
      intelligence: {
        reasoning: [
          '=Å Tickets released exactly 2 months in advance',
          '¡ Sells out within hours of release',
          '=g Best for kids 8+ who can understand the history',
          'ð Book at 10am Amsterdam time on release day'
        ].join('\n'),
        source: 'Amsterdam booking essentials'
      }
    });
  }

  return tasks;
}