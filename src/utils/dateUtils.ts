/**
 * Calculate the number of days until a given start date
 */
export const calculateDaysUntil = (startDate?: string): number => {
  if (!startDate) return 0;
  const today = new Date();
  const tripDate = new Date(startDate);
  const diffTime = tripDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

/**
 * Format a date string for display
 */
export const formatDateRange = (startDate: string, endDate: string): string => {
  if (!startDate || !endDate) return 'Dates TBD';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startFormatted = start.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  const endFormatted = end.toLocaleDateString('en-US', { 
    day: 'numeric',
    year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined
  });
  
  return `${startFormatted}-${endFormatted}`;
};

/**
 * Generate all dates in a trip date range
 */
export const generateTripDates = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);
  
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};