const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  price: Number,
  qty: Number,
  image: String,
});

const orderSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true }, // in kobo
    currency: { type: String, default: 'NGN' },
    paymentMethod: {
      type: String,
      enum: ['paystack'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paystackReference: String,
    deliveryNote: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
