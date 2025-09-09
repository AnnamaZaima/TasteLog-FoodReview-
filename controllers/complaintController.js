// server/controllers/complaintController.js
const { validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');


exports.createComplaint = async (req, res) => {
try {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({ errors: errors.array() });
}

const uid = req.userId || req.header('X-User-Id') || 'anonymous';
const complaint = await Complaint.create({
...req.body,
userId: uid, // Add userId for ownership
});
res.status(201).json(complaint);
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Failed to create complaint' });
}
};


exports.getComplaints = async (req, res) => {
try {
const { q, status } = req.query;
const filter = {};

const uid = req.userId || req.header('X-User-Id');
// If not admin, only show user's own complaints
if (!req.user?.role?.includes('admin')) {
filter.userId = uid;
}

if (status) filter.status = status;
if (q) {
filter.$or = [
{ restaurantName: new RegExp(q, 'i') },
{ itemName: new RegExp(q, 'i') },
{ title: new RegExp(q, 'i') },
{ description: new RegExp(q, 'i') },
{ userName: new RegExp(q, 'i') },
];
}

const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
res.json(complaints);
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Failed to fetch complaints' });
}
};


exports.getComplaintById = async (req, res) => {
try {
const doc = await Complaint.findById(req.params.id);
if (!doc) return res.status(404).json({ message: 'Not found' });
res.json(doc);
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Failed to fetch complaint' });
}
};


exports.updateStatus = async (req, res) => {
try {
const { status } = req.body;
const doc = await Complaint.findByIdAndUpdate(
req.params.id,
{ status },
{ new: true }
);
if (!doc) return res.status(404).json({ message: 'Not found' });
res.json(doc);
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Failed to update status' });
}
};