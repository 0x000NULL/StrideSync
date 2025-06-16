/**
 * Combines multiple class names into a single string.
 * Filters out any falsy values to avoid undefined or null classes.
 * 
 * @param {...string} classes - Class names to combine
 * @returns {string} Combined class names
 */
export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a date string into a human-readable format.
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string (e.g., "Jan 1, 2023")
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a duration in seconds into a human-readable format (HH:MM:SS).
 * 
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string (e.g., "01:23:45")
 */
export function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '--:--';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  const parts = [
    hours > 0 ? hours.toString().padStart(2, '0') : null,
    minutes.toString().padStart(2, '0'),
    remainingSeconds.toString().padStart(2, '0')
  ].filter(Boolean);
  
  return parts.join(':');
}

/**
 * Formats a distance in meters into a human-readable format.
 * 
 * @param {number} meters - Distance in meters
 * @param {boolean} [useMiles=false] - Whether to use miles instead of kilometers
 * @returns {string} Formatted distance string (e.g., "5.2 km" or "3.2 mi")
 */
export function formatDistance(meters, useMiles = false) {
  if (!meters && meters !== 0) return '--';
  
  if (useMiles) {
    const miles = meters * 0.000621371;
    return `${miles.toFixed(1)} mi`;
  }
  
  const kilometers = meters / 1000;
  return `${kilometers.toFixed(1)} km`;
}

/**
 * Formats a pace (time per kilometer/mile) into a human-readable format.
 * 
 * @param {number} seconds - Total seconds
 * @param {number} meters - Total distance in meters
 * @param {boolean} [useMiles=false] - Whether to use pace per mile instead of per kilometer
 * @returns {string} Formatted pace string (e.g., "5:30 /km" or "8:51 /mi")
 */
export function formatPace(seconds, meters, useMiles = false) {
  if (!seconds || !meters) return '--:-- /km';
  
  const distance = useMiles ? meters * 0.000621371 : meters / 1000;
  if (distance === 0) return '--:-- /km';
  
  const secondsPerUnit = seconds / distance;
  const minutes = Math.floor(secondsPerUnit / 60);
  const remainingSeconds = Math.round(secondsPerUnit % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} ${useMiles ? '/mi' : '/km'}`;
}

/**
 * Truncates a string to a specified length and adds an ellipsis if needed.
 * 
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated string with ellipsis if needed
 */
export function truncate(str, maxLength) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Converts a string to title case.
 * 
 * @param {string} str - The string to convert
 * @returns {string} String in title case
 */
export function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Debounces a function call to limit how often it can be invoked.
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generates a unique ID.
 * 
 * @returns {string} A unique ID
 */
export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Safely parses a JSON string.
 * 
 * @param {string} str - The JSON string to parse
 * @param {*} defaultValue - The default value to return if parsing fails
 * @returns {*} The parsed object or the default value
 */
export function safeJsonParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
}
