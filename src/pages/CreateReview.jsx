// client/src/pages/CreateReview.jsx
import React, { useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import "../styles/CreateReview.css";
import { useToast } from "../components/ToastProvider";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const CUISINES = [
  "Bangladeshi","Indian","Chinese","Thai","Italian","Continental",
  "Fast Food","Desserts","Seafood","BBQ","Mexican","Japanese","Korean","Arabic"
];
const AREAS = [
  "Dhanmondi","Gulshan","Banani","Uttara","Mirpur","Wari","Old Dhaka","Motijheel",
  "Elephant Road","New Market","Bashundhara","Baridhara","Lalmatia","Mohammadpur",
  "Tejgaon","Panthapath","Bailey Road","Shyamoli"
];
const DINING = [
  "Fine Dining","Casual Dining","Street Food","Fast Food","Cafe","Buffet","Events & Catering"
];

export default function CreateReview() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    rating: 0,
    cuisine: "",
    area: "",
    diningStyle: "",
    price: "",
    author: "",
    imageUrl: "",
    tagInput: "",
    tags: [],
    visitDate: "" // optional
  });

  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [err, setErr] = useState("");
  const [files, setFiles] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // base64 previews

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const addTag = () => {
    const t = form.tagInput.trim();
    if (!t || form.tags.includes(t)) return;
    setForm((p) => ({ ...p, tags: [...p.tags, t], tagInput: "" }));
  };

  const removeTag = (t) =>
    setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));

  // Validation: only Image URL, Tags and Date are optional
  const validity = useMemo(() => {
    const titleOk = form.title.trim().length >= 3;
    const descOk  = form.description.trim().length >= 20;
    const starsOk = Number(form.rating) >= 1;
    const cuisineOk = !!form.cuisine;
    const areaOk = !!form.area;
    const diningOk = !!form.diningStyle;
    const priceOk = form.price.trim().length > 0; // string accepted ($, $$, 500, etc.)
    const allOk =
      titleOk && descOk && starsOk && cuisineOk && areaOk && diningOk && priceOk;
    return { titleOk, descOk, starsOk, cuisineOk, areaOk, diningOk, priceOk, allOk };
  }, [form]);

  const submit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    if (submitting || !validity.allOk) {
      if (!validity.allOk) {
        toast?.error("Please complete all required fields.");
      }
      return;
    }

    setErr("");
    try {
      setSubmitting(true);
      // Convert selected files to base64 strings (light validation)
      const toBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      const images = [];
      for (const f of files) {
        // limit each file to ~1.5MB to fit API limit comfortably
        if (f.size > 1.5 * 1024 * 1024) {
          toast?.error(`${f.name} is larger than 1.5MB`);
          setSubmitting(false);
          return;
        }
        // Only images
        if (!f.type.startsWith("image/")) continue;
        // eslint-disable-next-line no-await-in-loop
        const b64 = await toBase64(f);
        images.push(String(b64));
      }

      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        price: form.price.trim(),
        author: form.author.trim(),
        rating: Number(form.rating),
        ...(images.length ? { images } : {}),
        ...(form.visitDate ? { visitDate: new Date(form.visitDate).toISOString() } : {})
      };
      delete payload.tagInput; // do not send the temporary tag text

      await axios.post(`${API_BASE}/api/foodreviews`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      toast?.success("Review created!");
      navigate("/");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create review.";
      setErr(msg);
      toast?.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // convenience for showing red outline only after first submit attempt
  const invalidClass = (ok) => (attempted && !ok ? " invalid" : "");

  return (
    <div className="create-review-page">
      <div className="cr-card">
        <div className="cr-header">
          <h2 className="cr-title">Create Food Review</h2>
          <Link to="/" aria-label="Close" className="close-x">×</Link>
        </div>

        <form onSubmit={submit} className="cr-content" noValidate>
          <div className={"form-group" + invalidClass(validity.titleOk)}>
            <label>Title <span className="req">*</span></label>
            <input
              className={"cr-input" + invalidClass(validity.titleOk)}
              type="text"
              placeholder="Amazing Biriyani at…"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              aria-invalid={attempted && !validity.titleOk}
            />
            {attempted && !validity.titleOk && (
              <small className="field-hint">Min 3 characters</small>
            )}
          </div>

          <div className={"form-group" + invalidClass(validity.descOk)}>
            <label>Description <span className="req">*</span></label>
            <textarea
              className={"cr-textarea" + invalidClass(validity.descOk)}
              placeholder="Describe your experience..."
              rows={6}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              aria-invalid={attempted && !validity.descOk}
            />
            {attempted && !validity.descOk && (
              <small className="field-hint">Min 20 characters</small>
            )}
          </div>

      <div className={"form-group" + invalidClass(validity.starsOk)}>
            <label>Rating <span className="req">*</span></label>
    <div className="cr-stars" role="radiogroup" aria-label="Select rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
      className={`cr-star ${form.rating >= n ? "active" : ""}`}
                  onClick={() => setField("rating", n)}
                >
                  ★
                </button>
              ))}
      <span className="cr-hint">Select rating</span>
            </div>
            {attempted && !validity.starsOk && (
              <small className="field-hint">Please select at least 1 star</small>
            )}
          </div>

      <div className="cr-row">
            <div className={"form-group" + invalidClass(validity.cuisineOk)}>
              <label>Cuisine <span className="req">*</span></label>
              <select
        className={"cr-select" + invalidClass(validity.cuisineOk)}
                value={form.cuisine}
                onChange={(e) => setField("cuisine", e.target.value)}
                aria-invalid={attempted && !validity.cuisineOk}
              >
                <option value="">Select cuisine</option>
                {CUISINES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className={"form-group" + invalidClass(validity.areaOk)}>
              <label>Area <span className="req">*</span></label>
              <select
        className={"cr-select" + invalidClass(validity.areaOk)}
                value={form.area}
                onChange={(e) => setField("area", e.target.value)}
                aria-invalid={attempted && !validity.areaOk}
              >
                <option value="">Select area</option>
                {AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

      <div className="cr-row">
            <div className={"form-group" + invalidClass(validity.diningOk)}>
              <label>Dining Style <span className="req">*</span></label>
              <select
        className={"cr-select" + invalidClass(validity.diningOk)}
                value={form.diningStyle}
                onChange={(e) => setField("diningStyle", e.target.value)}
                aria-invalid={attempted && !validity.diningOk}
              >
                <option value="">Select style</option>
                {DINING.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className={"form-group" + invalidClass(validity.priceOk)}>
              <label>Price <span className="req">*</span></label>
              <input
        className={"cr-input" + invalidClass(validity.priceOk)}
                placeholder="$, $$, $$$ or e.g. 500"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                aria-invalid={attempted && !validity.priceOk}
              />
              {attempted && !validity.priceOk && (
                <small className="field-hint">Please provide a price indicator</small>
              )}
            </div>
          </div>

          {/* Date is optional */}
      <div className="cr-row">
            <div className="form-group">
              <label>Date <span className="muted">(optional)</span></label>
              <input
        className="cr-input"
                type="date"
                value={form.visitDate}
                onChange={(e) => setField("visitDate", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Your Name <span className="muted">(optional)</span></label>
            <input
              className="cr-input"
              placeholder="Your name"
              value={form.author}
              onChange={(e) => setField("author", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Photos <span className="muted">(add from your device)</span></label>
            <div className="cr-uploader">
              <div className="row">
                <label htmlFor="file-input" className="cr-upload-label" role="button">
                  📷 Choose Photos
                </label>
                <span className="cr-upload-note">Up to 6 images, each ≤ 1.5MB</span>
              </div>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const list = Array.from(e.target.files || []);
                  const next = [...files, ...list].slice(0, 6);
                  setFiles(next);
                  // generate previews
                  Promise.all(next.map((f) => {
                    return new Promise((resolve) => {
                      const r = new FileReader();
                      r.onload = () => resolve(r.result);
                      r.readAsDataURL(f);
                    });
                  })).then((arr) => setPreviews(arr));
                }}
              />
              {previews.length > 0 && (
                <div className="cr-preview">
                  {previews.map((src, idx) => (
                    <div className="cr-thumb" key={idx}>
                      <img src={src} alt={`preview-${idx}`} />
                      <button
                        type="button"
                        className="cr-remove"
                        onClick={() => {
                          const nf = files.slice();
                          nf.splice(idx, 1);
                          setFiles(nf);
                          const np = previews.slice();
                          np.splice(idx, 1);
                          setPreviews(np);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Image URL <span className="muted">(optional)</span></label>
            <input
              className="cr-input"
              placeholder="https://example.com/image.jpg"
              value={form.imageUrl}
              onChange={(e) => setField("imageUrl", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Tags <span className="muted">(optional)</span></label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input"
                placeholder="Add a tag…"
                value={form.tagInput}
                onChange={(e) => setField("tagInput", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <button
                type="button"
                className="btn"
                onClick={addTag}
                disabled={!form.tagInput.trim()}
              >
                Add
              </button>
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {form.tags.map((t) => (
                <span
                  key={t}
                  className="pill selected"
                  onClick={() => removeTag(t)}
                  title="Remove tag"
                  role="button"
                >
                  {t} ×
                </span>
              ))}
            </div>
          </div>

          {err && (
            <div className="state state-error" role="alert">
              ⚠️ {err}
            </div>
          )}

          <div className="cr-actions">
            <Link className="cr-btn light" to="/">Cancel</Link>
            <button className="cr-btn primary" type="submit" disabled={!validity.allOk || submitting}>
              {submitting ? "Submitting…" : "Create Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
