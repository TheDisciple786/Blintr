const config = {
  // MongoDB connection
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/blintr',
  
  // JWT secret key - should be stored in environment variables in production
  jwtSecret: process.env.JWT_SECRET || 'your_secret_key',
  
  // Server port
  port: process.env.PORT || 8000,
  
  // Client URL for CORS
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
};

module.exports = config;
