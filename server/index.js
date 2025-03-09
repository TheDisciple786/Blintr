const express = require('express');
const {connectToMongoDB} = require('./connect');
const app = express();
const port = 8000;

connectToMongoDB('mongodb://localhost:27017/blintr').then(()=>console.log("connected to db"));

app.use(express.json());

app.use('/api',require('./routes/index_routes'));

app.listen(port,()=>console.log("server started"));