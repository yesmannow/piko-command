# PIKO COMMAND - 100% Free Distribution Center

A brutalist, browser-intent-based social media distribution platform designed for independent hip-hop artists to instantly share content across all platforms without API keys or paid services.


- This is a focused distribution tool with browser-intent posting, AI caption generation, YouTube vault integration, and post history tracking using pe
## Essential Features
### 1. Browser-Intent Distribution Engine

- **Progression**: Caption written → Platforms selected → "DROP IT" clicked 


- **Trigger**: User c

### 3. YouTube Video Vault (Real API Inte
- **Purpose**: Streamline promotion of YouTube content by providing instant access to real video library with live data
- **Progression**: App loads → YouTube API fetches latest 10 videos with thumbnails, titles, view counts, 

- **Progression**: Caption written → Platforms selected → "DROP IT" clicked → Instagram/TikTok: caption copied to clipboard + platform URLs opened → X/Facebook/LinkedIn: pre-filled share intent URLs opened → Post logged to history → Confetti celebration
- **Success criteria**: Clipboard successfully copies caption, correct platform URLs open in new tabs with pre-filled content, smart link auto-appended to all captions

### 2. AI Caption Remix (3 Styles)
- **Functionality**: Transform any input (video URL, draft caption) into three optimized caption styles using AI
- **Purpose**: Generate platform-specific captions that maximize engagement without manual copywriting
- **Trigger**: User clicks "REMIX AI" button with caption/URL in text field
- **Progression**: Button click → AI analyzes input → Three caption variants generated ([Hype], [Promo], [Viral]) → User selects preferred style → Caption populated in main field
- **Success criteria**: AI returns three distinct captions under character limits, each optimized for different platform contexts

### 3. YouTube Video Vault (Real API Integration)
- **Functionality**: Display PIKO's actual latest YouTube videos via YouTube Data API v3 with quick-share buttons to inject video URLs directly into the composer
- **Purpose**: Streamline promotion of YouTube content by providing instant access to real video library with live data
- **Trigger**: Vault displays automatically on Launchpad view, refreshes on demand
- **Progression**: App loads → YouTube API fetches latest 10 videos with thumbnails, titles, view counts, and publish dates → Videos displayed in scrollable vault → User clicks "Quick Share" → Video title + URL injected into caption field → Optional: User configures API key in settings panel
- **Success criteria**: Real YouTube videos fetched via API, displays with actual thumbnails/metadata/view counts, graceful fallback to mock data if no API key configured, quick-share injects correct URL and title into composer, API key persists between sessions

### 4. Post History Tracking
- `oklch(0.10b981 0.28 195)` - Emerald for success states and growth metrics
- `oklch(0.84cc16 0.24 120)` - Bright lime for accents and highlights
**Accent Color**: `oklch(0.75 0.25 330)` - Hot
**Background**: `oklch(0.09 0.01 0)` - Pure zinc-950 creating maximum contrast for brutalist aesthetic
**Foreground/Background Pairings**:




- **H1 (App Title "PIKO COMMAND")**: System UI Bold / 48-96px / Uppercase 
- **Labels**: Monospace Bold / 10-12px / Uppercase / Extra-wide tracking (0.15em) / Command-line style
- **Caption Input**: Monospace Medium / 16px / Technical data entry feel



- **Glitch effect on title**: 0.3s keyframe animation with multi-color text shadows that shift on hove
- **Button interactions**: Scale transform (0.95x) on active press, subtle shadow pulse
- **Drop success**: Canvas confetti burst with lime/green colors (200 particles, 120° spread)
- **Stats count-up**: Tabular number animations on load, synchronized with progress bar fills
## Component Selection
**Components**:
- **Cards**: Shadcn Card with zinc-800 borders, minimal shadows, brutalist aesthetic with sharp corners
- **Progress**: Shadcn Progress with custom heights and lime/emerald/green col



- `.bento-item-*`: Grid placement rules for main composer, AI results, vault, and stats sections



- **Input Focus**: Subtle lime ring, no border color changes

**Icon Selection** (L
- **Sparkles**: AI remix features
- **Copy**: Clipboard copy indicators
- **TrendingUp**: History and stats

- **Image**: Instagram platform

**Spacing**:


- **Bento Grid**: Single column on mobile (12-span), 2-column on tablet, 3-column on
- **Typography**: Reduce title from 96px to 48px on mobile



































































**Spacing**:
- **Card Padding**: p-6 for main content areas, p-4 for compact sections
- **Gap Between Elements**: gap-3 for tight grouping, gap-6 for major sections
- **Bento Grid Gap**: gap-6 (1.5rem) between all grid items

**Mobile**:
- **Bento Grid**: Single column on mobile (12-span), 2-column on tablet, 3-column on desktop
- **Navigation**: Wrap button group with maintained touch targets
- **Typography**: Reduce title from 96px to 48px on mobile
- **Vault**: Full-width on mobile, sidebar on desktop
