/**
 * Payment routes — /api/payment
 *
 * Paystack:
 *   POST /api/payment/paystack/initialize  — start a Paystack transaction
 *   GET  /api/payment/paystack/callback    — Paystack redirects here after payment
 *   POST /api/payment/paystack/webhook     — Paystack webhook (charge.success, etc.)
 *   GET  /api/payment/paystack/verify/:ref — manually verify a transaction
 */
const router = require('express').Router();
const crypto = require('crypto');
const axios = require('axios');
const pool = require('../config/db');

// Initialize a Paystack transaction
router.post('/paystack/initialize', async (req, res) => {
  try {
    const { customer, items, currency = 'NGN', deliveryNote = '' } = req.body;

    if (!customer?.email || !items?.length) {
      return res.status(400).json({ success: false, message: 'Customer email and items are required' });
    }

    const totalNGN = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const amountKobo = Math.round(totalNGN * 100);
    const reference = `EB-PS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Save pending order
    await pool.query(
      `INSERT INTO orders
         (reference, customer_name, customer_email, customer_phone,
          items, total_amount, currency, payment_method, paystack_reference, delivery_note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'paystack',$8,$9)`,
      [
        reference,
        customer.name,
        customer.email,
        customer.phone || '',
        JSON.stringify(items),
        amountKobo,
        currency,
        reference,
        deliveryNote,
      ]
    );

    // Initialize with Paystack
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: customer.email,
        amount: amountKobo,
        currency,
        reference,
        callback_url: process.env.PAYSTACK_CALLBACK_URL,
        metadata: {
          customerName: customer.name,
          customerPhone: customer.phone || '',
          cartItems: items.map(i => `${i.name} x${i.qty}`).join(', '),
          custom_fields: [
            { display_name: 'Customer Name', variable_name: 'customer_name', value: customer.name },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.status) {
      return res.status(502).json({ success: false, message: 'Paystack initialization failed' });
    }

    res.json({
      success: true,
      authorizationUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
      accessCode: response.data.data.access_code,
    });
  } catch (err) {
    console.error('Paystack initialize error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Payment initialization failed' });
  }
});

// Paystack redirect callback
router.get('/paystack/callback', async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=missing_reference`);
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    const data = response.data.data;

    if (data.status === 'success') {
      await pool.query(
        `UPDATE orders SET payment_status = 'paid' WHERE paystack_reference = $1`,
        [reference]
      );
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/success?reference=${reference}&method=paystack`
      );
    }

    await pool.query(
      `UPDATE orders SET payment_status = 'failed' WHERE paystack_reference = $1`,
      [reference]
    );
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/failed?reference=${reference}&reason=${encodeURIComponent(data.gateway_response)}`
    );
  } catch (err) {
    console.error('Paystack callback error:', err.response?.data || err.message);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=verification_error`);
  }
});

// Paystack webhook
router.post('/paystack/webhook', async (req, res) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ message: 'Invalid signature' });
  }

  const { event, data } = req.body;

  try {
    if (event === 'charge.success') {
      await pool.query(
        `UPDATE orders SET payment_status = 'paid' WHERE paystack_reference = $1`,
        [data.reference]
      );
    }
    if (event === 'charge.failed') {
      await pool.query(
        `UPDATE orders SET payment_status = 'failed' WHERE paystack_reference = $1`,
        [data.reference]
      );
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Paystack webhook error:', err.message);
    res.sendStatus(500);
  }
});

// Manual verify
router.get('/paystack/verify/:reference', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${req.params.reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    const data = response.data.data;
    res.json({
      success: true,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      paidAt: data.paid_at,
      reference: data.reference,
    });
  } catch (err) {
    console.error('Paystack verify error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

module.exports = router;
