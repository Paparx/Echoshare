import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper to upload to Cloudinary
const uploadToCloudinary = async (base64Image) => {
  if (!base64Image || !base64Image.startsWith('data:image')) return base64Image;
  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: 'ecoshare_colony'
    });
    return uploadResponse.secure_url;
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return base64Image; // Fallback to base64 if upload fails
  }
};

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Postgres Connection
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

// Database Initialization
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        flat_number TEXT,
        role TEXT DEFAULT 'user',
        badges TEXT[] DEFAULT '{}',
        avatar TEXT,
        points INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        type TEXT,
        available BOOLEAN DEFAULT TRUE,
        owner_id INTEGER REFERENCES users(id),
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TIMESTAMP WITH TIME ZONE,
        location TEXT,
        created_by INTEGER REFERENCES users(id),
        participants INTEGER[] DEFAULT '{}',
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cleanup_places (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        posted_by INTEGER REFERENCES users(id),
        status TEXT DEFAULT 'pending',
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

initDb();

// --- Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
app.post('/api/register', async (req, res) => {
  const { name, email, password, flatNumber } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, flat_number) VALUES ($1, $2, $3, $4) RETURNING id, name, email, flat_number, role, badges, points, avatar',
      [name, email, hashedPassword, flatNumber]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...userWithoutPassword } = user;
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
      res.json({ user: userWithoutPassword, token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  let { name, email, flat_number, avatar } = req.body;
  try {
    if (avatar && avatar.startsWith('data:image')) {
      avatar = await uploadToCloudinary(avatar);
    }
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), flat_number = COALESCE($3, flat_number), avatar = COALESCE($4, avatar) WHERE id = $5 RETURNING *',
      [name, email, flat_number, avatar, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Item Routes ---
app.get('/api/items', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT items.*, users.name as owner_name, users.email as owner_email 
      FROM items 
      JOIN users ON items.owner_id = users.id 
      ORDER BY items.updated_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items', authenticateToken, async (req, res) => {
  let { title, description, category, type, imageUrl } = req.body;
  try {
    if (imageUrl && imageUrl.startsWith('data:image')) {
      imageUrl = await uploadToCloudinary(imageUrl);
    }
    const result = await pool.query(
      'INSERT INTO items (title, description, category, type, owner_id, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, category, type, req.user.id, imageUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/items/:id', authenticateToken, async (req, res) => {
  let { available, title, description, category, type, imageUrl } = req.body;
  try {
    const oldItemResult = await pool.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
    const oldItem = oldItemResult.rows[0];
    if (!oldItem) return res.status(404).json({ error: 'Item not found' });

    if (imageUrl && imageUrl.startsWith('data:image')) {
      imageUrl = await uploadToCloudinary(imageUrl);
    }
    
    const result = await pool.query(
      'UPDATE items SET available = COALESCE($1, available), title = COALESCE($2, title), description = COALESCE($3, description), category = COALESCE($4, category), type = COALESCE($5, type), image_url = COALESCE($6, image_url), updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [available, title, description, category, type, imageUrl, req.params.id]
    );

    // Award points if borrowed
    if (available === false && oldItem.available === true) {
      await pool.query('UPDATE users SET points = points + 10 WHERE id = $1', [oldItem.owner_id]);
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const itemResult = await pool.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
    const item = itemResult.rows[0];
    if (req.user.role !== 'admin' && item.owner_id !== req.user.id) return res.sendStatus(403);
    
    if (!item.available) {
       await pool.query('UPDATE users SET points = points - 10 WHERE id = $1', [item.owner_id]);
    }
    
    await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Event Routes ---
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT events.*, users.name as creator_name 
      FROM events 
      JOIN users ON events.created_by = users.id 
      ORDER BY events.updated_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', authenticateToken, async (req, res) => {
  let { title, description, date, location, imageUrl } = req.body;
  try {
    if (imageUrl && imageUrl.startsWith('data:image')) {
      imageUrl = await uploadToCloudinary(imageUrl);
    }
    const result = await pool.query(
      'INSERT INTO events (title, description, date, location, created_by, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, date, location, req.user.id, imageUrl]
    );
    await pool.query('UPDATE users SET points = points + 30 WHERE id = $1', [req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events/:id/join', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE events SET participants = array_append(participants, $1) WHERE id = $2', [req.user.id, req.params.id]);
    await pool.query('UPDATE users SET points = points + 20 WHERE id = $1', [req.user.id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/events/:id', authenticateToken, async (req, res) => {
  let { title, description, date, location, imageUrl } = req.body;
  try {
    if (imageUrl && imageUrl.startsWith('data:image')) {
      imageUrl = await uploadToCloudinary(imageUrl);
    }
    const result = await pool.query(
      'UPDATE events SET title = COALESCE($1, title), description = COALESCE($2, description), date = COALESCE($3, date), location = COALESCE($4, location), image_url = COALESCE($5, image_url), updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [title, description, date, location, imageUrl, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    const event = result.rows[0];
    if (req.user.role !== 'admin' && event.created_by !== req.user.id) return res.sendStatus(403);
    
    await pool.query('UPDATE users SET points = points - 30 WHERE id = $1', [event.created_by]);
    await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cleanup/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cleanup_places WHERE id = $1', [req.params.id]);
    const place = result.rows[0];
    if (req.user.role !== 'admin' && place.posted_by !== req.user.id) return res.sendStatus(403);
    
    if (place.status === 'completed') {
      await pool.query('UPDATE users SET points = points - 20 WHERE id = $1', [place.posted_by]);
    }
    
    await pool.query('DELETE FROM cleanup_places WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Cleanup Routes ---
app.get('/api/cleanup', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cleanup_places.*, users.name as poster_name 
      FROM cleanup_places 
      JOIN users ON cleanup_places.posted_by = users.id 
      ORDER BY cleanup_places.updated_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cleanup', authenticateToken, async (req, res) => {
  let { title, description, location, imageUrl } = req.body;
  try {
    if (imageUrl && imageUrl.startsWith('data:image')) {
      imageUrl = await uploadToCloudinary(imageUrl);
    }
    const result = await pool.query(
      'INSERT INTO cleanup_places (title, description, location, posted_by, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, location, req.user.id, imageUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cleanup/:id/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { status } = req.body;
  try {
    const oldPlaceResult = await pool.query('SELECT * FROM cleanup_places WHERE id = $1', [req.params.id]);
    const oldPlace = oldPlaceResult.rows[0];
    
    await pool.query('UPDATE cleanup_places SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, req.params.id]);
    
    if (status === 'completed' && oldPlace.status !== 'completed') {
      await pool.query('UPDATE users SET points = points + 20 WHERE id = $1', [oldPlace.posted_by]);
    }
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Dashboard & Leaderboard ---
app.get('/api/stats', async (req, res) => {
  try {
    const items = await pool.query('SELECT count(*) FROM items');
    const events = await pool.query('SELECT count(*) FROM events');
    const cleanup = await pool.query('SELECT count(*) FROM cleanup_places');
    const borrows = await pool.query("SELECT count(*) FROM items WHERE available = FALSE");
    
    res.json({
      totalItemsShared: parseInt(items.rows[0].count),
      totalEventsOrganized: parseInt(events.rows[0].count),
      totalCleanupReports: parseInt(cleanup.rows[0].count),
      totalBorrowActions: parseInt(borrows.rows[0].count),
      co2Saved: parseInt(borrows.rows[0].count) * 0.5,
      wasteReduced: parseInt(items.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query('SELECT name, points FROM users WHERE role != \'admin\' ORDER BY points DESC LIMIT 5');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Static Hosting
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
