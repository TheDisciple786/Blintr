const fs = require('fs');
const path = require('path');
const { getActivePort } = require('./server/get-port');

const updateClientEnvFiles = () => {
    const port = getActivePort();
    const ipAddress = getLocalIPAddress();
    
    const envContent = `REACT_APP_API_URL=http://${ipAddress}:${port}`;
    
    const envFiles = [
        path.join(__dirname, 'client', '.env'),
        path.join(__dirname, 'client', '.env.local'),
        path.join(__dirname, 'client', '.env.development'),
        path.join(__dirname, 'client', '.env.production')
    ];
    
    envFiles.forEach(filePath => {
        try {
            fs.writeFileSync(filePath, envContent);
            console.log(`Updated ${filePath} with API URL: http://${ipAddress}:${port}`);
        } catch (err) {
            console.error(`Error updating ${filePath}:`, err);
        }
    });
};

function getLocalIPAddress() {
    try {
        const { networkInterfaces } = require('os');
        const nets = networkInterfaces();
        
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // Skip internal and non-IPv4 addresses
                if (!net.internal && net.family === 'IPv4') {
                    return net.address;
                }
            }
        }
    } catch (error) {
        console.log('Could not determine LAN IP address');
    }
    return 'localhost'; // Default to localhost if can't determine IP
}

updateClientEnvFiles();
