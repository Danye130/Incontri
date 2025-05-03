const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload media
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware ruolo
function requireRole(role) {
  return function (req, res, next) {
    if (req.user && req.user.role === role) {
      return next();
    }
    res.status(403).json({ message: 'Accesso negato' });
  };
}

// Crea post (solo creator)
router.post('/create', requireRole('creator'), upload.single('media'), async (req, res) => {
  const post = new Post({
    creator: req.user._id,
    text: req.body.text,
    mediaUrl: req.file ? '/uploads/' + req.file.filename : null
  });
  await post.save();
  res.json(post);
});

// Feed (tutti i post)
router.get('/feed', async (req, res) => {
  const posts = await Post.find().populate('creator', 'nickname photo').sort({ createdAt: -1 });
  res.json(posts);
});

module.exports = router;
