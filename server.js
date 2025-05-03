const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const sharp = require('sharp');
const stripe = require('stripe')('sk_test_1234567890abcdef'); // tua chiave Stripe
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB
mongoose.connect('mongodb+srv://IncontriUser:Calipso1!@cluster0.myejdyz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connesso'))
  .catch(err => console.error('❌ Errore MongoDB:', err));

// MODELLI
const UserSchema = new mongoose.Schema({
  nickname: String,
  email: String,
  password: String,
  description: String,
  photo: String,
  isVIP: { type: Boolean, default: false },
  likes: [String],
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'user'
  },
  subscriptionPrice: { type: Number },
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});
const User = mongoose.model('User', UserSchema);

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

// Middleware mock per autenticazione
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

// Rotte test base
app.get('/admin', requireRole('admin'), (req, res) => {
  res.send('Benvenuto admin');
});
app.get('/creator', requireRole('creator'), (req, res) => {
  res.send('Benvenuto creator');
});

// Upload per post
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

// Crea post
app.post('/posts/create', requireRole('creator'), upload.single('media'), async (req, res) => {
  const post = new Post({
    creator: req.user._id,
    text: req.body.text,
    mediaUrl: req.file ? '/uploads/' + req.file.filename : null
  });
  await post.save();
  res.json(post);
});

// Feed pubblico
app.get('/posts/feed', async (req, res) => {
  const posts = await Post.find().populate('creator', 'nickname photo').sort({ createdAt: -1 });
  res.json(posts);
});

// Abbonamento Stripe
app.post('/subscriptions/subscribe/:creatorId', async (req, res) => {
  const creator = await User.findById(req.params.creatorId);
  const follower = req.user;

  if (!creator || creator.role !== 'creator') {
    return res.status(404).json({ message: 'Creator non trovato' });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Abbonamento a ${creator.nickname}`
        },
        unit_amount: creator.subscriptionPrice * 100,
        recurring: { interval: 'month' }
      },
      quantity: 1
    }],
    success_url: 'http://localhost:3000/success.html',
    cancel_url: 'http://localhost:3000/cancel.html',
    metadata: {
      followerId: follower._id.toString(),
      creatorId: creator._id.toString()
    }
  });

  res.json({ url: session.url });
});

// Webhook Stripe (da attivare in futuro)
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const endpointSecret = 'whsec_1234567890abcdef'; // tua chiave webhook
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log('Errore firma webhook');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const metadata = event.data.object.metadata;
    const followerId = metadata.followerId;
    const creatorId = metadata.creatorId;

    try {
      const creator = await User.findById(creatorId);
      if (!creator.subscribers.includes(followerId)) {
        creator.subscribers.push(followerId);
        await creator.save();
        console.log(`✅ Abbonamento salvato: ${followerId} → ${creator.nickname}`);
      }
    } catch (err) {
      console.error('❌ Errore salvataggio abbonamento', err);
    }
  }

  res.status(200).send('Webhook ricevuto');
});

// Rotte ADMIN
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

// Avvio
app.listen(PORT, () => {
  console.log(`🚀 Server attivo su http://localhost:${PORT}`);
});
