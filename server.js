// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(express.static(__dirname)); // Serve file statici tipo index.html, signup.html, ecc.

const PORT = 3000;

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

// Route Registrazione
app.post('/signup', async (req, res) => {
  const { email, password, description, photo } = req.body;
  const newUser = new User({ email, password, description, photo });
  await newUser.save();
  res.redirect('/profile.html');
});

// Route Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    res.redirect('/profile.html');
  } else {
    res.send('Email o password sbagliata. Riprova!');
  }
});

// Rotta di prova (opzionale per il controllo della home)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Avvio server
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
