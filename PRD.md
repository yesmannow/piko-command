# PIKO COMMAND - Professional Studio-to-Social Hub

PIKO COMMAND is a brutalist, technically sophisticated social media distribution platform designed for professional content distribution with R2 cloud storage, GitHub automation, AI-powered caption generation, and YouTu

### 1. Studio-to-Web Upload Pipeline (Cloudflare R2 + GitHub)

- **Progression**: Fi

### 1. Studio-to-Web Upload Pipeline (Cloudflare R2 + GitHub)
- **Trigger**: User writes caption, selects platforms, clicks "DROP IT"
- **Success criteria**: Clipboard successfully copies caption for IG/TikTok, correct platform URLs open in new 
### 3. AI Caption Remix (3 Styles via window.spark.llm)
- **Purpose**: Generate platform-specific captions that maximize engagement without manual copywriting
- **Progression**: Button click → AI analyzes input → Three caption variants generated ([STREET HYPE], [OFFICIAL PROMO], [VIRAL]) → User selects preferred style → Caption populated in main field

- **Functionality**: Display PIKO's actual latest YouTube vid
- **Trigger**: Vault displays automatically on Launchpad view, refreshes on demand
- **Success criteria**: Real YouTube videos fetched via API, displays with actual th
- **Trigger**: User writes caption, selects platforms, clicks "DROP IT"
- **Purpose**: Enable R2 uploads and GitHub automation without exposing credentials
- **Progression**: Tab opened → User inputs R2 credentials (Account ID, Bucket Name, Access Key, Secret Key) → User inputs GitHub credentials (Token, Repo, Owner) → "SAVE VAULT" clicked → Credentia

### 3. AI Caption Remix (3 Styles via window.spark.llm)
- **Trigger**: Automatic logging on every "DROP IT" execution
- **Purpose**: Generate platform-specific captions that maximize engagement without manual copywriting
## Edge Case Handling
- **Progression**: Button click → AI analyzes input → Three caption variants generated ([STREET HYPE], [OFFICIAL PROMO], [VIRAL]) → User selects preferred style → Caption populated in main field
- **Clipboard Denied**: Fallback toast instructs user to manually copy caption displayed on screen


Brutalist technical aesthetic with cyberpunk neon accents. Command-line inspired labels, monospace fonts for data entry, neon glows on key actions. Feels like a 
## Color Selection
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

- **Youtube**: YouTube vault header and channel links
- **Database**: R2 stora
- **TrendingUp**: History and stats sections
- **Music**: Audio file representations

- **Card Padding**: p-6 for main content areas, p-4 for compact sections
- **Bento Grid Gap**: gap-6 (1.5rem) between all grid items
**Mobile**:
- **Navigation**: Wrap button group with maintained 44px touch targets
- **Vault**: Full-width on mobile, sidebar position on desktop























































- **Youtube**: YouTube vault header and channel links



- **TrendingUp**: History and stats sections

- **Music**: Audio file representations



- **Card Padding**: p-6 for main content areas, p-4 for compact sections

- **Bento Grid Gap**: gap-6 (1.5rem) between all grid items

**Mobile**:

- **Navigation**: Wrap button group with maintained 44px touch targets

- **Vault**: Full-width on mobile, sidebar position on desktop
