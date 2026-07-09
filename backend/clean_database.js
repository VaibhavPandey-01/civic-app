const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found in backend directory!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const mongoUriLine = envContent.split('\n').find(line => line.trim().startsWith('MONGO_URI='));

if (!mongoUriLine) {
  console.error('MONGO_URI not found in backend/.env!');
  process.exit(1);
}

const mongoUri = mongoUriLine.split('MONGO_URI=')[1].trim().replace(/['"]/g, '');

console.log('Connecting to MongoDB Atlas...');
mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected successfully!');
    const collections = mongoose.connection.collections;
    
    for (const name in collections) {
      await collections[name].deleteMany({});
      console.log(`Cleared all documents in collection: ${name}`);
    }
    
    console.log('Database database cleaned successfully! All old reports and users deleted.');
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
