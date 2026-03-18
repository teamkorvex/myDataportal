# DataPortal Backend

MongoDB-powered backend API for DataPortal application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your MongoDB URI:
```bash
cp .env.example .env
```

3. Edit `.env` and add your MongoDB connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dataportal?retryWrites=true&w=majority
PORT=3001
```

4. Start the server:
```bash
npm start
```

## API Endpoints

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/username/:username` - Get user by username
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/verify-2fa` - Verify 2FA code
- `POST /api/auth/discord` - Login/register with Discord

### Documents
- `GET /api/documents/user/:userId` - Get user's documents (including shared)
- `POST /api/documents` - Create new document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/share` - Share document with user
- `POST /api/documents/:id/unshare` - Unshare document from user

### Setup
- `POST /api/seed` - Seed database with example users
- `GET /api/health` - Health check

## MongoDB Schema

### User Collection
```javascript
{
  username: String (unique, required),
  discordId: String (unique, sparse),
  email: String (unique, sparse),
  password: String,
  twoFactorCode: String (default: '0000'),
  rank: String ('standard' | 'premium'),
  suspended: Boolean (default: false),
  discordAvatar: String,
  authType: String ('local' | 'discord'),
  createdAt: Date,
  updatedAt: Date
}
```

### Document Collection
```javascript
{
  userId: ObjectId (ref: 'User'),
  title: String (required),
  content: String,
  type: String ('text' | 'file'),
  fileType: String,
  fileData: String (base64),
  fileName: String,
  fileSize: Number,
  sharedWith: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## GitHub Secrets

Add these secrets to your GitHub repository:
- `MONGODB_URI` - Your MongoDB connection string
