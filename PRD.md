# PIKO COMMAND - GitHub-Native Studio Hub with Postiz-Inspired Distribution

PIKO COMMAND is a brutalist, technically sophisticated social media distribution platform designed for professional content distribution with GitHub-native asset storage, automated metadata sync, AI-powered caption generation, YouTube vault integration, and Postiz-inspired advanced scheduling and multi-platform management features.

**Experience Qualities**: 
1. **Technical Precision** - Every action feels deliberate and powerful, like operating production-grade equipment
2. **Zero Friction** - Assets flow from studio files directly to web deployment with single-button execution
3. **Street Authenticity** - Graffiti-inspired aesthetics meet professional tooling without compromise

**Complexity Level**: Complex Application (advanced functionality with multiple views, visual timeline, platform previews, and prompt management)

## Essential Features

### 1. Unified Social Media Adapter (Postiz-Inspired)
- **Functionality**: Centralized multi-platform distribution engine with smart popup handling and unified API
- **Purpose**: Professional-grade platform distribution with centered popups, clipboard management, and extensible architecture
- **Trigger**: User clicks "DROP IT" after composing caption and selecting platforms
- **Progression**: Caption finalized → Platform selection validated → SocialMediaAdapter.blastToAll() called → For each platform: centered popup window opened with platform-specific dimensions → Clipboard-based platforms (Instagram/TikTok) copy caption automatically → Intent-based platforms (X, Facebook, LinkedIn) open with pre-populated share dialogs → 500ms delay between popups to prevent browser blocking → All posts tracked in history
- **Success criteria**: Popups center on screen correctly, clipboard operations succeed silently, platform-specific URLs construct properly, browser popup blockers don't interfere, all distributions log to timeline

### 2. Visual Timeline Calendar (Postiz-Style "Hype Map")
- **Functionality**: Date-grouped visual timeline showing all distributed posts with platform badges, timestamps, and quick actions
- **Purpose**: Transform simple history into strategic content calendar for analyzing distribution patterns
- **Trigger**: User navigates to TIMELINE CALENDAR tab (formerly HISTORY)
- **Progression**: Tab opened → Posts grouped by date in reverse chronological order → Each date shows post count badge → Individual posts display time, caption preview, platform icons with colors, hashtag extraction, copy-to-clipboard button on hover
- **Success criteria**: Posts group correctly by date, timeline updates in real-time after new drops, platform icons color-coded accurately, copy function works on hover, hashtags parse and display correctly, empty state shows helpful messaging

### 3. Platform Preview (Multi-Platform Mockups)
- **Functionality**: Live preview of how captions will appear on Instagram, TikTok, X, Facebook, and LinkedIn with character count validation
- **Purpose**: Visualize platform-specific formatting before distribution to catch issues early
- **Trigger**: User clicks "SHOW PLATFORM PREVIEW" button in Launchpad
- **Progression**: Button clicked → PlatformPreview component renders → Tabs for each selected platform → Instagram shows mockup with profile, square image placeholder, caption with first 200 chars → TikTok shows vertical video mockup with caption → X shows tweet card with character counter (turns red at >280) → Facebook shows post card → LinkedIn shows professional post layout → URLs, hashtags, mentions highlighted in blue/cyan
- **Success criteria**: Character limits enforce correctly per platform, formatting previews accurate, hashtag/mention/URL parsing works, tab navigation smooth, mockups responsive on mobile, preview hides when no caption entered

### 4. AI Prompt Library (Template Management)
- **Functionality**: Save, organize, and reuse AI prompt templates for consistent caption generation across different content styles
- **Purpose**: Enable rapid iteration on proven prompt patterns without rewriting instructions each time
- **Trigger**: User clicks "TEMPLATES" button in Launchpad
- **Progression**: Button clicked → Prompt Library opens showing default templates (Street Hype, Official Promo, Viral Hook, The Storyteller) → User can create custom templates with name, description, category, and prompt text → Templates stored in useKV persistence → User selects template → "Use" button triggers AI generation with selected template + current caption as input → Generated caption replaces composer text
- **Success criteria**: Default templates load on first use, custom templates persist between sessions, template categories color-coded, AI generation uses template prompt correctly, templates copy to clipboard, delete function works for custom templates only

### 5. Social Media Launchpad (Multi-Platform Distribution)
### 5. Social Media Launchpad (Multi-Platform Distribution)
- **Functionality**: Compose captions, select target platforms, preview across platforms, and distribute content with platform-specific handling
- **Purpose**: Streamline multi-platform posting workflow from a single command center
- **Trigger**: User writes caption, selects platforms, clicks "DROP IT"
- **Progression**: Caption written → Platforms selected (IG, TikTok, X, Facebook, LinkedIn) → Optional: Platform Preview checked → Optional: Prompt template applied → "DROP IT" pressed → SocialMediaAdapter handles all distribution → Post saved to timeline → Success confetti animation
- **Success criteria**: Caption correctly copied for clipboard platforms, share intents pre-populate with caption + link, all posts persist to timeline calendar, platform-specific handling works reliably, confetti triggers on success

### 6. GitHub-Native Asset Upload
- **Functionality**: Direct upload of audio tracks and cover art to yesmannow/piko-artist-website-v3 repository
- **Purpose**: Zero-cost track hosting using GitHub as both storage and CDN
- **Trigger**: User selects audio file, optional cover image, fills metadata (title, artist, vibe, release date), clicks "UPLOAD & SYNC"
- **Progression**: Files selected → Metadata entered → Upload initiated → Files converted to base64 → Audio uploaded to /public/audio/tracks/[track-slug].mp3 → Cover uploaded to /public/images/covers/[track-slug].jpg → GitHub commit created → Metadata synced to /src/data/piko-tracks.json → Track appended to JSON array → Success confirmation → Track appears in uploaded tracks list
- **Success criteria**: Files successfully committed to GitHub repository, piko-tracks.json updated with new entry, progress bars show upload status, uploaded tracks persist locally, errors provide actionable feedback

### 7. AI Caption Remix (3 Styles via window.spark.llm)
- **Functionality**: Generate three platform-optimized caption variants from user input
- **Purpose**: Maximize engagement with AI-generated captions tailored to different audiences
- **Trigger**: User enters base caption or video URL, clicks "REMIX AI"
- **Progression**: Button click → LLM analyzes input → Three caption variants generated (STREET HYPE, OFFICIAL PROMO, VIRAL) → Tabbed interface displays each style → User selects preferred variant → Caption populated in main field
- **Success criteria**: All three styles generate successfully, each has distinct voice and formatting, selection replaces composer caption, hashtags included appropriately

### 8. YouTube Vault Integration
- **Functionality**: Display PIKO's latest YouTube videos with quick-share capability
- **Purpose**: Enable easy cross-promotion of YouTube content to other platforms
- **Trigger**: Vault displays on Launchpad view, refreshes on demand
- **Progression**: App loads → YouTube API fetches latest 10 videos → Thumbnails, titles, view counts displayed → User clicks "Quick Share" → Video URL and title injected into caption composer → Ready for distribution
- **Success criteria**: Real videos fetched with accurate metadata, quick-share pre-fills composer, API key configurable and persistent, graceful fallback to mock data when unconfigured

### 9. GitHub Vault Settings
- **Functionality**: Secure storage and validation of GitHub Personal Access Token
- **Purpose**: Enable repository access for direct asset uploads and metadata sync
- **Trigger**: User navigates to "THE VAULT" tab
- **Progression**: Tab opened → User pastes GitHub PAT (ghp_xxx) → "Check Connection" validates token and repository access → Success/failure status displayed → Token saved to encrypted persistence → Ready for uploads
- **Success criteria**: Token persists between sessions, connection check validates yesmannow/piko-artist-website-v3 access, masked input protects token visibility, clear setup guide provided

### 10. Post Timeline Tracking
- **Functionality**: Persistent log of all distributed posts with full context
- **Purpose**: Content audit trail and reusable caption library
- **Trigger**: Automatic logging on every "DROP IT" execution
- **Progression**: Post distributed → Entry created with caption, platforms array, timestamp → Saved to window.spark.kv persistence → Displayed in History view in reverse chronological order
- **Success criteria**: All posts persist between sessions, platform badges display correctly, timestamps show in local time format

## Edge Case Handling
- **No GitHub Token**: Upload section shows warning banner, vault settings highlight required
- **Failed GitHub Upload**: Detailed error toast with troubleshooting steps (token permissions, rate limits, network), upload state resets for retry
- **Failed Metadata Sync**: Partial success handling - assets uploaded but JSON sync failed, clear error messaging with manual sync option
- **Clipboard Denied**: Fallback toast with manual copy instructions, caption remains visible for copy-paste
- **Character Limit Exceeded**: Real-time counter turns red, warning tooltip on hover
- **No Platforms Selected**: "DROP IT" button disabled with tooltip explanation
- **Empty Caption**: Button disabled, validation message displayed

## Design Direction
Brutalist technical aesthetic with cyberpunk neon accents and graffiti culture DNA. Command-line inspired labels, monospace fonts for data entry, aggressive neon glows on key actions. Feels like a professional production studio control panel built by street artists - technical precision meets underground energy.

## Color Selection
High-contrast neon-on-dark palette inspired by cyberpunk aesthetics and spray paint graffiti.

- **Primary Color**: Neon Lime (oklch(0.75 0.25 330)) - Main brand highlight for primary actions, conveys energy and "GO" mentality
- **Secondary Colors**: 
  - Cyber Cyan (oklch(0.70 0.28 195)) - Supporting accent for secondary features
  - Electric Yellow (oklch(0.78 0.26 75)) - Attention-grabbing highlights
- **Accent Color**: Vivid Lime (oklch(0.78 0.26 75)) - CTAs and success states
- **Foreground/Background Pairings**:
  - Background Dark (oklch(0.12 0.02 265)): Foreground Light (oklch(0.98 0.01 90)) - Ratio 15.2:1 ✓
  - Card Background (oklch(0.16 0.025 270)): Foreground Light (oklch(0.98 0.01 90)) - Ratio 12.8:1 ✓
  - Primary Lime (oklch(0.75 0.25 330)): Dark Text (oklch(0.12 0.02 265)) - Ratio 8.1:1 ✓

## Font Selection
Industrial strength typography that bridges technical documentation and street art tagging.

- **Primary Font**: Barlow - Clean, geometric sans-serif for body copy and UI labels
- **Display Font**: Bebas Neue - Aggressive, condensed all-caps for headers and titles
- **Alternative Fonts**: Staatliches (tags), Rajdhani (technical data), Teko (monospace elements)

**Typographic Hierarchy**:
- **H1 (Page Title)**: Bebas Neue Bold / 48-64px / Wide letter spacing (0.05em) / Gradient text effects
- **H2 (Section Headers)**: Bebas Neue / 24-32px / Uppercase / Gradient or neon glow
- **Body Text**: Barlow Regular / 14-16px / 1.5 line height
- **Labels**: Barlow Bold / 11-12px / Uppercase / Wide tracking (0.1em) / Monospace style
- **Data/Metrics**: Rajdhani Bold / Tabular numbers / 16-24px

## Animations
Purposeful, high-impact animations that reinforce the brutalist-meets-street aesthetic.

- **Button Press**: Subtle scale-down (0.95) on active state, snappy 150ms transition
- **Upload Progress**: Smooth linear progress bars with color-coded stages (lime → emerald)
- **Success States**: Confetti burst on successful post distribution, celebration without delay
- **Hover States**: Neon glow intensification on interactive elements, 200ms ease-in-out
- **Modal Entry**: Quick slide-up from bottom (300ms) for generated captions
- **Connection Check**: Spinner animation during validation, checkmark/X fade-in on result

## Component Selection
- **Components**: 
  - Shadcn Button (customized with neon borders and glow effects)
  - Shadcn Card (modified with backdrop blur and border glows)
  - Shadcn Input/Textarea (dark backgrounds, lime focus rings)
  - Shadcn Progress (custom lime/emerald gradient fills)
  - Shadcn Tabs (active state with lime background)
  - Shadcn Alert (warning/success states with colored borders)
  - Shadcn Badge (platform indicators with custom colors)
  - Sonner Toast (bottom-right notifications with custom styling)

- **Customizations**: 
  - Custom neon-glow utility classes for button states
  - Graffiti-texture background pattern (subtle diagonal crosshatch)
  - Animated gradient borders for key cards
  - Custom progress bar with multi-stage colors

- **States**: 
  - Buttons: Default → Hover (border glow) → Active (scale + glow intensify) → Disabled (muted + cursor-not-allowed)
  - Inputs: Default → Focus (lime ring) → Error (red ring) → Success (emerald ring)

- **Icon Selection**: Phosphor Icons for all UI elements, color-coded by function
  - Zap: Primary actions (Launchpad)
  - Upload: File operations
  - Github: Repository integration
  - Database: Storage/vault references
  - Sparkles: AI generation
  - Music: Audio/track references
  - TrendingUp: Analytics/history

- **Spacing**: 
  - Card Padding: p-6 for main content, p-4 for compact sections
  - Grid Gap: gap-6 (1.5rem) between bento grid items
  - Button Gap: gap-3 (0.75rem) between action buttons
  - Form Field Gap: gap-4 (1rem) vertical spacing

- **Mobile**: 
  - Single-column layout on screens < 768px
  - Full-width cards with maintained spacing
  - Touch-friendly 44px minimum tap targets
  - Bento grid collapses to vertical stack
  - Navigation buttons wrap with consistent spacing
  - YouTube vault scrolls horizontally on mobile
  - Upload section maintains legibility with stacked form fields
