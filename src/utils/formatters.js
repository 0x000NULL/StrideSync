/**
 * Format distance in meters to a human-readable string
 * @param {number} meters - Distance in meters
 * @param {boolean} withUnit - Whether to include the unit in the output
 * @returns {string} Formatted distance string
 */
export const formatDistance = (meters, withUnit = true) => {
  if (meters === null || meters === undefined) return '--';

  const km = meters / 1000;
  if (km >= 1) {
    return `${km.toFixed(1)}${withUnit ? ' km' : ''}`;
  }
  return `${Math.round(meters)}${withUnit ? ' m' : ''}`;
};

/**
 * Format pace (seconds per kilometer) to a human-readable string
 * @param {number} secondsPerKm - Pace in seconds per kilometer
 * @returns {string} Formatted pace string (e.g., "4:30 /km")
 */
export const formatPace = secondsPerKm => {
  if (!secondsPerKm || secondsPerKm <= 0) return '--:-- /km';

  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
};

/**
 * Format duration in seconds to a human-readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string (e.g., "1h 23m" or "45m 30s")
 */
export const formatDuration = totalSeconds => {
  if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Format a date to a relative time string (e.g., "2 days ago", "1 week ago")
 * @param {Date|string} date - Date object or ISO date string
 * @returns {string} Relative time string
 */
export const formatRelativeTime = date => {
  if (!date) return 'Never';

  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return 'Just now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }

  // For older dates, return the actual date
  return then.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a date to a short date string (e.g., "Mar 15, 2023")
 * @param {Date|string} date - Date object or ISO date string
 * @returns {string} Formatted date string
 */
export const formatShortDate = date => {
  if (!date) return '--';

  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a number with a plus sign if positive
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export const formatWithPlus = num => {
  if (num === null || num === undefined) return '--';
  return num > 0 ? `+${num}` : num.toString();
};
