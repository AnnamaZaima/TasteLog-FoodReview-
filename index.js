import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";

import App from "./components/App";
import CreateReviewPage from "./components/CreateReviewPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Restaurants from "./pages/Restaurants";
import CreateReview from "./pages/CreateReview";
import Complaints from "./pages/Complaints";
import CreateComplaint from "./pages/CreateComplaint";
import PostDetail from "./pages/PostDetail";
import reportWebVitals from "./reportWebVitals";

import { ToastProvider } from "./components/ToastProvider";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<App />} />
            {/* Direct post detail route so /post/:id matches when navigated directly */}
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/create-complaint" element={<CreateComplaint />} />
            <Route 
              path="/create-review" 
              element={
                <ProtectedRoute>
                  <CreateReviewPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-review-new" 
              element={
                <ProtectedRoute>
                  <CreateReview />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
