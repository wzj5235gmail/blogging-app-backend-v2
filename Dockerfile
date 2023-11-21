# Use the official Node.js image as the base image, version 18.14.2
FROM node:18.14.2

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies for the application
RUN npm install --verbose

# Copy the application code to the working directory
COPY . .

# Expose the port on which the application will run
EXPOSE 5000

# Define the command to start the application
CMD ["npm", "start"]
