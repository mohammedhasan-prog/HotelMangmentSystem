const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

// Generate JWT Token
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        // By default role is 'CUSTOMER'
      },
    });

    // Generate token
    const token = signToken(newUser.id, newUser.role);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password.',
      });
    }

    // Check if user exists and password is correct
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password.',
      });
    }

    // Generate token
    const token = signToken(user.id, user.role);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};