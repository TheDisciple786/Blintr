const fs = require('fs');
const path = require('path');

const getActivePort = () => {
    try {
        const portFilePath = path.join(__dirname, 'current-port.txt');
        if (fs.existsSync(portFilePath)) {
            const port = fs.readFileSync(portFilePath, 'utf-8').trim();
            return parseInt(port, 10);
        }
    } catch (err) {
        console.error("Error reading port file:", err);
    }
    return 8000; // Default port if file doesn't exist or has issues
};

console.log(`Current active server port: ${getActivePort()}`);

module.exports = { getActivePort };
