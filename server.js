const express = require('express');
const path = require('path');
const cors = require('cors');
const ytdl = require('ytdl-core');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('@ffprobe-installer/ffprobe');

// Set ffmpeg paths for bundled binaries
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const app = express();
// Force port 3001 in development, use PORT in production deployment
const PORT = process.env.REPLIT_DEPLOYMENT ? process.env.PORT : 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.post('/api/download', async (req, res) => {
  try {
    const { url, format } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL обязателен' });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Некорректный YouTube URL' });
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    
    res.json({
      success: true,
      title: title,
      downloadUrl: `/api/download-file?url=${encodeURIComponent(url)}&format=${format || 'mp3'}`
    });

  } catch (error) {
    console.error('Ошибка скачивания:', error);
    res.status(500).json({ error: 'Ошибка сервера при обработке видео' });
  }
});

app.get('/api/download-file', async (req, res) => {
  try {
    const { url, format } = req.query;
    
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Некорректный YouTube URL' });
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '').substring(0, 50);
    
    if (format === 'mp4') {
      // Try to get combined H.264/MP4 format first
      let videoFormat = ytdl.chooseFormat(info.formats, { 
        quality: 'highest', 
        filter: format => format.container === 'mp4' && format.hasVideo && format.hasAudio && 
                          format.videoCodec && format.videoCodec.includes('avc1')
      });
      
      if (!videoFormat) {
        // Fallback: use separate streams with proper transcoding
        const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        const videoOnlyFormat = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'videoonly' });
        
        res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');
        
        const command = ffmpeg()
          .input(ytdl(url, { format: videoOnlyFormat }))
          .input(ytdl(url, { format: audioFormat }))
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            '-preset veryfast',
            '-crf 23',
            '-f mp4',
            '-movflags frag_keyframe+empty_moov'
          ])
          .on('error', (err) => {
            console.error('FFmpeg error:', err);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Ошибка при конвертации видео' });
            }
          })
          .pipe(res, { end: true });
      } else {
        res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');
        ytdl(url, { format: videoFormat }).pipe(res);
      }
    } else {
      // MP3 format - real conversion using ffmpeg
      const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
      
      res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
      res.setHeader('Content-Type', 'audio/mpeg');
      
      ffmpeg(ytdl(url, { format: audioFormat }))
        .audioCodec('libmp3lame')
        .audioBitrate(192)
        .format('mp3')
        .on('error', (err) => {
          console.error('FFmpeg MP3 error:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Ошибка при конвертации аудио в MP3' });
          }
        })
        .pipe(res, { end: true });
    }
    
  } catch (error) {
    console.error('Ошибка скачивания файла:', error);
    res.status(500).json({ error: 'Ошибка при скачивании файла' });
  }
});

app.get('/api/info', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL обязателен' });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Некорректный YouTube URL' });
    }

    const info = await ytdl.getInfo(url);
    
    res.json({
      title: info.videoDetails.title,
      duration: info.videoDetails.lengthSeconds,
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      author: info.videoDetails.author.name
    });

  } catch (error) {
    console.error('Ошибка получения информации:', error);
    res.status(500).json({ error: 'Ошибка получения информации о видео' });
  }
});

// Serve static files from Vite build
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(__dirname, 'index.html');

// Check if we're in production (dist exists) or development  
const isProduction = fs.existsSync(distPath);

if (isProduction) {
  // Production: serve from dist
  app.use(express.static(distPath, {
    maxAge: '1y',
    immutable: true
  }));
  
  app.get('*', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Development: serve from root (for when backend runs standalone)
  app.get('/', (req, res) => {
    res.send(`
      <h1>You2Fetch Backend</h1>
      <p>Backend is running on port ${PORT}</p>
      <p>Start frontend with: npm run dev</p>
      <p>API endpoints:</p>
      <ul>
        <li>POST /api/download</li>
        <li>GET /api/download-file</li>
        <li>GET /api/info</li>
      </ul>
    `);
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});