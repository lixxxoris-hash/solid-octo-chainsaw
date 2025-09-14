# You2Fetch - YouTube to MP3/MP4 Converter

## Overview

You2Fetch is a full-stack web application for converting YouTube videos to MP3 (audio) or MP4 (video) formats. It consists of a React frontend and an Express.js backend with YouTube processing capabilities using ytdl-core and FFmpeg. The application is now fully configured to run in the Replit environment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology**: React-based single-page application (SPA)
- **Build System**: Vite (evidenced by the bundled asset naming pattern)
- **Styling**: Tailwind CSS for utility-first styling
- **Routing**: Client-side routing handled by React Router
- **Static Assets**: Pre-built and bundled JavaScript/CSS files served statically

### Backend Architecture
- **Framework**: Express.js API server with YouTube processing capabilities
- **Purpose**: YouTube video download and conversion API, plus static file serving
- **Key Dependencies**: ytdl-core, FFmpeg, fluent-ffmpeg
- **Server Configuration**: 
  - Runs on port 3001 in development, configurable PORT in production
  - Handles API routes for video processing (/api/download, /api/download-file)
  - Serves static React build files in production mode
  - Configured with CORS for cross-origin requests

### File Structure
- `/src/` - React frontend source code
  - `/components/` - YouTubeDownloader component
  - `App.jsx` - Main application component
  - `index.jsx` - Application entry point
- `/server.js` - Express server with API endpoints
- `/vite.config.js` - Vite build configuration
- `/index.html` - HTML template with metadata

### Caching Strategy
- **Static Assets**: Long-term caching (1 year) with immutable flag for performance
- **HTML File**: No-cache policy to ensure fresh content delivery
- Cache-Control headers properly configured for optimal performance

### SEO and Metadata
- Comprehensive meta tags for search engines (Google, Yandex, Bing)
- Multilingual keyword optimization (English and Russian)
- Proper favicon and app icon configuration
- Robots.txt configured to allow all search engine crawlers

## External Dependencies

### Core Dependencies
- **Express.js** (^4.18.2) - Web server framework for Node.js
- Standard Express middleware stack including body-parser for request handling

### Build Tools
- **Vite** - Modern build tool for frontend bundling and optimization (inferred from asset naming)
- **React** - Frontend framework for user interface
- **Tailwind CSS** - Utility-first CSS framework for styling

### External Services
- **YouTube API Integration** - Required for video metadata retrieval and download functionality (implementation not visible in current codebase)
- **Search Engine Verification** - Google Search Console, Yandex Webmaster tools integration

### Browser Support
- Modern ES6+ JavaScript features
- Progressive Web App capabilities with proper meta tags
- Cross-platform favicon support (SVG format with fallbacks)

## Current Status

The application is fully configured and running in the Replit environment:

### ✅ Completed Setup
- Dependencies installed and configured
- Frontend running on port 5000 with Vite dev server
- Backend API running on port 3001 with Express.js
- Proxy configuration set up for API calls
- Deployment configuration ready for production

### ✅ Current Status (2025-09-14)
- **FULLY WORKING**: YouTube to MP3/MP4 conversion is now fully functional
- Frontend running correctly on port 5000 with Vite dev server
- Backend API running correctly on port 3001 with Express.js
- Both MP3 and MP4 downloads working with HTTP 200 responses
- Host blocking issues completely resolved

### Recent Changes (2025-09-14)
- **MAJOR FIX**: Replaced broken ytdl-core library with yt-dlp-exec for reliable YouTube downloads
- Configured Vite with explicit host arrays for Replit proxy compatibility (fixed Vite 6.0.9+ bug)
- Implemented proper yt-dlp streaming using .exec() method with stdout access
- Added YouTube compatibility headers (referer, user-agent) for improved reliability
- Set up proper workflow configurations for frontend and backend
- Updated deployment settings for VM deployment with build and run commands
- ✅ **CONFIRMED WORKING**: Both /api/download and /api/download-file endpoints functional