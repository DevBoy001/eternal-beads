require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pool = require('./config/db');
const migrate = require('./db/migrate');

const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');

const app = express();

/* ─── Security ──────────────────────────────────────────── */
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Admin-Key'],
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

/* ─── Body parsing ──────────────────────────────────────── */
// Paystack webhook needs raw body for HMAC verification
app.use('/api/payment/paystack/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─── Routes ────────────────────────────────────────────── */
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

/* ─── Start ─────────────────────────────────────────────── */
async function start() {
  try {
    // Test DB connection
    await pool.query('SELECT 1');
    console.log('✅  Neon PostgreSQL connected');

    // Run migrations (creates tables if they don't exist)
    await migrate();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀  Eternal Beads API running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('❌  Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
