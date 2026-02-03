# PIKO COMMAND - 100% Free Distribution Center

A brutalist, browser-intent-based social media distribution platform designed for independent hip-hop artists to instantly share content across all platforms without API keys or paid services.

**Experience Qualities**:
1. **Instant & Zero-Cost**: Every post launches immediately using free browser share intents and clipboard APIs - no accounts, no fees, no limitations.
2. **Brutalist & Bold**: Glitch animations, monospace typography, and a Bento Grid layout create a command-center aesthetic that feels technical and powerful.
3. **YouTube-First**: Built specifically for PIKO's YouTube-centric strategy with quick-share from video vault and platform-specific caption optimization.

**Complexity Level**: Light Application (multiple features with basic state)
- This is a focused distribution tool with browser-intent posting, AI caption generation, YouTube vault integration, and post history tracking using persistent storage.

## Essential Features

### 1. Browser-Intent Distribution Engine
- **Functionality**: Multi-platform posting using free browser share intents (X, Facebook, LinkedIn) and clipboard copy (Instagram, TikTok) with zero API requirements
- **Purpose**: Enable instant, free content distribution without paid API services or authentication flows
- **Trigger**: User writes caption, selects platforms, clicks "DROP IT"
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
- **Functionality**: Persistent log of all distributed posts with platforms, captions, and timestamps
- **Purpose**: Track content distribution history and maintain record of what was posted where
- **Trigger**: User navigates to "HISTORY" tab
- **Progression**: Tab selection → Post history loaded from persistent storage → Posts displayed in reverse chronological order
- **Success criteria**: All posts saved with complete metadata, history persists between sessions, posts display with platform badges

### 5. Real-Time Stats Dashboard
- **Functionality**: Live metrics showing total posts, platform count, and engagement percentage with animated progress bars
- **Purpose**: Visualize distribution activity and motivate consistent posting
- **Trigger**: Stats display automatically, update when new posts are made
- **Progression**: App loads → Stats calculated from post history → Animated count-up to current values → Progress bars fill with color-coded visualization
- **Success criteria**: Metrics accurately reflect post history, animations smooth and energetic, values update immediately after new posts

## Edge Case Handling

- **No Caption Entered**: Toast error prevents posting, "DROP IT" button disabled until caption exists
- **No Platforms Selected**: Toast error prevents posting, user prompted to select at least one platform
- **Clipboard Access Denied**: Graceful fallback with error toast instructing user to copy manually
- **Browser Popup Blocked**: Multiple platform intents may trigger popup blockers - user instructed to allow popups
- **Empty Post History**: Clean empty state with guidance to make first post
- **AI Generation Failed**: Error toast with retry option, original caption preserved
- **Character Limit Exceeded**: Visual warning shown, but posting still allowed (platforms will truncate)
- **YouTube API Key Not Configured**: Vault shows mock data with clear indicator, settings panel allows API key entry
- **YouTube API Request Failed**: Error toast displayed, graceful fallback to mock data, retry option available
- **YouTube API Rate Limit Hit**: Error message displayed with explanation, mock data shown as fallback
- **Invalid/Expired API Key**: Clear error message with link to Google Cloud Console for key regeneration

## Design Direction

The design evokes a brutalist command center meets underground hacker aesthetic—monospace typography, glitch effects, and stark contrasts create a technical, no-nonsense tool for rapid content distribution. The Bento Grid layout organizes features into distinct functional zones like a mission control dashboard.

## Color Selection

**Primary Color**: `oklch(0.68 0.24 120)` - Cyber lime representing action, launch, and the "go" state for distribution

**Secondary Colors**:
- `oklch(0.10b981 0.28 195)` - Emerald for success states and growth metrics
- `oklch(0.22c55e 0.26 75)` - Green for engagement and positive feedback
- `oklch(0.84cc16 0.24 120)` - Bright lime for accents and highlights

**Accent Color**: `oklch(0.75 0.25 330)` - Hot pink for AI features, glitch effects, and creative tools

**Background**: `oklch(0.09 0.01 0)` - Pure zinc-950 creating maximum contrast for brutalist aesthetic

**Foreground/Background Pairings**:
- Background `oklch(0.09 0.01 0)`: Foreground `oklch(0.98 0.01 90)` - Ratio 18.2:1 ✓
- Primary Lime `oklch(0.68 0.24 120)`: Zinc-950 `oklch(0.09 0.01 0)` - Ratio 10.8:1 ✓
- Accent Pink `oklch(0.75 0.25 330)`: Zinc-950 `oklch(0.09 0.01 0)` - Ratio 11.2:1 ✓

## Font Selection

Typography emphasizes technical precision and command-line aesthetics with heavy use of monospace fonts for a brutalist, hacker-inspired feel.

**Typographic Hierarchy**:
- **H1 (App Title "PIKO COMMAND")**: System UI Bold / 48-96px / Uppercase / Wide tracking / Glitch animation on hover / Gradient text
- **H2 (Section Titles)**: System UI Black / 24-32px / Uppercase / Wide tracking / Gradient text accent
- **Labels**: Monospace Bold / 10-12px / Uppercase / Extra-wide tracking (0.15em) / Command-line style
- **Body Text**: System UI Regular / 14px / 1.5 line height / Clean readability
- **Caption Input**: Monospace Medium / 16px / Technical data entry feel
- **Stats/Numbers**: Tabular nums / Bold / Large size for impact

## Animations

Animations feel instant and technical—glitch effects, scale transforms, and snappy transitions that match the brutalist, command-center aesthetic.

**Animation Principles**:
- **Glitch effect on title**: 0.3s keyframe animation with multi-color text shadows that shift on hover
- **Bento Grid reveal**: Framer Motion with 200ms fade + y-axis slide on view transitions
- **Button interactions**: Scale transform (0.95x) on active press, subtle shadow pulse
- **Progress bars**: Smooth width transitions with linear easing, instant color changes
- **Drop success**: Canvas confetti burst with lime/green colors (200 particles, 120° spread)
- **Platform tab badges**: Instant state changes, no fade transitions
- **Stats count-up**: Tabular number animations on load, synchronized with progress bar fills

## Component Selection

**Components**:
- **Buttons**: Shadcn Button with lime-400 primary color, outline variants for secondary actions, active scale transforms
- **Cards**: Shadcn Card with zinc-800 borders, minimal shadows, brutalist aesthetic with sharp corners
- **Inputs**: Shadcn Textarea with monospace font, borderless dark background, minimal focus states
- **Progress**: Shadcn Progress with custom heights and lime/emerald/green color variants
- **Badges**: Shadcn Badge for platform indicators and status labels with lime accent colors
- **Tabs**: Shadcn Tabs for AI caption variant selection with lime active state
- **Toast**: Sonner for all notifications with custom positioning and styling

**Customizations**:
- `.glitch-text`: Gradient text with animated text-shadow glitch effect on hover
- `.bento-grid`: CSS Grid with 12-column layout, responsive breakpoints for desktop/tablet/mobile
- `.bento-item-*`: Grid placement rules for main composer, AI results, vault, and stats sections
- Monospace input fields for technical, command-line aesthetic
- Borderless main textarea with dark background for brutalist minimalism
- Icon-labeled platform buttons with clipboard/intent type indicators

**States**:
- **Button Disabled**: Reduced opacity, cursor not-allowed, no interactions
- **Button Active**: Scale down to 0.95x for press feedback
- **Input Focus**: Subtle lime ring, no border color changes
- **Progress Loading**: Smooth width transition with instant color application
- **Toast Success**: Lime-themed success notifications

**Icon Selection** (Lucide React):
- **Zap**: Main launch/drop action icon
- **Sparkles**: AI remix features
- **Send**: Post distribution action
- **Copy**: Clipboard copy indicators
- **ExternalLink**: Browser intent indicators
- **TrendingUp**: History and stats
- **Youtube**: Video vault and platform
- **Hash**: X/Twitter platform and hashtags
- **Video**: TikTok platform
- **Image**: Instagram platform
- **Loader2**: Loading states with spin
- **Play**: Video playback

**Spacing**:
- **Card Padding**: p-6 for main content areas, p-4 for compact sections
- **Gap Between Elements**: gap-3 for tight grouping, gap-6 for major sections
- **Bento Grid Gap**: gap-6 (1.5rem) between all grid items

**Mobile**:
- **Bento Grid**: Single column on mobile (12-span), 2-column on tablet, 3-column on desktop
- **Navigation**: Wrap button group with maintained touch targets
- **Typography**: Reduce title from 96px to 48px on mobile
- **Vault**: Full-width on mobile, sidebar on desktop
