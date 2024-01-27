#!/bin/bash

# Update and install Git and Make
sudo apt-get update
sudo apt-get install -y git make tmux

# install Docker
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the Docker group (replace 'newuser' with your desired username)
NEW_USER="transcendence"
sudo useradd -m $NEW_USER
sudo usermod -aG docker $NEW_USER

PASSWORD="h7SuY43crqR9Papd7p2iPJYqXaCbkiTicvuQwYPep923A3Ui"
# Set a password for the new user (you can change this)
echo "$NEW_USER:$PASSWORD" | sudo chpasswd

# Generate SSH key for the new user
sudo -u $NEW_USER ssh-keygen -t rsa -b 4096 -N "" -f "/home/$NEW_USER/.ssh/id_rsa"

# Print the SSH public key
echo "SSH Public Key for $NEW_USER:"
sudo cat "/home/$NEW_USER/.ssh/id_rsa.pub"
