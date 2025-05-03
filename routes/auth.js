const express = require('express');
const router = express.Router();
const User = require('../models/User');

// LOGIN - verifica email + password
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Email o password errati' });
    }
    res.json({ userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router;
