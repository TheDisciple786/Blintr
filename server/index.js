const express = require('express');
const {connectToMongoDB} = require('./connect');
const cors = require('cors');
const app = express();
const portOptions = [8000, 8001, 8002, 8003, 8004, 8005]; // Define multiple port options
let port = process.env.PORT || portOptions[0]; // Start with the first option

connectToMongoDB('mongodb://localhost:27017/blintr').then(()=>console.log("connected to db"));

// Configure CORS to accept requests from any origin
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase payload size limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api',require('./routes/index_routes'));

// Basic health check endpoint
app.get('/', (req, res) => {
    res.send('Blintr API server is running');
});

// Function to try to start server with various port options
const startServer = (portIndex = 0) => {
    if (portIndex >= portOptions.length) {
        console.error("All port options are in use. Could not start server.");
        process.exit(1);
    }
    
    port = process.env.PORT || portOptions[portIndex];
    
    const server = app.listen(port, '0.0.0.0')
        .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${port} is already in use, trying next port...`);
                server.close();
                startServer(portIndex + 1);
            } else {
                console.error("Server error:", err);
            }
        })
        .on('listening', () => {
            console.log(`Server started and listening on all interfaces, port ${port}`);
            console.log(`Access locally via: http://localhost:${port}`);
            
            // Try to get the local IP address for LAN access
            try {
                const { networkInterfaces } = require('os');
                const nets = networkInterfaces();
                for (const name of Object.keys(nets)) {
                    for (const net of nets[name]) {
                        // Skip internal and non-IPv4 addresses
                        if (!net.internal && net.family === 'IPv4') {
                            console.log(`Access on LAN via: http://${net.address}:${port}`);
                        }
                    }
                }
            } catch (error) {
                console.log('Could not determine LAN IP addresses');
            }
            
            // Update the port in environment variables for other parts of the app
            process.env.PORT = port;
            
            // Create/update a file with the current port
            const fs = require('fs');
            fs.writeFileSync('./current-port.txt', port.toString(), 'utf-8');
        });
};

// Start the server with the first port option
startServer();