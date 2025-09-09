// server/controllers/adminController.js
const User = require('../models/User');
const FoodReview = require('../models/FoodReview');
const Complaint = require('../models/Complaint');

// Dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalReviews,
      totalComplaints,
      totalReports,
      activeUsers,
      todayUsers,
      todayReviews,
    ] = await Promise.all([
      User.countDocuments(),
      FoodReview.countDocuments({ isRemoved: false }),
      Complaint.countDocuments(),
      FoodReview.aggregate([
        { $unwind: '$reports' },
        { $count: 'total' }
      ]).then(result => result[0]?.total || 0),
      User.countDocuments({ isActive: true }),
      User.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      FoodReview.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        isRemoved: false
      }),
    ]);

    // Recent activity
    const recentReviews = await FoodReview.find({ isRemoved: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title rating authorName createdAt');

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username fullName role createdAt');

    // Top reviewers
    const topReviewers = await User.find({ reviewsCount: { $gt: 0 } })
      .sort({ reviewsCount: -1 })
      .limit(10)
      .select('username fullName reviewsCount likesReceived');

    res.json({
      stats: {
        totalUsers,
        totalReviews,
        totalComplaints,
        totalReports,
        activeUsers,
        todayUsers,
        todayReviews,
      },
      recentActivity: {
        recentReviews,
        recentUsers,
      },
      topReviewers,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// User management
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user role/status
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-demotion from superadmin
    if (req.user._id.toString() === userId && req.user.role === 'superadmin') {
      if (role !== 'superadmin') {
        return res.status(400).json({ 
          message: 'Cannot demote yourself from superadmin' 
        });
      }
    }

    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: user.getPublicProfile(),
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Review management
exports.getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } },
      ];
    }
    if (status === 'active') {
      filter.isRemoved = false;
    } else if (status === 'removed') {
      filter.isRemoved = true;
    }

    const [reviews, total] = await Promise.all([
      FoodReview.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      FoodReview.countDocuments(filter),
    ]);

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update review (feature/remove)
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isRemoved, featured } = req.body;

    const review = await FoodReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (isRemoved !== undefined) review.isRemoved = isRemoved;
    if (featured !== undefined) review.featured = featured;

    await review.save();

    res.json({
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get reports
exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const reports = await FoodReview.aggregate([
      { $match: { 'reports.0': { $exists: true } } },
      { $unwind: '$reports' },
      { $sort: { 'reports.createdAt': -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $project: {
          reviewId: '$_id',
          title: 1,
          authorName: 1,
          report: '$reports',
          reportsCount: { $size: '$reports' },
          isRemoved: 1,
        },
      },
    ]);

    const total = await FoodReview.aggregate([
      { $match: { 'reports.0': { $exists: true } } },
      { $unwind: '$reports' },
      { $count: 'total' },
    ]).then(result => result[0]?.total || 0);

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get complaints
exports.getComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Complaint.countDocuments(filter),
    ]);

    res.json({
      complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update complaint status
exports.updateComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, response } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (response) complaint.adminResponse = response;

    await complaint.save();

    res.json({
      message: 'Complaint updated successfully',
      complaint,
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
