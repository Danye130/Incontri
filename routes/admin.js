const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware di controllo ruolo admin
function requireAdmin(req, res, next) {
  const user = req.user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Accesso riservato agli admin' });
  }
  next();
}

// Ottieni tutti gli utenti
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero utenti' });
  }
});

// Modifica ruolo o stato utente
router.post('/user/:id/update', requireAdmin, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Utente aggiornato', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Errore aggiornamento utente' });
  }
});

// Elimina utente (es. profilo fake)
router.delete('/user/:id', requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utente eliminato' });
  } catch (err) {
    res.status(500).json({ message: 'Errore eliminazione utente' });
  }
});

module.exports = router;
