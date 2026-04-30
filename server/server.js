const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Models
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  flatNumber: String,
  role: { type: String, default: 'user' },
  badges: [String]
});
const User = mongoose.model('User', UserSchema);

const ItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  type: String,
  available: { type: Boolean, default: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerName: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});
const Item = mongoose.model('Item', ItemSchema);

const EventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  location: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creatorName: String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});
const Event = mongoose.model('Event', EventSchema);

// Auth Middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('Access denied');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.post('/api/auth/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || user.password !== req.body.password) return res.status(400).send('Invalid credentials');
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
  res.send({ user, token });
});

app.get('/api/items', async (req, res) => {
  const items = await Item.find();
  res.send(items);
});

app.post('/api/items', auth, async (req, res) => {
  const item = new Item({ ...req.body, ownerId: req.user.id });
  await item.save();
  res.status(201).send(item);
});

app.delete('/api/items/:id', auth, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).send('Not found');
  if (req.user.role !== 'admin' && item.ownerId.toString() !== req.user.id) {
    return res.status(403).send('Forbidden');
  }
  await item.deleteOne();
  res.send({ message: 'Deleted' });
});

app.get('/api/events', async (req, res) => {
  const events = await Event.find();
  res.send(events);
});

app.post('/api/events/:id/join', auth, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event.participants.includes(req.user.id)) {
    event.participants.push(req.user.id);
    await event.save();
  }
  res.send(event);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
