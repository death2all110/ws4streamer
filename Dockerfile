FROM ghcr.io/puppeteer/puppeteer:latest

USER root
RUN apt-get update \
    && apt-get install -y ffmpeg \
    && rm -rf /var/lib/apt/lists/*

USER pptruser
WORKDIR /home/pptruser/app

COPY package.json ./
RUN npm install

# Copy application code, music, and logo files
RUN mkdir -p /app/music /app/logo
COPY music/*.mp3 /app/music/
COPY logo/*.png /app/logo/
COPY streamer.mjs .
COPY server.mjs .

ENV HLS_DIR=/home/pptruser/app/hls
ENV MUSIC_DIR=/home/pptruser/app/music
ENV BASE_URL=http://127.0.0.1:8000

EXPOSE 8000
VOLUME /home/pptruser/app/music

CMD [ "npm", "start" ]