// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect('mongodb+srv://IncontriUser:Calipso1!@cluster0.myejdyz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connesso ✅'))
.catch((err) => console.log('Errore MongoDB ❌', err));

// Modello Utente
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  description: String,
  photo: String,
  likes: [String],
  matches: [String]
});

const User = mongoose.model('User', UserSchema);

// Modello Messaggio
const MessageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

// Multer per upload foto profilo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Registrazione Utente
app.post('/signup', upload.single('photo'), async (req, res) => {
  const { email, password, description } = req.body;
  let photoPath = '';

  if (req.file) {
    photoPath = '/uploads/' + req.file.filename;
  }

  const newUser = new User({ email, password, description, photo: photoPath });
  await newUser.save();
  res.redirect(`/profile.html?email=${email}`);
});

// Login Utente
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (user) {
    res.redirect(`/profile.html?email=${email}`);
  } else {
    res.send('Email o password sbagliata. Riprova!');
  }
});

// Ottenere dati profilo
app.get('/profile-data', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send('Email mancante');
  }

  const user = await User.findOne({ email });
  if (user) {
    res.json({
      email: user.email,
      description: user.description,
      photo: user.photo,
      likes: user.likes,
      matches: user.matches
    });
  } else {
    res.status(404).send('Utente non trovato');
  }
});

// Lista di tutti gli utenti
app.get('/list-users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// "Mi Piace" ad un utente
app.post('/like-user', async (req, res) => {
  const { fromEmail, toEmail } = req.body;

  const fromUser = await User.findOne({ email: fromEmail });
  const toUser = await User.findOne({ email: toEmail });

  if (!fromUser || !toUser) {
    return res.status(404).send('Utente non trovato');
  }

  if (!fromUser.likes.includes(toEmail)) {
    fromUser.likes.push(toEmail);
    await fromUser.save();
  }

  if (toUser.likes.includes(fromEmail)) {
    // È un match!
    fromUser.matches.push(toEmail);
    toUser.matches.push(fromEmail);
    await fromUser.save();
    await toUser.save();
    res.json({ match: true });
  } else {
    res.json({ match: false });
  }
});

// Inviare un messaggio
app.post('/send-message', async (req, res) => {
  const { sender, receiver, text } = req.body;
  const newMessage = new Message({ sender, receiver, text });
  await newMessage.save();
  res.sendStatus(200);
});

// Ottenere i messaggi tra due utenti
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

// Home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Avvio server
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
