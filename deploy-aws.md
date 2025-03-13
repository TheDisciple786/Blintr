# Deploying Blintr to AWS

This guide provides instructions for deploying Blintr to Amazon Web Services (AWS).

## Option 1: AWS Elastic Beanstalk (Recommended for beginners)

### Prerequisites:
1. AWS Account
2. AWS CLI installed and configured
3. EB CLI installed (`pip install awsebcli`)

### Deployment Steps:

1. **Initialize Elastic Beanstalk application:**
   ```bash
   cd d:\Blintr\blintr
   eb init
   ```
   Follow the prompts to configure your application.

2. **Create an environment:**
   ```bash
   eb create blintr-environment
   ```

3. **Configure environment variables:**
   In the AWS console, navigate to Elastic Beanstalk > Your Environment > Configuration > Software > Environment properties
   Add the following:
   - `MONGO_URI`: Your MongoDB connection string (use MongoDB Atlas for production)
   - `JWT_SECRET`: A secure JWT secret
   - `CLIENT_ORIGIN`: URL of your deployed client

4. **Deploy:**
   ```bash
   eb deploy
   ```

## Option 2: AWS EC2 with Docker

### Prerequisites:
1. AWS Account
2. Basic understanding of EC2, Docker, and AWS networking

### Deployment Steps:

1. **Launch an EC2 instance:**
   - Use Amazon Linux 2 AMI
   - t2.micro is sufficient for testing, consider t2.small or larger for production
   - Configure security groups to allow HTTP (80), HTTPS (443) and SSH (22)

2. **Install Docker on your EC2 instance:**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-public-dns
   sudo yum update -y
   sudo amazon-linux-extras install docker
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   ```
   Log out and log back in for changes to take effect.

3. **Install Docker Compose:**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Upload your application:**
   ```bash
   scp -i your-key.pem -r d:\Blintr\blintr ec2-user@your-ec2-public-dns:/home/ec2-user/
   ```

5. **Deploy with Docker Compose:**
   ```bash
   cd blintr
   docker-compose up -d
   ```

## Option 3: AWS ECS (Container Service)

For a more scalable container deployment, use Amazon ECS:

1. Create an ECS cluster
2. Build and push your Docker image to Amazon ECR
3. Define an ECS task and service
4. Use Application Load Balancer for routing traffic

## Database: MongoDB Atlas

For production, use MongoDB Atlas rather than self-hosting:

1. Create a MongoDB Atlas account
2. Create a new cluster (the free tier is sufficient to start)
3. Whitelist your AWS IP addresses
4. Create a database user
5. Get the connection string and use it as your MONGO_URI environment variable

## Domain and HTTPS

1. Register a domain using Amazon Route 53 or your preferred registrar
2. Create records pointing to your AWS resources
3. Set up AWS Certificate Manager for free SSL certificates
4. Configure your load balancer or CloudFront to use HTTPS

## Monitoring and Scaling

1. Set up CloudWatch Alarms to monitor your application
2. Configure Auto Scaling groups for EC2 or ECS capacity
3. Use AWS X-Ray for tracing and performance monitoring
