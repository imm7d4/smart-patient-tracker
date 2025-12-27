const cryptoService = require('../utils/cryptoService');

const encryptionMiddleware = (req, res, next) => {
  // 0. Bypass if Disabled (Test Mode)
  // console.log(`[Middleware] Check Disable: '${process.env.DISABLE_ENCRYPTION}'`);
  if (process.env.DISABLE_ENCRYPTION && process.env.DISABLE_ENCRYPTION.trim() === 'true') {
    console.log('[Middleware] Bypassing Encryption');
    return next();
  }

  // 1. Decrypt Incoming Request Body
  if (req.body && req.body.payload) {
    // console.log('Decrypting incoming request...');
    const decrypted = cryptoService.decrypt(req.body.payload);
    if (decrypted) {
      req.body = decrypted;
    } else {
      console.error('Failed to decrypt request body');
      return res.status(400).json({success: false, message: 'Invalid encryption'});
    }
  }

  // 2. Encrypt Outgoing Response
  const originalJson = res.json;
  res.json = function(data) {
    // console.log('Encrypting outgoing response...');
    try {
      // Prevent double encryption or encrypting already encrypted payload (if manual)
      if (data && data.payload && Object.keys(data).length === 1) {
        return originalJson.call(this, data);
      }

      const encrypted = cryptoService.encrypt(data);
      return originalJson.call(this, {payload: encrypted});
    } catch (error) {
      console.error('Response encryption failed', error);
      // Fallback to original if encryption fails (should not happen)
      // Or return 500? For safety, return 500.
      return originalJson.call(this, {success: false, message: 'Encryption failed'});
    }
  };

  next();
};

module.exports = encryptionMiddleware;
