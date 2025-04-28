// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(express.static(__dirname)); // Serve file statici tipo index.html, signup.html, ecc.

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
.catch((err) => console.log('Errore MongoDB ❌', err));

// Modello utente
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  description: String,
  photo: String
});

const User = mongoose.model('User', UserSchema);

// Modello messaggio
const MessageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

// Route Registrazione
app.post('/signup', async (req, res) => {
  const { email, password, description, photo } = req.body;
  const newUser = new User({ email, password, description, photo });
  await newUser.save();
  res.redirect(`/profile.html?email=${email}`);
});

// Route Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    res.redirect(`/profile.html?email=${email}`);
  } else {
    res.send('Email o password sbagliata. Riprova!');
  }
});

// Rotta per ottenere i dati dell'utente
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
      photo: user.photo
    });
  } else {
    res.status(404).send('Utente non trovato');
  }
});

// Rotta per inviare un messaggio
app.post('/send-message', async (req, res) => {
  const { sender, receiver, text } = req.body;
  const newMessage = new Message({ sender, receiver, text });
  await newMessage.save();
  res.sendStatus(200);
});

// Rotta per ottenere i messaggi di una conversazione
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

// NUOVA Rotta per ottenere la lista utenti
app.get('/list-users', async (req, res) => {
  const { exclude } = req.query;
  let query = {};
  if (exclude) {
    query.email = { $ne: exclude }; // exclude = "not equal"
  }
  const users = await User.find(query, 'email description');
  res.json(users);
});

// Rotta di prova (opzionale per la home)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Avvio server
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
