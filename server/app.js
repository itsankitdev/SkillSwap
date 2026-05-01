const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// ── Security Middleware ──────────────────────────────────
app.use(helmet()); // Sets secure HTTP headers
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// ── Rate Limiting ────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per window
  message: { success: false, message: 'Too many requests, slow down.' },
});
app.use('/api', limiter);

// ── Body Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Prevent huge payload attacks
app.use(express.urlencoded({ extended: true }));

// ── Logging (dev only) ───────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SkillSwap API is running 🚀' });
});


// ── Routes ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.use('/api/auth',     require('./routes/auth.routes'));
app.use('/api/users',    require('./routes/user.routes'));
app.use('/api/skills',   require('./routes/skill.routes'));
app.use('/api/requests', require('./routes/request.routes'));
app.use('/api/credits',  require('./routes/credit.routes'));
app.use('/api/match', require('./routes/match.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/sessions', require('./routes/session.routes'));
app.use('/api/ratings', require('./routes/rating.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));


// ── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field} is already taken`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map((e) => e.message).join(', ');
    statusCode = 400;
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // Don't leak stack traces in production
  const response = { success: false, message };
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

module.exports = app;