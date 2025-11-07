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
RUN mkdir -p /home/pptruser/app/music /home/pptruser/app/logo
COPY music/*.mp3 /home/pptruser/app/music/
COPY logo/*.png /home/pptruser/app/logo/
COPY streamer.mjs .
COPY server.mjs .

ENV HLS_DIR=/home/pptruser/app/hls
ENV MUSIC_DIR=/home/pptruser/app/music
ENV BASE_URL=http://127.0.0.1:8000

EXPOSE 8000

CMD [ "npm", "start" ]