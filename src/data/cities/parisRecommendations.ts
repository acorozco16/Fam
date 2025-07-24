/**
 * Paris Family Travel Intelligence
 * Disneyland Paris + classic tourism
 */

export function generateParisTasks(familyProfile: any, daysUntilTrip: number) {
  const tasks = [];
  const kids = familyProfile.kids || [];
  const tripPurpose = familyProfile.tripPurpose;
  const hasToddler = kids.some((kid: any) => parseInt(kid.age) <= 4);
  
  // ESSENTIAL: Disneyland Paris (only for theme parks or family vacation)
  if (tripPurpose === 'theme-parks' || tripPurpose === 'family-vacation') {
    tasks.push({
      id: 'disneyland-paris-tickets',
      title: 'Consider Disneyland Paris Day Trip',
      subtitle: '45min from Paris center - smaller than US parks, advance tickets save money',
      category: 'essential',
      status: 'incomplete',
      urgent: daysUntilTrip <= 14,
      isCustom: false,
      priority: 'medium',
      daysBeforeTrip: 30,
      intelligence: {
        reasoning: [
          '💰 Online tickets €10+ cheaper than gate prices',
          '🚇 RER A train direct from central Paris (45 mins)',
          '🏰 Much smaller than US Disney parks',
          '💡 Consider if worth the time vs Paris sights'
        ].join('\n'),
        source: 'Paris family options'
      }
    });
  }

  return tasks;
}
