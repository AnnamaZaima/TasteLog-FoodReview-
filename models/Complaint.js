// server/models/Complaint.js
const mongoose = require('mongoose');


const ComplaintSchema = new mongoose.Schema(
{
restaurantName: { type: String, required: true, trim: true },
itemName: { type: String, trim: true },
title: { type: String, required: true, trim: true },
description: { type: String, required: true, trim: true },
userName: { type: String, default: 'Anonymous', trim: true },
postId: { type: String, trim: true }, // Link to the review/post
status: {
type: String,
enum: ['open', 'in_review', 'resolved'],
default: 'open',
},
},
{ timestamps: true }
);


module.exports = mongoose.model('Complaint', ComplaintSchema);