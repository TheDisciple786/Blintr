const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Kill any process using port 8000-8005
const killProcessOnPorts = async () => {
    const ports = [8000, 8001, 8002, 8003, 8004, 8005];
    
    for (const port of ports) {
        try {
            if (process.platform === 'win32') {
                // Windows
                spawn('cmd', ['/c', `FOR /F "tokens=5" %P IN ('netstat -ano ^| findstr :${port}') DO taskkill /PID %P /F`]);
            } else {
                // Linux/Mac
                spawn('sh', ['-c', `lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs -I % kill -9 %`]);
            }
            
            console.log(`Attempted to kill processes on port ${port}`);
        } catch (error) {
            console.log(`No process found on port ${port} or error killing it`);
        }
    }
    
    // Wait a bit for processes to terminate
    return new Promise(resolve => setTimeout(resolve, 1000));
};

// Start the server
const startServer = () => {
    const serverProcess = spawn('node', ['server/index.js'], { 
        stdio: 'inherit',
        cwd: __dirname
    });
    
    serverProcess.on('error', (err) => {
        console.error('Failed to start server:', err);
    });
    
    return serverProcess;
};

// Update the client's environment with the server port
const updateClientEnv = () => {
    spawn('node', ['update-client-port.js'], { 
        stdio: 'inherit',
        cwd: __dirname
    });
};

// Start the client development server
const startClient = () => {
    const clientProcess = spawn('npm', ['start'], {
        stdio: 'inherit',
        cwd: path.join(__dirname, 'client')
    });
    
    clientProcess.on('error', (err) => {
        console.error('Failed to start client:', err);
    });
};

// Main function to orchestrate startup
const start = async () => {
    try {
        console.log('Checking for and killing processes on ports 8000-8005...');
        await killProcessOnPorts();
        
        console.log('Starting server...');
        startServer();
        
        console.log('Waiting for server to initialize...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('Updating client environment files...');
        updateClientEnv();
        
        console.log('Starting client...');
        startClient();
        
    } catch (err) {
        console.error('Error starting application:', err);
    }
};

start();
