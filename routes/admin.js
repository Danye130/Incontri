const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Autenticazione finta via header
router.use(async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ message: 'Non autenticato' });

  const user = await User.findById(userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Accesso negato: solo admin' });
  }

  req.user = user;
  next();
});

// ✅ 1. Ottieni tutti gli utenti
router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// ✅ 2. Cambia ruolo a un utente
router.put('/users/:id/role', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Utente non trovato' });

  user.role = req.body.role;
  await user.save();
  res.json({ message: 'Ruolo aggiornato' });
});

// ✅ 3. Elimina utente
router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Utente eliminato' });
});

module.exports = router;
