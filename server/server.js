const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));
app.use('/api/parent', require('./routes/parent'));
app.use('/api/books', require('./routes/books'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/subjects', require('./routes/subjects'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', school: 'Usman Online School', version: '1.0.0' });
});

// Serve frontend in production (Monorepo setup)
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use('/online_school', express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err instanceof require('multer').MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  res.status(500).json({ error: 'Internal server error.' });
});

// Start
async function start() {
  try {
    await sequelize.sync();
    console.log('✅ Database connected');
    
    app.listen(PORT, () => {
      console.log(`\n🏫 Usman Online School Server running on http://localhost:${PORT}`);
      console.log(`📚 API: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  }
}

start();
