const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login utente
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ message: 'Email o password non validi' });
    }

    // In futuro: genera e restituisci un token JWT
    res.json({
      message: 'Accesso riuscito',
      userId: user._id,
      nickname: user.nickname,
      role: user.role,
      isVIP: user.isVIP
    });
  } catch (err) {
    console.error('Errore durante il login:', err);
    res.status(500).json({ message: 'Errore server durante il login' });
  }
});

module.exports = router;
