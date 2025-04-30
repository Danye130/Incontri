const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

mongoose.connect('mongodb+srv://IncontriUser:Calipso1!@cluster0.myejdyz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connesso ✅'))
.catch((err) => console.error('Errore MongoDB ❌', err));

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

// Foto profilo disponibili
const photos = [
  '/images/donna1.jpg',
  '/images/donna2.jpg',
  '/images/donna3.jpg',
  '/images/donna4.jpg',
  '/images/donna5.jpg',
  '/images/donna6.jpg'
];

async function createFakeUsers() {
  await User.deleteMany(); // Cancella eventuali utenti precedenti

  for (let i = 1; i <= 15; i++) {
    const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
    const nickname = faker.internet.userName().toLowerCase().replace(/[^a-z0-9]/g, '');
    const fakeUser = new User({
      nickname: nickname,
      email: `${nickname}@test.com`,
      password: 'test1234',
      description: faker.lorem.sentence(),
      photo: randomPhoto,
      isVIP: faker.datatype.boolean(),
      likes: []
    });
    await fakeUser.save();
  }

  console.log('✅ 15 utenti finti creati con successo!');
  mongoose.connection.close();
}

createFakeUsers();
