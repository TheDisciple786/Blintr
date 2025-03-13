const express = require('express');
const {connectToMongoDB} = require('./connect');
const cors = require('cors');
const config = require('./config/config');
const app = express();

// Connect to MongoDB with the URI from config
connectToMongoDB(config.mongoURI).then(() => console.log("Connected to MongoDB database"));

// Configure CORS to accept requests from specific origin in production
app.use(cors({
    origin: config.clientOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase payload size limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Security headers middleware
app.use((req, res, next) => {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Only set CSP in production
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.yourdomain.com");
    }
    
    next();
});

app.use('/api', require('./routes/index_routes'));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.use(express.static(path.join(__dirname, '../client/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.send('Blintr API server is running');
});

// Proper error handling for production
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ 
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal Server Error' 
            : err.message 
    });
});

const port = config.port;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});