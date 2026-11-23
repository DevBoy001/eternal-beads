/**
 * Public product routes — /api/products
 */
const router = require('express').Router();
const pool = require('../config/db');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, sort, featured } = req.query;
    const conditions = ['in_stock = TRUE'];
    const values = [];

    if (category && category !== 'All pieces') {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }
    if (featured === 'true') {
      conditions.push('featured = TRUE');
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'ORDER BY featured DESC, created_at DESC';
    if (sort === 'low') orderBy = 'ORDER BY price ASC';
    if (sort === 'high') orderBy = 'ORDER BY price DESC';

    const { rows } = await pool.query(
      `SELECT * FROM products ${where} ${orderBy}`,
      values
    );

    res.json({ success: true, products: rows });
  } catch (err) {
    console.error('GET /api/products error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product: rows[0] });
  } catch (err) {
    console.error('GET /api/products/:id error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
