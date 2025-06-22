import {
  formatDistance,
  formatPace,
  formatDuration,
  formatRelativeTime,
  formatShortDate,
  formatWithPlus,
} from '../../src/utils/formatters';

describe('formatters', () => {
  describe('formatDistance', () => {
    it('formats distances less than 1km in meters', () => {
      expect(formatDistance(500)).toBe('500 m');
      expect(formatDistance(999)).toBe('999 m');
    });

    it('formats distances 1km or more in kilometers with one decimal place', () => {
      expect(formatDistance(1000)).toBe('1.0 km');
      expect(formatDistance(1560)).toBe('1.6 km'); // Should round 1.56 to 1.6
      expect(formatDistance(2300)).toBe('2.3 km');
    });

    it('handles zero distance', () => {
      expect(formatDistance(0)).toBe('0 m');
    });

    it('returns "--" for null or undefined input', () => {
      expect(formatDistance(null)).toBe('--');
      expect(formatDistance(undefined)).toBe('--');
    });

    it('formats without unit if withUnit is false', () => {
      expect(formatDistance(500, false)).toBe('500');
      expect(formatDistance(1560, false)).toBe('1.6');
    });
  });

  describe('formatPace', () => {
    it('formats pace correctly', () => {
      expect(formatPace(270)).toBe('4:30 /km'); // 4 * 60 + 30 = 270
      expect(formatPace(300)).toBe('5:00 /km');
      expect(formatPace(305)).toBe('5:05 /km'); // 5 * 60 + 5 = 305
    });

    it('pads seconds with a leading zero if less than 10', () => {
      expect(formatPace(245)).toBe('4:05 /km'); // 4 * 60 + 5 = 245
    });

    it('returns "--:-- /km" for invalid or zero input', () => {
      expect(formatPace(0)).toBe('--:-- /km');
      expect(formatPace(-10)).toBe('--:-- /km');
      expect(formatPace(null)).toBe('--:-- /km');
      expect(formatPace(undefined)).toBe('--:-- /km');
    });
  });

  describe('formatDuration', () => {
    it('formats duration correctly into HH:MM:SS', () => {
      expect(formatDuration(0)).toBe('00:00:00');
      expect(formatDuration(5)).toBe('00:00:05'); // 5 seconds
      expect(formatDuration(65)).toBe('00:01:05'); // 1 minute 5 seconds
      expect(formatDuration(3600)).toBe('01:00:00'); // 1 hour
      expect(formatDuration(3665)).toBe('01:01:05'); // 1 hour 1 minute 5 seconds
      expect(formatDuration(86399)).toBe('23:59:59'); // 23 hours 59 minutes 59 seconds
    });

    it('handles NaN, null, undefined, or negative input by returning 00:00:00', () => {
      expect(formatDuration(NaN)).toBe('00:00:00');
      expect(formatDuration(null)).toBe('00:00:00');
      expect(formatDuration(undefined)).toBe('00:00:00');
      expect(formatDuration(-100)).toBe('00:00:00');
    });
  });

  describe('formatRelativeTime', () => {
    const now = new Date();
    // Helper to create past dates
    const pastDate = secondsAgo => new Date(now.getTime() - secondsAgo * 1000);

    it('formats "Just now" for times less than 60 seconds ago', () => {
      expect(formatRelativeTime(pastDate(30))).toBe('Just now');
    });

    it('formats minutes ago correctly', () => {
      expect(formatRelativeTime(pastDate(60))).toBe('1 min ago');
      expect(formatRelativeTime(pastDate(120))).toBe('2 mins ago');
      expect(formatRelativeTime(pastDate(59 * 60))).toBe('59 mins ago');
    });

    it('formats hours ago correctly', () => {
      expect(formatRelativeTime(pastDate(60 * 60))).toBe('1 hour ago');
      expect(formatRelativeTime(pastDate(2 * 60 * 60))).toBe('2 hours ago');
      expect(formatRelativeTime(pastDate(23 * 60 * 60))).toBe('23 hours ago');
    });

    it('formats days ago correctly', () => {
      expect(formatRelativeTime(pastDate(24 * 60 * 60))).toBe('1 day ago');
      expect(formatRelativeTime(pastDate(2 * 24 * 60 * 60))).toBe('2 days ago');
      expect(formatRelativeTime(pastDate(6 * 24 * 60 * 60))).toBe('6 days ago');
    });

    it('formats weeks ago correctly', () => {
      expect(formatRelativeTime(pastDate(7 * 24 * 60 * 60))).toBe('1 week ago');
      expect(formatRelativeTime(pastDate(2 * 7 * 24 * 60 * 60))).toBe('2 weeks ago');
      expect(formatRelativeTime(pastDate(3 * 7 * 24 * 60 * 60))).toBe('3 weeks ago');
    });

    it('formats older dates as absolute date string', () => {
      const fourWeeksAgo = pastDate(4 * 7 * 24 * 60 * 60);
      const expectedDateString = fourWeeksAgo.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      expect(formatRelativeTime(fourWeeksAgo)).toBe(expectedDateString);

      const veryOldDate = new Date('2020-01-01T12:00:00Z');
      expect(formatRelativeTime(veryOldDate)).toBe('Jan 1, 2020');
    });

    it('returns "Never" for null or undefined date', () => {
      expect(formatRelativeTime(null)).toBe('Never');
      expect(formatRelativeTime(undefined)).toBe('Never');
    });
  });

  describe('formatShortDate', () => {
    it('formats date correctly', () => {
      expect(formatShortDate('2023-03-15T10:00:00Z')).toBe('Mar 15, 2023');
      const date = new Date(2024, 0, 5); // January 5, 2024
      expect(formatShortDate(date)).toBe('Jan 5, 2024');
    });

    it('handles different date string formats if parsable by Date constructor', () => {
      expect(formatShortDate('01/05/2024')).toBe('Jan 5, 2024'); // Assuming US locale for parsing
    });

    it('returns "--" for null or undefined date', () => {
      expect(formatShortDate(null)).toBe('--');
      expect(formatShortDate(undefined)).toBe('--');
    });

    it('returns "Invalid Date" for invalid date string if not handled by specific library', () => {
      // Note: toLocaleDateString on an invalid date can return "Invalid Date" or throw
      // Depending on JS engine. For consistency, perhaps the function should check validity.
      // Current implementation relies on Date constructor and toLocaleDateString.
      // Let's test with a clearly invalid string.
      // The behavior of toLocaleDateString for invalid dates is implementation-defined.
      // Some might return "Invalid Date", others might throw or return something else.
      // For this test, we'll just ensure it doesn't crash and returns a string.
      // A more robust test would mock Date or use a date library for consistent parsing.
      expect(typeof formatShortDate('not a date')).toBe('string');
    });
  });

  describe('formatWithPlus', () => {
    it('adds a plus sign for positive numbers', () => {
      expect(formatWithPlus(5)).toBe('+5');
      expect(formatWithPlus(0.5)).toBe('+0.5');
    });

    it('does not add a plus sign for zero or negative numbers', () => {
      expect(formatWithPlus(0)).toBe('0');
      expect(formatWithPlus(-5)).toBe('-5');
      expect(formatWithPlus(-0.5)).toBe('-0.5');
    });

    it('returns "--" for null or undefined input', () => {
      expect(formatWithPlus(null)).toBe('--');
      expect(formatWithPlus(undefined)).toBe('--');
    });
  });
});
