import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_STORAGE_KEY || 'smart-patient-tracker-secure-key-2025';

const secureStorage = {
  /**
     * Encrypts and stores data in localStorage
     * @param {string} key
     * @param {any} value
     */
  setItem: (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      if (import.meta.env.VITE_DISABLE_ENCRYPTION === 'true') {
        localStorage.setItem(key, jsonValue);
        return;
      }
      const encrypted = CryptoJS.AES.encrypt(jsonValue, SECRET_KEY).toString();
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Error saving securely to storage', error);
    }
  },

  /**
     * Retrieves and decrypts data from localStorage
     * @param {string} key
     * @returns {any | null}
     */
  getItem: (key) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      if (import.meta.env.VITE_DISABLE_ENCRYPTION === 'true') {
        return JSON.parse(encrypted);
      }

      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) return null; // Decryption failed or empty

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error retrieving from secure storage', error);
      // Fallback: Return null if decryption fails (tampering)
      return null;
    }
  },

  /**
     * Removes item from localStorage
     * @param {string} key
     */
  removeItem: (key) => {
    localStorage.removeItem(key);
  },

  /**
     * Clears all storage
     */
  clear: () => {
    localStorage.clear();
  },
};

export default secureStorage;

// Expose for Cypress/Dev execution
if (import.meta.env.MODE === 'development' || window.Cypress) {
  window.secureStorage = secureStorage;
}
