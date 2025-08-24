# EHopN Backend

Express.js backend with TypeScript and MongoDB for the EHopN invoice management system.

## 🚀 Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Invoice Management**: CRUD operations for invoices with file upload support
- **Subscription Management**: Stripe integration for subscription handling
- **File Upload**: Support for PDF, images, and Excel files with OCR simulation
- **Security**: Helmet, CORS, rate limiting, and input validation
- **TypeScript**: Full TypeScript support with strict type checking

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Stripe account (for subscription features)

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
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/ehopn_db
   JWT_SECRET=your_super_secret_jwt_key_here
   STRIPE_SECRET=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
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
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.ts    # Authentication logic
│   │   ├── invoiceController.ts # Invoice CRUD operations
│   │   └── subscriptionController.ts # Subscription management
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication
│   │   └── validation.ts       # Input validation
│   ├── models/
│   │   ├── User.ts             # User model
│   │   ├── Invoice.ts          # Invoice model
│   │   └── Subscription.ts     # Subscription model
│   ├── routes/
│   │   ├── auth.ts             # Authentication routes
│   │   ├── invoices.ts         # Invoice routes
│   │   └── subscription.ts     # Subscription routes
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   └── server.ts               # Main server file
├── uploads/                    # File upload directory
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Authentication (`/auth`)

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

### Invoices (`/invoices`)

- `GET /invoices` - Get user's invoices
- `POST /invoices/upload` - Upload and process invoice file
- `PUT /invoices/:id` - Update invoice
- `DELETE /invoices/:id` - Delete invoice

### Subscriptions (`/subscription`)

- `POST /subscription/create` - Create new subscription
- `GET /subscription/me` - Get current subscription
- `POST /subscription/webhook` - Stripe webhook handler

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Models

### User
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  passwordHash: string,
  language: 'en' | 'de' | 'ar',
  role: 'user' | 'admin',
  subscriptionPlan: 'Free' | 'Pro' | 'Business',
  createdAt: Date,
  updatedAt: Date
}
```

### Invoice
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  vendor: string,
  date: string,
  amount: string,
  taxId: string,
  fileUrl: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscription
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  plan: 'Free' | 'Pro' | 'Business',
  status: 'active' | 'canceled',
  renewDate: Date,
  stripeSubscriptionId?: string,
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
| `FRONTEND_URL` | Frontend URL for CORS | No (default: http://localhost:3000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `STRIPE_SECRET` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |

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

### Stripe Setup

1. Create a Stripe account
2. Get your API keys from the Stripe dashboard
3. Set up webhook endpoints
4. Update environment variables

## 🚀 Development

### Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm test         # Run tests
```

### File Upload

The backend supports file uploads for invoices:
- **Supported formats**: PDF, JPEG, PNG, Excel (XLS, XLSX)
- **Maximum size**: 10MB
- **Storage**: Local file system (uploads/ directory)

### OCR Simulation

The backend simulates OCR processing for uploaded files:
- Returns mock extracted data
- In production, integrate with real OCR services like Tesseract.js

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Request data validation
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 API Response Format

All API responses follow this format:

```typescript
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

The backend is configured to accept requests from the frontend:
- Development: `http://localhost:3000`
- Production: Set via `FRONTEND_URL` environment variable

## 📈 Production Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_production_jwt_secret
   STRIPE_SECRET=sk_live_your_production_stripe_key
   ```

3. **Start the server**
   ```bash
   npm start
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

3. **File Upload Fails**
   - Check file size (max 10MB)
   - Verify file type
   - Ensure uploads directory exists

4. **Stripe Integration Issues**
   - Verify Stripe keys
   - Check webhook configuration
   - Ensure proper event handling

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
