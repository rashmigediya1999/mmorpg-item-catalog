FROM node:current-alpine3.21

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

# Expose port
EXPOSE 3000

# Run the application
CMD ["npm", "run", "start"]