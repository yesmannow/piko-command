# PIKO COMMAND - Professional Studio-to-Social Hub

A high-end, zero-cost browser-based distribution platform for independent hip-hop artists to upload tracks to Cloudflare R2, sync metadata to GitHub, and distribute content across social platforms using browser intents.

PIKO COMMAND is a brutalist, technically sophisticated social media distribution platform designed for professional content distribution with R2 cloud storage, GitHub automation, AI-powered caption generation, and YouTube vault integration.

## Essential Features

### 1. Studio-to-Web Upload Pipeline (Cloudflare R2 + GitHub)
- **Functionality**: Dual-file concurrent upload (audio track + cover art) to Cloudflare R2, followed by automatic GitHub repository sync
- **Purpose**: Enable zero-friction distribution from studio to live website with automated deployment triggers
- **Trigger**: User selects audio file and optional cover image, fills in metadata, clicks "UPLOAD & SYNC"
- **Progression**: Files selected → Metadata entered → "UPLOAD & SYNC" clicked → Concurrent R2 uploads (audio + cover) with progress bars → GitHub API updates tracks.json in piko-artist-website repo → Vercel auto-deploys → Success confetti → Track appears in uploaded history
- **Success criteria**: Both files upload to R2 with clean filenames, GitHub tracks.json updated with new track metadata and R2 URLs, Vercel redeploys website automatically, user sees real-time upload progress

### 2. Browser-Intent Social Distribution (Zero-Cost Posting)
- **Functionality**: Multi-platform distribution using native browser clipboard and share intents
- **Purpose**: Instant social media posting without API fees or third-party services
- **Trigger**: User writes caption, selects platforms, clicks "DROP IT"
- **Progression**: Caption written → Platforms selected → "DROP IT" clicked → Instagram/TikTok: caption copied to clipboard + platform URLs opened → X/Facebook/LinkedIn: pre-filled share intent URLs opened → Post logged to history → Confetti celebration
- **Success criteria**: Clipboard successfully copies caption for IG/TikTok, correct platform URLs open in new tabs with pre-filled content, smart link to PIKO website auto-appended to all captions

### 3. AI Caption Remix (3 Styles via window.spark.llm)
- **Functionality**: Transform any input (video URL, draft caption) into three optimized caption styles using AI
- **Purpose**: Generate platform-specific captions that maximize engagement without manual copywriting
- **Trigger**: User clicks "REMIX AI" button with caption/URL in text field
- **Progression**: Button click → AI analyzes input → Three caption variants generated ([STREET HYPE], [OFFICIAL PROMO], [VIRAL]) → User selects preferred style → Caption populated in main field
- **Success criteria**: AI returns three distinct captions under character limits, each optimized for different platform contexts (emoji-heavy street hype, professional promo with CTA, short punchy viral)

### 4. YouTube Video Vault (Real API Integration)
- **Functionality**: Display PIKO's actual latest YouTube videos via YouTube Data API v3 with quick-share buttons to inject video URLs directly into the composer
- **Purpose**: Streamline promotion of YouTube content by providing instant access to real video library with live data
- **Trigger**: Vault displays automatically on Launchpad view, refreshes on demand
- **Progression**: App loads → YouTube API fetches latest 10 videos with thumbnails, titles, view counts, and publish dates → Videos displayed in scrollable vault → User clicks "Quick Share" → Video title + URL injected into caption field → Optional: User configures API key in settings panel
- **Success criteria**: Real YouTube videos fetched via API, displays with actual thumbnails/metadata/view counts, graceful fallback to mock data if no API key configured, quick-share injects correct URL and title into composer, API key persists between sessions

### 5. Vault Settings (Secure Credential Storage)
- **Functionality**: Secure input and persistent storage of Cloudflare R2 credentials (Account ID, Access Key, Secret Key, Bucket Name) and GitHub Personal Access Token
- **Purpose**: Enable R2 uploads and GitHub automation without exposing credentials
- **Trigger**: User navigates to "The Vault" tab
- **Progression**: Tab opened → User inputs R2 credentials (Account ID, Bucket Name, Access Key, Secret Key) → User inputs GitHub credentials (Token, Repo, Owner) → "SAVE VAULT" clicked → Credentials persisted via window.spark.kv → Success confirmation shown
- **Success criteria**: All credentials persist between sessions, vault status indicator shows "configured" when all fields filled, credentials never exposed in logs or console, test credentials button available for demo mode

### 6. Post History Tracking
- **Functionality**: Persistent log of all distributed posts with timestamps, platforms, and captions
- **Purpose**: Provide content audit trail and reusable caption library
- **Trigger**: Automatic logging on every "DROP IT" execution
- **Progression**: Post distributed → Entry created with caption, platforms array, timestamp, and link status → Saved to persistent storage → Displayed in History view in reverse chronological order
- **Success criteria**: All posts persist between sessions, history displays with platform badges and timestamps, captions remain fully readable

## Edge Case Handling
- **No API Keys**: Graceful fallback to mock YouTube data, vault status shows "unconfigured" warning
- **Failed R2 Upload**: Clear error toast with specific failure reason, progress bars reset, files remain selected for retry
- **Failed GitHub Sync**: Error toast indicates sync failure but R2 URLs still saved, manual retry option available
- **Clipboard Denied**: Fallback toast instructs user to manually copy caption displayed on screen
- **Character Limit Exceeded**: Real-time counter shows red when over limit, warns user before posting
- **No Platforms Selected**: "DROP IT" button disabled, tooltip explains platform selection required
- **Empty Caption**: Button disabled, clear validation message displayed

## Design Direction
Brutalist technical aesthetic with cyberpunk neon accents. Command-line inspired labels, monospace fonts for data entry, neon glows on key actions. Feels like a professional production studio control panel meets underground graffiti culture.

## Color Selection
High-contrast neon-on-dark palette inspired by cyberpunk aesthetics and street art spray paint colors.

- **Primary Color**: `oklch(0.75 0.25 330)` - Hot Magenta/Pink - Brand identity, main CTAs, logo glows
- **Secondary Colors**: 
  - `oklch(0.70 0.28 195)` - Electric Cyan for success states and AI features
  - `oklch(0.78 0.26 75)` - Cyber Yellow for warnings and highlights
  - `oklch(0.68 0.24 120)` - Neon Lime for "DROP IT" button and engagement metrics
- **Accent Color**: `oklch(0.65 0.25 25)` - Graffiti Orange for destructive actions and upload triggers
- **Background**: `oklch(0.09 0.01 0)` - Pure zinc-950 creating maximum contrast for brutalist aesthetic
- **Foreground/Background Pairings**:
  - Primary (Hot Magenta `oklch(0.75 0.25 330)`): White text (`oklch(0.98 0.01 90)`) - Ratio 10.2:1 ✓
  - Secondary (Electric Cyan `oklch(0.70 0.28 195)`): Dark background (`oklch(0.12 0.02 265)`) - Ratio 6.8:1 ✓
  - Accent (Cyber Yellow `oklch(0.78 0.26 75)`): Dark background (`oklch(0.12 0.02 265)`) - Ratio 8.1:1 ✓
  - Background (Zinc-950 `oklch(0.09 0.01 0)`): White text (`oklch(0.98 0.01 90)`) - Ratio 16.5:1 ✓

## Font Selection
Monospace and display fonts that communicate technical precision with underground street energy.

- **Typographic Hierarchy**:
  - **H1 (App Title "PIKO COMMAND")**: Bebas Neue / 48-96px / Uppercase / Glitch effect on hover with neon color shifts
  - **H2 (Section Headers)**: Bebas Neue / 24-32px / Uppercase / Gradient text (lime to cyan)
  - **Body Text**: Barlow / 14-16px / Regular weight / High line-height (1.6)
  - **Labels**: Rajdhani Bold / 10-12px / Uppercase / Extra-wide tracking (0.15em) / Command-line style
  - **Caption Input**: Teko Medium / 16px / Monospace feel / Technical data entry aesthetic
  - **Buttons**: Bebas Neue Bold / 14-18px / Uppercase / Wide tracking

## Animations
Purposeful animations that enhance feedback and create moments of celebration without slowing workflow.

- **Glitch effect on title**: 0.3s keyframe animation with multi-color text shadows that shift on hover using ::before and ::after pseudo-elements
- **Button interactions**: Scale transform (0.95x) on active press, subtle shadow pulse on hover
- **Drop success**: Canvas confetti burst with lime/green colors (200 particles, 120° spread, y-origin 0.6)
- **Upload progress**: Smooth neon glow pulse on progress bars during active uploads
- **Stats count-up**: Tabular number animations on load, synchronized with progress bar fills
- **Tab transitions**: 0.2s fade + vertical slide (20px) using framer-motion

## Component Selection

**Components**:
- **Cards**: Shadcn Card with zinc-800 2px borders, backdrop-blur-xl, minimal shadows, brutalist aesthetic with sharp corners
- **Buttons**: Shadcn Button with custom lime-400 primary, scale-95 active states, uppercase tracking-wide text
- **Progress**: Shadcn Progress with custom heights (h-2) and lime/emerald/green color variants with neon glows
- **Tabs**: Shadcn Tabs with custom active states (lime-400 background, zinc-950 text)
- **Textarea**: Shadcn Textarea with monospace font, zinc-950 background, lime focus ring
- **Input**: Shadcn Input with password toggle for secrets, monospace for credentials
- **Badge**: Shadcn Badge with lime/cyan/yellow color variants and border treatments
- **Alert**: Shadcn Alert for vault status indicators with color-coded states
- **ScrollArea**: Shadcn ScrollArea for YouTube vault video list
- **Collapsible**: Shadcn Collapsible for setup guide in vault settings

**Customizations**:
- `.studio-card`: Custom card class with backdrop-blur-xl, hover border color shift, translateY on hover
- `.neon-glow-*`: Custom utility classes for colored box-shadows on primary actions
- `.glitch-hover`: Custom animation for main title with pseudo-element color shifts
- `.bento-item-*`: Grid placement rules for main composer, AI results, vault, and stats sections

**States**:
- **Buttons**: Default (solid lime-400) / Outline (border-zinc-700 with lime hover) / Active (scale-95) / Disabled (opacity-50)
- **Inputs**: Default (zinc-900 bg) / Focus (lime-500 ring) / Filled (subtle border color) / Error (red-500 ring)
- **Upload Status**: Idle / Uploading (animated spinner + progress) / Success (green checkmark + confetti) / Error (red warning icon)
- **Vault Status**: Unconfigured (yellow warning) / Configured (green checkmark)
- **Input Focus**: Subtle lime ring (ring-2 ring-lime-500/20), no border color changes

**Icon Selection** (Lucide React):
- **Upload**: Upload button, file dropzones
- **Send**: "DROP IT" final distribution button
- **Sparkles**: AI remix features, demo modes
- **Youtube**: YouTube vault header and channel links
- **Github**: GitHub integration indicators
- **Database**: R2 storage sections
- **Copy**: Clipboard copy indicators
- **TrendingUp**: History and stats sections
- **Zap**: Launchpad/composer main icon
- **Music**: Audio file representations
- **Image**: Cover art and Instagram platform icons

**Spacing**:
- **Card Padding**: p-6 for main content areas, p-4 for compact sections
- **Gap Between Elements**: gap-3 for tight grouping (form fields), gap-6 for major sections
- **Bento Grid Gap**: gap-6 (1.5rem) between all grid items

**Mobile**:
- **Bento Grid**: Single column on mobile (12-span), 2-column on tablet, 3-column on desktop (existing CSS preserved)
- **Navigation**: Wrap button group with maintained 44px touch targets
- **Typography**: Reduce title from 96px to 48px on mobile (text-4xl md:text-6xl)
- **Vault**: Full-width on mobile, sidebar position on desktop
