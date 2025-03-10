const express = require('express');
const {connectToMongoDB} = require('./connect');
const cors = require('cors');
const app = express();
const port = 8000;

connectToMongoDB('mongodb://localhost:27017/blintr').then(()=>console.log("connected to db"));

app.use(cors());

// Increase payload size limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api',require('./routes/index_routes'));

app.listen(port,()=>console.log("server started on http://localhost:" + port));