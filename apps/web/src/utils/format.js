import { formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format a duration in seconds to a human-readable string (HH:MM:SS)
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format a pace in seconds per kilometer to a MM:SS string
 * @param {number} secondsPerKm - Pace in seconds per kilometer
 * @returns {string} Formatted pace string (MM:SS)
 */
export const formatPace = (secondsPerKm) => {
  if (!secondsPerKm && secondsPerKm !== 0) return '0:00';
  
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Format a date to a relative time string (e.g., "2 days ago")
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Relative time string
 */
export const formatDistance = (date) => {
  if (!date) return '';
  return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true });
};

export default {
  formatDuration,
  formatPace,
  formatDistance
};
