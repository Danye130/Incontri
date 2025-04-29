const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();

// Percorso statico
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://IncontriUser:Calipso1!@cluster0.myejdyz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connesso ✅'))
.catch((err) => console.error('Errore MongoDB ❌', err));

// Modello utente
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

// Modello messaggi
const MessageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

// Multer storage per upload foto
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

// Route Registrazione
app.post('/signup', upload.single('photo'), async (req, res) => {
  const { nickname, email, password, description } = req.body;
  let photoPath = '/images/default-profile.png';

  if (req.file) {
    const outputPath = 'public/uploads/' + 'resized-' + req.file.filename;

    await sharp(req.file.path)
      .resize(300, 300)
      .toFile(outputPath);

    fs.unlinkSync(req.file.path);

    photoPath = '/uploads/resized-' + req.file.filename;
  }

  const newUser = new User({ nickname, email, password, description, photo: photoPath });
  await newUser.save();
  res.redirect('/login.html');
});

// Route Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    res.redirect('/index.html');
  } else {
    res.send('Email o password errata.');
  }
});

// Get profile data
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

// Get nickname
app.get('/get-nickname', async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email });

  if (user) {
    res.json({ nickname: user.nickname });
  } else {
    res.status(404).send('Nickname non trovato');
  }
});

// Lista utenti
app.get('/list-users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Invia un messaggio
app.post('/send-message', async (req, res) => {
  const { sender, receiver, text } = req.body;
  const newMessage = new Message({ sender, receiver, text });
  await newMessage.save();
  res.sendStatus(200);
});

// Ottieni i messaggi
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

// Mi Piace
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

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Avvio server
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
