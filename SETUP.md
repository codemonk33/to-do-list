# 🚀 Setup Guide - Todo App

This guide will help you set up and run the Todo App with both frontend and backend components.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo CLI** - Install globally: `npm install -g @expo/cli`
- **MongoDB** - Local installation or MongoDB Atlas account
- **Git** - [Download here](https://git-scm.com/)

## 🏗️ Project Structure

```
todo-app/
├── app/                    # Expo Router app directory
├── components/            # React Native components
├── contexts/              # React contexts (Auth, Tasks)
├── services/              # API services
├── types/                 # TypeScript definitions
├── backend/               # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── server.js         # Main server file
└── README.md             # Project documentation
```

## 🔧 Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
1. Copy the environment example file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/todo-app
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   
   # Security
   BCRYPT_ROUNDS=12
   ```

### Step 4: Start MongoDB
**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod

# Or if using MongoDB Community Server
brew services start mongodb-community  # macOS
sudo systemctl start mongod           # Linux
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

### Step 5: Start Backend Server
```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

**Expected Output:**
```
🚀 Server running on port 5000
📱 Environment: development
🔗 API URL: http://localhost:5000/api
💚 Health Check: http://localhost:5000/api/health
Connected to MongoDB
```

## 📱 Frontend Setup

### Step 1: Navigate to Root Directory
```bash
cd ..  # If you're in backend directory
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
1. Copy the environment example file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` file with your configuration:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000/api
   ```

### Step 4: Start Frontend Development Server
```bash
npm start
```

**Expected Output:**
```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```

## 🧪 Testing the Setup

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### Frontend App
1. Open Expo Go app on your mobile device
2. Scan the QR code from the terminal
3. The app should load and show the authentication screen

## 🔐 Default Categories

When a user registers, the following default categories are automatically created:

- **Work** (Blue) - Work-related tasks
- **Personal** (Green) - Personal tasks
- **Shopping** (Orange) - Shopping lists
- **Health** (Red) - Health and fitness
- **Learning** (Purple) - Educational tasks
- **Travel** (Cyan) - Travel planning

## 🚨 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```bash
Error: MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running locally or update `MONGODB_URI` to point to your MongoDB instance.

#### 2. Port Already in Use
```bash
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change the port in `.env` file or kill the process using port 5000.

#### 3. Expo Build Failed
```bash
Error: Metro bundler failed to start
```
**Solution:** Clear Metro cache:
```bash
npx expo start --clear
```

#### 4. Dependencies Installation Failed
```bash
Error: npm install failed
```
**Solution:** Clear npm cache and try again:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables

Make sure these environment variables are properly set:

**Backend (.env):**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)

**Frontend (.env):**
- `EXPO_PUBLIC_API_URL` - Backend API URL

## 📱 Running on Different Platforms

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Web Browser
```bash
npm run web
```

### Physical Device
1. Install Expo Go app from App Store/Play Store
2. Scan QR code from terminal
3. App will load on your device

## 🔄 Development Workflow

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend (in new terminal)
```bash
npm start
```

### 3. Make Changes
- Edit files in `app/` directory for screens
- Edit files in `components/` for UI components
- Edit files in `backend/` for API changes

### 4. Hot Reload
- Backend: Automatically restarts on file changes
- Frontend: Automatically reloads on file changes

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/complete` - Toggle completion

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## 🎯 Next Steps

1. **Customize UI**: Modify colors, fonts, and layouts in components
2. **Add Features**: Implement additional functionality like task reminders, sharing, etc.
3. **Testing**: Add unit tests and integration tests
4. **Deployment**: Deploy backend to cloud platforms and frontend to app stores

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review error logs in the terminal
3. Check MongoDB connection and environment variables
4. Ensure all dependencies are properly installed

## 🎉 You're All Set!

Your Todo App should now be running with:
- ✅ Backend API on http://localhost:5000
- ✅ Frontend app accessible via Expo
- ✅ MongoDB database connected
- ✅ Authentication system working
- ✅ Task management functionality

Happy coding! 🚀 