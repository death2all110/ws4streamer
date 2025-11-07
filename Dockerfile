# Use the official Puppeteer base image
# It includes Node.js and all necessary browser dependencies
FROM ghcr.io/puppeteer/puppeteer:latest

# The image runs as 'pptruser'. Switch to root to install ffmpeg.
USER root
RUN apt-get update \
    && apt-get install -y ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Switch back to the non-privileged user
USER pptruser

WORKDIR /home/pptruser/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the streamer and server scripts
COPY streamer.mjs .
COPY server.mjs .
# Use the official Puppeteer base image
# It includes Node.js and all necessary browser dependencies
FROM ghcr.io/puppeteer/puppeteer:latest

# The image runs as 'pptruser'. Switch to root to install ffmpeg.
USER root
RUN apt-get update \
    && apt-get install -y ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Switch back to the non-privileged user
USER pptruser

WORKDIR /home/pptruser/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the streamer and server scripts
COPY streamer.mjs .
COPY server.mjs .

# --- Environment Variables ---
# Set the HLS directory inside the container
ENV HLS_DIR=/home/pptruser/app/hls

# (Optional) Set the URL to your ws4kp instance.
# This is REQUIRED if ws4kp is not running on '127.0.0.1:8080'
# relative to this container.
# ENV WS4KP_URL="http://your-ws4kp-host:8080/?kiosk=true&settings-mediaPlaying-boolean=true"

# (REQUIRED FOR IPTV) Set the public-facing URL of this container.
# Example: http://192.168.1.100:8000
# You MUST override this at runtime. The default '127.0.0.1' will
# only work on the host machine itself.
ENV BASE_URL=http://127.0.0.1:8000

# --- Ports and Volumes ---
# Expose the HLS web server port
EXPOSE 8000

# (Optional) You can mount a volume to access HLS files from the host
VOLUME /home/pptruser/app/hls

# Run both the streamer and the server
CMD [ "npm", "start" ]
# --- Environment Variables ---
# Set the HLS directory inside the container
ENV HLS_DIR=/home/pptruser/app/hls

# (Optional) Set the URL to your ws4kp instance.
# This is REQUIRED if ws4kp is not running on '127.0.0.1:8080'
# relative to this container.
# ENV WS4KP_URL="http://your-ws4kp-host:8080/?kiosk=true&settings-mediaPlaying-boolean=true"

# --- Ports and Volumes ---
# Expose the HLS web server port
EXPOSE 8000

# (Optional) You can mount a volume to access HLS files from the host
VOLUME /home/pptruser/app/hls

# Run both the streamer and the server
CMD [ "npm", "start" ]