const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:8082'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory storage for testing
let users = [];
let tasks = [];
let categories = [];
let nextId = 1;

// Helper function to generate ID
const generateId = () => {
  return (nextId++).toString();
};

// Mock data
const initializeMockData = () => {
  // Add some default categories
  categories = [
    { id: generateId(), name: 'Work', color: '#3b82f6', userId: '1', createdAt: new Date(), updatedAt: new Date() },
    { id: generateId(), name: 'Personal', color: '#10b981', userId: '1', createdAt: new Date(), updatedAt: new Date() },
    { id: generateId(), name: 'Shopping', color: '#f59e0b', userId: '1', createdAt: new Date(), updatedAt: new Date() }
  ];

  // Add some default tasks
  tasks = [
    { 
      id: generateId(), 
      title: 'Welcome to TodoApp!', 
      description: 'This is your first task. Tap to edit or mark as complete.', 
      completed: false, 
      categoryId: categories[0].id, 
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      priority: 'medium', 
      createdAt: new Date(), 
      updatedAt: new Date(), 
      userId: '1' 
    }
  ];

  // Add a default user
  users = [
    { 
      id: '1', 
      email: 'demo@example.com', 
      username: 'demo', 
      createdAt: new Date(), 
      updatedAt: new Date() 
    }
  ];
};

// Initialize mock data
initializeMockData();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Mock server running - no database required'
  });
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { email, username, password } = req.body;
  
  if (!email || !username || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const newUser = {
    id: generateId(),
    email,
    username,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  users.push(newUser);

  // Generate a mock token
  const token = 'mock-jwt-token-' + Date.now();

  res.json({
    success: true,
    data: { user: newUser, token },
    message: 'User registered successfully'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid credentials' });
  }

  // Generate a mock token
  const token = 'mock-jwt-token-' + Date.now();

  res.json({
    success: true,
    data: { user, token },
    message: 'Login successful'
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
});

app.get('/api/auth/me', (req, res) => {
  // Mock authentication - in real app, verify JWT token
  const user = users[0]; // Return first user for demo
  res.json({ success: true, data: user });
});

// Task routes
app.get('/api/tasks', (req, res) => {
  res.json({ success: true, data: tasks });
});

app.post('/api/tasks', (req, res) => {
  const { title, description, priority, categoryId, dueDate } = req.body;
  
  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  const newTask = {
    id: generateId(),
    title,
    description: description || '',
    completed: false,
    categoryId,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    priority: priority || 'medium',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '1'
  };

  tasks.unshift(newTask);
  res.json({ success: true, data: newTask, message: 'Task created successfully' });
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updatedAt: new Date() };
  res.json({ success: true, data: tasks[taskIndex], message: 'Task updated successfully' });
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  tasks.splice(taskIndex, 1);
  res.json({ success: true, message: 'Task deleted successfully' });
});

app.patch('/api/tasks/:id/complete', (req, res) => {
  const { id } = req.params;
  
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  task.completed = !task.completed;
  task.updatedAt = new Date();
  
  res.json({ success: true, data: task, message: 'Task status updated' });
});

// Category routes
app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: categories });
});

app.post('/api/categories', (req, res) => {
  const { name, color } = req.body;
  
  if (!name || !color) {
    return res.status(400).json({ success: false, message: 'Name and color are required' });
  }

  const newCategory = {
    id: generateId(),
    name,
    color,
    userId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  categories.push(newCategory);
  res.json({ success: true, data: newCategory, message: 'Category created successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock server running on port ${PORT}`);
  console.log(`📱 No database required - using in-memory storage`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 API endpoints: http://localhost:${PORT}/api/*`);
});

module.exports = app; 