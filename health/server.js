const express = require('express');
const nunjucks = require('nunjucks');
const app = express();

// Configuration
const PORT = 3000;

// Template engine setup
const env = nunjucks.configure('views', {
  autoescape: true,
  express: app
});

// Add custom date filter
env.addFilter('date', function(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
});

app.set('view engine', 'njk'); // Change file extensions to .njk

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', require('./routes/rooms'));
app.use('/api', require('./routes/api'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});