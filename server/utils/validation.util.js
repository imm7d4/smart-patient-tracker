/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if required fields are present in data
 * @param {Array<string>} fields - Array of required field names
 * @param {Object} data - Data object to validate
 * @returns {Object} { valid: boolean, missing: Array<string> }
 */
const validateRequired = (fields, data) => {
  const missing = fields.filter((field) => !data[field]);
  return {
    valid: missing.length === 0,
    missing,
  };
};

/**
 * Sanitize user input by trimming whitespace
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim();
};

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId format
 */
const validateObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

module.exports = {
  validateEmail,
  validateRequired,
  sanitizeInput,
  validateObjectId,
};
