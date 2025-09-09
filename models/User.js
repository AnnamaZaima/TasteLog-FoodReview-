// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // Statistics
    reviewsCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    likesReceived: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (excluding sensitive data)
UserSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Update user statistics
UserSchema.methods.updateStats = async function () {
  const FoodReview = mongoose.model('FoodReview');
  
  // Count user's reviews
  this.reviewsCount = await FoodReview.countDocuments({ 
    authorId: this._id.toString(),
    isRemoved: false 
  });
  
  // Count user's comments
  const reviews = await FoodReview.find({}, { comments: 1 });
  this.commentsCount = reviews.reduce((total, review) => {
    return total + (review.comments || []).filter(
      comment => comment.author === this._id.toString()
    ).length;
  }, 0);
  
  // Count likes received on user's reviews
  const userReviews = await FoodReview.find({ 
    authorId: this._id.toString(),
    isRemoved: false 
  }, { likes: 1 });
  this.likesReceived = userReviews.reduce((total, review) => total + (review.likes || 0), 0);
  
  await this.save();
};

// Indexes for performance
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);
