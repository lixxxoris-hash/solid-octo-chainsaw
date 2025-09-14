import React, { useState } from 'react';
import './YouTubeDownloader.css';

const YouTubeDownloader = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [format, setFormat] = useState('mp3');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, format }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка сервера');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result?.downloadUrl) {
      window.open(result.downloadUrl, '_blank');
    }
  };

  return (
    <div className="youtube-downloader">
      <div className="container">
        <header className="header">
          <h1>🎵 You2Fetch</h1>
          <p>YouTube to MP3/MP4 Converter</p>
        </header>

        <form onSubmit={handleSubmit} className="download-form">
          <div className="input-group">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Вставьте ссылку на YouTube видео..."
              className="url-input"
              required
            />
            
            <div className="format-selector">
              <label>
                <input
                  type="radio"
                  value="mp3"
                  checked={format === 'mp3'}
                  onChange={(e) => setFormat(e.target.value)}
                />
                🎵 MP3 (Аудио)
              </label>
              <label>
                <input
                  type="radio"
                  value="mp4"
                  checked={format === 'mp4'}
                  onChange={(e) => setFormat(e.target.value)}
                />
                🎬 MP4 (Видео)
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading || !url}
              className="download-btn"
            >
              {loading ? '⏳ Обработка...' : '📥 Скачать'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {result && (
          <div className="result">
            <h3>✅ Готово к скачиванию!</h3>
            <p><strong>Название:</strong> {result.title}</p>
            <button onClick={handleDownload} className="final-download-btn">
              📥 Скачать {format.toUpperCase()}
            </button>
          </div>
        )}

        <div className="features">
          <div className="feature">
            <span>🚀</span>
            <h4>Быстро</h4>
            <p>Мгновенная конвертация</p>
          </div>
          <div className="feature">
            <span>🔒</span>
            <h4>Безопасно</h4>
            <p>Без регистрации</p>
          </div>
          <div className="feature">
            <span>🎯</span>
            <h4>Качественно</h4>
            <p>Высокое качество</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeDownloader;