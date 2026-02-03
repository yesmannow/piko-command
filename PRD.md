# PIKO COMMAND - Social Media Distribution Hub

A hyper-modern, high-performance social media distribution hub that combines the precision of a Digital Audio Workstation with premium streetwear aesthetics, purpose-built for artist PIKO.

**Experience Qualities**:
1. **Empowering** - The interface should make content creation feel like producing a track in a professional studio, giving the artist complete control and confidence.
2. **Electric** - Every interaction should feel charged with energy through responsive micro-interactions, glowing accents, and fluid animations that match the intensity of hip-hop culture.
3. **Refined** - Despite the bold aesthetic, the UI maintains premium quality through glassmorphism, precise spacing, and thoughtful hierarchy that feels expensive and exclusive.

**Complexity Level**: Light Application (multiple features with basic state)
This is a focused tool for cross-platform social media posting with AI assistance, draft management, and analytics visualization. It has distinct feature areas (composer, vault, feed, metrics) but maintains a single-view dashboard approach with moderate state management needs.

## Essential Features

### The Composer (Content Creation)
- **Functionality**: Rich text area with platform-specific character counters, media upload dropzone, platform selection checkboxes, and AI remix capability
- **Purpose**: Centralized content creation that adapts to each platform's requirements
- **Trigger**: Main interface always visible; AI Ghostwriter triggered by button click
- **Progression**: User types content → Selects platforms (IG/X/TikTok) → Optional: clicks Ghostwriter for AI remixes → Reviews character counts → Sends post → Confetti celebration
- **Success Criteria**: Post data persists to KV store with timestamp, character counters update in real-time, AI generates three distinct remix styles, success state triggers visual feedback

### The Vault (Latest Tracks)
- **Functionality**: Displays 3 most recent tracks with artwork, title, and release info
- **Purpose**: Keep music releases visible and accessible during content creation for cross-promotion
- **Trigger**: Auto-loads on app mount
- **Progression**: App loads → Mock data fetches → Cards render with glassmorphism styling → Hover reveals additional details
- **Success Criteria**: Three track cards display with proper spacing, images load correctly, responsive on all devices

### Live Feed (Post History)
- **Functionality**: Horizontal scrolling gallery of previously sent posts with republish capability
- **Purpose**: Quick access to post history and one-click republishing
- **Trigger**: Loads from KV store on mount; updates when new post sent
- **Progression**: User views feed → Scrolls horizontally → Clicks post card → Option to republish appears → Confirms → Content repopulates composer
- **Success Criteria**: Posts persist across sessions, scroll interaction is smooth, republish accurately restores content and platform selections

### Hype Metrics (Engagement Stats)
- **Functionality**: Visual dashboard of mock engagement metrics using progress bars and numbers
- **Purpose**: Motivational feedback showing growth and engagement trends
- **Trigger**: Auto-displays on load
- **Progression**: App loads → Animated progress bars fill → Numbers count up → Hover shows detailed tooltips
- **Success Criteria**: Animations feel smooth and energetic, metrics are visually distinct, mobile layout remains readable

### AI Ghostwriter (Content Remix)
- **Functionality**: Takes user's draft and generates three stylistic variations
- **Purpose**: Overcome writer's block and optimize content for different audiences
- **Trigger**: User clicks "Ghostwriter" button in composer
- **Progression**: User has draft content → Clicks Ghostwriter → Loading state → Three remix cards appear (Street Hype, Promotional, Viral) → User selects one → Content replaces draft
- **Success Criteria**: LLM generates contextually relevant remixes, distinct tones are evident, selection smoothly replaces original text

## Edge Case Handling
- **Empty Composer Send**: Disable send button when textarea is empty; show subtle visual feedback
- **Character Limit Overflow**: Display warning color (Cyber Lime) when approaching limits, red when exceeded
- **No Platform Selected**: Require at least one platform checkbox before allowing send
- **API Failure States**: Show retry button with clear error messaging using toast notifications
- **Empty Post History**: Display encouraging empty state with icon and call-to-action
- **Slow LLM Response**: Show skeleton loading states during AI generation with timeout fallback

## Design Direction
The design should evoke the feeling of being in a premium recording studio—dark, focused, professional—but infused with the bold energy of streetwear culture. Every surface should have depth through glassmorphism, every interaction should feel tactile and responsive, and the color palette should pop against the deep charcoal like neon signs in a night cityscape.

## Color Selection
The palette balances professional darkness with electric energy pops.

- **Primary Color (Electric Indigo #6366f1 / oklch(0.611 0.211 271.5))**: Represents creativity and digital innovation; used for primary actions, focus states, and key interactive elements
- **Secondary Color (Cyber Lime #bef264 / oklch(0.906 0.175 127.5))**: High-energy accent for success states, highlights, and attention-grabbing elements like warnings
- **Background (Zinc-950 #09090b / oklch(0.135 0 0))**: Deep charcoal foundation that makes colors pop and creates studio-like focus
- **Surface (Zinc-900 #18181b / oklch(0.185 0 0))**: Elevated surfaces for cards and panels with glassmorphism effects
- **Foreground (Zinc-50 #fafafa / oklch(0.985 0 0))**: Primary text color for maximum contrast and readability
- **Muted (Zinc-500 #71717a / oklch(0.544 0.011 264))**: Secondary text and subtle UI elements

**Foreground/Background Pairings**:
- Primary (Electric Indigo #6366f1): White text (#fafafa) - Ratio 5.2:1 ✓
- Secondary (Cyber Lime #bef264): Zinc-950 (#09090b) - Ratio 12.8:1 ✓
- Background (Zinc-950 #09090b): Zinc-50 (#fafafa) - Ratio 18.5:1 ✓
- Surface (Zinc-900 #18181b): Zinc-50 (#fafafa) - Ratio 16.2:1 ✓

## Font Selection
Typography should bridge technical precision with street culture boldness—clean and readable for body content but impactful and commanding for headers.

- **Typographic Hierarchy**:
  - H1 (App Title "PIKO COMMAND"): Space Grotesk Bold/32px/tight tracking (-0.02em)/uppercase - commanding presence
  - H2 (Section Headers): Space Grotesk Bold/20px/tight tracking/uppercase - section definition
  - H3 (Card Titles): Inter SemiBold/16px/normal tracking - content hierarchy
  - Body (Primary Content): Inter Regular/14px/relaxed line-height (1.6) - optimal readability
  - Caption (Metadata/Stats): Inter Medium/12px/wide tracking (0.02em) - technical precision
  - Button Labels: Inter SemiBold/14px/normal tracking/uppercase - clear actions

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
- **Check**: For success confirmations

**Spacing**:
- Container padding: p-6 (24px) on desktop, p-4 (16px) on mobile
- Grid gap: gap-6 (24px) on desktop, gap-4 (16px) on mobile
- Card internal padding: p-6
- Button padding: px-6 py-3 for primary, px-4 py-2 for secondary
- Section spacing: space-y-4 for related elements, space-y-8 for distinct sections
- Bento grid cell min-heights: Large (400px), Medium (300px), Wide (250px), Small (200px)

**Mobile**:
- Bento grid transitions from complex layout to single-column stack
- Horizontal Live Feed maintains scroll on mobile with snap points
- Character counters stack vertically instead of horizontal row
- Platform checkboxes remain horizontal with smaller touch targets
- Ghostwriter remix cards stack vertically
- All text sizes remain the same (already optimized for readability)
- Bottom padding increases on mobile to account for browser chrome
