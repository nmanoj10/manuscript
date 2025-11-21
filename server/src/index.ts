import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import { authMiddleware, errorHandler } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import manuscriptRoutes from './routes/manuscripts.js';
import uploadRoutes from './routes/uploads.js';
import { isVisionConfigured } from './utils/vision.js';

// Load .env from parent directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:9002',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth middleware
app.use(authMiddleware);

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/manuscripts', manuscriptRoutes);
app.use('/api/uploads', uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const visionReady = isVisionConfigured();
    console.log(`Vision OCR configured: ${visionReady}`);
    console.log(`Gemini configured: ${!!process.env.GEMINI_API_KEY}`);

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
