// =============================================================================
// frontend/src/utils/formatDate.js
// Utility for formatting dates (using date-fns)
// =============================================================================
import { format, isToday, isYesterday } from 'date-fns';

export const formatMessageTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  try {
    if (isToday(date)) {
      return format(date, 'p'); // Format as 'h:mm a' (e.g., 2:30 PM)
    }
    if (isYesterday(date)) {
      return `Yesterday ${format(date, 'p')}`; // Format as 'Yesterday h:mm a'
    }
    // Older than yesterday, show relative time or full date
    // Example: Show relative time for up to a week ago
    // const distance = formatDistanceToNow(date, { addSuffix: true });
    // if (/* condition for showing relative time */) {
    //   return distance;
    // }
    // Otherwise, show full date and time
    return format(date, 'MMM d, yyyy p'); // Format as 'MMM d, yyyy h:mm a' (e.g., Apr 20, 2025 2:30 PM)
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid date';
  }
};