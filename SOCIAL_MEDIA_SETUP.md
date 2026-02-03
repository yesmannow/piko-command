# Social Media API Authentication Guide

This guide explains how to set up Instagram, TikTok, and YouTube API authentication for real social media posting in THE LAB.

## Overview

THE LAB now supports real multi-platform posting to:
- **Instagram** (Reels & Feed)
- **TikTok** (Video uploads)
- **YouTube** (Shorts)
- **Twitter/X** (Posts with media)

## Quick Start

1. Navigate to the **SOCIAL** tab in THE LAB
2. Click **"Load Demo App Credentials"** to test the UI (demo mode only)
3. Click **"Demo Connect"** on any platform to simulate a connection
4. For real posting, follow the platform-specific setup guides below

## Platform Setup Guides

### Instagram (Meta for Developers)

**Prerequisites:**
- Meta Developer account
- Instagram account (must be a Business or Creator account)

**Steps:**

1. **Create a Meta App**
   - Go to [developers.facebook.com](https://developers.facebook.com/)
   - Click "Create App" → Choose "Business" type
   - Fill in app details and create

2. **Add Instagram Basic Display**
   - In your app dashboard, click "Add Product"
   - Find "Instagram Basic Display" and click "Set Up"
   - Click "Create New App" in the Basic Display settings

3. **Configure OAuth Settings**
   - Under "Basic Display" → "User Token Generator"
   - Add your OAuth Redirect URI: `https://your-app-url.com`
   - Save changes

4. **Get Credentials**
   - Copy your **App ID**
   - Copy your **App Secret** (Settings → Basic)
   - Add these to THE LAB → SOCIAL tab → Instagram section

5. **Add Test Users**
   - Go to Roles → Instagram Testers
   - Add your Instagram account
   - Accept the invite on Instagram

6. **Connect in THE LAB**
   - Enter App ID, App Secret, and Redirect URI
   - Click "Connect Instagram"
   - Authorize the app when redirected

---

### TikTok (TikTok for Developers)

**Prerequisites:**
- TikTok account
- TikTok Developer account

**Steps:**

1. **Create Developer Account**
   - Go to [developers.tiktok.com](https://developers.tiktok.com/)
   - Sign up with your TikTok account
   - Complete developer verification

2. **Create an App**
   - In Developer Portal, click "Create App"
   - Fill in app details (name, category, etc.)
   - Submit for review (may take 1-3 days)

3. **Request Content Posting API Access**
   - Once app is approved, request access to "Content Posting API"
   - This requires additional verification and use case description
   - Approval may take several days

4. **Configure Login Kit**
   - In your app settings, go to "Login Kit"
   - Add Redirect URI: `https://your-app-url.com`
   - Enable required scopes:
     - `video.upload`
     - `video.publish`

5. **Get Credentials**
   - Copy your **Client Key**
   - Copy your **Client Secret**
   - Add these to THE LAB → SOCIAL tab → TikTok section

6. **Connect in THE LAB**
   - Enter Client Key, Client Secret, and Redirect URI
   - Click "Connect TikTok"
   - Authorize the app when redirected

---

### YouTube (Google Cloud Console)

**Prerequisites:**
- Google account
- YouTube channel

**Steps:**

1. **Create Google Cloud Project**
   - Go to [console.cloud.google.com](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Give it a descriptive name

2. **Enable YouTube Data API v3**
   - In your project, go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Configure OAuth consent screen first if prompted
   - Choose "Web application" as application type

4. **Configure OAuth Client**
   - Add Authorized redirect URIs: `https://your-app-url.com`
   - Save and create

5. **Get Credentials**
   - Copy your **Client ID** (looks like: `123456-abc.apps.googleusercontent.com`)
   - Copy your **Client Secret**
   - Add these to THE LAB → SOCIAL tab → YouTube section

6. **Configure OAuth Consent Screen** (Important!)
   - Add your email as a test user
   - Set publishing status to "Testing" (for development)
   - Add required scopes:
     - `https://www.googleapis.com/auth/youtube.upload`
     - `https://www.googleapis.com/auth/youtube`

7. **Connect in THE LAB**
   - Enter Client ID, Client Secret, and Redirect URI
   - Click "Connect YouTube"
   - Authorize the app and select your YouTube channel

---

## Using Real Social Media Posting

### After Connecting Platforms:

1. **Go to THE DROP tab**
2. **Upload your media** (audio/video/image)
3. **Write your caption**
4. **Select platforms** - Connected platforms show a ✓ checkmark
5. **Click DROP IT**

The app will:
- Post to all selected AND connected platforms
- Show success/failure for each platform
- Save the post to your history
- Display platform-specific URLs

### Platform Requirements:

**Instagram:**
- Videos: MP4, H.264, max 60 seconds for Reels
- Images: JPG/PNG, square or vertical
- Captions: max 2,200 characters

**TikTok:**
- Videos: MP4, H.264, 3 seconds to 10 minutes
- Resolution: 720p minimum
- Captions: max 2,200 characters

**YouTube Shorts:**
- Videos: MP4, vertical (9:16), max 60 seconds
- Resolution: 1080p recommended
- Titles: max 100 characters

---

## Troubleshooting

### "Failed to connect [Platform]"
- Check that App ID/Client ID and Secret are correct
- Verify Redirect URI matches exactly (including https://)
- Ensure app is in "Development" or "Testing" mode
- Check that required scopes/permissions are enabled

### "Token expired"
- Click "Disconnect" and reconnect
- Some tokens expire after 60 days (Instagram) or need refresh

### "Upload failed"
- Check file size and format requirements
- Verify your account has posting permissions
- For TikTok: ensure Content Posting API is approved

### "Platform not connected" during post
- The platform checkbox is selected but OAuth not completed
- Go to SOCIAL tab and connect the platform first

---

## Security Notes

- All tokens are stored locally in your browser
- Tokens are never sent to external servers (except the platforms themselves)
- App credentials should be kept secret
- For production apps, use environment variables for secrets

---

## Demo Mode

THE LAB includes a demo mode for testing:

1. Click **"Load Demo App Credentials"** in the SOCIAL tab
2. Click **"Demo Connect"** for any platform
3. Posts will be simulated (not actually sent to platforms)
4. Great for testing the UI and workflow

---

## Production Checklist

Before going live with real posting:

- [ ] All platforms have approved apps
- [ ] OAuth credentials are properly configured
- [ ] Test users added (Instagram)
- [ ] Content Posting API approved (TikTok)
- [ ] OAuth consent screen published (YouTube)
- [ ] Redirect URIs use HTTPS in production
- [ ] Test posting on all platforms
- [ ] Monitor API quotas and rate limits

---

## API Rate Limits

Be aware of platform rate limits:

- **Instagram:** 25 API calls per user per 24 hours
- **TikTok:** 100 video uploads per day
- **YouTube:** 10,000 quota units per day (1 upload = ~1,600 units)

---

## Support

For issues with:
- **Platform APIs:** Check official developer documentation
- **THE LAB app:** Review this guide and check connection status
- **OAuth errors:** Verify credentials and redirect URIs match exactly

---

## Resources

- [Instagram API Documentation](https://developers.facebook.com/docs/instagram-api)
- [TikTok API Documentation](https://developers.tiktok.com/doc)
- [YouTube API Documentation](https://developers.google.com/youtube/v3)
- [OAuth 2.0 Guide](https://oauth.net/2/)
