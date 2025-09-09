import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  toggleLike,
  toggleDislike,
  reportReview,
  deleteReview as apiDeleteReview,
} from "../services/foodReviewService";
import Comments from "./Comments";
import { useToast } from "./ToastProvider";
import { useAuth } from '../contexts/AuthContext';

/** Same uid as the one sent in X-User-Id header (see service) */
function getUid() {
  let uid = localStorage.getItem("uid");
  if (!uid) {
    uid =
      (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("uid", uid);
  }
  return uid;
}

export default function ReviewCard({ review, onUpdated }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false); // NEW

  const me = useMemo(() => getUid(), []);
  const { user, isAdmin } = useAuth();

  // initialize count from incoming data
  useEffect(() => {
    setCommentCount(Array.isArray(review?.comments) ? review.comments.length : 0);
  }, [review?.comments]);

  /** Author / delete rule must match server:
   *  - If review.authorId is missing/empty/anonymous -> allow delete (legacy posts)
   *  - If review.authorId exists -> only the same uid can delete
   */
  const rawAuthorId = typeof review?.authorId === "string" ? review.authorId.trim() : "";
  const hasAuthor = rawAuthorId.length > 0 && rawAuthorId !== "anonymous";
  // Only admins can delete posts now
  const canDelete = !!isAdmin;

  /* ---------- Like / Dislike ---------- */
  const onLike = async () => {
    try {
      setBusy(true);
      const res = await toggleLike(review._id);
      toast.success(res?.liked ? "You liked this review!" : "Like removed");
      onUpdated?.();
    } catch (e) {
      console.error("like error:", e);
      toast.error(e?.response?.data?.message || "Failed to toggle like.");
    } finally {
      setBusy(false);
    }
  };

  const onDislike = async () => {
    try {
      setBusy(true);
      const res = await toggleDislike(review._id);
      toast.info(res?.disliked ? "You disliked this review." : "Dislike removed");
      onUpdated?.();
    } catch (e) {
      console.error("dislike error:", e);
      toast.error(e?.response?.data?.message || "Failed to toggle dislike.");
    } finally {
      setBusy(false);
    }
  };

  /* ---------- Delete (2-step confirm, no window.confirm) ---------- */
  const onDelete = async () => {
    if (!canDelete) {
      toast.error("Only the author can delete this post.");
      return;
    }
    try {
      setBusy(true);
      await apiDeleteReview(review._id); // service sends X-User-Id
      toast.success("Post deleted");
      onUpdated?.();
    } catch (e) {
      console.error("delete error:", e);
      toast.error(e?.response?.data?.message || "Failed to delete post.");
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  /* ---------- Report ---------- */
  const onReport = async () => {
    try {
      setBusy(true);
      const res = await reportReview(review._id, reportReason);
      if (res?.removed) {
        toast.info("This post was auto-removed after multiple reports.");
        onUpdated?.();
      } else {
        toast.info("Report submitted. Thank you!");
      }
      setReportOpen(false);
    } catch (e) {
      console.error("report error:", e);
      toast.error(e?.response?.data?.message || "Failed to report review.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="review-card">
      {/* Clickable header section for navigation to detailed view */}
      <Link to={`/post/${review._id}`} className="review-card-header" style={{ 
        textDecoration: 'none', 
        color: 'inherit',
        display: 'block',
        cursor: 'pointer'
      }}>
        {review.imageUrl && (
          <img
            src={review.imageUrl}
            alt={review.title || "Review image"}
            style={{ width: "100%", borderRadius: 8, marginBottom: 12, objectFit: "cover", maxHeight: 160 }}
            loading="lazy"
          />
        )}

        <h3 style={{ margin: '0 0 8px 0', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => e.target.style.color = '#667eea'}
            onMouseLeave={(e) => e.target.style.color = 'inherit'}>
          {review.title || "Untitled"}
        </h3>

        {review.visitDate && (
          <p className="visit-date">Visited: {new Date(review.visitDate).toLocaleDateString()}</p>
        )}

        <p className="muted">
          {[review.cuisine, review.area, review.diningStyle].filter(Boolean).join(" • ")}
        </p>

        {review.description && <p>{review.description}</p>}
        <p className="rating">⭐ {review.rating ?? "—"}</p>
      </Link>

      <div className="actions" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 6 }}>
        <button className="btn" disabled={busy} onClick={onLike} aria-label="Like">
          👍 {review.likes ?? 0}
        </button>

        <button className="btn btn-light" disabled={busy} onClick={onDislike} aria-label="Dislike">
          👎 {review.dislikes ?? 0}
        </button>

        <button
          className="btn btn-light"
          disabled={busy}
          onClick={() => setShowComments((v) => !v)}
          aria-expanded={showComments}
          title={showComments ? "Hide comments" : "Show comments"}
        >
          💬 Comments ({commentCount})
        </button>

        <div style={{ position: "relative" }}>
          <button
            className="btn btn-light"
            type="button"
            disabled={busy}
            onClick={() => setReportOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={reportOpen}
            title="Report this post"
          >
            🚩 Report
          </button>

          {reportOpen && (
            <div
              role="menu"
              style={{
                position: "absolute",
                top: "110%",
                left: 0,
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 8,
                boxShadow: "0 10px 20px rgba(0,0,0,.08)",
                padding: 12,
                width: 230,
                zIndex: 10,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Report reason</div>
              <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
                {[
                  { key: "spam", label: "Spam" },
                  { key: "abusive", label: "Abusive / Offensive" },
                  { key: "off-topic", label: "Off-topic" },
                  { key: "plagiarism", label: "Plagiarism" },
                  { key: "advertising", label: "Advertising" },
                  { key: "other", label: "Other" },
                ].map((opt) => (
                  <label key={opt.key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="radio"
                      name={`report-${review._id}`}
                      value={opt.key}
                      checked={reportReason === opt.key}
                      onChange={() => setReportReason(opt.key)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-light" onClick={() => setReportOpen(false)} disabled={busy}>
                  Cancel
                </button>
                <button type="button" className="btn" onClick={onReport} disabled={busy}>
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>

        {canDelete && (
          !confirmDelete ? (
            <button
              className="btn btn-light"
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
              title="Delete this post"
            >
              🗑️ Delete
            </button>
          ) : (
            <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              <button className="btn" onClick={onDelete} disabled={busy} title="Confirm delete">
                Confirm
              </button>
              <button className="btn btn-light" onClick={() => setConfirmDelete(false)} disabled={busy} title="Cancel">
                Cancel
              </button>
            </span>
          )
        )}
      </div>

      {showComments && (
        <Comments
          reviewId={review._id}
          onCountChange={setCommentCount}
        />
      )}
    </article>
  );
}
