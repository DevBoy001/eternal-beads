/**
 * Admin routes — /api/admin  (all require X-Admin-Key header)
 *
 * Products:
 *   GET    /api/admin/products              — list all (incl. out-of-stock)
 *   POST   /api/admin/products              — create (multipart/form-data with 'image')
 *   PUT    /api/admin/products/:id          — update text fields
 *   PUT    /api/admin/products/:id/image    — replace image
 *   DELETE /api/admin/products/:id          — delete + remove Cloudinary image
 *   PATCH  /api/admin/products/:id/stock    — toggle in_stock
 *
 * Orders:
 *   GET    /api/admin/orders                — list all orders
 *   GET    /api/admin/orders/:id            — single order
 */
const router = require('express').Router();
const pool = require('../config/db');
const adminAuth = require('../middleware/adminAuth');
const { cloudinary, upload } = require('../config/cloudinary');

router.use(adminAuth);

/* ─── PRODUCTS ─────────────────────────────────────────── */

// List all products
router.get('/products', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    res.json({ success: true, products: rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create product
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Product image is required' });
    }

    const { name, category, price, note = '', tag = '', inStock, featured } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: 'name, category, and price are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO products
         (name, category, price, note, image, image_public_id, tag, in_stock, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        name,
        category,
        Number(price),
        note,
        req.file.path,
        req.file.filename,
        tag,
        inStock !== 'false',
        featured === 'true',
      ]
    );

    res.status(201).json({ success: true, product: rows[0] });
  } catch (err) {
    console.error('POST /admin/products error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update product text fields
router.put('/products/:id', async (req, res) => {
  try {
    const { name, category, price, note, tag, inStock, featured } = req.body;

    // Build dynamic SET clause
    const fields = [];
    const values = [];

    if (name !== undefined)     { values.push(name);              fields.push(`name = $${values.length}`); }
    if (category !== undefined) { values.push(category);          fields.push(`category = $${values.length}`); }
    if (price !== undefined)    { values.push(Number(price));     fields.push(`price = $${values.length}`); }
    if (note !== undefined)     { values.push(note);              fields.push(`note = $${values.length}`); }
    if (tag !== undefined)      { values.push(tag);               fields.push(`tag = $${values.length}`); }
    if (inStock !== undefined)  {
      values.push(inStock !== 'false' && inStock !== false);
      fields.push(`in_stock = $${values.length}`);
    }
    if (featured !== undefined) {
      values.push(featured === 'true' || featured === true);
      fields.push(`featured = $${values.length}`);
    }

    if (!fields.length) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product: rows[0] });
  } catch (err) {
    console.error('PUT /admin/products/:id error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Replace product image
router.put('/products/:id/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'New image file is required' });
    }

    // Get old image public id
    const { rows: existing } = await pool.query(
      'SELECT image_public_id FROM products WHERE id = $1',
      [req.params.id]
    );
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete old Cloudinary image
    if (existing[0].image_public_id) {
      await cloudinary.uploader.destroy(existing[0].image_public_id).catch(() => {});
    }

    const { rows } = await pool.query(
      `UPDATE products SET image = $1, image_public_id = $2 WHERE id = $3 RETURNING *`,
      [req.file.path, req.file.filename, req.params.id]
    );

    res.json({ success: true, product: rows[0] });
  } catch (err) {
    console.error('PUT /admin/products/:id/image error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Remove from Cloudinary
    if (rows[0].image_public_id) {
      await cloudinary.uploader.destroy(rows[0].image_public_id).catch(() => {});
    }

    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('DELETE /admin/products/:id error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle stock status
router.patch('/products/:id/stock', async (req, res) => {
  try {
    const { inStock } = req.body;

    if (inStock === undefined) {
      return res.status(400).json({ success: false, message: 'inStock is required' });
    }

    const value = inStock === true || inStock === 'true';
    const { rows } = await pool.query(
      'UPDATE products SET in_stock = $1 WHERE id = $2 RETURNING *',
      [value, req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product: rows[0] });
  } catch (err) {
    console.error('PATCH /admin/products/:id/stock error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ─── ORDERS ───────────────────────────────────────────── */

// List all orders
router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;
    const values = [];
    let where = '';

    if (status) {
      values.push(status);
      where = `WHERE payment_status = $1`;
    }

    const { rows } = await pool.query(
      `SELECT * FROM orders ${where} ORDER BY created_at DESC`,
      values
    );
    res.json({ success: true, orders: rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Single order
router.get('/orders/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order: rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
