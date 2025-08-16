const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [30, 'Category name cannot exceed 30 characters']
  },
  color: {
    type: String,
    required: [true, 'Category color is required'],
    default: '#3b82f6',
    validate: {
      validator: function(v) {
        // Basic hex color validation
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  icon: {
    type: String,
    default: 'tag'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [100, 'Category description cannot exceed 100 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  taskCount: {
    type: Number,
    default: 0
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for category display name
categorySchema.virtual('displayName').get(function() {
  return this.name.charAt(0).toUpperCase() + this.name.slice(1);
});

// Virtual for category with task count
categorySchema.virtual('withTaskCount').get(function() {
  return {
    id: this._id,
    name: this.name,
    color: this.color,
    icon: this.icon,
    description: this.description,
    taskCount: this.taskCount,
    sortOrder: this.sortOrder,
    createdAt: this.createdAt
  };
});

// Method to increment task count
categorySchema.methods.incrementTaskCount = function() {
  this.taskCount += 1;
  return this.save();
};

// Method to decrement task count
categorySchema.methods.decrementTaskCount = function() {
  if (this.taskCount > 0) {
    this.taskCount -= 1;
  }
  return this.save();
};

// Method to update task count
categorySchema.methods.updateTaskCount = function() {
  return mongoose.model('Task').countDocuments({ categoryId: this._id })
    .then(count => {
      this.taskCount = count;
      return this.save();
    });
};

// Static method to find categories by user
categorySchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  
  if (options.isActive !== undefined) {
    query.isActive = options.isActive;
  }
  
  if (options.isDefault !== undefined) {
    query.isDefault = options.isDefault;
  }
  
  return this.find(query)
    .sort({ sortOrder: 1, name: 1 })
    .select('-__v');
};

// Static method to find default categories
categorySchema.statics.findDefaults = function() {
  return this.find({ isDefault: true })
    .sort({ sortOrder: 1, name: 1 });
};

// Static method to create default categories for a user
categorySchema.statics.createDefaults = function(userId) {
  const defaultCategories = [
    { name: 'Work', color: '#3b82f6', icon: 'briefcase', sortOrder: 1 },
    { name: 'Personal', color: '#10b981', icon: 'heart', sortOrder: 2 },
    { name: 'Shopping', color: '#f59e0b', icon: 'cart', sortOrder: 3 },
    { name: 'Health', color: '#ef4444', icon: 'medical-bag', sortOrder: 4 },
    { name: 'Learning', color: '#8b5cf6', icon: 'book-open', sortOrder: 5 },
    { name: 'Travel', color: '#06b6d4', icon: 'airplane', sortOrder: 6 }
  ];

  const categories = defaultCategories.map(cat => ({
    ...cat,
    userId,
    isDefault: true,
    description: `${cat.name} related tasks`
  }));

  return this.insertMany(categories);
};

// Static method to find category by name and user
categorySchema.statics.findByNameAndUser = function(name, userId) {
  return this.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    userId
  });
};

// Pre-save middleware to ensure unique names per user
categorySchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const existingCategory = await this.constructor.findByNameAndUser(this.name, this.userId);
    if (existingCategory && existingCategory._id.toString() !== this._id.toString()) {
      return next(new Error('Category name already exists for this user'));
    }
  }
  next();
});

// Pre-remove middleware to handle task reassignment
categorySchema.pre('remove', async function(next) {
  try {
    // Reassign tasks to no category
    await mongoose.model('Task').updateMany(
      { categoryId: this._id },
      { $unset: { categoryId: 1 } }
    );
    next();
  } catch (error) {
    next(error);
  }
});

// Indexes for better query performance
categorySchema.index({ userId: 1, name: 1 }, { unique: true });
categorySchema.index({ userId: 1, isActive: 1 });
categorySchema.index({ userId: 1, sortOrder: 1 });
categorySchema.index({ isDefault: 1 });

module.exports = mongoose.model('Category', categorySchema); 