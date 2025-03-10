const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.get('/api/server-info', (req, res) => {
  res.json({
    port: process.env.PORT || server.address().port,
    status: 'running'
  });
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});