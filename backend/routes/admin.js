/**
 * Admin routes — /api/admin  (all require X-Admin-Key header)
 *
 * Products:
 *   GET    /api/admin/products          — list all products (including out-of-stock)
 *   POST   /api/admin/products          — create product (multipart/form-data with 'image' field)
 *   PUT    /api/admin/products/:id      — update product details (no image change)
 *   PUT    /api/admin/products/:id/image — replace product image
 *   DELETE /api/admin/products/:id      — delete product + Cloudinary image
 *   PATCH  /api/admin/products/:id/stock — toggle inStock
 *
 * Orders:
 *   GET    /api/admin/orders            — list all orders
 *   GET    /api/admin/orders/:id        — single order detail
 */
const router = require('express').Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const adminAuth = require('../middleware/adminAuth');
const { cloudinary, upload } = require('../config/cloudinary');

// All admin routes are protected
router.use(adminAuth);

/* ─── PRODUCTS ─────────────────────────────────────────── */

// List all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create product
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Product image is required' });
    }

    const { name, category, price, note, tag, inStock, featured } = req.body;

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      note,
      tag,
      inStock: inStock !== 'false',
      featured: featured === 'true',
      image: req.file.path,           // Cloudinary secure URL
      imagePublicId: req.file.filename, // Cloudinary public_id
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('POST /admin/products error:', err);
    // If mongoose validation error
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update product details (text fields only — no image)
router.put('/products/:id', async (req, res) => {
  try {
    const { name, category, price, note, tag, inStock, featured } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = Number(price);
    if (note !== undefined) updates.note = note;
    if (tag !== undefined) updates.tag = tag;
    if (inStock !== undefined) updates.inStock = inStock !== 'false' && inStock !== false;
    if (featured !== undefined) updates.featured = featured === 'true' || featured === true;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    console.error('PUT /admin/products/:id error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Replace product image
router.put('/products/:id/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'New image file is required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete old image from Cloudinary
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId).catch(() => {});
    }

    product.image = req.file.path;
    product.imagePublicId = req.file.filename;
    await product.save();

    res.json({ success: true, product });
  } catch (err) {
    console.error('PUT /admin/products/:id/image error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Remove image from Cloudinary
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId).catch(() => {});
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('DELETE /admin/products/:id error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle product stock status
router.patch('/products/:id/stock', async (req, res) => {
  try {
    const { inStock } = req.body;

    if (typeof inStock !== 'boolean' && inStock !== 'true' && inStock !== 'false') {
      return res.status(400).json({ success: false, message: 'inStock must be a boolean' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { inStock: inStock === true || inStock === 'true' } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    console.error('PATCH /admin/products/:id/stock error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ─── ORDERS ───────────────────────────────────────────── */

// List all orders
router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { paymentStatus: status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Single order detail
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
