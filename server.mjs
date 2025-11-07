import express from 'express';
import path from 'path';

const PORT = process.env.HTTP_PORT || 8000;
const HLS_DIR = path.resolve(process.env.HLS_DIR || './hls');
const chnlNum = process.env.CHANNEL_NUMBER || '1234';

// IMPORTANT: This is the publicly accessible URL of this server.
// You MUST set this as an environment variable when running in Docker
// so that the .m3u file contains the correct URL for your clients.
// Example: http://192.168.1.100:8000
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;
const app = express();

/**
 * Formats a Date object into XMLTV-compatible string.
 * @param {Date} date - The date to format.
 * @returns {string} - e.g., "20251105210000 -0600"
 */
function formatXmlTvDate(date) {
    const pad = (num) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    const offset = -date.getTimezoneOffset();
    const offsetSign = offset >= 0 ? '+' : '-';
    const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
    const offsetMinutes = pad(Math.abs(offset) % 60);

    return `${year}${month}${day}${hours}${minutes}${seconds} ${offsetSign}${offsetHours}${offsetMinutes}`;
}


// --- /playlist.m3u ---
app.get('/playlist.m3u', (req, res) => {
    const m3uContent = `#EXTM3U
#EXTINF:-1 tvg-id="WS4KP" tvg-chno="${chnlNum}" tvg-name="WeatherStar 4000+" group-title="Weather",WeatherStar 4000+
${BASE_URL}/hls/stream.m3u8
`;
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(m3uContent);
});


// --- /guide.xml ---
app.get('/guide.xml', (req, res) => {
    const channelId = "WS4KP";
    const channelName = "WeatherStar 4000+";

    // Create synthetic 3-hour program blocks for the next 24 hours
    let programs = '';
    const now = new Date();

    // Start EPG from the beginning of the current hour
    let startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

    for (let i = 0; i < 8; i++) { // 8 * 3-hour blocks = 24 hours
        const endTime = new Date(startTime.getTime() + (3 * 60 * 60 * 1000));

        programs += `
  <programme start="${formatXmlTvDate(startTime)}" stop="${formatXmlTvDate(endTime)}" channel="${channelId}">
    <title lang="en">Local Forecast</title>
    <desc lang="en">Live local weather forecast from your WeatherStar 4000+.</desc>
    <category lang="en">Weather</category>
  </programme>`;

        startTime = endTime; // Set start for next block
    }

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<tv generator-info-name="ws4kp-streamer">
  <channel id="${channelId}">
    <display-name>${channelName}</display-name>
  </channel>
  ${programs}
</tv>
`;

    res.setHeader('Content-Type', 'application/xml');
    res.send(xmlContent);
});


app.use('/hls', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.use('/hls', express.static(HLS_DIR));


app.get('/', (req, res) => {
    res.send(`
    <html>
      <head><title>WS4KP Streamer</title></head>
      <body>
        <h1>WS4KP Streamer is Running</h1>
        <p>Your IPTV source files are available:</p>
        <ul>
          <li><strong>M3U Playlist:</strong> <a href="/playlist.m3u">/playlist.m3u</a></li>
          <li><strong>XMLTV Guide:</strong> <a href="/guide.xml">/guide.xml</a></li>
        </ul>
        <p>The core HLS stream is at: <code>/hls/stream.m3u8</code></p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
    console.log(`[Server] HLS and IPTV server running on http://127.0.0.1:${PORT}`);
    console.log(`[Server] --- HLS Stream: ${BASE_URL}/hls/stream.m3u8`);
    console.log(`[Server] --- M3U Playlist: ${BASE_URL}/playlist.m3u`);
    console.log(`[Server] --- XMLTV Guide: ${BASE_URL}/guide.xml`);
});