const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
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

// Schemi
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  description: String,
  photo: String,
  isVIP: { type: Boolean, default: false },
  likes: [String]
});

const MessageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);

// Multer + Sharp per foto profilo
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
app.post('/signup', upload.single('photo'), async (req, res) => {
  try {
    const { email, password, description } = req.body;
    let photoPath = '';

    if (req.file) {
      const filename = Date.now() + '-' + req.file.originalname;
      const outputPath = `public/uploads/${filename}`;
      await sharp(req.file.buffer)
        .resize(300, 300)
        .jpeg({ quality: 80 })
        .toFile(outputPath);
      photoPath = '/uploads/' + filename;
    }

    const newUser = new User({ email, password, description, photo: photoPath });
    await newUser.save();
    res.redirect(`/profile.html?email=${email}`);
  } catch (err) {
    console.error('Errore registrazione:', err);
    res.status(500).send('Errore nella registrazione.');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    res.redirect(`/profile.html?email=${email}`);
  } else {
    res.send('Email o password sbagliata!');
  }
});

app.get('/profile-data', async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email });
  if (user) {
    res.json({
      email: user.email,
      description: user.description,
      photo: user.photo,
      isVIP: user.isVIP
    });
  } else {
    res.status(404).send('Utente non trovato');
  }
});

app.get('/list-users', async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

app.post('/send-message', async (req, res) => {
  const { sender, receiver, text } = req.body;
  const newMessage = new Message({ sender, receiver, text });
  await newMessage.save();
  res.sendStatus(200);
});

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

app.get('/check-new-messages', async (req, res) => {
  const { email } = req.query;
  const newMessages = await Message.countDocuments({ receiver: email });
  res.json({ newMessages });
});

app.post('/like', async (req, res) => {
  const { sender, receiver } = req.body;
  const user = await User.findOne({ email: sender });
  if (user && !user.likes.includes(receiver)) {
    user.likes.push(receiver);
    await user.save();
    res.send('Like inviato!');
  } else {
    res.send('Hai già messo Mi Piace a questo utente.');
  }
});

// Home Page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Avvio Server
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
