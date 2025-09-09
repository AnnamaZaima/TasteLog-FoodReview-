import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: { type: String, trim: true, default: "Anonymous" },
    text: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
