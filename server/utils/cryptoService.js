const CryptoJS = require('crypto-js');

// Shared secret key - Must match client
const ENCRYPTION_KEY = process.env.API_KEY || 'smart-patient-tracker-api-secret-2025';

const cryptoService = {
    /**
     * Encrypts a JSON object or string
     * @param {any} data 
     * @returns {string} ciphertext
     */
    encrypt: (data) => {
        try {
            const jsonString = JSON.stringify(data);
            return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
        } catch (error) {
            console.error('Server Encryption Error:', error);
            return null;
        }
    },

    /**
     * Decrypts ciphertext to Original Data
     * @param {string} ciphertext 
     * @returns {any} Original Data
     */
    decrypt: (ciphertext) => {
        try {
            const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedString) return null;

            return JSON.parse(decryptedString);
        } catch (error) {
            console.error('Server Decryption Error:', error);
            return null;
        }
    }
};

module.exports = cryptoService;
