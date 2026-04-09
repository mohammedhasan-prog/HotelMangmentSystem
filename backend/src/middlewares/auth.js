const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

exports.protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token.',
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
};
