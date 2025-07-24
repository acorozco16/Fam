/**
 * Tokyo Family Travel Intelligence  
 * Disney, culture, very family-friendly society
 */

export function generateTokyoTasks(familyProfile: any, daysUntilTrip: number) {
  const tasks = [];
  const kids = familyProfile.kids || [];
  const tripPurpose = familyProfile.tripPurpose;
  
  // ESSENTIAL: Disney planning (only for theme parks or family vacation)
  if (tripPurpose === 'theme-parks' || tripPurpose === 'family-vacation') {
    tasks.push({
      id: 'tokyo-disney-tickets',
      title: 'Choose Tokyo Disney Park Strategy',
      subtitle: 'DisneySea unique to Tokyo, Disneyland better for young kids - advance tickets recommended',
      category: 'essential',
      status: 'incomplete',
      urgent: daysUntilTrip <= 30,
      isCustom: false,
      priority: 'high',
      daysBeforeTrip: 30,
      intelligence: {
        reasoning: [
          '🌊 DisneySea: Unique to Tokyo, better for 8+ and adults',
          '🏰 Disneyland: Better for kids under 8, familiar characters',
          '🎫 Can sell out during busy periods',
          '⚠️ Very different from US Disney parks'
        ].join('\n'),
        source: 'Tokyo Disney essentials'
      }
    });
  }

  // ESSENTIAL: Language barrier (critical for all trips except visiting family)
  if (tripPurpose !== 'visiting-family') {
    tasks.push({
      id: 'tokyo-language-prep',
      title: 'Download Google Translate with Camera',
      subtitle: 'Essential for menus, signs, emergency communication - works offline',
      category: 'essential',
      status: 'incomplete',
      urgent: false,
      isCustom: false,
      priority: 'high',
      daysBeforeTrip: 7,
      intelligence: {
        reasoning: [
          '📱 Camera translation for menus and signs',
          '🗣️ Voice translation for basic communication',
          '📶 Download offline Japanese translation pack',
          '🚨 Critical for emergencies with kids'
        ].join('\n'),
      source: 'Tokyo communication intelligence'
    }
  });

  return tasks;
}
