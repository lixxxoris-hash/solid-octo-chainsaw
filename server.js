const express = require('express');
const path = require('path');
const cors = require('cors');
const play = require('play-dl');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('@ffprobe-installer/ffprobe');
const ytDlpExec = require('yt-dlp-exec');

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

// Helper function to validate YouTube URL
function isValidYouTubeURL(url) {
  const type = play.yt_validate(url);
  return type === 'video' || type === 'shorts' || type === 'share';
}

// API Routes
app.post('/api/download', async (req, res) => {
  try {
    const { url, format } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL обязателен' });
    }

    if (!isValidYouTubeURL(url)) {
      return res.status(400).json({ error: 'Некорректный YouTube URL' });
    }

    const info = await play.video_basic_info(url);
    const title = info.video_details.title;
    
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
    
    if (!url) {
      return res.status(400).json({ error: 'URL обязателен' });
    }

    if (!isValidYouTubeURL(url)) {
      return res.status(400).json({ error: 'Некорректный YouTube URL' });
    }

    const info = await play.video_basic_info(url);
    const title = info.video_details.title.replace(/[^\w\s]/gi, '').substring(0, 50);
    
    if (format === 'mp4') {
      // Use yt-dlp for reliable MP4 download
      res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
      res.setHeader('Content-Type', 'video/mp4');
      
      const ytDlpProcess = ytDlpExec.exec(url, {
        output: '-',
        format: 'best[ext=mp4]/best',
        remuxVideo: 'mp4',
        addHeader: ['referer:youtube.com', 'user-agent:googlebot']
      });
      
      ytDlpProcess.stdout.pipe(res);
      
      ytDlpProcess.on('error', (err) => {
        console.error('yt-dlp MP4 error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Ошибка при скачивании видео' });
        }
      });
      
    } else {
      // Use yt-dlp for reliable MP3 download
      res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
      res.setHeader('Content-Type', 'audio/mpeg');
      
      const ytDlpProcess = ytDlpExec.exec(url, {
        output: '-',
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: '192K',
        addHeader: ['referer:youtube.com', 'user-agent:googlebot']
      });
      
      ytDlpProcess.stdout.pipe(res);
      
      ytDlpProcess.on('error', (err) => {
        console.error('yt-dlp MP3 error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Ошибка при конвертации аудио в MP3' });
        }
      });
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

    if (!isValidYouTubeURL(url)) {
      return res.status(400).json({ error: 'Некорректный YouTube URL' });
    }

    const info = await play.video_basic_info(url);
    
    res.json({
      title: info.video_details.title,
      duration: info.video_details.durationInSec,
      thumbnail: info.video_details.thumbnails[info.video_details.thumbnails.length - 1].url,
      author: info.video_details.channel.name
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