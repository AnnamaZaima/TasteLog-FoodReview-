// src/components/Comments.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  listComments as apiListComments,
  addComment as apiAddComment,
  deleteComment as apiDeleteComment,
} from "../services/foodReviewService";
import { useToast } from "./ToastProvider";
import { useAuth } from "../contexts/AuthContext";

/** Same uid used in X-User-Id */
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

function getStoredName() {
  return localStorage.getItem("comment_name") || "";
}

export default function Comments({ reviewId, onCountChange }) {
  const toast = useToast();
  const { isAuthenticated, user } = useAuth();
  const me = useMemo(() => getUid(), []);
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  // If user isn't authenticated, default to anonymous to avoid exposing uid
  const [anonymous, setAnonymous] = useState(() => !isAuthenticated);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!reviewId) return;
    try {
      const data = await apiListComments(reviewId);
      const list = Array.isArray(data) ? data : [];
      setItems(list);
      onCountChange?.(list.length);
    } catch (e) {
      console.error("Failed to load comments:", e?.response?.data || e.message);
    }
  };

  useEffect(() => {
    load(); // initial + when reviewId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewId]);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    try {
      // Determine display name: use user's name unless posting as anonymous
      const displayNameRaw = !anonymous
        ? (user?.name || user?.fullName || user?.username || user?.email || "")
        : "Anonymous";
      const safeName = (displayNameRaw || "").trim().slice(0, 60);
      await apiAddComment(reviewId, body, safeName || undefined);
      setText("");
      await load();
      toast?.success("Comment added");
    } catch (e) {
      console.error(e);
      toast?.error(e?.response?.data?.message || "Failed to add comment");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (commentId) => {
    if (busy) return;
    if (!window.confirm("Delete this comment?")) return;
    setBusy(true);
    try {
      await apiDeleteComment(reviewId, commentId);
      await load();
    } catch (e) {
      console.error(e);
      toast?.error(e?.response?.data?.message || "Failed to delete comment");
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(e);
    }
  };

  return (
    <div className="comments" style={{ marginTop: 10 }}>
      <h5 style={{ margin: "6px 0" }}>Comments ({items.length})</h5>

      <form
        onSubmit={submit}
        className="comment-form"
        style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr auto" }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Write a comment…"
          aria-label="Write a comment"
        />
        <button className="btn" disabled={busy || !text.trim()} type="submit">
          Post
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontSize: 12, color: "#555" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
          />
          Post as Anonymous
        </label>
        {!anonymous && isAuthenticated && (
          <span style={{ opacity: 0.8 }}>
            Your name will appear as <strong>{user?.name || user?.fullName || user?.username || user?.email}</strong>
          </span>
        )}
        {!isAuthenticated && !anonymous && (
          <span style={{ color: "#b45309" }}>
            You are not signed in; posting name will fallback to Anonymous
          </span>
        )}
      </div>

      <ul
        className="comment-list"
        style={{ listStyle: "none", paddingLeft: 0, marginTop: 8 }}
      >
        {items.map((c) => {
          const isMine = c?.author && String(c.author) === String(me);
          return (
            <li
              key={c._id}
              style={{
                border: "1px solid #eee",
                borderRadius: 8,
                padding: "8px 10px",
                marginBottom: 6,
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  fontSize: 12,
                  color: "#777",
                }}
              >
                <strong style={{ color: "#555" }}>
                  {c.authorName ||
                    (c.author === "anonymous"
                      ? "Anonymous"
                      : (c.author || "").slice(0, 12))}
                </strong>
                <span>•</span>
                <span>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}</span>
                {isMine && (
                  <button
                    type="button"
                    className="btn btn-light"
                    style={{ marginLeft: "auto" }}
                    onClick={() => remove(c._id)}
                    disabled={busy}
                    aria-label="Delete your comment"
                    title="Delete your comment"
                  >
                    🗑
                  </button>
                )}
              </div>
              <div style={{ marginTop: 4 }}>{c.text}</div>
            </li>
          );
        })}
        {items.length === 0 && (
          <li style={{ color: "#888", fontSize: 14 }}>No comments yet.</li>
        )}
      </ul>
    </div>
  );
}
