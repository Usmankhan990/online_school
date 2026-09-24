const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();

// Track server state for graceful termination
let isShuttingDown = false;

// Normalize URL for cPanel Passenger subdirectory
app.use((req, res, next) => {
  if (isShuttingDown) {
    res.set('Connection', 'close');
    return res.status(503).json({ error: 'Server is restarting, please retry in a moment.' });
  }
  if (req.url.startsWith('/online_school')) {
    req.url = req.url.replace('/online_school', '') || '/';
  }
  next();
});

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
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/jobs', require('./routes/jobs'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', school: 'Taleem Ghar', version: '1.0.0' });
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

// Server reference for lifecycle control
let server;

// Graceful Shutdown Handler for Passenger / Process Manager
const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  // Force exit safety timeout (5 seconds) so worker never hangs or becomes an orphan
  const forceExitTimeout = setTimeout(() => {
    console.error('⚠️ Graceful shutdown timed out (5s), forcing exit.');
    process.exit(1);
  }, 5000);
  forceExitTimeout.unref();

  try {
    if (server) {
      await new Promise((resolve) => {
        server.close((err) => {
          if (err) console.error('Error closing HTTP server:', err);
          else console.log('✅ HTTP server closed (no new connections accepted).');
          resolve();
        });
      });
    }

    // Close Sequelize DB connection pool
    try {
      await sequelize.close();
      console.log('✅ Database connections closed cleanly.');
    } catch (dbErr) {
      console.error('Error closing database connection:', dbErr);
    }

    console.log('👋 Process exiting cleanly.');
    clearTimeout(forceExitTimeout);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start
async function start() {
  try {
    // Authenticate database connection quickly without heavy sync/migrations
    await sequelize.authenticate();
    console.log('✅ Database connected and authenticated');
    
    // Only run migrations/sync if explicitly enabled via environment variable (e.g. initial setup)
    // In standard production, migrations are run separately via: npm run migrate
    if (process.env.AUTO_MIGRATE === 'true') {
      try {
        console.log('🔄 AUTO_MIGRATE enabled, running migrations...');
        const runMigrations = require('./scripts/runMigrations');
        await runMigrations();
      } catch (migErr) {
        console.error('Migration warning:', migErr.message);
      }
    }
    
    server = app.listen(PORT, () => {
      console.log(`\n🏫 Taleem Ghar Server running on http://localhost:${PORT}`);
      console.log(`📚 API: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  }
}

start();
