#!/bin/bash

# Install Coolify on the VPS
# Reference: https://coolify.io/docs/installation/self-hosted

# Update system
apt update && apt upgrade -y

# Install Docker if not present
if ! [ -x "$(command -v docker)" ]; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
fi

# Install Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

echo "Coolify has been installed. Open http://your-server-ip:8000 to set it up."
echo "You will need to configure the following in Coolify:"
echo "1. PostgreSQL database for sriox.com"
echo "2. Nginx proxy for handling subdomains and redirects"
echo "3. Set up deployment for frontend and backend services"