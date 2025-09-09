import Review from "../models/Review.js";

/** GET /api/foodreviews */
export const list = async (req, res) => {
  try {
    // filters & sort
    const {
      q = "",
      cuisine = "",
      area = "",
      diningStyle = "",
      sort = "rating_desc",
      page = 1,
      pageSize = 12
    } = req.query;

    const query = {};
    if (q) query.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { cuisine: { $regex: q, $options: "i" } }
    ];
    if (cuisine) query.cuisine = cuisine;
    if (area) query.area = area;
    if (diningStyle) query.diningStyle = diningStyle;

    const sortMap = {
      rating_desc: { rating: -1, createdAt: -1 },
      rating_asc: { rating: 1, createdAt: -1 },
      recent: { createdAt: -1 },
      price_low: { price: 1 },
      price_high: { price: -1 }
    };

    const skip = (Number(page) - 1) * Number(pageSize);
    const [items, total] = await Promise.all([
      Review.find(query).sort(sortMap[sort] || sortMap.recent).skip(skip).limit(Number(pageSize)),
      Review.countDocuments(query)
    ]);

    res.json({ items, total });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/** POST /api/foodreviews */
export const create = async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/** POST /api/foodreviews/:id/like */
export const like = async (req, res) => {
  const { id } = req.params;
  const updated = await Review.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    { new: true }
  );
  res.json(updated);
};

/** POST /api/foodreviews/:id/dislike */
export const dislike = async (req, res) => {
  const { id } = req.params;
  const updated = await Review.findByIdAndUpdate(
    id,
    { $inc: { dislikes: 1 } },
    { new: true }
  );
  res.json(updated);
};

/** POST /api/foodreviews/:id/comments */
export const addComment = async (req, res) => {
  const { id } = req.params;
  const { author = "Anonymous", text } = req.body;
  if (!text) return res.status(400).json({ message: "Comment text required" });

  const updated = await Review.findByIdAndUpdate(
    id,
    {
      $push: { comments: { author, text, createdAt: new Date() } }
    },
    { new: true }
  );
  res.json(updated);
};
