const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Task title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Task description cannot exceed 500 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  attachments: [{
    filename: String,
    url: String,
    type: String,
    size: Number
  }],
  recurring: {
    type: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'none'
    },
    interval: {
      type: Number,
      default: 1
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  timeEstimate: {
    hours: {
      type: Number,
      min: 0,
      max: 24
    },
    minutes: {
      type: Number,
      min: 0,
      max: 59
    }
  },
  actualTime: {
    hours: {
      type: Number,
      min: 0,
      max: 24
    },
    minutes: {
      type: Number,
      min: 0,
      max: 59
    }
  },
  notes: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task status
taskSchema.virtual('status').get(function() {
  if (this.completed) return 'completed';
  if (this.dueDate && new Date() > this.dueDate) return 'overdue';
  if (this.dueDate && new Date(this.dueDate) - new Date() < 24 * 60 * 60 * 1000) return 'due-soon';
  return 'pending';
});

// Virtual for formatted due date
taskSchema.virtual('formattedDueDate').get(function() {
  if (!this.dueDate) return null;
  return this.dueDate.toLocaleDateString();
});

// Virtual for time estimate in minutes
taskSchema.virtual('timeEstimateMinutes').get(function() {
  if (!this.timeEstimate) return 0;
  return (this.timeEstimate.hours || 0) * 60 + (this.timeEstimate.minutes || 0);
});

// Virtual for actual time in minutes
taskSchema.virtual('actualTimeMinutes').get(function() {
  if (!this.actualTime) return 0;
  return (this.actualTime.hours || 0) * 60 + (this.actualTime.minutes || 0);
});

// Method to mark task as complete
taskSchema.methods.markComplete = function() {
  this.completed = true;
  this.completedAt = new Date();
  return this.save();
};

// Method to mark task as incomplete
taskSchema.methods.markIncomplete = function() {
  this.completed = false;
  this.completedAt = undefined;
  return this.save();
};

// Method to toggle completion status
taskSchema.methods.toggleComplete = function() {
  this.completed = !this.completed;
  if (this.completed) {
    this.completedAt = new Date();
  } else {
    this.completedAt = undefined;
  }
  return this.save();
};

// Method to add note
taskSchema.methods.addNote = function(content) {
  this.notes.push({ content });
  return this.save();
};

// Method to update note
taskSchema.methods.updateNote = function(noteId, content) {
  const note = this.notes.id(noteId);
  if (note) {
    note.content = content;
    note.updatedAt = new Date();
    return this.save();
  }
  throw new Error('Note not found');
};

// Method to delete note
taskSchema.methods.deleteNote = function(noteId) {
  this.notes = this.notes.filter(note => note._id.toString() !== noteId);
  return this.save();
};

// Static method to find tasks by user
taskSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  
  if (options.completed !== undefined) {
    query.completed = options.completed;
  }
  
  if (options.priority) {
    query.priority = options.priority;
  }
  
  if (options.categoryId) {
    query.categoryId = options.categoryId;
  }
  
  if (options.dueDate) {
    query.dueDate = options.dueDate;
  }
  
  return this.find(query).populate('categoryId', 'name color');
};

// Static method to find overdue tasks
taskSchema.statics.findOverdue = function(userId) {
  return this.find({
    userId,
    completed: false,
    dueDate: { $lt: new Date() }
  }).populate('categoryId', 'name color');
};

// Static method to find tasks due soon
taskSchema.statics.findDueSoon = function(userId, hours = 24) {
  const dueSoon = new Date();
  dueSoon.setHours(dueSoon.getHours() + hours);
  
  return this.find({
    userId,
    completed: false,
    dueDate: { $gte: new Date(), $lte: dueSoon }
  }).populate('categoryId', 'name color');
};

// Indexes for better query performance
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, categoryId: 1 });
taskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema); 