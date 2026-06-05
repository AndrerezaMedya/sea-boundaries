# Use official Node.js image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install --production

# Bundle app source (middleware required for MVT display token)
COPY server.js app.js ./
COPY db ./db
COPY lib ./lib
COPY routes ./routes
COPY middleware ./middleware

ENV NODE_ENV=production

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080

# Run the web service on container startup.
CMD [ "node", "server.js" ]
