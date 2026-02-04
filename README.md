# 🎵 PIKO COMMAND

PIKO COMMAND is a brutalist, technically sophisticated social media distribution platform designed for professional content distribution. Built with GitHub-native asset storage, automated metadata sync, AI-powered caption generation, and advanced multi-platform management features.

## 🚀 Features

- **Multi-Platform Distribution** - Distribute content to Instagram, TikTok, X (Twitter), Facebook, and LinkedIn with a single click
- **OAuth Integration Hub** - Professional OAuth 2.0 connections for direct API posting to all major platforms
- **Smart Distribution Logic** - API-first posting with automatic fallback to browser intents
- **AI Caption Generation** - Generate platform-optimized caption variants using AI
- **Visual Timeline Calendar** - Track all distributed posts with a beautiful timeline view
- **Platform Preview** - Preview how your content will appear on each platform before posting
- **GitHub-Native Asset Storage** - Direct upload of audio tracks and cover art to GitHub repository
- **YouTube Vault Integration** - Display and share latest YouTube videos
- **Prompt Library** - Save and reuse AI prompt templates for consistent caption generation

## 🔐 OAuth Integration

PIKO COMMAND features industry-standard OAuth 2.0 integration for seamless social media connections:

### Supported Platforms
- **Twitter/X** - Direct tweet posting via Twitter API v2
- **Instagram** - Graph API integration for posts
- **TikTok** - Content Posting API for video uploads
- **Facebook** - Graph API for page posts
- **LinkedIn** - Professional content sharing

### Setup
1. Navigate to **THE VAULT** → **Social Integrations**
2. Configure OAuth credentials for each platform
3. Click **CONNECT** to authorize
4. Posts will use official APIs when connected, browser intents as fallback

See [OAUTH_INTEGRATION.md](OAUTH_INTEGRATION.md) for detailed setup instructions.

### Environment Variables (Optional)
OAuth credentials can be configured via environment variables:

```bash
# Copy example file
cp .env.example .env

# Add your credentials
VITE_TWITTER_CLIENT_ID=your_client_id
VITE_TWITTER_CLIENT_SECRET=your_client_secret
# ... (see .env.example for all platforms)
```

## 🛠️ Tech Stack

- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI components
- Framer Motion for animations
- GitHub Spark integration

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## 🔒 Security & Code Quality

PIKO COMMAND implements industry-standard security practices:

- **Input Sanitization** - All user inputs are sanitized to prevent XSS and injection attacks
- **Type Safety** - Full TypeScript coverage with strict type checking
- **Secure Logging** - Centralized logger with environment-aware output
- **API Key Validation** - Format validation for GitHub and YouTube API keys
- **Error Handling** - Comprehensive error handling with detailed context logging

## 🏗️ Architecture

### Core Services
- **Logger Service** (`src/lib/logger.ts`) - Centralized logging with component tracking
- **Sanitization** (`src/lib/sanitize.ts`) - Input validation and sanitization utilities
- **Social Media Adapter** (`src/lib/SocialMediaAdapter.ts`) - Multi-platform sharing engine
- **GitHub Uploader** (`src/lib/githubAssetUploader.ts`) - Direct repository asset management

### Key Features Status
✅ **Fully Implemented:**
- Multi-platform social media distribution
- GitHub-native asset storage
- AI caption generation (Ghostwriter)
- Visual timeline calendar
- Platform preview mockups
- Prompt library
- YouTube vault integration

⚠️ **Browser Intent Based:**
- Social media posting uses browser intents + clipboard for maximum reliability
- No OAuth complexity - simpler and more maintainable

## 🎨 Design Philosophy

Brutalist technical aesthetic with cyberpunk neon accents and graffiti culture DNA. Command-line inspired labels, monospace fonts for data entry, aggressive neon glows on key actions. Feels like a professional production studio control panel built by street artists.

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
