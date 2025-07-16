/**
 * Validate activity form data
 */
export const validateActivityForm = (activity: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!activity.name?.trim()) {
    errors.name = 'Activity name is required';
  }
  
  if (!activity.date) {
    errors.date = 'Date is required';
  }
  
  if (activity.time && activity.date) {
    const activityDateTime = new Date(`${activity.date}T${activity.time}`);
    const now = new Date();
    
    if (activityDateTime < now) {
      errors.time = 'Activity time cannot be in the past';
    }
  }
  
  return errors;
};