# THE LAB - Hip-Hop Artist Social Media Hub

A high-energy, professional social media distribution hub designed for hip-hop/rap artists. The Lab combines studio-grade workflow automation with aggressive, high-contrast aesthetics—dark backgrounds, neon accents, and bold typography that matches the intensity of the booth.

**Experience Qualities**:
1. **Aggressive** - The interface should feel like entering a recording studio booth—dark, focused, with high-contrast neon accents that demand attention and energize creativity.
2. **Professional** - Mobile-first design with large touch targets and instant feedback, built for artists on the move who need to drop content from anywhere.
3. **Intelligent** - AI-powered tools that understand hip-hop culture, automatically generate smart links, analyze lyrics for captions, and manage release schedules without manual tracking.

**Complexity Level**: Complex Application (advanced functionality with multiple views)
This is a comprehensive artist workflow tool featuring multi-platform content distribution, AI lyric analysis, smart link generation, multi-format video preview, unified comment management, release calendar automation, and real-time performance visualization. It manages complex state across media uploads, platform-specific formatting, scheduled notifications, and cross-platform engagement data.

## Essential Features

### The Drop Button (One-Touch Distribution)
- **Functionality**: Single upload interface for audio/video + caption that auto-formats for Instagram Reels, TikTok, YouTube Shorts, and X simultaneously
- **Purpose**: Eliminate platform-specific reformatting—drop once, distribute everywhere with format-specific optimization
- **Trigger**: User clicks "THE DROP" button after uploading media and writing caption
- **Progression**: User uploads audio/video file → Writes single caption → App auto-generates smart link → Formats caption for each platform (character limits, hashtags) → Shows multi-platform preview → User confirms → Distributes to all selected platforms → Success celebration
- **Success Criteria**: Video auto-formats to vertical 9:16 for Reels/TikTok/Shorts, captions adapt to platform limits, smart link included in all posts, distribution completes within 10 seconds

### Smart Music Links (Auto-Generated)
- **Functionality**: When track is posted, automatically create a Linktree/Songwhip-style landing page and inject the link into post captions
- **Purpose**: Drive traffic to a unified music link without manual link creation or copy-paste
- **Trigger**: Automatically activates when user posts content marked as "track release"
- **Progression**: User marks post as track → App generates unique short URL → Creates smart link page with Spotify/Apple Music/YouTube placeholders → Inserts link into all platform captions → Page persists and is editable
- **Success Criteria**: Link generates in under 2 seconds, appears in all captions, landing page is mobile-responsive, links persist in KV store

### Visual Asset Preview (Multi-Format)
- **Functionality**: Side-by-side previewer showing how uploaded video appears as IG Reel vs TikTok vs YouTube Short vs X video
- **Purpose**: Catch formatting issues before posting—see exactly how the video will crop/display on each platform
- **Trigger**: Automatically displays when video is uploaded
- **Progression**: User uploads video → App analyzes dimensions → Displays 4 preview windows showing platform-specific crops → User can adjust framing → Confirms or re-uploads
- **Success Criteria**: Previews render within 1 second, accurately represent platform video players, show safe zones for text/faces

### AI Lyric-to-Caption (Content Intelligence)
- **Functionality**: Analyzes uploaded track audio/lyrics and auto-generates hard-hitting captions, punchlines, and trending rap hashtags
- **Purpose**: Turn lyrics into viral social content without manual effort—the AI understands rap culture and creates authentic captions
- **Trigger**: User uploads audio file or pastes lyrics into lyric input field → Clicks "Extract Bars" button
- **Progression**: User uploads track → AI extracts/analyzes lyrics → Generates 3 caption styles (Quotable Bar, Hype Announcement, Story/Context) → Suggests trending hashtags → User selects preferred version → Caption populates composer
- **Success Criteria**: AI identifies best quotable lyrics, suggests hashtags with 10k+ usage, generates culturally authentic language, completes in under 5 seconds

### Beat-Sync Reminders (Release Calendar)
- **Functionality**: Tracks release dates and automatically sends notifications to post teasers at strategic times (3 days before, 1 day before, midnight of drop)
- **Purpose**: Never miss a drop window—the app manages release marketing timing automatically
- **Trigger**: User adds release date to track → App schedules notification sequence
- **Progression**: User enters track title + release date → App creates reminder schedule → At trigger times, sends notification with pre-templated teaser post → User can quick-post or customize → Post goes live
- **Success Criteria**: Notifications fire at exact scheduled times, include pre-written teaser templates, one-tap posting works, calendar syncs across devices

### Engagement Quick-Stunt (Unified Comments)
- **Functionality**: Aggregated view of fan comments from all platforms; blast a single reply to multiple platforms simultaneously
- **Purpose**: Engage fans across platforms without switching apps—respond once, reach everyone
- **Trigger**: User opens "Comments" tab → Sees unified feed → Selects multiple comments → Types one reply → Blasts to all
- **Progression**: User views comment feed (sorted by recency) → Filters by platform if desired → Selects comments to reply to → Types single response → Chooses "Blast All" or individual platforms → Reply posts to selected platforms
- **Success Criteria**: Comments load in real-time from IG/X/TikTok, replies post within 3 seconds, blast feature sends identical reply to all selected comments

### Instant Media Handling (Performance)
- **Functionality**: High-speed upload with real-time progress bars and automatic video compression for fast distribution
- **Purpose**: Artists need speed—no waiting 10 minutes to upload. Compress and optimize in the background while maintaining quality
- **Trigger**: User selects media file → Upload and compression begin immediately
- **Progression**: User drops file → Upload progress bar animates → Compression runs in parallel → Shows before/after file sizes → Completion in under 30 seconds for most files
- **Success Criteria**: Progress bar updates smoothly, compression reduces file size by 40%+ without visual degradation, large files (100MB+) compressed to under 50MB

### Hype Meters (Performance Visuals)
- **Functionality**: Real-time visualization of engagement using animated "hype meters" instead of boring charts—shows shares, fire emojis, comments as energy bars
- **Purpose**: Make analytics feel energizing and motivational, not analytical and dry
- **Trigger**: Auto-loads on dashboard; updates when new engagement data arrives
- **Progression**: User views dashboard → Hype meters animate in → Bars pulse with new activity → Hover shows exact numbers → Click for detailed breakdown
- **Success Criteria**: Animations are fluid (60fps), meters respond to real-time data, visual language matches studio aesthetic (VU meters, spectrum analyzers)

### Studio-to-Web Upload (R2 Integration)
- **Functionality**: Upload audio tracks directly to Cloudflare R2 storage with automatic GitHub repository sync to update artist website; includes demo track upload simulation for testing
- **Purpose**: Streamline the workflow from studio production to live website—no manual file uploads or repo updates needed; verify integration with test data
- **Trigger**: User selects audio file in Studio tab → Enters track metadata → Clicks "Upload & Sync" OR clicks "Demo: Upload Random Track" to simulate upload flow
- **Progression**: User uploads track file → App uploads to R2 bucket → Generates public R2 URL → Updates GitHub repo's tracks.json → Triggers Vercel redeploy → Track appears on live website → Success confirmation (OR) Demo mode: generates random track metadata → simulates upload/sync with progress animation → adds demo track to uploaded list → celebration effect
- **Success Criteria**: Upload completes within 30 seconds for 50MB file, GitHub API call succeeds, tracks.json properly formatted, no data loss, progress bar shows accurate status, demo upload provides realistic simulation of integration flow with confetti celebration

### Vault Settings (Credential Management)
- **Functionality**: Secure storage interface for R2 access keys, bucket configuration, and GitHub personal access token with one-click test credential loading
- **Purpose**: Centralize all API credentials in one secure location with password masking and validation; provide demo credentials for testing integration flow
- **Trigger**: User clicks "Vault" tab to configure credentials OR clicks "Load Test Credentials" for demo mode
- **Progression**: User enters R2 Account ID → Bucket name → Access keys → GitHub owner/repo → Personal access token → Saves to encrypted KV storage → Validates required fields → Success confirmation (OR) User clicks "Load Test Credentials" → All fields auto-populate with demo values → User can test Studio upload flow
- **Success Criteria**: All credentials stored securely in KV, password fields masked by default with toggle, validation prevents missing fields, credentials persist across sessions, test credentials enable demo upload functionality

### Live Website Preview (Website Integration)
- **Functionality**: Embedded iframe showing live artist website (https://piko-artist-website.vercel.app/) to verify uploaded tracks appear correctly
- **Purpose**: Provide instant visual feedback that tracks synced successfully without leaving the app
- **Trigger**: Auto-loads in Studio tab; refreshes after successful upload
- **Progression**: User views Studio tab → Iframe loads live website → User uploads track → After sync completes, can verify track appears → Click "Open in New Tab" for full-screen view
- **Success Criteria**: Iframe loads within 3 seconds, displays website responsively, new tracks visible after GitHub sync, external link opens correctly


## Edge Case Handling
- **Empty Composer Send**: Disable send button when textarea is empty; show subtle visual feedback
- **Character Limit Overflow**: Display warning color (Cyber Lime) when approaching limits, red when exceeded
- **No Platform Selected**: Require at least one platform checkbox before allowing send
- **API Failure States**: Show retry button with clear error messaging using toast notifications
- **Empty Post History**: Display encouraging empty state with icon and call-to-action
- **Slow LLM Response**: Show skeleton loading states during AI generation with timeout fallback
- **Large Media Files**: Show file size warnings for files over 100MB; automatically compress images when auto-optimize is enabled
- **Compression Failures**: Gracefully fall back to original file if compression fails; show error toast
- **No Images to Optimize**: Disable optimize button and show informative message when all images are already optimized or only videos are present
- **Missing Vault Credentials**: Prevent upload attempts and show clear error when R2/GitHub credentials not configured
- **R2 Upload Failure**: Display specific error message with retry option; maintain upload progress state
- **GitHub API Failure**: Handle authentication errors, rate limits, and file conflicts gracefully
- **Invalid Audio Format**: Validate file type before upload; show supported formats list
- **Network Timeout**: Implement timeout handling for long uploads with resume capability indication
- **Empty Uploaded Tracks**: Show encouraging empty state with upload call-to-action
- **Iframe Load Failure**: Show fallback message if website preview cannot load
- **Test Credentials Mode**: Demo credentials populate all fields for testing; show clear indicator when in test mode; demo uploads don't hit real APIs but simulate full flow
- **Demo Track Upload**: Generates random track from preset list; simulates realistic upload timing; shows all progress states; adds to local storage only

## Design Direction
The design should feel like stepping into a high-end recording studio at night—almost pitch black with aggressive neon accents cutting through the darkness. High contrast is key: sharp whites for text, electric neon for actions, deep blacks for backgrounds. Typography should be bold and commanding. Every interaction should feel tactile and immediate, optimized for mobile touch with large targets and instant visual feedback. This is a professional tool that looks like it belongs in a booth, not a boardroom.

## Color Selection
Aggressive, high-contrast palette inspired by studio equipment and neon-lit city streets.

- **Primary Color (Electric Magenta #ff00ff / oklch(0.701 0.322 328))**: Aggressive neon accent for "THE DROP" button and critical actions—impossible to miss, demands attention
- **Secondary Color (Neon Cyan #00ffff / oklch(0.906 0.195 195))**: Electric accent for success states, active elements, and hype visualizations
- **Accent Color (Hot Orange #ff3366 / oklch(0.646 0.237 16))**: Warning/alert color for character limits, notifications, and engagement spikes
- **Background (Pure Black #000000 / oklch(0 0 0))**: Absolute black background for maximum contrast and studio atmosphere
- **Surface (Dark Gray #111111 / oklch(0.15 0 0))**: Slightly elevated surfaces for cards, maintaining dark aesthetic
- **Foreground (Pure White #ffffff / oklch(1 0 0))**: Crisp white text for maximum readability against black
- **Muted (Gray #666666 / oklch(0.5 0 0))**: Secondary text and disabled states

**Foreground/Background Pairings**:
- Primary (Electric Magenta #ff00ff): White text (#ffffff) - Ratio 6.1:1 ✓
- Secondary (Neon Cyan #00ffff): Black (#000000) - Ratio 12.6:1 ✓
- Accent (Hot Orange #ff3366): White (#ffffff) - Ratio 4.8:1 ✓
- Background (Pure Black #000000): White (#ffffff) - Ratio 21:1 ✓
- Surface (Dark Gray #111111): White (#ffffff) - Ratio 18.2:1 ✓

## Font Selection
Bold, aggressive typography that commands attention—inspired by album covers and studio interfaces.

- **Typographic Hierarchy**:
  - H1 (App Title "THE LAB"): Bebas Neue Bold/48px/ultra-tight tracking (-0.05em)/uppercase - maximum impact
  - H2 (Section Headers): Bebas Neue/28px/tight tracking/uppercase - aggressive hierarchy
  - H3 (Feature Labels): Inter Black/16px/wide tracking (0.05em)/uppercase - bold labels
  - Body (Primary Content): Inter Regular/15px/relaxed line-height (1.6) - readable at mobile scale
  - Caption (Metadata/Stats): Inter Medium/13px/wide tracking (0.03em)/uppercase - technical feel
  - Button Labels: Inter Black/15px/normal tracking/uppercase - strong call-to-action

## Animations
Animations should feel studio-grade—precise, purposeful, and energetic without being distracting. They reinforce the premium quality and add moments of delight during key interactions.

Key animation moments:
- **Micro-interactions**: Buttons scale 1.02x on hover with subtle glow (200ms ease-out), creating tactile feedback
- **Success Confetti**: Dramatic celebration when post is sent, reinforcing accomplishment
- **Progress Bars**: Animate from 0 to value with easing (600ms) on mount for satisfying reveal
- **Card Hover**: Lift effect with increased glow and slight scale (150ms) on glassmorphic cards
- **Tab Transitions**: Smooth content fade and slide (300ms) when switching between Ghostwriter options
- **Loading States**: Pulsing skeleton screens with shimmer effect during async operations

## Component Selection

**Components**:
- **Button** (shadcn): Primary actions with variants (default for Electric Indigo, outline for secondary, ghost for tertiary)
- **Card** (shadcn): All content containers with custom glassmorphism styling applied via className
- **Textarea** (shadcn): Main composer input with character counter integration
- **Checkbox** (shadcn): Platform selectors (IG, X, TikTok) with custom Electric Indigo accent
- **Progress** (shadcn): Hype Metrics visualization with custom color overrides
- **Tabs** (shadcn): Ghostwriter remix style selector
- **ScrollArea** (shadcn): Live Feed horizontal scroll container
- **Separator** (shadcn): Visual dividers between sections
- **Badge** (shadcn): Platform indicators and stat labels
- **Toast** (sonner): Success/error notifications with custom styling

**Customizations**:
- **Glassmorphism Cards**: Custom CSS classes applying backdrop-blur-xl, bg-zinc-900/40, border-zinc-800/50, shadow-2xl
- **Glow Effects**: Box-shadow with Electric Indigo/Cyber Lime at varying opacity for hover states
- **Media Dropzone**: Custom component with dashed border, drag-over state, and file preview
- **Character Counter**: Custom component showing platform-specific limits with color-coded warnings
- **Post Card**: Custom component for Live Feed with thumbnail, excerpt, timestamp, and republish button

**States**:
- **Buttons**: Default (solid Electric Indigo) → Hover (scale + glow) → Active (scale down) → Disabled (opacity 40%)
- **Inputs**: Default (zinc-800 border) → Focus (Electric Indigo ring glow) → Error (red border) → Disabled (muted)
- **Cards**: Rest (subtle border) → Hover (lifted with enhanced glow) → Active (pressed state for clickable)
- **Checkboxes**: Unchecked (zinc-700) → Checked (Electric Indigo with white check) → Hover (ring glow)

**Icon Selection**:
- **Send**: Send (paper plane) for post submission
- **Sparkles**: For AI Ghostwriter button
- **Instagram/Twitter/TikTok**: Brand icons for platform selection (using Lucide social icons)
- **Music**: For The Vault section header
- **Clock**: For timestamp in Live Feed
- **TrendingUp**: For Hype Metrics
- **Image**: For media upload indicator
- **RotateCcw**: For republish action
- **AlertCircle**: For error states
- **Check**: For success confirmations and optimized badges
- **Settings**: For Vault settings tab
- **Gauge**: For quality/compression indicators
- **Zap**: For optimize action (fast/electric connotation)
- **Database**: For Studio tab (R2 storage)
- **Upload**: For track upload interface
- **Globe**: For live website preview
- **Eye/EyeOff**: For password field visibility toggle
- **Key**: For credential security indicators
- **Github**: For GitHub integration section
- **ExternalLink**: For opening website in new tab
- **Loader2**: For async operation loading states
- **CheckCircle**: For successful upload/sync confirmations

**Spacing**:
- Container padding: p-6 (24px) on desktop, p-4 (16px) on mobile
- Grid gap: gap-6 (24px) on desktop, gap-4 (16px) on mobile
- Card internal padding: p-6
- Button padding: px-6 py-3 for primary, px-4 py-2 for secondary
- Section spacing: space-y-4 for related elements, space-y-8 for distinct sections
- Bento grid cell min-heights: Large (400px), Medium (300px), Wide (250px), Small (200px)

**Mobile**:
- **Mobile-First Priority**: All touch targets minimum 48px × 48px for thumb-friendly interaction
- **Single-column Stack**: Features stack vertically with generous spacing (24px gaps)
- **Large Action Buttons**: "THE DROP" button is full-width and 64px tall on mobile
- **Bottom Navigation**: Fixed bottom bar on mobile for quick access to Drop/Comments/Calendar/Metrics
- **Swipe Gestures**: Horizontal swipe between major sections, vertical scroll within
- **Instant Feedback**: Every touch shows immediate visual response (scale/glow) within 100ms
- **Optimized Video Previews**: Stack vertically on mobile, each preview takes 50% screen width
- **Quick Actions**: Long-press on posts for instant republish menu
