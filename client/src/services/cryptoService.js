import CryptoJS from 'crypto-js';

// Shared secret key - In a real app, ensure this matches the server's key via env variables
const ENCRYPTION_KEY = import.meta.env.VITE_API_KEY || 'smart-patient-tracker-api-secret-2025';

const cryptoService = {
    /**
     * Encrypts a JSON object or string
     * @param {any} data 
     * @returns {string} ciphertext
     */
    encrypt: (data) => {
        if (import.meta.env.VITE_DISABLE_ENCRYPTION === 'true') return JSON.stringify(data);
        try {
            const jsonString = JSON.stringify(data);
            return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
        } catch (error) {
            console.error('Encryption Error:', error);
            return null;
        }
    },

    /**
     * Decrypts ciphertext to Original Data
     * @param {string} ciphertext 
     * @returns {any} Original Data
     */
    decrypt: (ciphertext) => {
        if (import.meta.env.VITE_DISABLE_ENCRYPTION === 'true') return JSON.parse(ciphertext);
        try {
            const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedString) return null;

            return JSON.parse(decryptedString);
        } catch (error) {
            console.error('Decryption Error:', error);
            return null;
        }
    }
};

export default cryptoService;
