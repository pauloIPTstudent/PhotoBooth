import express from 'express';
import { login } from '../controllers/authController.js';

export const authRoutes = express.Router();

// POST /api/auth/login
authRoutes.post('/login', login);
