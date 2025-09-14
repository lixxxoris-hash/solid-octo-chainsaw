# You2Fetch - YouTube to MP3/MP4 Converter

## Overview

You2Fetch is a web-based YouTube video converter frontend that provides the user interface for downloading YouTube videos in MP3 (audio) or MP4 (video) formats. This is a frontend-only deployment serving a pre-built React application through an Express.js server. The backend API for actual YouTube processing is not included in this import and would need to be implemented separately for full functionality.

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
- **Framework**: Express.js minimal server
- **Purpose**: Static file serving and SPA routing support for frontend assets
- **Server Configuration**: 
  - Serves static files with 1-year caching for assets (production-optimized)
  - Handles all routes with no-cache headers for the main HTML file
  - Supports React Router by serving index.html for all routes
  - Configured to use environment PORT for deployment compatibility

### File Structure
- `/frontend/` - Contains all client-side assets and the main HTML file
- `/server.js` - Express server entry point
- Static assets are pre-built and optimized for production

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

This is a frontend-only deployment. The YouTube video processing and conversion backend is not included in this import. The frontend will display an "operation was aborted" error when users try to submit YouTube URLs because there's no backend API to handle the conversion requests.

To make this fully functional, you would need to implement:
- Backend API endpoints for YouTube video processing
- YouTube video download capabilities (yt-dlp or similar)
- Video/audio conversion tools (FFmpeg)
- File serving and cleanup logic