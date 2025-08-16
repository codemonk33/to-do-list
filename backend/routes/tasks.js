const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Validation middleware
const validateTask = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId')
];

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { completed, priority, categoryId, dueDate, search } = req.query;
    
    let query = { userId: req.user.userId };
    
    // Filter by completion status
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }
    
    // Filter by priority
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      query.priority = priority;
    }
    
    // Filter by category
    if (categoryId) {
      query.categoryId = categoryId;
    }
    
    // Filter by due date
    if (dueDate) {
      const date = new Date(dueDate);
      if (!isNaN(date.getTime())) {
        query.dueDate = date;
      }
    }
    
    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tasks = await Task.find(query)
      .populate('categoryId', 'name color')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: tasks
    });
    
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a specific task by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate('categoryId', 'name color');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
    
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', validateTask, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { title, description, priority, categoryId, dueDate } = req.body;
    
    // Verify category exists and belongs to user (if provided)
    if (categoryId) {
      const category = await Category.findOne({
        _id: categoryId,
        userId: req.user.userId
      });
      
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }
    
    // Create new task
    const task = new Task({
      title,
      description,
      priority: priority || 'medium',
      categoryId,
      dueDate,
      userId: req.user.userId
    });
    
    await task.save();
    
    // Update category task count if category is assigned
    if (categoryId) {
      await Category.findByIdAndUpdate(categoryId, {
        $inc: { taskCount: 1 }
      });
    }
    
    // Populate category info
    await task.populate('categoryId', 'name color');
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
    
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating task'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', validateTask, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { title, description, priority, categoryId, dueDate } = req.body;
    
    // Find the task
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Store old category for count update
    const oldCategoryId = task.categoryId;
    
    // Verify new category exists and belongs to user (if provided)
    if (categoryId && categoryId !== oldCategoryId) {
      const category = await Category.findOne({
        _id: categoryId,
        userId: req.user.userId
      });
      
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }
    
    // Update task
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name color');
    
    // Update category task counts
    if (oldCategoryId && oldCategoryId !== categoryId) {
      await Category.findByIdAndUpdate(oldCategoryId, {
        $inc: { taskCount: -1 }
      });
    }
    
    if (categoryId && categoryId !== oldCategoryId) {
      await Category.findByIdAndUpdate(categoryId, {
        $inc: { taskCount: 1 }
      });
    }
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
    
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task'
    });
  }
});

// @route   PATCH /api/tasks/:id/complete
// @desc    Toggle task completion status
// @access  Private
router.patch('/:id/complete', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Toggle completion status
    await task.toggleComplete();
    
    // Populate category info
    await task.populate('categoryId', 'name color');
    
    res.json({
      success: true,
      message: `Task marked as ${task.completed ? 'complete' : 'incomplete'}`,
      data: task
    });
    
  } catch (error) {
    console.error('Toggle task completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Store category ID for count update
    const categoryId = task.categoryId;
    
    // Delete the task
    await task.remove();
    
    // Update category task count if category was assigned
    if (categoryId) {
      await Category.findByIdAndUpdate(categoryId, {
        $inc: { taskCount: -1 }
      });
    }
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task'
    });
  }
});

// @route   GET /api/tasks/stats/overview
// @desc    Get task statistics overview
// @access  Private
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      highPriorityTasks
    ] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, completed: true }),
      Task.countDocuments({ userId, completed: false }),
      Task.countDocuments({
        userId,
        completed: false,
        dueDate: { $lt: new Date() }
      }),
      Task.countDocuments({
        userId,
        completed: false,
        priority: 'high'
      })
    ]);
    
    res.json({
      success: true,
      data: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        overdue: overdueTasks,
        highPriority: highPriorityTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
    });
    
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task statistics'
    });
  }
});

module.exports = router; 