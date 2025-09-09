// client/src/pages/Restaurants.jsx
import React, { useState, useEffect } from 'react';
import ReviewCard from '../components/ReviewCard';
import { getAllReviews } from '../services/foodReviewService';

export default function Restaurants() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await getAllReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <div>Loading restaurants...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>All Restaurants</h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        {reviews.map(review => (
          <ReviewCard key={review._id} review={review} onUpdated={loadReviews} />
        ))}
      </div>
    </div>
  );
}
