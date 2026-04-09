const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes/index');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Set HTTP security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Logger
app.use(morgan('dev'));

// Main API routes
app.use('/api/v1', routes);

// 404 handler for missing routes
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found',
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
