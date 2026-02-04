# OAuth Integration Hub - Implementation Guide

## Overview

PIKO COMMAND now features a professional OAuth 2.0 Integration Hub that enables seamless social media account connections. This replaces manual API configurations with industry-standard OAuth flows for Twitter/X, Instagram, TikTok, Facebook, and LinkedIn.

## Features

### 1. **Secure OAuth 2.0 Flow**
- Industry-standard OAuth implementation
- State parameter validation to prevent CSRF attacks
- Token expiration and automatic refresh handling
- Secure credential storage using `window.spark.kv`

### 2. **Multi-Platform Support**
- **Twitter/X**: Direct tweet posting via Twitter API v2
- **Instagram**: Graph API integration for image/video posting
- **TikTok**: Content Posting API for video uploads
- **Facebook**: Graph API for page posts
- **LinkedIn**: Professional content sharing via LinkedIn API

### 3. **Smart Distribution Logic**
The `SocialMediaAdapter` now uses a smart fallback system:
1. **First**: Attempts API posting if platform is OAuth-connected
2. **Fallback**: Uses browser intents/clipboard method if API fails

### 4. **Professional UI/UX**
- Visual connection status indicators (● CONNECTED / ○ DISCONNECTED)
- Platform configuration tabs with masked credential fields
- Real-time connection testing
- Glassmorphism card effects matching PIKO COMMAND aesthetic
- Cyber Lime (#bef264) accent colors on connected platforms

## Architecture

### Core Files

#### `/src/lib/auth.ts`
OAuth manager handling:
- OAuth flow initiation
- Authorization callback processing
- Token refresh logic
- State validation
- Platform-specific endpoint configuration

#### `/src/components/SocialConnectHub.tsx`
Main integration UI featuring:
- Platform connection cards with visual status
- Tabbed credential configuration
- OAuth connection triggers
- Disconnect functionality
- Real-time connection state management

#### `/src/components/OAuthCallback.tsx`
OAuth callback handler that:
- Processes OAuth redirect callbacks
- Validates state parameters
- Posts messages to parent window
- Auto-closes after success/error

#### `/src/lib/SocialMediaAdapter.ts` (Enhanced)
Updated adapter with:
- OAuth connection checking
- API-first posting with fallback
- Platform-specific API implementations
- Credential validation

## Setup Instructions

### For End Users (Piko)

1. **Navigate to THE VAULT**
   - Click the "THE VAULT" tab in the main navigation
   - Select "Social Integrations" sub-tab

2. **For Each Platform:**
   - Click on the platform card (Twitter, Instagram, TikTok, etc.)
   - Configure API credentials in the form:
     - **Client ID** / **App ID** / **Client Key**
     - **Client Secret** / **App Secret**
   - Click **"CONNECT [PLATFORM]"**
   - Authorize PIKO COMMAND in the OAuth popup window
   - Connection confirmed with green ● CONNECTED indicator

3. **Platform-Specific Setup:**

   **Twitter/X:**
   - Go to https://developer.twitter.com/en/portal/dashboard
   - Create a new app or use existing
   - Enable OAuth 2.0 with Read & Write permissions
   - Set redirect URI: `[your-app-url]/oauth/callback`
   - Copy Client ID and Client Secret

   **Instagram:**
   - Go to https://developers.facebook.com/
   - Create Instagram Basic Display App
   - Configure OAuth redirect URIs
   - Copy App ID and App Secret

   **TikTok:**
   - Go to https://developers.tiktok.com/
   - Create new app
   - Request "Content Posting API" access
   - Set redirect URI and copy credentials

   **Facebook:**
   - Go to https://developers.facebook.com/
   - Create app with "pages_manage_posts" permission
   - Configure OAuth settings
   - Copy App ID and App Secret

   **LinkedIn:**
   - Go to https://www.linkedin.com/developers/
   - Create new app
   - Request "w_member_social" permission
   - Set OAuth redirect URIs
   - Copy Client ID and Client Secret

### Developer Notes

#### OAuth Flow Sequence

1. **Initiation**
   ```typescript
   OAuthManager.initiateOAuth(platform, authConfig)
   ```
   - Generates random state token
   - Stores state and platform in sessionStorage
   - Opens OAuth authorization window

2. **Authorization**
   - User authorizes in popup window
   - Platform redirects to `/oauth/callback?code=xxx&state=xxx`

3. **Callback Processing**
   ```typescript
   OAuthCallback component:
   - Validates state parameter
   - Posts message to parent window with code
   - Auto-closes popup
   ```

4. **Token Exchange**
   ```typescript
   SocialConnectHub message listener:
   - Receives OAuth code from callback
   - Calls OAuthManager.handleCallback()
   - Exchanges code for access token
   - Stores credentials in KV store
   - Updates UI connection status
   ```

#### Data Storage Schema

**`social-connections` KV Key:**
```typescript
{
  twitter?: {
    platform: 'twitter',
    connected: boolean,
    credentials: {
      accessToken: string,
      refreshToken?: string,
      expiresAt: number,
      userId?: string,
      username?: string
    },
    lastConnected: number,
    error?: string
  },
  // ... same structure for other platforms
}
```

**`oauth-config` KV Key:**
```typescript
{
  twitter?: {
    clientId: string,
    clientSecret: string
  },
  // ... same for other platforms
}
```

#### API Posting Implementation

When user clicks "BLAST ALL":

```typescript
SocialMediaAdapter.share(platform, payload):
1. Check if platform is OAuth-connected
2. If connected:
   - Validate token expiration
   - Refresh if needed
   - Attempt API post
   - Return if successful
3. If not connected OR API fails:
   - Fall back to browser intent
   - Copy to clipboard if needed
   - Open platform popup
```

Platform-specific API implementations in `SocialMediaAdapter.ts`:
- `postToTwitter()` - Twitter API v2
- `postToFacebook()` - Graph API
- `postToLinkedIn()` - LinkedIn UGC API
- `postToInstagram()` - Graph API (pending full implementation)
- `postToTikTok()` - Content Posting API (pending full implementation)

## Security Considerations

1. **Client-Side OAuth Limitations**
   - Client secrets must be treated as public in browser environments
   - For production: Consider backend proxy for token exchange
   - Current implementation suitable for single-user scenarios

2. **Token Storage**
   - Tokens stored in browser via `window.spark.kv`
   - Encrypted at rest
   - Never transmitted to external services
   - User-specific, not shared across devices

3. **CSRF Protection**
   - Random state parameter generated per OAuth flow
   - State validated on callback
   - sessionStorage ensures state tied to browser tab

4. **Scope Minimization**
   - Only requests necessary permissions per platform
   - Users can review permissions during OAuth flow
   - Tokens can be revoked from platform settings

## Troubleshooting

### "OAuth state mismatch" Error
- Clear browser cache and sessionStorage
- Try connection flow again
- Ensure popup blocker isn't interfering

### "Token exchange failed" Error
- Verify Client ID and Secret are correct
- Check redirect URI matches exactly
- Ensure app has correct permissions enabled

### API Posting Fails, Falls Back to Browser
- Check token hasn't expired
- Verify platform API permissions
- Review browser console for detailed error
- Platform may require additional verification steps

### Connection Shows as Disconnected
- Click platform tab to see error details
- Re-authorize if token expired
- Check if app was revoked in platform settings

## Future Enhancements

1. **Backend Token Exchange**
   - Move OAuth token exchange to secure backend
   - Protect client secrets from browser exposure
   - Enable multi-device token sync

2. **Advanced API Features**
   - Media upload support for all platforms
   - Post scheduling via platform APIs
   - Analytics and engagement metrics
   - Reply/comment management

3. **Additional Platforms**
   - YouTube Community Posts
   - Threads (Instagram's Twitter competitor)
   - Mastodon/Fediverse
   - Discord webhooks

4. **Token Management**
   - Visual token expiration countdown
   - Automatic background refresh
   - Multi-account support per platform
   - Credential import/export

## Testing Checklist

- [ ] OAuth flow completes successfully for each platform
- [ ] State validation prevents CSRF attacks
- [ ] Tokens stored securely in KV store
- [ ] Connection status updates in real-time
- [ ] Disconnect clears credentials properly
- [ ] API posting works when connected
- [ ] Fallback to browser intents works when disconnected
- [ ] Error messages are user-friendly
- [ ] Popup windows center on screen
- [ ] Callback auto-closes after processing
- [ ] Multiple connections don't interfere with each other

## Support Resources

- Twitter API Docs: https://developer.twitter.com/en/docs/twitter-api
- Instagram Graph API: https://developers.facebook.com/docs/instagram-api
- TikTok API: https://developers.tiktok.com/doc/overview
- Facebook Graph API: https://developers.facebook.com/docs/graph-api
- LinkedIn API: https://docs.microsoft.com/en-us/linkedin/

---

**Built for PIKO COMMAND** | Zero-Cost Distribution with Professional OAuth Integration
