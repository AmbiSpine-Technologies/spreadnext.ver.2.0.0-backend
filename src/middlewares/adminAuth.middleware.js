import Admin from "../models/admin.model.js";
// src/middlewares/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';


export const protect = async (req, res, next) => {
// 1. Check token from Cookies OR Authorization Header (for flexibility)
  let token = req.cookies.token || (req.headers.authorization?.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null);
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

export const superAdmin = (req, res, next) => {
  if (req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Super Admin access required' });
  }
};



// Log admin activity
export const logAdminActivity = async (adminId, action, targetType, targetId, details) => {
  try {
    await Admin.findByIdAndUpdate(
      adminId,
      {
        $push: {
          activityLog: {
            action,
            targetType,
            targetId,
            details,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );
  } catch (error) {
    console.error("Error logging admin activity:", error);
  }
};


