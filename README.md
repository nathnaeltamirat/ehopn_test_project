# EHopN - Invoice Management System

A full-stack invoice management application built with Next.js 14 (frontend) and Express.js (backend), featuring user authentication, invoice upload/management, OCR processing, and subscription handling with Chapa payment integration.

## 🚀 Live Demo

- **Frontend**: [https://ehopn-test-project.vercel.app](https://ehopn-test-project.vercel.app)
- **Backend API**: [https://ehopn-test-project.onrender.com](https://ehopn-test-project.onrender.com)

## 🎯 Features

### Frontend (Next.js 14)
- **Modern UI**: Built with TailwindCSS and responsive design
- **Internationalization**: Support for English, German, and Arabic (RTL)
- **Authentication**: Login/Register with JWT tokens and Google OAuth
- **Invoice Management**: Drag-and-drop file upload, OCR processing, CRUD operations
- **Dashboard**: Overview of invoices, subscription status, and user data
- **Settings**: Language preferences, subscription management, profile settings
- **Real-time Updates**: Live data synchronization with backend

### Backend (Express.js)
- **RESTful API**: Complete API endpoints for all frontend functionality
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Google OAuth**: Social login integration
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer for handling invoice file uploads
- **OCR Processing**: Tesseract.js for text extraction from images
- **AI Integration**: Google Generative AI for invoice data extraction
- **Payment Processing**: Chapa payment gateway integration
- **Email Service**: Nodemailer for welcome and password reset emails
- **Security**: Helmet, rate limiting, CORS, input validation

## 📁 Project Structure

```
ehopn_test_project/
├── frontend/                 # Next.js 14 application
│   ├── app/                 # App Router pages
│   │   ├── login/          # Authentication pages
│   │   ├── register/
│   │   ├── dashboard/      # Main dashboard
│   │   ├── invoices/       # Invoice management
│   │   └── settings/       # User settings
│   ├── components/         # Reusable components
│   ├── lib/               # API client and utilities
│   └── public/            # Static assets
└── backend/                # Express.js API server
    ├── src/
    │   ├── controllers/   # Route handlers
    │   ├── models/        # Mongoose schemas
    │   ├── routes/        # API routes
    │   ├── middleware/    # Auth, validation, etc.
    │   ├── config/        # Database and passport config
    │   └── utils/         # Email service and utilities
    ├── uploads/           # File upload directory
    └── server.js          # Main server file
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **react-i18next** for internationalization
- **react-dropzone** for file uploads

### Backend
- **Express.js** with JavaScript
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Passport.js** for Google OAuth
- **bcryptjs** for password hashing
- **Multer** for file uploads
- **Tesseract.js** for OCR processing
- **Google Generative AI** for AI-powered data extraction
- **Chapa** for payment processing
- **Nodemailer** for email services
- **Helmet** for security headers
- **express-rate-limit** for rate limiting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB instance (local or Atlas)
- Google Cloud Console account (for OAuth)
- Chapa account (for payments)
- Google AI API key (for AI features)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # URLs
   BACKEND_URL=https://ehopn-test-project.onrender.com
   FRONTEND_URL=https://ehopn-test-project.vercel.app
   
   # Database Configuration
   MONGODB_URI=your_mongodb_connection_string_here
   
   # JWT Authentication
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   
   # Chapa Payment Gateway
   CHAPA_SECRET_KEY=your_chapa_secret_key_here
   CHAPA_PUBLIC_KEY=your_chapa_public_key_here
   CHAPA_ENCRYPTION_KEY=your_chapa_encryption_key_here
   
   # Google AI (Gemini)
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Email Configuration (Optional)
   EMAIL_USER=your_email_here@gmail.com
   EMAIL_PASSWORD=your_email_app_password_here
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   echo "NEXT_PUBLIC_API_URL=https://ehopn-test-project.onrender.com/api" > .env.local
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `GET /google` - Google OAuth login
- `GET /google/callback` - Google OAuth callback

### Invoices (`/api/invoices`)
- `GET /` - Get user's invoices
- `POST /` - Create new invoice
- `POST /upload` - Upload invoice file with OCR
- `PUT /:id` - Update invoice
- `DELETE /:id` - Delete invoice

### Subscriptions (`/api/subscription`)
- `GET /plans` - Get available subscription plans
- `GET /me` - Get current subscription
- `POST /create` - Create new subscription with Chapa
- `POST /verify` - Verify Chapa payment
- `POST /cancel` - Cancel subscription
- `POST /webhook` - Chapa webhook handler

### User (`/api/user`)
- `PUT /language` - Update user language preference
- `PUT /profile` - Update user profile

## 🔐 Authentication

The application uses JWT tokens for authentication:

1. **Login/Register**: Returns JWT token
2. **Google OAuth**: Automatic login with Google account
3. **Protected Routes**: Require `Authorization: Bearer <token>` header
4. **Token Storage**: Frontend stores tokens in localStorage
5. **Auto-refresh**: Tokens are automatically included in API requests

## 💳 Subscription Plans

- **Free**: 5 invoices per month, basic OCR, email support
- **Pro**: Unlimited invoices, advanced OCR, priority support (1,500 ETB/month)
- **Business**: All Pro features + API access, dedicated support (5,000 ETB/month)

## 🌐 Internationalization

Supports three languages:
- **English** (en) - Left-to-right
- **German** (de) - Left-to-right  
- **Arabic** (ar) - Right-to-left

Language changes are:
1. Applied immediately in the UI
2. Saved to the backend
3. Persisted across sessions

## 📁 File Upload & OCR

Invoice files can be uploaded via:
- **Drag & Drop**: Using react-dropzone
- **File Selection**: Click to browse
- **Supported Formats**: PDF, PNG, JPG, JPEG, XLSX, XLS

Processing workflow:
1. File is uploaded to backend
2. OCR processing extracts text using Tesseract.js
3. AI processing enhances data extraction using Google Generative AI
4. User can edit extracted data
5. Invoice is saved to database

## 🚀 Deployment

### Backend Deployment (Render)

1. **Connect your GitHub repository to Render**
2. **Set environment variables in Render dashboard:**
   ```
   BACKEND_URL=https://ehopn-test-project.onrender.com
   FRONTEND_URL=https://ehopn-test-project.vercel.app
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CHAPA_SECRET_KEY=your_chapa_secret_key
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   EMAIL_USER=your_gmail_address (optional)
   EMAIL_PASSWORD=your_gmail_app_password (optional)
   ```
3. **Deploy automatically on push to main branch**

### Frontend Deployment (Vercel)

1. **Connect your GitHub repository to Vercel**
2. **Set environment variable:**
   ```
   NEXT_PUBLIC_API_URL=https://ehopn-test-project.onrender.com/api
   ```
3. **Deploy automatically on push to main branch**

### Google OAuth Setup

1. **Create OAuth 2.0 credentials in Google Cloud Console**
2. **Add authorized redirect URI:**
   ```
   https://ehopn-test-project.onrender.com/api/auth/google/callback
   ```
3. **Update environment variables with your credentials**

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon
```

### Frontend Development
```bash
cd frontend
npm run dev  # Starts Next.js dev server
```

### Database Management
- MongoDB connection is handled automatically
- Models include validation and middleware
- Indexes are created for performance

## 🛡️ Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure authentication
- **Google OAuth**: Secure social login
- **Input Validation**: express-validator middleware
- **Rate Limiting**: Prevents abuse
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Environment Variables**: Sensitive data protection

## 📊 Database Models

### User
```javascript
{
  name: string,
  email: string (unique),
  passwordHash: string,
  language: 'en' | 'de' | 'ar',
  role: 'user' | 'admin',
  subscriptionPlan: 'Free' | 'Pro' | 'Business',
  googleId: string (optional),
  resetToken: string (optional),
  resetTokenExpires: Date (optional)
}
```

### Invoice
```javascript
{
  userId: ObjectId,
  vendor: string,
  date: string,
  amount: string,
  taxId: string,
  fileUrl: string,
  extractedData: object (optional)
}
```

### Subscription
```javascript
{
  userId: ObjectId,
  plan: 'Free' | 'Pro' | 'Business',
  status: 'active' | 'pending' | 'canceled',
  renewDate: Date,
  chapaTxRef: string (optional)
}
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection string
- Verify all environment variables are set
- Check if port 5000 is available

**Frontend can't connect to backend:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check if backend is running on the correct port
- Ensure CORS is configured properly

**Authentication issues:**
- Check JWT_SECRET is set
- Verify token is being sent in Authorization header
- Check token expiration
- Ensure Google OAuth redirect URI is correct

**Google OAuth redirect_uri_mismatch:**
- Add `https://ehopn-test-project.onrender.com/api/auth/google/callback` to Google Cloud Console
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct

**File upload fails:**
- Verify uploads directory exists
- Check file size limits (10MB)
- Ensure proper MIME type validation

**Payment issues:**
- Verify Chapa credentials are set correctly
- Check webhook URL configuration
- Ensure proper currency settings (ETB)

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Recent Updates

- **Backend**: Converted from TypeScript to JavaScript for better deployment compatibility
- **Authentication**: Added Google OAuth integration
- **Payments**: Integrated Chapa payment gateway
- **OCR**: Added Tesseract.js and Google AI integration
- **Email**: Added Nodemailer for welcome and password reset emails
- **Deployment**: Configured for Render (backend) and Vercel (frontend)
- **Security**: Fixed CORS and localhost references for production

