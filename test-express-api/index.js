const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

console.log('\n\n*******************************');
console.log('PORT', PORT);
console.log('NODE_ENV', process.env.NODE_ENV);
console.log('HOST', process.env.HOST);
console.log('*******************************\n\n');

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Additional test endpoint
app.get('/info', (req, res) => {
  res.json({
    app: 'test-express-api',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    host: process.env.HOST || '0.0.0.0',
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
