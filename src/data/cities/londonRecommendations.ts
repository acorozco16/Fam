/**
 * London Family Travel Intelligence - ESSENTIAL TASKS ONLY
 * Focus: Critical booking deadlines and trip-breaking logistics
 */

export function generateLondonTasks(familyProfile: any, daysUntilTrip: number) {
  const tasks = [];
  const kids = familyProfile.kids || [];
  const tripPurpose = familyProfile.tripPurpose;
  const hasSchoolAge = kids.some((kid: any) => {
    const age = parseInt(kid.age);
    return age >= 5 && age <= 12;
  });

  // ESSENTIAL: Harry Potter Studio Tour (only for family vacation)
  if (hasSchoolAge && tripPurpose === 'family-vacation' && daysUntilTrip >= 90) {
    tasks.push({
      id: 'harry-potter-studio-tour',
      title: 'Book Harry Potter Studio Tour',
      subtitle: 'Sells out months in advance - most popular family attraction in London',
      category: 'essential',
      status: 'incomplete',
      urgent: daysUntilTrip <= 90,
      isCustom: false,
      priority: 'high',
      daysBeforeTrip: 90,
      intelligence: {
        reasoning: [
          '>„ Most popular family attraction in London area',
          '<« Books up 2-4 months in advance',
          '=Œ Includes round-trip transport from central London',
          '=¡ Book now or miss out completely'
        ].join('\n'),
        source: 'London booking essentials'
      }
    });
  }

  return tasks;
}