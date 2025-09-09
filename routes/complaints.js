// server/routes/complaints.js
const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/complaintController');


const router = express.Router();


// Create
router.post(
'/',
[
body('restaurantName').notEmpty().withMessage('Restaurant name is required'),
body('title').notEmpty().withMessage('Title is required'),
body('description').notEmpty().withMessage('Description is required'),
body('postId').optional().isString().withMessage('Post ID must be a string'),
],
ctrl.createComplaint
);


// Read
router.get('/', ctrl.getComplaints);
router.get('/:id', ctrl.getComplaintById);


// Update (status only for now)
router.patch('/:id/status', [body('status').isString()], ctrl.updateStatus);


module.exports = router;