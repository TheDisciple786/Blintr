# Step-by-Step AWS Deployment Guide for Blintr

This comprehensive guide will walk you through deploying Blintr on AWS using Elastic Beanstalk.

## Prerequisites

1. **AWS Account**: Create one at [aws.amazon.com](https://aws.amazon.com)
2. **MongoDB Atlas Account**: Create one at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **AWS CLI**: Install from [aws.amazon.com/cli](https://aws.amazon.com/cli/)
4. **EB CLI**: Install with `pip install awsebcli`
5. **Git**: Install from [git-scm.com](https://git-scm.com)
6. **Node.js and npm**: Install from [nodejs.org](https://nodejs.org)

## Step 1: Prepare Your MongoDB Atlas Database

1. **Create a MongoDB Atlas cluster**:
   - Log in to MongoDB Atlas
   - Create a new project
   - Build a new cluster (the free tier is sufficient to start)

2. **Configure database access**:
   - Go to Database Access and create a new database user with password authentication
   - Note down the username and password
   TheDisciple786
   SyNagNagHD372!?!

3. **Configure network access**:
   - Go to Network Access
   - Add a new IP address entry
   - Select "Allow Access from Anywhere" temporarily (we'll restrict this later)

4. **Get your connection string**:
   - Go to Clusters > Connect > Connect your application
   - Copy the connection string, which will look like: 
     `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>`
   - Replace `<username>`, `<password>`, and `<database>` with your values

## Step 2: Prepare Your Application for Deployment

1. **Update configuration**:
   - Make sure your application uses environment variables for:
     - MongoDB connection string
     - JWT secret
     - Any other configuration that varies by environment

2. **Create a `.ebignore` file** to exclude unnecessary files:
   ```
   node_modules
   npm-debug.log
   .git
   .gitignore
   .env.*
   ```

3. **Create an `ecosystem.config.js` file** for PM2 process management:
   ```javascript
   module.exports = {
     apps: [{
       name: "blintr",
       script: "server/index.js",
       instances: "max",
       env: {
         NODE_ENV: "production",
       }
     }]
   };
   ```

4. **Update package.json** to add production build and start scripts:
   ```json
   "scripts": {
     "start": "node server/index.js",
     "build": "cd client && npm install && npm run build",
     "postinstall": "npm run build"
   }
   ```

## Step 3: Build and Test Locally

1. **Install dependencies and build the app**:
   ```bash
   npm install
   cd client
   npm install
   npm run build
   cd ..
   ```

2. **Test your app locally in production mode**:
   ```bash
   NODE_ENV=production MONGO_URI=your_mongodb_atlas_uri npm start
   ```

3. **Verify everything works correctly** in your browser at http://localhost:8000

## Step 4: Initialize Elastic Beanstalk

1. **Initialize your EB application**:
   ```bash
   cd d:\Blintr\blintr
   eb init
   ```

2. **Follow the prompts**:
   - Select your region (choose the one closest to your users)
   - Create a new application (e.g., "blintr")
   - Select Node.js as the platform
   - Choose the latest Node.js version
   - Set up SSH for your instances (recommended for troubleshooting)

## Step 5: Create and Configure EB Environment

1. **Create your environment**:
   ```bash
   eb create blintr-production
   ```

2. **Set environment variables through the CLI**:
   ```bash
   eb setenv MONGO_URI=your_mongodb_atlas_uri JWT_SECRET=your_secret_key NODE_ENV=production PORT=8081
   ```

   Alternatively, set them in the AWS console:
   - Go to AWS Elastic Beanstalk > Environments > your-environment
   - Click Configuration > Software > Edit
   - Add environment properties
   - Click Apply

## Step 6: Deploy Your Application

1. **Deploy to Elastic Beanstalk**:
   ```bash
   eb deploy
   ```

2. **Open the deployed application**:
   ```bash
   eb open
   ```

## Step 7: Set Up a Custom Domain (Optional)

1. **Register a domain** using Amazon Route 53 or your preferred registrar

2. **Create an SSL certificate** using AWS Certificate Manager:
   - Go to AWS Certificate Manager
   - Request a public certificate
   - Enter your domain name(s)
   - Choose DNS validation
   - Follow the validation steps

3. **Configure your EB environment**:
   - Go to AWS Elastic Beanstalk > Environments > your-environment
   - Click Configuration > Load balancer > Edit
   - Add a listener on port 443 with protocol HTTPS
   - Select your SSL certificate
   - Click Apply

4. **Create DNS records**:
   - Go to Route 53 > Hosted zones > your-domain
   - Create record set
   - Name: www or @
   - Type: A - IPv4 address
   - Alias: Yes
   - Target: Your Elastic Beanstalk environment URL
   - Click Create

## Step 8: Set Up Monitoring

1. **Configure basic monitoring**:
   - Go to AWS Elastic Beanstalk > Environments > your-environment
   - Click Monitoring

2. **Set up CloudWatch alarms** for critical metrics:
   - Go to CloudWatch > Alarms > Create alarm
   - Select metric (e.g., CPU utilization)
   - Define threshold conditions
   - Set up notifications (optional)
   - Click Create alarm

## Step 9: Secure Your Deployment

1. **Update MongoDB Atlas network access**:
   - Go back to MongoDB Atlas > Network Access
   - Edit your "Allow Access from Anywhere" entry
   - Replace it with the IP range or security group of your EB environment

2. **Enable HTTPS redirection**:
   - Edit your EB configuration to redirect HTTP to HTTPS
   - You can do this using a `.platform/nginx/conf.d/https_redirect.conf` file

3. **Set proper security headers**:
   - Update your application to include security headers like Content-Security-Policy, X-XSS-Protection, etc.

## Step 10: Implement CI/CD Pipeline (Optional)

1. **Set up GitHub Actions** for continuous deployment:
   - Create `.github/workflows/deploy.yml` with EB deployment steps
   - Configure AWS credentials as GitHub secrets
   - Trigger deployments on push to main branch

## Troubleshooting

1. **View logs**:
   ```bash
   eb logs
   ```

2. **SSH into your instance**:
   ```bash
   eb ssh
   ```

3. **Monitor health**:
   ```bash
   eb health
   ```

4. **Common issues and solutions**:
   - If app doesn't start: Check logs for errors
   - If MongoDB connection fails: Verify network access settings
   - If deployment fails: Check for proper Node.js version compatibility

## Cost Management

1. **Monitor costs** using AWS Cost Explorer
2. **Set up billing alarms** in CloudWatch
3. **Consider using Reserved Instances** for long-term deployments

## Scaling Your Application

1. **Enable auto scaling** in your EB environment configuration
2. **Configure scaling triggers** based on CPU, network, or custom metrics
3. **Consider implementing a caching layer** with Redis or Elasticache for better performance
```

Remember that AWS pricing depends on the resources you use. Start with minimal resources and scale as needed to control costs.
