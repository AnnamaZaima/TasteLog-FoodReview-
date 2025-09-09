// server/controllers/foodReviewController.js
const { validationResult } = require("express-validator");
const FoodReview = require("../models/FoodReview");

const getUid = (req) => req.userId || req.header("X-User-Id") || null;

/* ----------------------------- Create ----------------------------- */
exports.createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const uid = getUid(req);
    // authorId is REQUIRED in the schema – use 'anonymous' only if you truly allow it
    const authorId = uid || "anonymous";
    const authorName = req.body.authorName || req.body.username || undefined;

    const review = await FoodReview.create({
      ...req.body,
      authorId,
      ...(authorName && { authorName }),
    });

    res.status(201).json(review);
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ message: "Failed to create review" });
  }
};

/* ----------------------------- List (hide removed) ----------------------------- */
exports.getReviews = async (req, res) => {
  try {
    const { q, cuisine, area, diningStyle, sort } = req.query;
    const filter = { isRemoved: { $ne: true } };

    if (cuisine) filter.cuisine = Array.isArray(cuisine) ? { $in: cuisine } : cuisine;
    if (area) filter.area = Array.isArray(area) ? { $in: area } : area;
    if (diningStyle)
      filter.diningStyle = Array.isArray(diningStyle) ? { $in: diningStyle } : diningStyle;

    if (q && q.trim()) {
      const rx = new RegExp(q.trim(), "i");
      filter.$or = [
        { title: rx },
        { description: rx },
        { cuisine: rx },
        { area: rx },
        { diningStyle: rx },
        // tags is an array – use elemMatch for regex
        { tags: { $elemMatch: { $regex: rx } } },
      ];
    }

    let query = FoodReview.find(filter);
    switch (sort) {
      case "rating_desc":
        query = query.sort({ rating: -1, createdAt: -1 });
        break;
      case "rating_asc":
        query = query.sort({ rating: 1, createdAt: -1 });
        break;
      case "price_low":
        query = query.sort({ price: 1 });
        break;
      case "price_high":
        query = query.sort({ price: -1 });
        break;
      case "recent":
      default:
        query = query.sort({ createdAt: -1 });
    }

    const data = await query.exec();
    res.json(data);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

/* ----------------------------- Get by id ----------------------------- */
exports.getReviewById = async (req, res) => {
  try {
    const r = await FoodReview.findById(req.params.id);
    if (!r || r.isRemoved) return res.status(404).json({ message: "Review not found" });
    res.json(r);
  } catch (err) {
    console.error("Error fetching review:", err);
    res.status(500).json({ message: "Failed to fetch review" });
  }
};

/* ----------------------------- Update (author only) ----------------------------- */
exports.updateReview = async (req, res) => {
  try {
    const r = await FoodReview.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Review not found" });

    const uid = getUid(req);
    const hasRealAuthor = r.authorId && r.authorId !== "anonymous";

    if (hasRealAuthor && (!uid || String(r.authorId) !== String(uid))) {
      return res.status(403).json({ message: "Only the author can update this post" });
    }

    const allowed = [
      "title",
      "description",
      "rating",
      "cuisine",
      "area",
      "diningStyle",
      "price",
      "imageUrl",
      "tags",
      "visitDate",
    ];
    for (const k of allowed) if (k in req.body) r[k] = req.body[k];

    await r.save();
    res.json(r);
  } catch (err) {
    console.error("Error updating review:", err);
    res.status(500).json({ message: "Failed to update review" });
  }
};

/* ----------------------------- Delete (author only) ----------------------------- */
exports.deleteReview = async (req, res) => {
  try {
    const r = await FoodReview.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Review not found" });

    const uid = getUid(req);
    const hasRealAuthor = r.authorId && r.authorId !== "anonymous";

    if (hasRealAuthor && (!uid || String(r.authorId) !== String(uid))) {
      return res.status(403).json({ message: "Only the author can delete this post" });
    }

    await r.deleteOne();
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ message: "Failed to delete review" });
  }
};

/* ----------------------------- Like / Dislike ----------------------------- */
exports.toggleLike = async (req, res) => {
  try {
    const uid = getUid(req);
    if (!uid) return res.status(400).json({ message: "Missing user id" });

    // Use lean to avoid Mongoose doc validation/virtuals
    const review = await FoodReview.findById(req.params.id).lean();
    if (!review || review.isRemoved) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Normalize legacy shapes (string/null -> [])
    const likedByArr = Array.isArray(review.likedBy)
      ? [...review.likedBy]
      : (review.likedBy ? [String(review.likedBy)] : []);
    const dislikedByArr = Array.isArray(review.dislikedBy)
      ? [...review.dislikedBy]
      : (review.dislikedBy ? [String(review.dislikedBy)] : []);

    const hasLiked = likedByArr.includes(uid);
    const hasDisliked = dislikedByArr.includes(uid);

    if (hasLiked) {
      // remove like
      const idx = likedByArr.indexOf(uid);
      if (idx >= 0) likedByArr.splice(idx, 1);
    } else {
      // add like and ensure dislike removed
      if (!likedByArr.includes(uid)) likedByArr.push(uid);
      const di = dislikedByArr.indexOf(uid);
      if (di >= 0) dislikedByArr.splice(di, 1);
    }

    const likesCount = likedByArr.length;
    const dislikesCount = dislikedByArr.length;

    const updated = await FoodReview.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          likedBy: likedByArr,
          dislikedBy: dislikedByArr,
          likes: likesCount,
          dislikes: dislikesCount,
        },
      },
      { new: true, runValidators: false }
    );

    if (!updated) return res.status(404).json({ message: "Review not found" });

    res.json({
      liked: !hasLiked,
      likesCount,
      disliked: false,
      dislikesCount,
    });
  } catch (err) {
    console.error("Error toggling like:", err && (err.stack || err));
    res.status(500).json({ message: "Failed to toggle like" });
  }
};

exports.toggleDislike = async (req, res) => {
  try {
    const uid = getUid(req);
    if (!uid) return res.status(400).json({ message: "Missing user id" });

    const review = await FoodReview.findById(req.params.id).lean();
    if (!review || review.isRemoved) {
      return res.status(404).json({ message: "Review not found" });
    }

    const likedByArr = Array.isArray(review.likedBy)
      ? [...review.likedBy]
      : (review.likedBy ? [String(review.likedBy)] : []);
    const dislikedByArr = Array.isArray(review.dislikedBy)
      ? [...review.dislikedBy]
      : (review.dislikedBy ? [String(review.dislikedBy)] : []);

    const hasLiked = likedByArr.includes(uid);
    const hasDisliked = dislikedByArr.includes(uid);

    if (hasDisliked) {
      const idx = dislikedByArr.indexOf(uid);
      if (idx >= 0) dislikedByArr.splice(idx, 1);
    } else {
      if (!dislikedByArr.includes(uid)) dislikedByArr.push(uid);
      const li = likedByArr.indexOf(uid);
      if (li >= 0) likedByArr.splice(li, 1);
    }

    const likesCount = likedByArr.length;
    const dislikesCount = dislikedByArr.length;

    const updated = await FoodReview.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          likedBy: likedByArr,
          dislikedBy: dislikedByArr,
          likes: likesCount,
          dislikes: dislikesCount,
        },
      },
      { new: true, runValidators: false }
    );

    if (!updated) return res.status(404).json({ message: "Review not found" });

    res.json({
      disliked: !hasDisliked,
      dislikesCount,
      liked: false,
      likesCount,
    });
  } catch (err) {
    console.error("Error toggling dislike:", err && (err.stack || err));
    res.status(500).json({ message: "Failed to toggle dislike" });
  }
};

/* ----------------------------- Report ----------------------------- */
exports.reportReview = async (req, res) => {
  try {
    const uid = getUid(req);
    const { reason } = req.body || {};
    if (!uid) return res.status(400).json({ message: "Missing user id" });
    if (!reason) return res.status(400).json({ message: "Reason is required" });

    const r = await FoodReview.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Review not found" });

    // Normalize reports to an array
    const reportsArray = Array.isArray(r.reports) ? r.reports : [];
    
    // Check if user already reported
    if (reportsArray.find((rep) => rep.userId === uid)) {
      return res.status(409).json({ message: "You already reported this post" });
    }

    reportsArray.push({ userId: uid, reason, createdAt: new Date() });
    r.reports = reportsArray;
    
    await r.save({ validateBeforeSave: false });

    res.json({ reportsCount: reportsArray.length, removed: r.isRemoved });
  } catch (err) {
    console.error("Error reporting review:", err);
    res.status(500).json({ message: "Failed to report review" });
  }
};

/* ----------------------------- Comments ----------------------------- */
exports.listComments = async (req, res) => {
  try {
    const r = await FoodReview.findById(req.params.id).select("comments");
    if (!r) return res.status(404).json({ message: "Review not found" });

    const commentsArray = Array.isArray(r.comments) ? r.comments : [];
    const comments = [...commentsArray].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(comments);
  } catch (err) {
    console.error("Error listing comments:", err);
    res.status(500).json({ message: "Failed to list comments" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const uid = getUid(req) || "anonymous";
    const { text, name } = req.body || {};
    const body = (text || "").trim();
    if (!body) return res.status(400).json({ message: "Text required" });

    const r = await FoodReview.findById(req.params.id);
    if (!r || r.isRemoved) return res.status(404).json({ message: "Review not found" });

    // Ensure comments array exists
    if (!Array.isArray(r.comments)) {
      r.comments = [];
    }

    const newComment = {
      text: body,
      author: uid,
      createdAt: new Date(),
      ...(name && { authorName: String(name).slice(0, 60) }),
    };

    r.comments.push(newComment);

    await r.save({ validateBeforeSave: false });
    res.status(201).json(r.comments[r.comments.length - 1]);
  } catch (err) {
    console.error("Error adding comment:", err && (err.stack || err));
    res.status(500).json({ message: "Failed to add comment" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const uid = getUid(req);
    const { id, commentId } = req.params;

    const r = await FoodReview.findById(id);
    if (!r) return res.status(404).json({ message: "Review not found" });

    const c = r.comments.id(commentId);
    if (!c) return res.status(404).json({ message: "Comment not found" });

    if (!uid || String(c.author) !== String(uid)) {
      return res.status(403).json({ message: "Only the author can delete this comment" });
    }

    c.deleteOne();
    await r.save();
    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};
