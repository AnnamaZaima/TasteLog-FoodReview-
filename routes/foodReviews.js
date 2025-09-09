// server/routes/foodReviews.js
const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/foodReviewController');
const { adminOnly } = require('../middleware/auth');

/* ------------------------------ Validators ------------------------------ */

// :id must be a valid MongoDB ObjectId
const idCheck = [param('id').isMongoId().withMessage('Invalid review id')];

// :commentId must be a valid subdoc id (ObjectId-like)
const commentIdCheck = [
  param('commentId').isMongoId().withMessage('Invalid comment id'),
];

// Create validators (strict)
const createChecks = [
  body('title').isString().trim().isLength({ min: 3 }).withMessage('title ≥ 3 chars'),
  body('description').isString().trim().isLength({ min: 20 }).withMessage('description ≥ 20 chars'),
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('rating 1–5'),

  body('cuisine').optional().isString().trim(),
  body('area').optional().isString().trim(),
  body('diningStyle').optional().isString().trim(),
  body('price').optional().isString().trim(),
  body('imageUrl').optional().isURL().withMessage('imageUrl must be a URL'),
  body('images').optional().isArray().withMessage('images must be an array of strings (base64 or URLs)'),
  body('images.*').optional().isString().withMessage('images entries must be strings'),
  body('tags').optional().isArray().withMessage('tags must be an array of strings'),
  body('tags.*').optional().isString().trim(),
  body('visitDate').optional().isISO8601().toDate(),

  // optional author display name; authorId comes from header in controller
  body('authorName').optional().isString().trim().isLength({ max: 60 }),
];

// Update validators (same fields but optional)
const updateChecks = [
  idCheck,
  body('title').optional().isString().trim().isLength({ min: 3 }),
  body('description').optional().isString().trim().isLength({ min: 20 }),
  body('rating').optional().isFloat({ min: 1, max: 5 }),
  body('cuisine').optional().isString().trim(),
  body('area').optional().isString().trim(),
  body('diningStyle').optional().isString().trim(),
  body('price').optional().isString().trim(),
  body('imageUrl').optional().isURL(),
  body('tags').optional().isArray(),
  body('tags.*').optional().isString().trim(),
  body('visitDate').optional().isISO8601().toDate(),
];

// Listing / search validators
const listChecks = [
  query('q').optional().isString().trim(),
  query('cuisine').optional(),
  query('area').optional(),
  query('diningStyle').optional(),
  query('sort')
    .optional()
    .isIn(['recent', 'rating_desc', 'rating_asc', 'price_low', 'price_high'])
    .withMessage('invalid sort'),
];

// Report validators
const reportChecks = [
  idCheck,
  body('reason')
    .isIn(['spam', 'abusive', 'off-topic', 'plagiarism', 'advertising', 'other'])
    .withMessage('invalid reason'),
];

// Comment validators
const addCommentChecks = [
  idCheck,
  body('text').isString().trim().notEmpty().withMessage('text required'),
  body('name').optional().isString().trim().isLength({ max: 60 }),
];

/* ------------------------------ Routes ------------------------------ */

// List (with filters/search/sort)
router.get('/', listChecks, ctrl.getReviews);

// Create
router.post('/', createChecks, ctrl.createReview);

// Read one
router.get('/:id', idCheck, ctrl.getReviewById);

// Update (author only)
router.patch('/:id', updateChecks, ctrl.updateReview);

// Delete (author only)
// Delete: admin only
router.delete('/:id', idCheck, adminOnly, ctrl.deleteReview);

/* ---------- Reactions (mutually exclusive) ---------- */
router.post('/:id/like', idCheck, ctrl.toggleLike);
router.post('/:id/dislike', idCheck, ctrl.toggleDislike);

/* ------------------------------- Reports ------------------------------ */
router.post('/:id/report', reportChecks, ctrl.reportReview);

/* ------------------------------- Comments ----------------------------- */
router.get('/:id/comments', idCheck, ctrl.listComments);
router.post('/:id/comments', addCommentChecks, ctrl.addComment);
router.delete('/:id/comments/:commentId', [...idCheck, ...commentIdCheck], ctrl.deleteComment);

module.exports = router;
