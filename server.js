require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const sharp = require('sharp');
const stripe = require('stripe')('sk_test_1234567890abcdef');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware base
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Connessione MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connesso'))
  .catch(err => console.error('❌ Errore MongoDB:', err));

// MODELLI
const User = require('./models/User');

// ROUTES
const authRoutes = require('./routes/auth');
const registerRoutes = require('./routes/register');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');

// Attivazione rotte API
app.use('/api', authRoutes);
app.use('/api', registerRoutes);
app.use('/api', profileRoutes);
app.use('/admin', adminRoutes);

// Middleware autenticazione
app.use(async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (userId) {
    const user = await User.findById(userId);
    req.user = user;
  }
  next();
});

// Middleware ruoli
function requireRole(role) {
  return function (req, res, next) {
    if (req.user && req.user.role === role) {
      return next();
    }
    res.status(403).json({ message: 'Accesso negato' });
  };
}

// MODELLI MESSAGGI e POST
const MessageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});
const Message = mongoose.model('Message', MessageSchema);

const PostSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: '' },
  mediaUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', PostSchema);

// ROTTA CREAZIONE POST
app.post('/posts/create', requireRole('user'), multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'public/uploads/';
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  })
}).single('media'), async (req, res) => {
  const post = new Post({
    creator: req.user._id,
    text: req.body.text,
    mediaUrl: req.file ? '/uploads/' + req.file.filename : null
  });
  await post.save();
  res.json(post);
});

// ROTTA FEED POST
app.get('/posts/feed', async (req, res) => {
  const posts = await Post.find().populate('creator', 'nickname photo').sort({ createdAt: -1 });
  res.json(posts);
});

// ROTTA PROFILI IN EVIDENZA
app.get('/api/featured-users', async (req, res) => {
  try {
    const featuredUsers = await User.find({ featured: true }).limit(10);
    res.json(featuredUsers);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero dei profili in evidenza' });
  }
});

// ROTTA TUTTI GLI UTENTI (ORDINATI)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ featured: -1, isFake: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero degli utenti' });
  }
});

// AVVIO SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server attivo su http://localhost:${PORT}`);
});
