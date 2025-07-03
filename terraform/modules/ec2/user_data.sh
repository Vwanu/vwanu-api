#!/bin/bash

# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker

# Add ec2-user to docker group
usermod -a -G docker ec2-user

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Log in to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 058264272613.dkr.ecr.us-east-1.amazonaws.com

# Pull and run the Docker image
docker run -d \
  --name api-container \
  --restart always \
  -p ${api_port}:${api_port} \
  -e STAGE=${environment} \
  -e REGION=us-east-1 \
  -e GITHUB_USERNAME=system \
  -e DB_HOST=${db_host} \
  -e DB_USERNAME=${db_username} \
  -e DB_PASSWORD=${db_password} \
  -e PGUSER=${db_username} \
  -e PGPASSWORD=${db_password} \
  -e PGDATABASE=${db_name} \
  -e DB_SSL=true \
  -e API_URL=https://api.wadsonvaval.click \
  -e AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE=true \
  -e CLIENT_ID=ui \
  -e clientId=ui \
  -e userPoolId=dummy_user_pool_id \
  -e CLOUDINARY_API_SECRET=${cloudinary_api_secret} \
  -e CLOUDINARY_API_KEY=${cloudinary_api_key} \
  -e CLOUDINARY_CLOUD_NAME=${cloudinary_cloud_name} \
  -e JWT_SECRET=${jwt_secret} \
  -e AUTHENTICATION_SECRET=${authentication_secret} \
  -e API_PORT=${api_port} \
  -e HOST=0.0.0.0 \
  -e maxPostVideos=5 \
  -e maxPostAudios=5 \
  -e maxPostImages=5 \
  -e maxMessageImages=5 \
  -e maxDiscussionVideos=5 \
  -e maxDiscussionAudios=5 \
  -e maxDiscussionImages=5 \
  -e HASHING_SALT_ROUNDS=10 \
  -e ROOT_USER_EMAIL=admin@wadsonvaval.click \
  -e ROOT_USER_PASSWORD=ChangeMe123! \
  -e ROOT_USER_FIRST_NAME=Admin \
  -e ROOT_USER_LAST_NAME=User \
  ${docker_image}

# Create a health check script
cat > /home/ec2-user/health_check.sh << 'EOF'
#!/bin/bash
curl -f http://localhost:${api_port}/health || exit 1
EOF

chmod +x /home/ec2-user/health_check.sh

# Setup CloudWatch agent for monitoring
yum install -y amazon-cloudwatch-agent 