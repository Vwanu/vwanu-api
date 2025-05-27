const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Hello from test server!' });
});

app.listen(port, () => {
  console.log(`Test server listening on port ${port}`);
}); 