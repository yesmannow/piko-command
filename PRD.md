# THE LAB - Artist Command Center

A comprehensive social media and content management platform designed for independent hip-hop artists to streamline their release workflow, engage with fans, and maintain their web presence from a single, powerful hub.

**Experience Qualities**:
1. **Fast-Paced & Reactive**: Every interaction feels instant with real-time feedback, progress indicators, and celebratory animations that match the energy of dropping new music.
2. **Professional & Powerful**: Advanced features like R2 cloud storage, GitHub automation, and multi-platform posting give artists studio-grade tools without complexity.
3. **Mobile-First & Tactile**: Large touch targets, clear typography, and streamlined workflows enable artists to manage their empire from the booth or on the move.

**Complexity Level**: Complex Application (advanced functionality with multiple views)
- This is a full-featured artist management platform with cloud integrations, API connections, AI-powered content generation, multi-platform social media posting, persistent data storage, release calendars, and automated deployment workflows.

## Essential Features

### 1. Global Drop Engine
- **Functionality**: Upload a single audio/video file with cover art and caption, auto-format for Instagram Reels, TikTok, YouTube Shorts, and X (Twitter) simultaneously with real API posting
- **Purpose**: Eliminate redundant work by allowing one-click multi-platform distribution with platform-specific optimization and real social media posting
- **Trigger**: User uploads media file(s), writes caption, selects target platforms, and clicks "DROP IT"
- **Progression**: File selection → Caption writing → Platform selection → Smart link generation → Real API calls to connected platforms → Multi-platform post creation → Confetti celebration → Post history
- **Success criteria**: Media files uploaded, formatted correctly for each platform, posts successfully sent to authenticated platforms via APIs, and smart link generated and appended to captions

### 2. Smart Music Links
- **Functionality**: Auto-generate branded smart link pages (like Linktree/Songwhip) when tracks are posted
- **Purpose**: Provide fans a single URL that aggregates all streaming platforms for easy discovery
- **Trigger**: Track upload with "Track Release" flag enabled
- **Progression**: Track metadata input → Smart link URL generation (lab.link/track-slug) → Link appended to all captions
- **Success criteria**: Unique, clean URL generated and automatically included in all social media posts

### 3. Visual Asset Preview
- **Functionality**: Side-by-side preview showing exactly how video/image will appear on each platform before posting
- **Purpose**: Catch formatting issues and ensure content looks perfect across all platforms
- **Trigger**: User navigates to "PREVIEW" tab after uploading media
- **Progression**: Media upload → Preview tab selection → Live previews rendered (IG Reels 9:16, TikTok 9:16, YT Shorts 9:16, X 16:9)
- **Success criteria**: Accurate aspect ratio previews displayed for each platform with autoplay video support

### 4. AI Lyric-to-Caption (Extract Bars)
- **Functionality**: AI analyzes pasted lyrics to generate three caption styles: quotable bar, hype announcement, and story/context
- **Purpose**: Transform raw lyrics into engaging social media captions optimized for engagement
- **Trigger**: User clicks "Extract Bars" button, pastes lyrics, and clicks "Analyze"
- **Progression**: Button click → Dialog opens → Lyrics pasted → AI processes (GPT-4o-mini) → Three caption variations displayed → User selects one → Caption populated
- **Success criteria**: AI returns three distinct, platform-ready captions under 200 characters with trending hashtags

### 5. Beat-Sync Reminders (Release Calendar)
- **Functionality**: Notification system that tracks release dates and reminds artist to post teasers at strategic intervals
- **Purpose**: Maintain consistent promotional momentum around release dates
- **Trigger**: User schedules a release in the "RELEASES" tab
- **Progression**: Release scheduled → System checks every 60 seconds → Notifications fired at 3 days before, 1 day before, and midnight of release
- **Success criteria**: Toast notifications appear at correct times, reminders are tracked to prevent duplicates

### 6. Unified Comment Engagement
- **Functionality**: View all fan comments from all platforms in one feed, select multiple comments, and "blast" a single reply to all at once
- **Purpose**: Streamline fan engagement without platform-hopping
- **Trigger**: User navigates to "COMMENTS" tab
- **Progression**: Tab selection → Mock comments displayed from all platforms → User selects comments via checkbox → Reply typed → "Blast to All" clicked → Confirmation toast
- **Success criteria**: Comments aggregated, checkboxes functional, blast reply feature sends to all selected comments

### 7. Studio-to-Web Upload (R2 + GitHub Integration)
- **Functionality**: Upload audio tracks and cover art to Cloudflare R2, then auto-sync metadata to GitHub repo to trigger website redeploy
- **Purpose**: Seamlessly update artist website with new tracks without manual code editing
- **Trigger**: User uploads audio + optional cover image in "STUDIO" tab, fills metadata, clicks "UPLOAD & SYNC"
- **Progression**: File selection → Metadata input → Concurrent R2 uploads (audio + cover) → GitHub API call updates tracks.json → Vercel redeploy triggered → Success confetti
- **Success criteria**: Files uploaded to R2 with public URLs, tracks.json updated with both audioUrl and coverImageUrl, track appears in "RELEASES" view

### 8. Secure Vault Settings
- **Functionality**: Encrypted storage of R2 access keys, bucket name, account ID, GitHub personal access token, and repo details
- **Purpose**: Centralize sensitive credentials securely for automated integrations
- **Trigger**: User navigates to "VAULT" tab and inputs credentials
- **Progression**: Vault tab opened → Credentials entered (with show/hide toggles) → "SAVE VAULT" clicked → Credentials persisted via useKV → Confirmation toast
- **Success criteria**: All credentials saved securely, retrievable by other features, test credentials loadable for demo mode

### 9. Live Website Preview
- **Functionality**: Embedded iframe showing live artist website with instant refresh capability
- **Purpose**: Verify new tracks appear correctly on website after sync
- **Trigger**: User views "STUDIO" tab or "RELEASES" tab
- **Progression**: Tab navigation → iframe loads https://piko-artist-website.vercel.app/ → User can open in new tab
- **Success criteria**: Website loads in iframe, new tab button functional

### 10. Hype Meters (Performance Visualization)
- **Functionality**: Real-time animated progress bars showing shares, fire emojis, comments, and engagement percentage
- **Purpose**: Replace boring analytics with motivating, energetic visualizations
- **Trigger**: App loads, metrics animate in
- **Progression**: App load → Metrics count up with animation → Progress bars fill → Neon glow effects applied
- **Success criteria**: Metrics display with smooth animations, progress bars correlate to values, visual style matches theme

### 11. Social Media API Authentication
- **Functionality**: OAuth 2.0 authentication flow for Instagram, TikTok, YouTube, and Twitter/X with secure token management
- **Purpose**: Enable real multi-platform posting via official platform APIs instead of simulated posts
- **Trigger**: User navigates to "SOCIAL" tab and clicks "Connect [Platform]"
- **Progression**: Platform selection → OAuth redirect to platform → User authorizes app → Callback with auth code → Token exchange → Token stored securely → Connection status updated
- **Success criteria**: OAuth flow completes successfully, access tokens stored via useKV, token expiration tracked, connected platforms show checkmarks in UI, real API calls succeed when posting

### 12. Real Multi-Platform Posting
- **Functionality**: Actual API calls to Instagram Graph API, TikTok Content Posting API, YouTube Data API v3, and Twitter API v2
- **Purpose**: Replace simulated posts with real uploads to social media platforms
- **Trigger**: User clicks "DROP IT" with connected platforms selected
- **Progression**: Caption + media prepared → API calls made concurrently to all connected platforms → Upload progress tracked → Success/failure per platform → Post URLs returned → Results displayed
- **Success criteria**: Videos/images successfully uploaded to platforms, captions posted correctly, post URLs returned, errors handled gracefully with specific platform feedback

## Edge Case Handling

- **No Credentials Configured**: Alert displayed on STUDIO/RELEASES tabs prompting user to configure Vault, uploads disabled
- **No Social Platforms Connected**: Alert in DROP tab prompting user to connect platforms in SOCIAL tab, simulated posts still work
- **Platform Authentication Expired**: Token expiration tracked, user prompted to reconnect when tokens expire
- **OAuth Callback Errors**: Failed authentication handled with error messages, state parameter validated
- **Partial Platform Failures**: Some platforms succeed while others fail - individual results shown per platform
- **Missing Required Fields**: Toast error prevents form submission until track title, platforms, or credentials are provided
- **File Size Limits**: Audio file size unlimited (within R2 limits), cover images capped at 5MB with validation, platform-specific size limits enforced
- **Upload Failures**: Error status displayed with specific error message, progress bar resets, retry allowed
- **GitHub API Errors**: 404 errors handled gracefully (creates new tracks.json), authentication errors surfaced to user
- **Empty States**: All tabs show helpful empty states with guidance when no data exists
- **Character Limits**: Platform-specific character counts enforced (Twitter 280, others 2200) with visual warnings
- **Network Failures**: Error states displayed, retry mechanisms available
- **Invalid Media Formats**: Platform-specific format validation (MP4 for video, JPG/PNG for images)

## Design Direction

The design should evoke the energy of a late-night studio session—dark, focused, with bursts of electric color. Think neon-lit recording booth meets command center. The interface should feel like a professional tool that artists take seriously while maintaining the excitement and spontaneity of creating and dropping music.

## Color Selection

**Primary Color**: `oklch(0.35 0.18 140)` - Deep vibrant green representing growth, success, and the "go" signal to drop content

**Secondary Colors**:
- `oklch(0.88 0.08 140)` - Soft green for supporting UI elements and secondary actions
- `oklch(0.45 0.15 120)` - Bright lime accent for active states and highlights

**Accent Color**: `oklch(0.50 0.20 15)` - Warm orange/red for destructive actions, urgent notifications, and high-energy moments

**Foreground/Background Pairings**:
- Background `oklch(0.98 0.005 140)`: Foreground `oklch(0.20 0.12 140)` - Ratio 13.2:1 ✓
- Primary `oklch(0.35 0.18 140)`: Primary Foreground `oklch(0.98 0.005 140)` - Ratio 6.8:1 ✓
- Accent `oklch(0.45 0.15 120)`: Accent Foreground `oklch(0.98 0.005 140)` - Ratio 5.2:1 ✓
- Destructive `oklch(0.50 0.20 15)`: Destructive Foreground `oklch(0.98 0.005 140)` - Ratio 4.7:1 ✓

## Font Selection

Fonts should convey technical precision mixed with creative energy, suitable for both data-heavy interfaces and bold creative statements.

**Typographic Hierarchy**:
- **H1 (App Title "THE LAB")**: Bebas Neue Bold / 60px / Uppercase / Tight tracking / Neon glow effect
- **H2 (Section Titles)**: Bebas Neue Regular / 28px / Uppercase / Tight tracking
- **H3 (Card Titles)**: Bebas Neue Regular / 20px / Uppercase
- **Body Text**: IBM Plex Sans Regular / 14px / 1.5 line height
- **Labels**: IBM Plex Sans Bold / 12px / Uppercase / Wide tracking
- **Monospace (URLs, Credentials)**: Fira Code Regular / 13px / Used for technical data

## Animations

Animations should reinforce the feeling of speed and precision—fast, snappy transitions for routine interactions, with celebratory moments (confetti, glow pulses) reserved for significant achievements like successful drops or uploads.

**Animation Principles**:
- **Tab transitions**: Framer Motion with 200ms fade + y-axis slide for content switching
- **Button interactions**: Scale transform (1.05x) on hover, active press state on click
- **Progress bars**: Smooth width transitions with easing, neon glow intensifies as progress increases
- **Upload success**: Canvas confetti burst (150 particles, 100° spread, neon colors)
- **Hype meters**: Count-up number animations on load, progress bar fill with 300ms easing
- **Drag & drop**: Scale increase (1.02x) and neon glow pulse when dragging over drop zone
- **Video previews**: Smooth opacity fade when toggling play/pause states

## Component Selection

**Components**:
- **Buttons**: Shadcn Button with custom neon-glow classes for primary actions, outline variants for secondary
- **Cards**: Shadcn Card with custom `.studio-card` class (backdrop blur, semi-transparent bg, subtle border)
- **Inputs**: Shadcn Input and Textarea with muted backgrounds, focus ring with primary color
- **Progress**: Shadcn Progress with custom height (h-2, h-3) and neon glow classes
- **Checkboxes**: Shadcn Checkbox for platform selection and comment selection
- **Badges**: Shadcn Badge for platform tags, status indicators, engagement counts
- **Tabs**: Shadcn Tabs for multi-caption preview in AI dialog
- **Dialog**: Shadcn Dialog for AI lyric analysis modal
- **ScrollArea**: Shadcn ScrollArea for recent drops, uploaded tracks, releases catalog
- **Alert**: Shadcn Alert for configuration status, warnings, and empty states
- **Collapsible**: Shadcn Collapsible for setup guide in Vault
- **Toast**: Sonner for all notifications (success, error, info)

**Customizations**:
- `.studio-card`: Glass morphism effect with `bg-card/80 backdrop-blur-sm border border-border shadow-xl`
- `.neon-glow-magenta`: Custom box-shadow for primary actions `0 0 20px oklch(0.701 0.322 328 / 0.5)`
- `.neon-glow-cyan`: Secondary glow `0 0 20px oklch(0.906 0.195 195 / 0.5)`
- `.neon-glow-orange`: Accent glow `0 0 20px oklch(0.646 0.237 16 / 0.5)`
- Custom upload drop zones with hover states, drag-over effects, and icon transformations

**States**:
- **Button Disabled**: Reduced opacity (0.5), cursor not-allowed, no hover effects
- **Input Focus**: Border color shifts to primary, subtle ring with primary/50 opacity
- **Checkbox Checked**: Background primary, border primary, checkmark visible
- **Progress Loading**: Animated width transition, color shifts based on status (uploading/syncing/success/error)
- **Upload Success**: Confetti animation, checkmark icon, green glow

**Icon Selection** (Lucide React):
- **Zap**: The Drop action (lightning fast posting)
- **Upload**: File uploads, studio sync
- **Music**: Audio files, tracks, releases, TikTok platform
- **Eye**: Preview functionality
- **MessageCircle**: Comments, engagement
- **Calendar**: Release scheduling
- **Settings**: Vault configuration
- **Database**: Studio/uploads section
- **Sparkles**: AI features, demo mode
- **ExternalLink**: External URLs, website links
- **CheckCircle**: Success states, synced status, connected platforms
- **AlertCircle**: Warnings, missing config
- **Loader2**: Loading states (with spin animation)
- **Instagram**: Instagram platform icon
- **Youtube**: YouTube platform icon
- **LogIn/LogOut**: Social media authentication
- **Users**: Social media tab

**Spacing**:
- **Card Padding**: p-4 for compact cards, p-6 for primary content areas
- **Gap Between Elements**: gap-4 (1rem) for related items, gap-6 (1.5rem) for sections
- **Section Spacing**: space-y-6 between major page sections
- **Grid Gaps**: gap-4 for card grids

**Mobile**:
- **Navigation**: Wrap button group with flex-wrap, maintain large touch targets (min h-11)
- **Grid Layouts**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for responsive card grids
- **Upload Drop Zones**: Full width on mobile, maintain minimum height for easy drag/drop
- **Preview Grid**: Stack vertically on mobile (grid-cols-2 lg:grid-cols-4)
- **Typography**: Reduce H1 from 60px to 48px on mobile (text-5xl md:text-6xl)
- **Sidebar Hype Meters**: Remain in right column on desktop, move below main content on mobile
