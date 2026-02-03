import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Sparkles, Copy, Zap, Music, Hash } from 'lucide-react'

interface GhostwriterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCaptionSelect: (caption: string) => void
  currentCaption: string
}

interface CaptionVariant {
  hype: string
  promo: string
  viral: string
}

type WorkflowMode = 'tone-shift' | 'lyric-hook' | 'hashtag-inject'

export function GhostwriterModal({
  open,
  onOpenChange,
  onCaptionSelect,
  currentCaption
}: GhostwriterModalProps) {
  const [mode, setMode] = useState<WorkflowMode>('tone-shift')
  const [lyricInput, setLyricInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCaptions, setGeneratedCaptions] = useState<CaptionVariant | null>(null)
  const [extractedHook, setExtractedHook] = useState('')
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([])

  const HASHTAG_VAULT = {
    music: ['#PikoMusic', '#NewHipHop', '#YouTubeMusic', '#IndependentArtist', '#HipHopCulture'],
    energy: ['#Fire', '#Vibes', '#NewMusic', '#MusicVideo', '#NowPlaying'],
    promo: ['#NewRelease', '#OutNow', '#MusicDrop', '#StreamNow', '#LinkInBio'],
    community: ['#SupportIndieMusic', '#UndergroundHipHop', '#RealHipHop', '#MusicLife'],
    platform: ['#YouTubeArtist', '#TikTokMusic', '#InstagramMusic', '#SpotifyArtist']
  }

  const generateToneShift = async () => {
    if (!currentCaption.trim()) {
      toast.error('Enter a caption or video link first!')
      return
    }

    setIsGenerating(true)

    try {
      const prompt = `You are the Creative Director for PIKO, a YouTube-focused hip-hop artist. Generate 3 caption styles for this content:

INPUT: ${currentCaption}

Generate exactly 3 caption styles optimized for different platforms. Return a JSON object with these exact keys:

1. "hype": Street-level energy, heavy on emojis (🔥, 💿, 🚀, 💯, ⚡). Focus on excitement and raw energy. Include #PikoMusic #NewHipHop #YouTubeMusic. Keep under 200 characters. Use slang and capital letters for emphasis.

2. "promo": Clean, professional, YouTube CTA-focused. Clear message with strong call-to-action ("Watch the full video", "Stream now", "Subscribe for more"). Include relevant hashtags. Keep under 200 characters. Professional but engaging tone.

3. "viral": Ultra-short, punchy, curiosity-gap designed for TikTok/X. Maximum engagement focus with a hook that makes people NEED to click. Under 100 characters. No fluff.

Voice: Authentic, Street-smart, Technical, Energetic, Confident.`

      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const result = JSON.parse(response)

      setGeneratedCaptions({
        hype: result.hype || '',
        promo: result.promo || '',
        viral: result.viral || ''
      })

      toast.success('3 caption styles generated!')
    } catch (error) {
      toast.error('AI generation failed. Try again!')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateLyricHook = async () => {
    if (!lyricInput.trim()) {
      toast.error('Paste your track lyrics first!')
      return
    }

    setIsGenerating(true)

    try {
      const prompt = `You are a social media strategist for hip-hop artist PIKO. Analyze these track lyrics and extract the HARDEST 4 lines that would work best as an Instagram Reels or TikTok caption.

LYRICS:
${lyricInput}

TASK:
1. Identify the 4 most powerful, quotable, hard-hitting lines from the lyrics
2. These should be lines that:
   - Hit different (memorable, punchy)
   - Tell a mini-story or convey strong emotion
   - Work standalone without full song context
   - Would make someone want to hear the full track

3. Format them as an Instagram Reels caption with proper spacing and emojis

Return ONLY the formatted caption, no explanation. Make it street-ready and Instagram-optimized with 2-3 relevant emojis. Keep it under 150 characters total.`

      const hook = await window.spark.llm(prompt, 'gpt-4o-mini', false)
      setExtractedHook(hook.trim())
      toast.success('Hook extracted from lyrics!')
    } catch (error) {
      toast.error('Hook extraction failed. Try again!')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateSmartHashtags = async () => {
    if (!currentCaption.trim()) {
      toast.error('Enter a caption first!')
      return
    }

    setIsGenerating(true)

    try {
      const prompt = `You are a social media optimization expert for hip-hop artist PIKO. Analyze this caption and suggest the best hashtags from the available vault.

CAPTION: ${currentCaption}

HASHTAG VAULT (organized by category):
${JSON.stringify(HASHTAG_VAULT, null, 2)}

TASK:
Return a JSON object with a single property "hashtags" containing an array of 5-8 hashtags that best match this caption's content, tone, and intent. Mix categories strategically. Always include #PikoMusic.

Example format:
{
  "hashtags": ["#PikoMusic", "#NewHipHop", "#Fire", "#OutNow", "#YouTubeArtist"]
}`

      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const result = JSON.parse(response)
      setSuggestedHashtags(result.hashtags || [])
      toast.success(`${result.hashtags?.length || 0} hashtags suggested!`)
    } catch (error) {
      toast.error('Hashtag generation failed. Try again!')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectCaption = (variant: keyof CaptionVariant) => {
    if (generatedCaptions) {
      onCaptionSelect(generatedCaptions[variant])
      toast.success('Caption applied to Launchpad!')
    }
  }

  const handleUseHook = () => {
    if (extractedHook) {
      onCaptionSelect(extractedHook)
      toast.success('Hook applied to Launchpad!')
    }
  }

  const handleApplyHashtags = () => {
    if (suggestedHashtags.length > 0) {
      const hashtagString = '\n\n' + suggestedHashtags.join(' ')
      const captionWithHashtags = currentCaption.trim() + hashtagString
      onCaptionSelect(captionWithHashtags)
      toast.success('Hashtags injected!')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-lime-500/50 bg-zinc-950/95 backdrop-blur-xl max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black uppercase tracking-wider flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-lime-400" />
            <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
              GHOSTWRITER AI
            </span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Multimodal content remixing powered by AI
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as WorkflowMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50 border-2 border-zinc-800 mb-6">
            <TabsTrigger
              value="tone-shift"
              className="font-bold uppercase text-xs data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950"
            >
              <Zap className="w-3 h-3 mr-1" />
              Tone Shift
            </TabsTrigger>
            <TabsTrigger
              value="lyric-hook"
              className="font-bold uppercase text-xs data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950"
            >
              <Music className="w-3 h-3 mr-1" />
              Lyric Hook
            </TabsTrigger>
            <TabsTrigger
              value="hashtag-inject"
              className="font-bold uppercase text-xs data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950"
            >
              <Hash className="w-3 h-3 mr-1" />
              Hashtag Vault
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tone-shift" className="space-y-4">
            <Card className="border-2 border-zinc-800 bg-zinc-900/30">
              <CardContent className="p-4">
                <p className="text-sm text-zinc-400 mb-3">
                  Transform your current caption into 3 platform-optimized styles: <strong className="text-lime-400">Street Hype</strong>, <strong className="text-emerald-400">Official Promo</strong>, and <strong className="text-cyan-400">Viral Punch</strong>.
                </p>
                <div className="p-3 rounded border border-zinc-700 bg-zinc-950/50 mb-3">
                  <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Current Caption:</p>
                  <p className="text-sm text-zinc-300">{currentCaption || 'No caption entered yet'}</p>
                </div>
                <Button
                  onClick={generateToneShift}
                  disabled={isGenerating || !currentCaption.trim()}
                  className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider active:scale-95 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      REMIXING...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      GENERATE 3 STYLES
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {generatedCaptions && (
              <div className="space-y-3">
                {(['hype', 'promo', 'viral'] as const).map((variant) => {
                  const variantLabels = {
                    hype: { label: 'STREET HYPE', color: 'lime', emoji: '🔥' },
                    promo: { label: 'OFFICIAL PROMO', color: 'emerald', emoji: '📢' },
                    viral: { label: 'VIRAL PUNCH', color: 'cyan', emoji: '⚡' }
                  }
                  const config = variantLabels[variant]

                  return (
                    <Card key={variant} className={`border-2 border-${config.color}-600/50 bg-${config.color}-500/5`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className={`bg-${config.color}-500/20 text-${config.color}-400 border-${config.color}-500/50 font-black uppercase`}>
                            {config.emoji} {config.label}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(generatedCaptions[variant])}
                            className="hover:bg-zinc-800 active:scale-95 transition-all"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="p-3 rounded border border-zinc-700 bg-zinc-950/50">
                          <p className="text-sm leading-relaxed">{generatedCaptions[variant]}</p>
                        </div>
                        <Button
                          onClick={() => handleSelectCaption(variant)}
                          className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase active:scale-95 transition-all"
                        >
                          USE THIS CAPTION
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="lyric-hook" className="space-y-4">
            <Card className="border-2 border-zinc-800 bg-zinc-900/30">
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label className="text-xs uppercase tracking-widest font-black text-zinc-400 mb-2 block">
                    PASTE YOUR TRACK LYRICS
                  </Label>
                  <Textarea
                    value={lyricInput}
                    onChange={(e) => setLyricInput(e.target.value)}
                    placeholder="Paste your full track lyrics here..."
                    className="min-h-[200px] resize-none bg-zinc-950 border-zinc-700 focus:border-lime-500 text-sm font-mono"
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  AI will extract the <strong>hardest 4 lines</strong> and format them as an Instagram Reels caption
                </p>
                <Button
                  onClick={generateLyricHook}
                  disabled={isGenerating || !lyricInput.trim()}
                  className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider active:scale-95 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      EXTRACTING...
                    </>
                  ) : (
                    <>
                      <Music className="w-5 h-5 mr-2" />
                      EXTRACT HOOK
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {extractedHook && (
              <Card className="border-2 border-purple-600/50 bg-purple-500/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 font-black uppercase">
                      🎤 EXTRACTED HOOK
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(extractedHook)}
                      className="hover:bg-zinc-800 active:scale-95 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4 rounded border border-purple-600/30 bg-zinc-950/50">
                    <p className="text-sm leading-relaxed whitespace-pre-line">{extractedHook}</p>
                  </div>
                  <Button
                    onClick={handleUseHook}
                    className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase active:scale-95 transition-all"
                  >
                    USE THIS HOOK
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="hashtag-inject" className="space-y-4">
            <Card className="border-2 border-zinc-800 bg-zinc-900/30">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm text-zinc-400 mb-3">
                  AI analyzes your caption and suggests the most relevant hashtags from PIKO's curated vault.
                </p>
                <div className="p-3 rounded border border-zinc-700 bg-zinc-950/50 mb-3">
                  <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Current Caption:</p>
                  <p className="text-sm text-zinc-300">{currentCaption || 'No caption entered yet'}</p>
                </div>
                <Button
                  onClick={generateSmartHashtags}
                  disabled={isGenerating || !currentCaption.trim()}
                  className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider active:scale-95 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ANALYZING...
                    </>
                  ) : (
                    <>
                      <Hash className="w-5 h-5 mr-2" />
                      SUGGEST HASHTAGS
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {suggestedHashtags.length > 0 && (
              <Card className="border-2 border-cyan-600/50 bg-cyan-500/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-black uppercase">
                      # SMART HASHTAGS ({suggestedHashtags.length})
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(suggestedHashtags.join(' '))}
                      className="hover:bg-zinc-800 active:scale-95 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-3 rounded border border-cyan-600/30 bg-zinc-950/50">
                    <div className="flex flex-wrap gap-2">
                      {suggestedHashtags.map((tag, idx) => (
                        <Badge
                          key={idx}
                          className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={handleApplyHashtags}
                    className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase active:scale-95 transition-all"
                  >
                    INJECT HASHTAGS
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="border-2 border-zinc-800 bg-zinc-900/30">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-zinc-400 uppercase mb-3">HASHTAG VAULT LIBRARY</p>
                <div className="space-y-3">
                  {Object.entries(HASHTAG_VAULT).map(([category, tags]) => (
                    <div key={category}>
                      <p className="text-xs font-bold text-zinc-500 uppercase mb-1">{category}</p>
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag, idx) => (
                          <Badge
                            key={idx}
                            className="bg-zinc-800 text-zinc-400 text-[10px] font-mono cursor-pointer hover:bg-zinc-700 active:scale-95 transition-all"
                            onClick={() => copyToClipboard(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
