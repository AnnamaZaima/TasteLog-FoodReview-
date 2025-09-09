import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Pages
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Restaurants from './pages/Restaurants';
import CreateReview from './pages/CreateReview';
import Complaints from './pages/Complaints';
import CreateComplaint from './pages/CreateComplaint';
import AdminDashboard from './pages/AdminDashboard';
import PostDetail from './pages/PostDetail';

// Components
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Auth routes are separate from the main layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main application layout */}
        <Route path="/" element={<Layout />}>
          {/* Child routes rendered within the Layout's <Outlet /> */}
          <Route index element={<Homepage />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="create-review" element={<CreateReview />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="create-complaint" element={<CreateComplaint />} />
          <Route path="post/:id" element={<PostDetail />} />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
