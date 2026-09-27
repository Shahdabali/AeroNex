FROM node:22-slim

# Install latest chrome dev package and fonts to support major charsets
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Skip Puppeteer's own Chromium download as we're using the installed Google Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

WORKDIR /app

# Copy server package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the server source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the API port
EXPOSE 5000

# Start the API server
CMD ["npm", "start"]
