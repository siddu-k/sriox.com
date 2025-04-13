require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const path = require('path');
const { initializeDatabase } = require('./services/dbInit');

// Import routes
const authRoutes = require('./routes/auth');
const siteRoutes = require('./routes/sites');
const redirectRoutes = require('./routes/redirects');
const githubPagesRoutes = require('./routes/githubPages');
const userRoutes = require('./routes/users');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/sites', express.static(path.join(__dirname, '../data/sites')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/redirects', redirectRoutes);
app.use('/api/github-pages', githubPagesRoutes);
app.use('/api/users', userRoutes);

// Serve redirect pages
app.get('/:username', async (req, res) => {
  try {
    const redirectPath = path.join(__dirname, '../data/subpages', `${req.params.username}.html`);
    res.sendFile(redirectPath);
  } catch (error) {
    res.status(404).send('Redirect not found');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
async function startServer() {
  try {
    // Sync database
    await sequelize.sync({ alter: true });
    console.log('Database connected!');
    
    // Initialize database with required data
    await initializeDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();