const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_1234567890abcdef');
const User = require('../models/User');

// Middleware per caricare utente da header
router.use(async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (userId) {
    const user = await User.findById(userId);
    req.user = user;
  }
  next();
});

// Rotta per avviare pagamento abbonamento mensile
router.post('/subscribe/:creatorId', async (req, res) => {
  const creator = await User.findById(req.params.creatorId);
  const follower = req.user;

  if (!creator || creator.role !== 'creator') {
    return res.status(404).json({ message: 'Creator non trovato' });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Abbonamento a ${creator.nickname}`
        },
        unit_amount: creator.subscriptionPrice * 100,
        recurring: { interval: 'month' }
      },
      quantity: 1
    }],
    success_url: 'http://localhost:3000/success.html',
    cancel_url: 'http://localhost:3000/cancel.html',
    metadata: {
      followerId: follower._id.toString(),
      creatorId: creator._id.toString()
    }
  });

  res.json({ url: session.url });
});

module.exports = router;
