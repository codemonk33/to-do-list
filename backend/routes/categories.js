const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Validation middleware
const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Category name must be between 1 and 30 characters'),
  body('color')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Description cannot exceed 100 characters'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon name cannot exceed 50 characters')
];

// @route   GET /api/categories
// @desc    Get all categories for the authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { isActive, isDefault } = req.query;
    
    let query = { userId: req.user.userId };
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Filter by default status
    if (isDefault !== undefined) {
      query.isDefault = isDefault === 'true';
    }
    
    const categories = await Category.find(query)
      .sort({ sortOrder: 1, name: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get a specific category by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
    
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category'
    });
  }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private
router.post('/', validateCategory, async (req, res) => {
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
    
    const { name, color, description, icon } = req.body;
    
    // Check if category name already exists for this user
    const existingCategory = await Category.findByNameAndUser(name, req.user.userId);
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    
    // Get the highest sort order and increment by 1
    const lastCategory = await Category.findOne({ userId: req.user.userId })
      .sort({ sortOrder: -1 });
    const sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 0;
    
    // Create new category
    const category = new Category({
      name,
      color,
      description,
      icon: icon || 'tag',
      userId: req.user.userId,
      sortOrder
    });
    
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
    
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating category'
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private
router.put('/:id', validateCategory, async (req, res) => {
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
    
    const { name, color, description, icon } = req.body;
    
    // Find the category
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if name is being changed and if it conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findByNameAndUser(name, req.user.userId);
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists'
        });
      }
    }
    
    // Update category
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
    
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating category'
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if it's a default category
    if (category.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default categories'
      });
    }
    
    // Check if category has tasks
    const taskCount = await Task.countDocuments({ categoryId: req.params.id });
    if (taskCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${taskCount} task(s). Please reassign or delete the tasks first.`
      });
    }
    
    // Delete the category
    await category.remove();
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category'
    });
  }
});

// @route   PATCH /api/categories/:id/toggle
// @desc    Toggle category active status
// @access  Private
router.patch('/:id/toggle', async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Toggle active status
    category.isActive = !category.isActive;
    await category.save();
    
    res.json({
      success: true,
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      data: category
    });
    
  } catch (error) {
    console.error('Toggle category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating category'
    });
  }
});

// @route   PATCH /api/categories/:id/reorder
// @desc    Update category sort order
// @access  Private
router.patch('/:id/reorder', [
  body('sortOrder')
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
], async (req, res) => {
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
    
    const { sortOrder } = req.body;
    
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Update sort order
    category.sortOrder = sortOrder;
    await category.save();
    
    res.json({
      success: true,
      message: 'Category order updated successfully',
      data: category
    });
    
  } catch (error) {
    console.error('Reorder category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating category order'
    });
  }
});

// @route   GET /api/categories/stats/overview
// @desc    Get category statistics overview
// @access  Private
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [
      totalCategories,
      activeCategories,
      defaultCategories,
      categoriesWithTasks
    ] = await Promise.all([
      Category.countDocuments({ userId }),
      Category.countDocuments({ userId, isActive: true }),
      Category.countDocuments({ userId, isDefault: true }),
      Category.countDocuments({ userId, taskCount: { $gt: 0 } })
    ]);
    
    // Get top categories by task count
    const topCategories = await Category.find({ userId, taskCount: { $gt: 0 } })
      .sort({ taskCount: -1 })
      .limit(5)
      .select('name color taskCount');
    
    res.json({
      success: true,
      data: {
        total: totalCategories,
        active: activeCategories,
        default: defaultCategories,
        withTasks: categoriesWithTasks,
        topCategories
      }
    });
    
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category statistics'
    });
  }
});

module.exports = router; 