const express = require('express');
const router = express.Router();
const User = require('../models/User');

// REGISTRAZIONE UTENTE
router.post('/register', async (req, res) => {
  const { nickname, email, password, description } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email già registrata' });

    const newUser = new User({ nickname, email, password, description });
    await newUser.save();
    res.status(201).json({ message: 'Utente registrato con successo' });
  } catch (err) {
    console.error('Errore registrazione:', err);
    res.status(500).json({ message: 'Errore durante la registrazione' });
  }
});

module.exports = router;
