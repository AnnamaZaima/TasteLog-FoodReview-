import React from 'react';
import CreateReview from "../pages/CreateReview";

const CreateReviewPage = () => {
  // Handle adding a new review (you can send this to your backend or manage in state)
  const handleAddReview = (newReview) => {
    console.log('New review added:', newReview);
    // For example, you can send the review data to your API or update the reviews list.
  };

  return (
    <div>
      <h1>Create a New Review</h1>
      <CreateReview onAddReview={handleAddReview} /> {/* Pass handler to CreateReview */}
    </div>
  );
};

export default CreateReviewPage;
