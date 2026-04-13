// src/routes/authRoutes.js
import express from 'express';
import { signup, signin, forgotPassword, resetPassword, logout } from '../../controllers/admin/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/logout', logout);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;