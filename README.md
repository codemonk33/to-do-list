# 📱 To-Do List Application

A modern, cross-platform to-do list application built with React Native, Expo, and Node.js. Features a beautiful UI with React Native Paper and Tailwind CSS, robust backend with MongoDB, and seamless mobile experience.

## ✨ Features

- **📝 Task Management**: Create, edit, delete, and mark tasks as complete
- **🎨 Modern UI**: Beautiful interface using React Native Paper components
- **📱 Cross-Platform**: Works on iOS, Android, and Web
- **🔄 Real-time Sync**: Instant updates across all devices
- **🔐 User Authentication**: Secure login and registration system
- **📊 Task Categories**: Organize tasks with custom categories
- **🔍 Search & Filter**: Find tasks quickly with advanced search
- **📅 Due Dates**: Set reminders and track deadlines
- **🌙 Dark/Light Theme**: Automatic theme switching based on system preference
- **📊 Offline Support**: Works without internet connection

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo CLI** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based routing system
- **React Native Paper** - Material Design components
- **NativeWind (Tailwind CSS)** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/to-do-app.git
   cd to-do-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Backend
   MONGODB_URI=mongodb://localhost:27017/todo-app
   JWT_SECRET=your-secret-key
   PORT=5000
   
   # Frontend
   EXPO_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the backend server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

5. **Start the frontend**
   ```bash
   # In a new terminal
   npm start
   # or
   expo start
   ```

## 📱 Running the App

### Mobile Development
- **iOS Simulator**: Press `i` in the terminal or click "Run on iOS simulator"
- **Android Emulator**: Press `a` in the terminal or click "Run on Android device/emulator"
- **Physical Device**: Scan the QR code with Expo Go app

### Web Development
- Press `w` in the terminal or click "Run in web browser"

## 🏗️ Project Structure

```
to-do-app/
├── app/                    # Expo Router app directory
│   ├── (tabs)/           # Tab-based navigation
│   ├── _layout.tsx       # Root layout
│   └── +not-found.tsx    # 404 page
├── components/            # Reusable UI components
│   ├── ui/               # UI components
│   └── ...               # Other components
├── constants/             # App constants and configuration
├── hooks/                 # Custom React hooks
├── services/              # API services and utilities
├── types/                 # TypeScript type definitions
├── utils/                 # Helper functions
├── backend/               # Node.js backend server
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── server.js         # Server entry point
└── assets/               # Images, fonts, and static files
```

## 🔧 Available Scripts

- **`npm start`** - Start Expo development server
- **`npm run android`** - Run on Android device/emulator
- **`npm run ios`** - Run on iOS simulator
- **`npm run web`** - Run in web browser
- **`npm run lint`** - Run ESLint
- **`npm run build`** - Build for production
- **`npm run eject`** - Eject from Expo managed workflow

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks for user
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/complete` - Mark task as complete

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## 🎨 UI Components

The app uses **React Native Paper** for Material Design components:

- **Cards** - Task display and management
- **Floating Action Button** - Quick task creation
- **Bottom Navigation** - App navigation
- **Text Input** - Task input forms
- **Checkbox** - Task completion status
- **Icon Button** - Action buttons
- **Snackbar** - User notifications

## 🎯 Key Features Implementation

### Task Management
- Create tasks with title, description, due date, and category
- Edit existing tasks
- Mark tasks as complete/incomplete
- Delete tasks with confirmation
- Bulk operations (delete multiple, mark all complete)

### User Experience
- Smooth animations and transitions
- Haptic feedback on interactions
- Pull-to-refresh functionality
- Infinite scroll for large task lists
- Search and filter capabilities

### Data Persistence
- Local storage for offline functionality
- Real-time sync with backend
- Conflict resolution for concurrent edits
- Data validation and sanitization

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Secure HTTP headers

## 📱 Platform Support

- **iOS** - Native iOS app with App Store distribution
- **Android** - Native Android app with Play Store distribution
- **Web** - Progressive Web App (PWA) support
- **Desktop** - Electron wrapper for desktop usage

## 🚀 Deployment

### Backend Deployment
1. **Heroku**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

2. **Vercel**
   ```bash
   vercel --prod
   ```

3. **DigitalOcean App Platform**
   - Connect GitHub repository
   - Configure environment variables
   - Deploy automatically

### Frontend Deployment
1. **Expo Application Services (EAS)**
   ```bash
   eas build --platform all
   eas submit --platform all
   ```

2. **Web Deployment**
   ```bash
   expo build:web
   # Deploy build folder to your hosting service
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo** team for the amazing development platform
- **React Native Paper** for beautiful UI components
- **Tailwind CSS** for utility-first CSS framework
- **MongoDB** for the flexible database solution

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/to-do-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/to-do-app/discussions)
- **Email**: your-email@example.com

---

**Made with ❤️ using React Native and Node.js**
