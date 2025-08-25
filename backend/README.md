# EHopN Backend

Express.js backend with JavaScript and MongoDB for the EHopN invoice management system.

## 🚀 Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Google OAuth**: Social login integration with Passport.js
- **Invoice Management**: CRUD operations for invoices with file upload support
- **OCR Processing**: Tesseract.js for text extraction from images
- **AI Integration**: Google Generative AI for enhanced data extraction
- **Subscription Management**: Chapa payment gateway integration
- **File Upload**: Support for PDF, images, and Excel files
- **Email Service**: Nodemailer for welcome and password reset emails
- **Security**: Helmet, CORS, rate limiting, and input validation
- **JavaScript**: Full JavaScript implementation for better deployment compatibility

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Google Cloud Console account (for OAuth)
- Chapa account (for payments)
- Google AI API key (for AI features)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # URLs
   BACKEND_URL=https://ehopn-test-project.onrender.com
   FRONTEND_URL=https://ehopn-test-project.vercel.app
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/ehopn_db
   
   # JWT Authentication
   JWT_SECRET=your_super_secret_jwt_key_here
   
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

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── passport.js          # Google OAuth configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── invoiceController.js # Invoice CRUD operations
│   │   ├── subscriptionController.js # Subscription management
│   │   └── userController.js    # User profile management
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   └── validation.js       # Input validation
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── Invoice.js          # Invoice model
│   │   └── Subscription.js     # Subscription model
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── invoices.js         # Invoice routes
│   │   ├── subscription.js     # Subscription routes
│   │   └── user.js             # User routes
│   └── utils/
│       └── emailService.js     # Email service with Nodemailer
├── uploads/                    # File upload directory
├── server.js                   # Main server file
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user info
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `GET /google` - Google OAuth login
- `GET /google/callback` - Google OAuth callback

### Invoices (`/api/invoices`)

- `GET /` - Get user's invoices
- `POST /` - Create new invoice
- `POST /upload` - Upload and process invoice file with OCR
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

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Google OAuth Flow

1. User clicks "Sign in with Google" on frontend
2. Frontend redirects to `/api/auth/google`
3. User authenticates with Google
4. Google redirects to `/api/auth/google/callback`
5. Backend creates/updates user and returns JWT token
6. Frontend receives token and logs user in

## 📊 Database Models

### User
```javascript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  passwordHash: string,
  language: 'en' | 'de' | 'ar',
  role: 'user' | 'admin',
  subscriptionPlan: 'Free' | 'Pro' | 'Business',
  googleId: string (optional),
  resetToken: string (optional),
  resetTokenExpires: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Invoice
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  vendor: string,
  date: string,
  amount: string,
  taxId: string,
  fileUrl: string,
  extractedData: object (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Subscription
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  plan: 'Free' | 'Pro' | 'Business',
  status: 'active' | 'pending' | 'canceled',
  renewDate: Date,
  chapaTxRef: string (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment | No (default: development) |
| `BACKEND_URL` | Backend URL for OAuth | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `CHAPA_SECRET_KEY` | Chapa secret key | Yes |
| `CHAPA_PUBLIC_KEY` | Chapa public key | Yes |
| `CHAPA_ENCRYPTION_KEY` | Chapa encryption key | Yes |
| `GEMINI_API_KEY` | Google AI API key | Yes |
| `EMAIL_USER` | Gmail address | No |
| `EMAIL_PASSWORD` | Gmail app password | No |

### MongoDB Setup

**Local MongoDB:**
```bash
# Install MongoDB locally
# Start MongoDB service
mongod

# Connect to database
MONGODB_URI=mongodb://localhost:27017/ehopn_db
```

**MongoDB Atlas:**
```bash
# Use Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ehopn_db?retryWrites=true&w=majority
```

### Google OAuth Setup

1. Create a project in Google Cloud Console
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `https://ehopn-test-project.onrender.com/api/auth/google/callback`
5. Update environment variables with credentials

### Chapa Payment Setup

1. Create a Chapa account
2. Get your API keys from the dashboard
3. Set up webhook endpoints
4. Update environment variables

## 🚀 Development

### Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm start        # Start production server
npm test         # Run tests
```

### File Upload

The backend supports file uploads for invoices:
- **Supported formats**: PDF, JPEG, PNG, Excel (XLS, XLSX)
- **Maximum size**: 10MB
- **Storage**: Local file system (uploads/ directory)

### OCR Processing

The backend uses Tesseract.js for OCR processing:
- Extracts text from uploaded images
- Processes PDF files
- Returns structured data for invoice fields

### AI Integration

Google Generative AI enhances data extraction:
- Improves accuracy of extracted data
- Validates and corrects OCR results
- Provides intelligent data processing

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Request data validation
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security
- **Google OAuth**: Secure social login

## 📧 Email Service

The backend includes email functionality:
- **Welcome emails**: Sent to new users
- **Password reset emails**: Secure password recovery
- **Subscription confirmation**: Plan activation notifications

Email service is optional - if credentials aren't configured, emails are skipped gracefully.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 API Response Format

All API responses follow this format:

```javascript
{
  success: boolean,
  message: string,
  data?: any
}
```

### Example Responses

**Success:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "language": "en",
    "subscriptionPlan": "Free"
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

## 🤝 Frontend Integration

This backend is designed to work seamlessly with the EHopN frontend. All API responses match the frontend's expected data shapes.

### CORS Configuration

The backend is configured to accept requests from:
- Development: `http://localhost:3000`, `http://localhost:3001`
- Production: Vercel frontend URLs
- Custom: Set via `FRONTEND_URL` environment variable

## 📈 Production Deployment

### Render Deployment

1. **Connect your GitHub repository to Render**
2. **Set environment variables in Render dashboard**
3. **Deploy automatically on push to main branch**

### Environment Variables for Production

```env
NODE_ENV=production
BACKEND_URL=https://ehopn-test-project.onrender.com
FRONTEND_URL=https://ehopn-test-project.vercel.app
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_PUBLIC_KEY=your_chapa_public_key
CHAPA_ENCRYPTION_KEY=your_chapa_encryption_key
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_gmail_address (optional)
EMAIL_PASSWORD=your_gmail_app_password (optional)
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string
   - Check network connectivity

2. **JWT Token Invalid**
   - Ensure JWT_SECRET is set
   - Check token expiration
   - Verify token format

3. **Google OAuth Issues**
   - Verify redirect URI in Google Cloud Console
   - Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
   - Ensure OAuth is enabled for the project

4. **File Upload Fails**
   - Check file size (max 10MB)
   - Verify file type
   - Ensure uploads directory exists

5. **Chapa Payment Issues**
   - Verify Chapa credentials
   - Check webhook URL configuration
   - Ensure proper currency settings (ETB)

6. **Email Service Issues**
   - Check EMAIL_USER and EMAIL_PASSWORD
   - Verify Gmail app password is correct
   - Ensure 2FA is enabled for Gmail

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Recent Updates

- **JavaScript Conversion**: Converted from TypeScript to JavaScript for better deployment compatibility
- **Google OAuth**: Added social login integration
- **Chapa Integration**: Replaced Stripe with Chapa payment gateway
- **OCR Processing**: Added Tesseract.js for text extraction
- **AI Integration**: Added Google Generative AI for enhanced data processing
- **Email Service**: Added Nodemailer for transactional emails
- **Security**: Fixed CORS and localhost references for production
- **Deployment**: Configured for Render hosting platform
