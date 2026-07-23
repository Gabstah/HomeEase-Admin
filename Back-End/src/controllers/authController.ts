import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/passwordHash.js';
import { generateToken } from '../utils/jwt.js';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateSignupRole,
} from '../utils/validators.js';
import { errorResponse } from '../utils/errorResponse.js';

export const signup = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    if (!fullName || !email || !phone || !password || !role) {
      return res.status(400).json(errorResponse(400, 'Missing required fields'));
    }

    if (!validateEmail(email)) {
      return res.status(400).json(errorResponse(400, 'Invalid email format'));
    }

    if (!validatePassword(password)) {
      return res.status(400).json(
        errorResponse(
          400,
          'Password must be at least 8 characters with 1 uppercase letter and 1 number'
        )
      );
    }

    if (!validatePhone(phone)) {
      return res.status(400).json(errorResponse(400, 'Invalid phone number'));
    }

    if (!validateSignupRole(role)) {
      return res.status(400).json(
        errorResponse(400, 'Role must be CLIENT or WORKER. Admin accounts cannot be created via signup.')
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json(errorResponse(409, 'Email already registered'));
    }

    const hashedPassword = await hashPassword(password);
    const normalizedRole = role.toUpperCase();

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        password: hashedPassword,
        role: normalizedRole,
      },
    });

    if (normalizedRole === 'WORKER') {
      await prisma.workerProfile.create({
        data: {
          userId: user.id,
        },
      });
    } else {
      await prisma.clientProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(errorResponse(400, 'Email and password required'));
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json(errorResponse(401, 'Invalid credentials'));
    }

    if (user.isDeleted) {
      return res.status(403).json(errorResponse(403, 'Account suspended'));
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json(errorResponse(401, 'Invalid credentials'));
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse(401, 'Unauthorized'));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isDeleted: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json(errorResponse(404, 'User not found'));
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.isDeleted ? 'INACTIVE' : 'ACTIVE',
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const sendPasswordResetEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json(errorResponse(400, 'Invalid email'));
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({
        success: true,
        message: 'If email exists, password reset link sent',
      });
    }

    // TODO: Send actual email with reset token

    return res.json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!validatePassword(newPassword)) {
      return res.status(400).json(
        errorResponse(
          400,
          'Password must be at least 8 characters with 1 uppercase letter and 1 number'
        )
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json(errorResponse(404, 'User not found'));
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error'));
  }
};
