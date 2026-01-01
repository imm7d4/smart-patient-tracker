const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({success: false, message: 'Not authorized, token failed'});
    }
  } else {
    res.status(401).json({success: false, message: 'Not authorized, no token'});
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({success: false, message: `User role ${req.user.role} is not authorized`});
    }
    next();
  };
};

module.exports = {protect, authorize};
