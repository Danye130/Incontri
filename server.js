// ==================== AGGIUNTA/AGGIORNAMENTO server.js ====================

// Modello messaggi aggiornato
const MessageSchema = new mongoose.Schema({
  sender: String,    // Email del mittente
  receiver: String,  // Email del destinatario
  text: String,
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }  // <-- AGGIUNTO per sapere se è stato letto
});
const Message = mongoose.model('Message', MessageSchema);

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

// Controlla quanti messaggi non letti (NUOVA ROTTA)
app.get('/unread-messages', async (req, res) => {
  const { receiver } = req.query;
  const unreadCount = await Message.countDocuments({ receiver, read: false });
  res.json({ count: unreadCount });
});

// Marca i messaggi come letti (NUOVA ROTTA)
app.post('/mark-messages-read', async (req, res) => {
  const { sender, receiver } = req.body;
  await Message.updateMany({ sender, receiver, read: false }, { read: true });
  res.sendStatus(200);
});
