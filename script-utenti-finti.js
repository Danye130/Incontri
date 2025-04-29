const mongoose = require('mongoose');
const faker = require('faker');

mongoose.connect('mongodb+srv://IncontriUser:Calipso1!@cluster0.myejdyz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connesso ✅'))
.catch((err) => console.error('Errore MongoDB ❌', err));

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  description: String,
  photo: String,
  isVIP: { type: Boolean, default: false },
  likes: [String]
});

const User = mongoose.model('User', UserSchema);

async function createFakeUsers() {
  await User.deleteMany({});
  for (let i = 0; i < 10; i++) {
    const fakeUser = new User({
      email: faker.internet.email(),
      password: faker.internet.password(),
      description: faker.lorem.sentence(),
      photo: '/images/default-profile.png',
      isVIP: faker.datatype.boolean()
    });
    await fakeUser.save();
  }
  console.log('Utenti finti creati con successo ✅');
  mongoose.connection.close();
}

createFakeUsers();
