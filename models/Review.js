const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  text: String,
  author: String,
  createdAt: { type: Date, default: Date.now },
});

const FoodReviewSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  cuisine: String,
  area: String,
  diningStyle: String,
  price: String,
  author: String,
  imageUrl: String,
  tags: [String],
  visitDate: { type: Date }, // supports your new date field
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  comments: { type: [CommentSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('FoodReview', FoodReviewSchema);
