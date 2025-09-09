// client/src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import '../styles/Layout.css';

export default function Layout({ className = '' }) {
  return (
    <div className="app-layout">
      <Navigation />
      <main className={`main-content ${className}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
