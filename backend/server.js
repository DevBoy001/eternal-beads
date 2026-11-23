require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');

const app = express();

/* ─── Security middleware ───────────────────────────────── */
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-Admin-Key'],
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* ─── Body parsing ──────────────────────────────────────── */
// Paystack webhook needs raw body for HMAC signature verification
app.use('/api/payment/paystack/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─── Routes ────────────────────────────────────────────── */
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

// 404 fallback
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

/* ─── Database + start ──────────────────────────────────── */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀  Eternal Beads API running on http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
