const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// Upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET profilo utente loggato
router.get('/profile', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Non autenticato' });
  res.json(req.user);
});

// PUT modifica profilo
router.put('/profile', upload.single('photo'), async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Non autenticato' });

  const { nickname, description } = req.body;
  if (nickname) req.user.nickname = nickname;
  if (description) req.user.description = description;
  if (req.file) req.user.photo = '/uploads/' + req.file.filename;

  try {
    await req.user.save();
    res.json({ message: 'Profilo aggiornato' });
  } catch (err) {
    console.error('Errore salvataggio profilo:', err);
    res.status(500).json({ message: 'Errore salvataggio profilo' });
  }
});

module.exports = router;
