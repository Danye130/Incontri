const mongoose = require('mongoose');

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
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isFeatured: { type: Boolean, default: false } // 👑 profilo in evidenza
});

module.exports = mongoose.model('User', UserSchema);
