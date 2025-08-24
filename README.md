# Invoice Management System

A full-stack invoice management application built with Next.js 14 (frontend) and Express.js (backend), featuring user authentication, invoice upload/management, and subscription handling.

## 🚀 Features

### Frontend (Next.js 14)
- **Modern UI**: Built with TailwindCSS and responsive design
- **Internationalization**: Support for English, German, and Arabic (RTL)
- **Authentication**: Login/Register with JWT tokens
- **Invoice Management**: Drag-and-drop file upload, OCR simulation, CRUD operations
- **Dashboard**: Overview of invoices, subscription status, and user data
- **Settings**: Language preferences, subscription management, profile settings

### Backend (Express.js)
- **RESTful API**: Complete API endpoints for all frontend functionality
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer for handling invoice file uploads
- **Stripe Integration**: Subscription management with Stripe
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
    │   ├── config/        # Database connection
    │   └── types/         # TypeScript interfaces
    └── server.ts          # Main server file
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **react-i18next** for internationalization
- **react-dropzone** for file uploads

### Backend
- **Express.js** with TypeScript
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads
- **Stripe** for payments
- **Helmet** for security headers
- **express-rate-limit** for rate limiting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB instance
- Stripe account (for payments)

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
   cp env.example .env
   ```

4. **Configure environment variables:**
```bash
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000   

# Database Configuration
MONGODB_URI=your_mongodb_connection_string_here

# Chapa Payment Gateway
CHAPA_PUBLIC_KEY=your_chapa_public_key_here
CHAPA_SECRET_KEY=your_chapa_secret_key_here
CHAPA_ENCRYPTION_KEY=your_chapa_encryption_key_here

# Gemini API (AI Integration)
GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Email (SMTP / App Password)
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
   echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Authentication (`/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout (placeholder)
- `GET /me` - Get current user

### Invoices (`/invoices`)
- `GET /` - Get user's invoices
- `POST /` - Create new invoice
- `POST /upload` - Upload invoice file with OCR
- `PUT /:id` - Update invoice
- `DELETE /:id` - Delete invoice

### Subscriptions (`/subscription`)
- `GET /me` - Get current subscription
- `POST /create` - Create new subscription
- `POST /cancel` - Cancel subscription
- `POST /webhook` - Stripe webhook handler

### User (`/user`)
- `PUT /language` - Update user language preference

## 🔐 Authentication

The application uses JWT tokens for authentication:

1. **Login/Register**: Returns JWT token
2. **Protected Routes**: Require `Authorization: Bearer <token>` header
3. **Token Storage**: Frontend stores tokens in localStorage
4. **Auto-refresh**: Tokens are automatically included in API requests

## 💳 Subscription Plans

- **Free**: Basic invoice uploads, email support
- **Pro**: Unlimited uploads, advanced OCR, priority support ($29.99/month)
- **Business**: All Pro features + API access, dedicated support ($99.99/month)

## 🌐 Internationalization

Supports three languages:
- **English** (en) - Left-to-right
- **German** (de) - Left-to-right  
- **Arabic** (ar) - Right-to-left

Language changes are:
1. Applied immediately in the UI
2. Saved to the backend
3. Persisted across sessions

## 📁 File Upload

Invoice files can be uploaded via:
- **Drag & Drop**: Using react-dropzone
- **File Selection**: Click to browse
- **Supported Formats**: PDF, PNG, JPG, JPEG, XLSX, XLS

Upload process:
1. File is sent to backend
2. OCR simulation extracts data
3. User can edit extracted data
4. Invoice is saved to database

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

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build TypeScript: `npm run build`
3. Start production server: `npm start`

### Frontend Deployment
1. Set `NEXT_PUBLIC_API_URL` to production backend URL
2. Build application: `npm run build`
3. Deploy to Vercel, Netlify, or other platforms

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
- **Input Validation**: express-validator middleware
- **Rate Limiting**: Prevents abuse
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Environment Variables**: Sensitive data protection

## 📊 Database Models

### User
```typescript
{
  name: string
  email: string (unique)
  passwordHash: string
  language: 'en' | 'de' | 'ar'
  role: 'user' | 'admin'
  subscriptionPlan: 'Free' | 'Pro' | 'Business'
}
```

### Invoice
```typescript
{
  userId: ObjectId
  vendor: string
  date: string
  amount: string
  taxId: string
  fileUrl: string
}
```

### Subscription
```typescript
{
  userId: ObjectId
  plan: 'Free' | 'Pro' | 'Business'
  status: 'active' | 'canceled'
  renewDate: Date
  stripeSubscriptionId?: string
}
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

**File upload fails:**
- Verify uploads directory exists
- Check file size limits
- Ensure proper MIME type validation

