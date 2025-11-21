# Saraswathi - Digital Manuscript Repository

A modern, full-stack web application for discovering, preserving, and sharing ancient manuscripts with AI-powered categorization, summarization, and intelligent search capabilities.

## 🎯 Features

### Frontend (Next.js)
- ✅ Beautiful, responsive manuscript gallery
- ✅ Advanced search and filtering (category, language, text search)
- ✅ Manuscript detail pages with rich information
- ✅ Admin upload interface for new manuscripts
- ✅ Real-time processing status tracking
- ✅ Modern UI with Tailwind CSS and Radix UI components

### Backend (Node.js/Express)
- ✅ RESTful API for manuscript management
- ✅ Secure file uploads with ImageKit integration
- ✅ **AI-powered features with Gemini:**
  - Automatic manuscript categorization
  - Intelligent summarization
  - Image hint generation for visual search
- ✅ MongoDB data persistence
- ✅ Role-based access control (Admin, User, Contributor)
- ✅ CORS and security middleware
- ✅ Comprehensive error handling

## 📁 Project Structure

```
saraswathi/
├── saraswathi/                 # Frontend (Next.js + React)
│   ├── src/
│   │   ├── app/               # Next.js app router
│   │   ├── components/        # Reusable React components
│   │   ├── lib/               # Utilities and API client
│   │   ├── hooks/             # Custom React hooks
│   │   └── context/           # React context providers
│   ├── public/                # Static assets
│   ├── package.json
│   └── tsconfig.json
│
└── server/                     # Backend (Express.js)
    ├── src/
    │   ├── config/            # Database configuration
    │   ├── models/            # MongoDB schemas
    │   ├── routes/            # API route definitions
    │   ├── controllers/       # Business logic handlers
    │   ├── middleware/        # Auth, uploads, error handling
    │   ├── utils/             # Gemini AI, ImageKit utilities
    │   └── index.ts           # Express server entry point
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    └── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- MongoDB (local or Atlas cloud)
- Google Gemini API key
- ImageKit account

### 1. One-Command Setup (Windows)

**Run PowerShell script:**
```powershell
.\quickstart.ps1
```

**Or batch script:**
```cmd
quickstart.bat
```

### 2. Manual Setup

#### Backend
```bash
cd server
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

#### Frontend
```bash
cd saraswathi
npm install
npm run dev
```

## ⚙️ Configuration

### Backend Environment Variables (`server/.env.local`)

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:9002

# Database
MONGODB_URI=mongodb://localhost:27017/saraswathi
# OR MongoDB Atlas:
MONGODB_ATLAS_URI=mongodb+srv://user:password@cluster.mongodb.net/saraswathi

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# JWT (Optional)
JWT_SECRET=your_jwt_secret
```

### Frontend Environment Variables (`saraswathi/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🌐 API Endpoints

### Manuscripts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/manuscripts` | List manuscripts (paginated, filterable) |
| GET | `/api/manuscripts/categories` | Get all categories |
| GET | `/api/manuscripts/languages` | Get all languages |
| GET | `/api/manuscripts/:id` | Get manuscript details |
| POST | `/api/manuscripts` | Create manuscript (admin) |
| PUT | `/api/manuscripts/:id` | Update manuscript (admin) |
| DELETE | `/api/manuscripts/:id` | Delete manuscript (admin) |

### Uploads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/uploads` | Upload manuscript with file |
| GET | `/api/uploads/status/:uploadId` | Check upload status |
| GET | `/api/uploads/user/uploads` | Get user's upload history |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## 🔑 Getting API Keys

### Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy and paste into `server/.env.local`

### ImageKit
1. Sign up at [ImageKit.io](https://imagekit.io/)
2. Create a free account
3. Go to Settings > API Keys
4. Copy Public Key, Private Key, and URL Endpoint
5. Add to `server/.env.local`

### MongoDB
**Local Option:**
```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb
```

**Cloud Option (MongoDB Atlas):**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Use as `MONGODB_ATLAS_URI` in `.env.local`

## 🏃 Running the Application

**Open 2 terminals:**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd saraswathi
npm run dev
# Frontend runs on http://localhost:9002
```

## 📦 Available Scripts

### Backend
```bash
npm run dev        # Start development server with hot reload
npm run build      # Build TypeScript
npm start          # Run production build
npm run lint       # Run ESLint
npm run typecheck  # Check TypeScript types
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Run production server
npm run lint       # Run ESLint
npm run typecheck  # Check TypeScript types
```

## 🗄️ Database Schemas

### Manuscript
```javascript
{
  _id: ObjectId,
  title: String,
  author: String,
  description: String,
  category: String,
  origin: String,
  language: String,
  imageUrl: String,
  imageHint: String,
  fileUrl: String,
  summary: String,
  tags: [String],
  status: 'draft' | 'published' | 'archived',
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### User
```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  role: 'user' | 'admin' | 'contributor',
  createdAt: Date,
  updatedAt: Date
}
```

### Upload
```javascript
{
  _id: ObjectId,
  fileName: String,
  originalName: String,
  mimeType: String,
  size: Number,
  uploadedBy: String,
  imageUrl: String,
  fileUrl: String,
  status: 'processing' | 'completed' | 'failed',
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication

Currently uses simple header-based authentication. Pass via headers:
```javascript
// Browser
fetch(url, {
  headers: {
    'X-User-Email': 'user@example.com',
    'X-User-Role': 'admin'  // 'user' | 'admin' | 'contributor'
  }
})

// Store in localStorage for frontend
localStorage.setItem('userEmail', 'user@example.com');
localStorage.setItem('userRole', 'admin');
```

**For production, implement JWT authentication.**

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service or check MONGODB_URI

### CORS Errors
**Solution:** Ensure `FRONTEND_URL` matches your frontend URL in `server/.env.local`

### API Not Responding
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Image Upload Fails
- Verify ImageKit credentials are correct
- Check ImageKit account is active
- Ensure URL endpoint is properly formatted

## 📚 Documentation

- **Frontend:** See `saraswathi/README.md`
- **Backend:** See `server/README.md`
- **Complete Setup Guide:** See `SETUP_GUIDE.md`

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd saraswathi
vercel deploy
```

### Backend (Heroku, Railway, or VPS)
```bash
cd server
# Configure your hosting platform
npm run build
npm start
```

## 🔮 Future Enhancements

- [ ] JWT authentication system
- [ ] User profiles and upload history
- [ ] Full-text search with Elasticsearch
- [ ] User reviews and ratings
- [ ] Related manuscripts recommendations
- [ ] PDF viewer
- [ ] Download functionality
- [ ] Admin analytics dashboard
- [ ] Real-time notifications
- [ ] Social sharing features
- [ ] Mobile app (React Native)

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

- Check documentation in README files
- Review API endpoints and error messages
- Check browser console for client-side errors
- Check server logs for backend errors

## 📖 Technologies Used

### Frontend
- **Next.js 15** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Lucide React** - Icons

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Google Generative AI** - Gemini API
- **ImageKit** - Image management
- **Multer** - File uploads

---

**Created with ❤️ for manuscript preservation and digital heritage**
#   T h e - C o d e r s  
 