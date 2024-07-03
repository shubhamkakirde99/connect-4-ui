# Step 1: Use the Node.js 16 image as the base
FROM node:16-alpine

# Step 2: Set the working directory in the Docker container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of your application's source code
COPY . .

# Step 6: Expose port 3000 for the React app
EXPOSE 3000

# Step 7: Define the command to run your app
CMD ["npm", "start"]