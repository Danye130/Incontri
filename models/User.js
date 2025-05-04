const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  description: { type: String, default: '' },
  photo: { type: String, default: '/images/default-profile.jpg' },
  isVIP: { type: Boolean, default: false },
  isFake: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  likes: [{ type: String }]
});

module.exports = mongoose.model('User', UserSchema);
