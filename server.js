const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const sharp = require('sharp');
const stripe = require('stripe')('sk_test_1234567890abcdef'); // Sostituisci con chiave reale
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
})
.then(() => console.log('MongoDB Connesso ✅'))
.catch(err => console.error('Errore MongoDB ❌', err));

// Schemi
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

const MessageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});
const Message = mongoose.model('Message', MessageSchema);

// Multer Upload
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

// ROTTE

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

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    res.redirect('/index.html');
  } else {
    res.send('Email o password errata.');
  }
});

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

app.get('/list-users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/send-message', async (req, res) => {
  const { sender, receiver, text } = req.body;
  const newMessage = new Message({ sender, receiver, text, read: false });
  await newMessage.save();
  res.sendStatus(200);
});

app.get('/get-messages', async (req, res) => {
  const { sender, receiver } = req.query;

  const filter = sender && receiver
    ? {
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender }
        ]
      }
    : receiver
    ? { receiver }
    : {};

  const messages = await Message.find(filter).sort('timestamp');
  res.json(messages);
});

app.get('/unread-messages', async (req, res) => {
  const { receiver } = req.query;
  if (!receiver) return res.json({ count: 0 });

  const count = await Message.countDocuments({ receiver, read: false });
  res.json({ count });
});

app.post('/mark-messages-read', async (req, res) => {
  const { sender, receiver } = req.body;
  await Message.updateMany({ sender, receiver, read: false }, { read: true });
  res.sendStatus(200);
});

app.get('/message-senders', async (req, res) => {
  const { receiver } = req.query;
  if (!receiver) return res.status(400).send("Receiver mancante");

  const messages = await Message.find({ receiver });
  const uniqueSenders = [...new Set(messages.map(m => m.sender))];
  const users = await User.find({ email: { $in: uniqueSenders } });

  res.json(users);
});

app.post('/like', async (req, res) => {
  const { senderNickname, receiverEmail } = req.body;

  const user = await User.findOne({ email: receiverEmail });
  if (user) {
    if (!user.likes.includes(senderNickname)) {
      user.likes.push(senderNickname);
      await user.save();
    }
    res.send('Like inviato!');
  } else {
    res.status(404).send('Utente non trovato');
  }
});

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

app.post('/create-checkout-session', async (req, res) => {
  const { priceId } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: { name: 'Piano VIP Incontri' },
        unit_amount: priceId === 'price_1_month' ? 999 : 4999
      },
      quantity: 1
    }],
    mode: 'payment',
    success_url: 'https://incontri-backend.onrender.com/index.html?success=true',
    cancel_url: 'https://incontri-backend.onrender.com/index.html?canceled=true'
  });

  res.json({ id: session.id });
});

// ✅ Crea nuovo utente da dashboard
app.post('/create-user', async (req, res) => {
  const { nickname, email, password, photo, description, isVIP } = req.body;

  if (!nickname || !email || !password) {
    return res.status(400).send("Nickname, email e password sono obbligatori.");
  }

  try {
    const user = new User({
      nickname,
      email,
      password,
      description: description || '',
      photo: photo || '/images/default-profile.png',
      isVIP: isVIP || false
    });

    await user.save();
    res.status(201).json({ message: "Utente creato con successo", user });
  } catch (err) {
    console.error("Errore creazione utente:", err);
    res.status(500).send("Errore interno durante la creazione dell'utente.");
  }
});

// Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Avvio
app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
