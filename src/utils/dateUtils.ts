// Utility functions for date handling to avoid timezone issues

export const formatDateSafe = (dateString: string): string => {
  // Ensure we treat the date as local time by adding T00:00:00
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateForCalendar = (dateString: string): string => {
  // For calendar display, we want to ensure the date is treated as local
  return dateString + 'T00:00:00';
};

export const isDateInFuture = (dateString: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  
  const targetDate = new Date(dateString + 'T00:00:00');
  targetDate.setHours(0, 0, 0, 0); // Start of target date
  
  return targetDate >= today;
};










