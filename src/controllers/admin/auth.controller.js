// src/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../../models/user.model.js';
import { sendResetEmail } from '../../utils/email.js'; // we'll create this

export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, userName, password } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { userName }] });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      userName,
      password: hashedPassword,
      role: 'user',
    });
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/signin
export const signin = async (req, res) => {
  try {
    const { email, password, role } = req.body; // role ko fetch karein

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
      // Role Validation: Check karein ki user ka role frontend se match kar raha hai
    if (user.role !== role) {
      return res.status(403).json({ message: 'Access denied: Unauthorized role' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account blocked, contact admin' });
    }
    user.lastLogin = new Date();
    await user.save();


    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  // Set httpOnly cookie
res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.cookie('token', '', { maxAge: 0, httpOnly: true });
  res.status(200).json({ message: 'Logged out successfully' });
};
// @desc    Forgot password – send reset link
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user with that email' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendResetEmail(email, resetLink);
    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // 1. Sirf token se user dhoondein
    const user = await User.findOne({ resetPasswordToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token: User not found' });
    }

    // 2. Check karein expiry alag se
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    // 3. Sab sahi hai toh password update karein
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
