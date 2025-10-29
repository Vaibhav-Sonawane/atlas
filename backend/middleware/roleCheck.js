const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

const checkOwnershipOrRole = (resourceField, ...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has required role
    if (roles.includes(req.user.role)) {
      return next();
    }

    // Check if user owns the resource
    const resourceId = req.params[resourceField] || req.body[resourceField];
    if (req.user._id.toString() === resourceId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  };
};

export { checkRole, checkOwnershipOrRole };
