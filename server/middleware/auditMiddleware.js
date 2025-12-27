const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');

const auditLogger = async (req, res, next) => {
  // We listen to the 'finish' event to log after the response is sent
  // But for capturing the request details, we can prep here.

  // Attempt to identify user from token purely for logging purposes
  // independent of the actual auth middleware to capture even failed attempts if token exists
  let userId = null;
  const userEmail = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (token !== 'null' && token !== 'undefined') {
        const decoded = jwt.decode(token);
        if (decoded) {
          userId = decoded.id;
          // Decoding doesn't always give email depending on how it was signed.
          // But our authController signs with id.
          // Let's rely on req.user if available later.
        }
      }
    } catch (_e) {
      // Ignore
    }
  }

  // Capture original end function to intercept
  const _originalEnd = res.end;

  // We can just log immediately or on finish. "EACH AND EVERY ACTION" implies request receipt usually.
  // But logging on finish allows capturing status code.

  res.on('finish', () => {
    // Filter out sensitive data from logging
    const body = { ...req.body };
    if (body.password) body.password = '[REDACTED]';

    // Don't log internal health checks or static if any
    if (req.originalUrl === '/') return;

    AuditLog.create({
      userId: req.user ? req.user.id : userId, // req.user might be set by auth middleware running before this? No, we likely put this first or after.
      // If we put this BEFORE auth middleware, req.user is undefined.
      // If we put it AFTER, we miss 401s.
      // Best to put it first, and try to extract token manually as above.
      userEmail: userEmail,
      action: `${req.method} ${req.originalUrl}`,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      details: {
        body: body,
        query: req.query,
        statusCode: res.statusCode,
      },
      targetId: req.audit ? req.audit.targetId : null,
      userAgent: req.get('user-agent'),
    }).catch((err) => console.error('Audit Log Error:', err));
  });

  next();
};

module.exports = auditLogger;
