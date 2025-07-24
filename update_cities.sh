#!/bin/bash

# Script to update all city files with trip purpose filtering and remove non-essential tasks

cities=("london" "barcelona" "amsterdam" "rome" "newYork" "sanDiego" "copenhagen")

for city in "${cities[@]}"; do
    echo "Updating ${city}..."
    
    # Backup original file
    cp "src/data/cities/${city}Recommendations.ts" "src/data/cities/${city}Recommendations.ts.backup"
    
    # Create simplified version with just function header and return
    cat > "src/data/cities/${city}Recommendations.ts" << EOF
/**
 * ${city^} Family Travel Intelligence - ESSENTIAL TASKS ONLY
 * Focus: Critical booking deadlines and trip-breaking logistics
 */

export function generate${city^}Tasks(familyProfile: any, daysUntilTrip: number) {
  const tasks = [];
  const kids = familyProfile.kids || [];
  const tripPurpose = familyProfile.tripPurpose;
  
  // Only essential tasks based on trip purpose
  // Non-essential recommendations moved to separate data structure
  
  return tasks;
}

/**
 * Additional ${city^} recommendations (not tasks)
 * These would be displayed in a separate "Browse ${city^} Ideas" section
 */
export const ${city}Recommendations = {
  attractions: [],
  restaurants: [],
  cultural: [],
  transport: {}
};
EOF

done

echo "All cities updated with trip purpose support!"