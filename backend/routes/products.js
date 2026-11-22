/**
 * Public product routes — /api/products
 */
const router = require('express').Router();
const Product = require('../models/Product');

// GET /api/products — list all in-stock products (public storefront)
router.get('/', async (req, res) => {
  try {
    const { category, sort, featured } = req.query;
    const filter = {};

    if (category && category !== 'All pieces') filter.category = category;
    if (featured === 'true') filter.featured = true;

    let query = Product.find(filter);

    if (sort === 'low') query = query.sort({ price: 1 });
    else if (sort === 'high') query = query.sort({ price: -1 });
    else query = query.sort({ featured: -1, createdAt: -1 });

    const products = await query.lean();
    res.json({ success: true, products });
  } catch (err) {
    console.error('GET /api/products error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/products/:id — single product detail
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    console.error('GET /api/products/:id error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
