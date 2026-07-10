const { toZonedTime, fromZonedTime, formatInTimeZone } = require('date-fns-tz');
const { startOfDay, endOfDay } = require('date-fns');

const TIMEZONE = process.env.TZ || 'Asia/Kolkata';

/**
 * Returns the start of the day in UTC for the configured business timezone.
 * @param {Date|string|number} date - The date to process
 * @returns {Date} The UTC Date object representing 12:00 AM in the local timezone
 */
function getStartOfDay(date = new Date()) {
  const zonedDate = toZonedTime(date, TIMEZONE);
  const startZoned = startOfDay(zonedDate);
  return fromZonedTime(startZoned, TIMEZONE);
}

/**
 * Returns the end of the day in UTC for the configured business timezone.
 * @param {Date|string|number} date - The date to process
 * @returns {Date} The UTC Date object representing 11:59:59 PM in the local timezone
 */
function getEndOfDay(date = new Date()) {
  const zonedDate = toZonedTime(date, TIMEZONE);
  const endZoned = endOfDay(zonedDate);
  return fromZonedTime(endZoned, TIMEZONE);
}

/**
 * Formats a date into a YYYY-MM-DD string according to the configured business timezone.
 * Prevents UTC timezone slicing bugs in charts.
 * @param {Date|string|number} date - The date to process
 * @returns {string} The local date string, e.g., '2026-07-10'
 */
function formatLocalYYYYMMDD(date = new Date()) {
  return formatInTimeZone(date, TIMEZONE, 'yyyy-MM-dd');
}

module.exports = {
  getStartOfDay,
  getEndOfDay,
  formatLocalYYYYMMDD,
  TIMEZONE
};
