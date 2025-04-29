const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const sharp = require('sharp');
const stripe = require('stripe')('sk_test_1234567890abcdef'); // tua chiave di test Stripe
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect('mongodb+srv://IncontriUser:Calipso1!@cluster0.myejdyz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connesso ✅'))
.catch((err) => console.error('Errore MongoDB ❌', err));

// Schemi Mongoose

// User
const UserSchema = new mongoose.Schema({
  nickname: String,
  email: String,
  password: String,
  description: String,
  photo: String,
  isVIP: { type: Boolean, default: false },
  likes: [String]
});
const User = mongoose.model('User', UserSchema);

// Message
const MessageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});
const Message = mongoose.model('Message', MessageSchema);

// Multer Upload Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'public/uploads/';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, ''));
  }
});
const upload = multer({ storage: storage });

// Rotte

// Registrazione
app.post('/signup', upload.single('photo'), async (req, res) => {
  const { nickname, email, password, description } = req.body;
  let photoPath = '/images/default-profile.png';

  if (req.file) {
    const outputPath = 'public/uploads/resized-' + req.file.filename;
    await sharp(req.file.path).resize(300, 300).toFile(outputPath);
    fs.unlinkSync(req.file.path);
    photoPath = '/uploads/resized-' + req.file.filename;
  }

  const newUser = new User({ nickname, email, password, description, photo: photoPath });
  await newUser.save();
  res.redirect('/login.html');
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    res.redirect('/index.html');
  } else {
    res.send('Email o password errata.');
  }
});

// Dati profilo
app.get('/profile-data', async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email });

  if (user) {
    res.json({
      nickname: user.nickname,
      description: user.description,
      photo: user.photo,
      isVIP: user.isVIP
    });
  } else {
    res.status(404).send('Utente non trovato');
  }
});

// Lista utenti
app.get('/list-users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Invia messaggio
app.post('/send-message', async (req, res) => {
  const { sender, receiver, text } = req.body;
  const newMessage = new Message({ sender, receiver, text, read: false });
  await newMessage.save();
  res.sendStatus(200);
});

// Ottieni messaggi
app.get('/get-messages', async (req, res) => {
  const { sender, receiver } = req.query;
  const messages = await Message.find({
    $or: [
      { sender, receiver },
      { sender: receiver, receiver: sender }
    ]
  }).sort('timestamp');
  res.json(messages);
});

// Messaggi non letti
app.get('/unread-messages', async (req, res) => {
  const { receiver } = req.query;
  const unreadCount = await Message.countDocuments({ receiver, read: false });
  res.json({ count: unreadCount });
});

// Marca messaggi come letti
app.post('/mark-messages-read', async (req, res) => {
  const { sender, receiver } = req.body;
  await Message.updateMany({ sender, receiver, read: false }, { read: true });
  res.sendStatus(200);
});

// Invia Like
app.post('/like', async (req, res) => {
  const { sender, receiver } = req.body;
  const user = await User.findOne({ nickname: receiver });
  if (user) {
    if (!user.likes.includes(sender)) {
      user.likes.push(sender);
      await user.save();
    }
    res.send('Like inviato!');
  } else {
    res.status(404).send('Utente non trovato');
  }
});

// Update Profilo
app.post('/update-profile', upload.single('photo'), async (req, res) => {
  const { email, nickname, description, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    user.nickname = nickname;
    user.description = description;
    user.password = password;

    if (req.file) {
      const outputPath = 'public/uploads/resized-' + req.file.filename;
      await sharp(req.file.path).resize(300, 300).toFile(outputPath);
      fs.unlinkSync(req.file.path);
      user.photo = '/uploads/resized-' + req.file.filename;
    }

    await user.save();
    res.redirect('/profile.html');
  } else {
    res.status(404).send('Utente non trovato');
  }
});

// Stripe Checkout session
app.post('/create-checkout-session', async (req, res) => {
  const { priceId } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Piano VIP Incontri'
        },
        unit_amount: priceId === 'price_1_month' ? 999 : 4999,
      },
      quantity: 1
    }],
    mode: 'payment',
    success_url: 'https://incontri-backend.onrender.com/index.html?success=true',
    cancel_url: 'https://incontri-backend.onrender.com/index.html?canceled=true'
  });

  res.json({ id: session.id });
});

// Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
