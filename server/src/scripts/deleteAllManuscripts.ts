import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/database.js';
import { Manuscript } from '../models/Manuscript.js';

// Load environment from repository root .env.local (same as server index.ts)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

async function main() {
  // Safety: require explicit env var to run
  if (process.env.FORCE_DELETE_MANUSCRIPTS !== 'true') {
    console.error('Refusing to run. Set FORCE_DELETE_MANUSCRIPTS=true in environment to confirm.');
    process.exit(1);
  }

  try {
    await connectDB();

    const result = await Manuscript.deleteMany({});
    console.log(`Deleted ${result.deletedCount ?? 0} manuscript(s).`);

    process.exit(0);
  } catch (err) {
    console.error('Failed to delete manuscripts:', err);
    process.exit(2);
  }
}

main();
