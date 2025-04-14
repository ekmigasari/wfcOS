#Base Image
FROM oven/bun

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY . .

# Install dependencies
RUN bun install 

# Run the application
CMD ["bun", "dev"]

# Expose port 3000
EXPOSE 3000

# If using prisma

# #Base Image
# FROM oven/bun

# # Set the working directory inside the container
# WORKDIR /api

# # Copy working directory
# COPY ./prisma ./
# COPY . .

# # Install dependencies
# RUN bun install --ignore-scripts
# RUN bunx prisma generate

# # Run the application
# CMD ["bun", "dev"]

# # Expose port 3000
# EXPOSE 3001