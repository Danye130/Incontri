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

// Lista corretta delle foto disponibili
const photos = [
  '/images/donna1.jpg',
  '/images/donna2.jpg',
  '/images/donna3.jpg',
  '/images/donna4.jpg',
  '/images/donna5.jpg',
  '/images/donna6.jpg'
];

async function createFakeUsers() {
  await User.deleteMany({}); // Cancella tutti gli utenti esistenti

  for (let i = 0; i < 10; i++) {
    const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
    const fakeUser = new User({
      nickname: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      description: faker.lorem.sentence(),
      photo: randomPhoto,
      isVIP: faker.datatype.boolean()
    });
    await fakeUser.save();
  }
  console.log('Utenti finti creati con successo ✅');
  mongoose.connection.close();
}

createFakeUsers();
