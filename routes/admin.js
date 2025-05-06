const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware per autenticazione semplice con userId
function checkAdmin(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(403).send("Accesso negato");

  User.findOne({ email: userId }).then(user => {
    if (!user || user.role !== 'admin') {
      return res.status(403).send("Accesso solo per admin");
    }
    next();
  });
}

// GET tutti gli utenti
router.get('/users', checkAdmin, async (req, res) => {
  const utenti = await User.find();
  res.json(utenti);
});

// Cambia ruolo utente
router.put('/users/:id/role', checkAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { role: req.body.role });
  res.sendStatus(200);
});

// Aggiorna campo "in evidenza"
router.put('/users/:id/featured', checkAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isFeatured: req.body.isFeatured });
  res.sendStatus(200);
});

// Elimina utente
router.delete('/users/:id', checkAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.sendStatus(200);
});

module.exports = router;
