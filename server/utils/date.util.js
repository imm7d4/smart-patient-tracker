/**
 * Get start of day timestamp (00:00:00.000)
 * @param {Date} date - Optional date, defaults to today
 * @returns {Date} Start of day
 */
const getStartOfDay = (date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

/**
 * Get end of day timestamp (23:59:59.999)
 * @param {Date} date - Optional date, defaults to today
 * @returns {Date} End of day
 */
const getEndOfDay = (date = new Date()) => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

/**
 * Get date N days ago
 * @param {number} days - Number of days to subtract
 * @returns {Date} Date N days ago
 */
const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Get date range for today
 * @returns {Object} Object with startOfDay and endOfDay
 */
const getTodayRange = () => {
  return {
    startOfDay: getStartOfDay(),
    endOfDay: getEndOfDay(),
  };
};

module.exports = {
  getStartOfDay,
  getEndOfDay,
  getDaysAgo,
  getTodayRange,
};
