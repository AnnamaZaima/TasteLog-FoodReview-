const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

app.use(cors());
app.use(bodyParser.json());

let reviews = [];

app.get('/reviews', (req, res) => {
  const { cuisine, restaurant, area, search } = req.query;
  let filtered = reviews;

  if (cuisine) filtered = filtered.filter(r => r.tags.includes(cuisine));
  if (restaurant) filtered = filtered.filter(r => r.restaurant.toLowerCase().includes(restaurant.toLowerCase()));
  if (area) filtered = filtered.filter(r => r.area.toLowerCase().includes(area.toLowerCase()));
  if (search) filtered = filtered.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  res.json(filtered);
});

app.post('/reviews', (req, res) => {
  const review = { id: uuidv4(), ...req.body };
  reviews.push(review);
  res.status(201).json(review);
});

app.put('/reviews/:id', (req, res) => {
  const { id } = req.params;
  reviews = reviews.map(r => r.id === id ? { ...r, ...req.body } : r);
  res.json({ message: 'Updated' });
});

app.delete('/reviews/:id', (req, res) => {
  const { id } = req.params;
  reviews = reviews.filter(r => r.id !== id);
  res.json({ message: 'Deleted' });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
