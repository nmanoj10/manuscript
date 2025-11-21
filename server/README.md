# Saraswathi Backend Server

Complete REST API backend for the Saraswathi manuscript repository application.

## Features

- **Manuscript Management**: CRUD operations for manuscript collection
- **Image Uploads**: Secure image uploads with ImageKit integration
- **AI Integration**: 
  - Gemini API for automatic manuscript categorization
  - AI-powered summaries and metadata generation
- **MongoDB**: Persistent data storage
- **Authentication**: Role-based access control (Admin, User, Contributor)
- **Search & Filtering**: Advanced search, category and language filtering

## Project Structure

```
server/
├── src/
│   ├── config/         # Database configuration
│   ├── models/         # MongoDB schemas (Manuscript, User, Upload)
│   ├── routes/         # API route handlers
│   ├── controllers/     # Business logic
│   ├── middleware/     # Auth, error handling, file upload
│   ├── utils/          # Gemini AI and ImageKit utilities
│   └── index.ts        # Main server entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

**Required Variables:**
- `MONGODB_URI` or `MONGODB_ATLAS_URI` - MongoDB connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `IMAGEKIT_PUBLIC_KEY` - ImageKit public key
- `IMAGEKIT_PRIVATE_KEY` - ImageKit private key
- `IMAGEKIT_URL_ENDPOINT` - ImageKit URL endpoint
- `FRONTEND_URL` - Frontend URL for CORS

### 3. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas Cloud**
Use connection string in `MONGODB_ATLAS_URI`

### 4. API Keys Setup

**Gemini API:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key
3. Add to `.env.local`

**ImageKit:**
1. Sign up at [ImageKit.io](https://imagekit.io/)
2. Get credentials from dashboard
3. Add to `.env.local`

## Running

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production
```bash
npm start
```

## API Endpoints

### Manuscripts
- `GET /api/manuscripts` - Get all manuscripts (with pagination, filtering)
- `GET /api/manuscripts/categories` - Get all categories
- `GET /api/manuscripts/languages` - Get all languages
- `GET /api/manuscripts/:id` - Get manuscript by ID
- `POST /api/manuscripts` - Create manuscript (admin only)
- `PUT /api/manuscripts/:id` - Update manuscript (admin only)
- `DELETE /api/manuscripts/:id` - Delete manuscript (admin only)

### Uploads
- `POST /api/uploads` - Upload manuscript with file
- `GET /api/uploads/status/:uploadId` - Get upload processing status
- `GET /api/uploads/user/uploads` - Get user's uploads

## Authentication

Pass user info via headers:
```
X-User-Email: user@example.com
X-User-Role: admin|user|contributor
```

## Database Schemas

### Manuscript
- title, author, description
- category, origin, language
- imageUrl, imageHint, fileUrl
- summary, tags, status
- views count

### User
- email, name, role
- timestamps

### Upload
- fileName, originalName, mimeType, size
- imageUrl, fileUrl
- status (processing, completed, failed)
- timestamps

## Technologies

- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **TypeScript** - Type safety
- **Google Generative AI** - Gemini API
- **ImageKit** - Image management
- **Multer** - File upload handling
- **CORS** - Cross-origin requests
