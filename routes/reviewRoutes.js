import { Router } from "express";
import { list, create, like, dislike, addComment } from "../controllers/reviewController.js";

const router = Router();

router.get("/", list);
router.post("/", create);
router.post("/:id/like", like);
router.post("/:id/dislike", dislike);
router.post("/:id/comments", addComment);

export default router;
