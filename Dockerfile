# Use a base image with Node.js and Playwright's recommended dependencies
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm ci

# Copy the rest of the project files
COPY . .

# Install Playwright browsers
RUN npx playwright install --with-deps

# Command to run the tests
CMD ["npx", "playwright", "test"]
