const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const morgan = require('morgan');
const AppError = require('./src/utils/appError');

// Routers and the payment controller for the webhook
const eventRouter = require('./src/routes/eventRouter');
const authRouter = require('./src/routes/authRouter');
const adminRouter = require('./src/routes/adminRouter');
const paymentController = require('./src/controllers/paymentController');
const socketRouter = require('./src/routes/messageRouter');

const app = express();

// --- Global Middlewares ---
// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- Security Headers ---
app.use(helmet());

// --- CORS Configuration ---
//  Allow multiple local dev origins for flexibility
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://192.168.0.33:5500', // optional: for LAN testing
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Webhook 
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.stripeWebhook
);

// JSON & URL Encoded Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again later.',
});

// API Routes
app.use('/api', apiLimiter);
app.use('/api/events', eventRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/socket', socketRouter);


// Serve Frontend Static Files
const frontendDir = path.join(__dirname, '../front-end');
app.use(express.static(frontendDir));

// --- Serve HTML Pages ---
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.get('/event.html', (req, res) => {
  res.sendFile(path.join(frontendDir, 'event.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(frontendDir, 'admin.html'));
});

app.get('/create-event.html', (req, res) => {
  res.sendFile(path.join(frontendDir, 'create-event.html'));
});

// Handle Unmatched API Routes ---
app.all('/api/', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('ERROR', err.message);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
