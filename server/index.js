const express = require('express');
const cors = require('cors'); // Import cors middleware
const { connectToMongoDB } = require('./connect');
const app = express();
const port = 8000;

connectToMongoDB('mongodb://localhost:27017/blintr').then(() => console.log("connected to db"));

app.use(cors()); 
app.use(express.json());

app.use('/api', require('./routes/index_routes'));

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});