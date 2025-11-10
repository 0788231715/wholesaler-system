const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

const isOwnerOrAdmin = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if user is admin or owner of the resource
      if (req.user.role === 'admin' || resource.producer?.toString() === req.user.id || resource.retailer?.toString() === req.user.id) {
        return next();
      }

      res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error in authorization'
      });
    }
  };
};

module.exports = { authorize, isOwnerOrAdmin };