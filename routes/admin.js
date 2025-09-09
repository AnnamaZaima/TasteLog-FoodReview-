// server/routes/admin.js
const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, superAdminOnly, adminOnly } = require('../middleware/auth');

// All admin routes require authentication
router.use(auth);

// Dashboard stats (admin+)
router.get('/dashboard', adminOnly, adminController.getDashboardStats);

// User management (superadmin only)
router.get('/users', superAdminOnly, adminController.getUsers);
router.put('/users/:userId', 
  superAdminOnly,
  [
    param('userId').isMongoId().withMessage('Invalid user ID'),
    body('role').optional().isIn(['user', 'admin', 'superadmin']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  ],
  adminController.updateUser
);
router.delete('/users/:userId',
  superAdminOnly,
  [param('userId').isMongoId().withMessage('Invalid user ID')],
  adminController.deleteUser
);

// Review management (admin+)
router.get('/reviews', adminOnly, adminController.getReviews);
router.put('/reviews/:reviewId',
  adminOnly,
  [
    param('reviewId').isMongoId().withMessage('Invalid review ID'),
    body('isRemoved').optional().isBoolean().withMessage('isRemoved must be boolean'),
    body('featured').optional().isBoolean().withMessage('featured must be boolean'),
  ],
  adminController.updateReview
);

// Reports management (admin+)
router.get('/reports', adminOnly, adminController.getReports);

// Complaints management (admin+)
router.get('/complaints', adminOnly, adminController.getComplaints);
router.put('/complaints/:complaintId',
  adminOnly,
  [
    param('complaintId').isMongoId().withMessage('Invalid complaint ID'),
    body('status').optional().isIn(['pending', 'resolved', 'rejected']).withMessage('Invalid status'),
    body('response').optional().isString().withMessage('Response must be string'),
  ],
  adminController.updateComplaint
);

module.exports = router;
