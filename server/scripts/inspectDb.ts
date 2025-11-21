import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

import { connectDB, disconnectDB } from '../src/config/database.js';
import { Manuscript } from '../src/models/Manuscript.js';
import { Upload } from '../src/models/Upload.js';

const run = async () => {
  try {
    await connectDB();

    console.log('\nRecent Manuscripts:');
    const manuscripts = await Manuscript.find().sort({ createdAt: -1 }).limit(10).lean();
    manuscripts.forEach((m: any) => {
      console.log(`- id:${m._id} title:${m.title || '<no-title>'} imageUrl:${m.imageUrl || '<no-image>'} createdAt:${m.createdAt}`);
    });

    console.log('\nRecent Uploads:');
    const uploads = await Upload.find().sort({ createdAt: -1 }).limit(10).lean();
    uploads.forEach((u: any) => {
      console.log(`- id:${u._id} originalName:${u.originalName} fileName:${u.fileName} imageUrl:${u.imageUrl || '<no-image>'} uploadedBy:${u.uploadedBy} status:${u.status}`);
    });

    await disconnectDB();
  } catch (err) {
    console.error('Inspect DB error:', err);
    process.exit(1);
  }
};

run();
