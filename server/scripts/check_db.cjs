const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const uri = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/saraswathi';

(async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB:', uri);

    const db = mongoose.connection.db;
    const manuscriptsCount = await db.collection('manuscripts').countDocuments().catch(() => 0);
    const uploadsCount = await db.collection('uploads').countDocuments().catch(() => 0);
    console.log('manuscripts:', manuscriptsCount);
    console.log('uploads:', uploadsCount);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('DB check error:', err.message || err);
    process.exit(1);
  }
})();
