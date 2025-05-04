const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Recupera dati profilo pubblico
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Profilo non trovato' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero del profilo' });
  }
});

// Aggiorna profilo (nickname, descrizione, isVIP, featured, ecc.)
router.post('/profile/update', async (req, res) => {
  const userId = req.headers['x-user-id'];

  if (!userId) return res.status(401).json({ message: 'Non autorizzato' });

  try {
    const updateFields = (({
      nickname,
      description,
      isVIP,
      featured,
      isFake
    }) => ({ nickname, description, isVIP, featured, isFake }))(req.body);

    const user = await User.findByIdAndUpdate(userId, updateFields, { new: true });
    if (!user) return res.status(404).json({ message: 'Utente non trovato' });

    res.json({ message: 'Profilo aggiornato', user });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante l\'aggiornamento del profilo' });
  }
});

module.exports = router;
