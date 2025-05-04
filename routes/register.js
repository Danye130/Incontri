const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const User = require('../models/User');

// Configurazione Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/uploads/';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, ''));
  }
});
const upload = multer({ storage });

// Rotta per registrazione utente
router.post('/register', upload.single('photo'), async (req, res) => {
  const { nickname, email, password, description } = req.body;

  try {
    let photoPath = '/images/default-profile.jpg';

    if (req.file) {
      const resizedPath = 'public/uploads/resized-' + req.file.filename;
      await sharp(req.file.path)
        .resize(300)
        .toFile(resizedPath);
      photoPath = '/uploads/' + path.basename(resizedPath);
    }

    const newUser = new User({
      nickname,
      email,
      password,
      description,
      photo: photoPath,
      role: 'user',
      isFake: false
    });

    await newUser.save();
    res.status(201).json({ message: 'Registrazione completata', userId: newUser._id });
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    res.status(500).json({ error: 'Registrazione fallita' });
  }
});

module.exports = router;
