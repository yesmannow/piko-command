import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Sparkles, Copy, Zap, Music, Hash } from 'lucide-react'

interface CaptionVariant {
  hype: string
  promo: string
  viral: string
}

interface GhostwriterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCaptionSelect: (caption: string) => void
  currentCaption: string
}

export function GhostwriterModal({ open, onOpenChange, onCaptionSelect, currentCaption }: GhostwriterModalProps) {
  const [lyricInput, setLyricInput] = useState('')
  const [generatedCaption, setGeneratedCaption] = useState<CaptionVariant | null>(null)
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([])
  const [extractedHook, setExtractedHook] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const hashtagVault = {
    music: ['#PikoMusic', '#NewHipHop', '#YouTubeMusic', '#IndependentArtist', '#HipHopCulture'],
    energy: ['#Fire', '#Vibes', '#NewMusic', '#MusicVideo', '#NowPlaying'],
    promo: ['#NewRelease', '#OutNow', '#MusicDrop', '#StreamNow', '#LinkInBio'],
    community: ['#SupportIndieMusic', '#UndergroundHipHop', '#RealHipHop', '#MusicLife'],
    platform: ['#YouTubeArtist', '#TikTokMusic', '#InstagramMusic', '#SpotifyArtist']
  }

  const generateToneShift = async () => {
    if (!currentCaption.trim()) {
      toast.error('Enter a caption first!')
      return
    }
    setIsGenerating(true)
    try {
      const promptText = `You are a social media caption expert for hip-hop artists. Transform the following caption into 3 distinct variants optimized for different platforms and tones.

INPUT CAPTION: ${currentCaption}

Generate 3 variations in JSON format:
1. "hype": Street-style, emoji-heavy, all caps emphasis, slang-driven (under 200 chars)
2. "promo": Clean, professional, YouTube CTA-focused (under 200 chars) 
3. "viral": Ultra-short curiosity-gap hook (under 100 chars)

Return ONLY valid JSON with keys: hype, promo, viral`
      const prompt = window.spark.llmPrompt([promptText] as any, ...[])

      const result = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const parsed = JSON.parse(result)
      
      setGeneratedCaption({
        hype: parsed.hype || '',
        promo: parsed.promo || '',
        viral: parsed.viral || ''
      })
      toast.success('3 caption styles generated!')
    } catch (error) {
      toast.error('AI generation failed. Try again!')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const extractLyricHook = async () => {
    if (!lyricInput.trim()) {
      toast.error('Paste your lyrics first!')
      return
    }
    
    setIsGenerating(true)
    try {
      const promptText = `You are a hip-hop marketing expert. Analyze these track lyrics and extract the HARDEST 4 lines that would work as an Instagram Reel or TikTok caption.

LYRICS:
${lyricInput}

REQUIREMENTS:
- Pick the 4 most impactful, memorable lines
- Format with emojis and line breaks for Instagram
- Keep it under 150 characters total
- Make it standalone without needing song context

Return ONLY the formatted hook caption, no explanation.`
      const prompt = window.spark.llmPrompt([promptText] as any, ...[])

      const hook = await window.spark.llm(prompt, 'gpt-4o-mini', false)
      setExtractedHook(hook.trim())
      toast.success('Hook extracted!')
    } catch (error) {
      toast.error('Extraction failed!')
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
      const allTags = Object.values(hashtagVault).flat()
      const promptText = `You are a social media strategist. Analyze this caption and select 5-8 hashtags from the provided list that best match the content and vibe.

CAPTION: ${currentCaption}

AVAILABLE HASHTAGS: ${allTags.join(', ')}

TASK:
- Select 5-8 most relevant hashtags
- Mix categories (music, energy, promo)
- Return as JSON array of hashtag strings

Return format: {"hashtags": ["#Tag1", "#Tag2", ...]}`
      const prompt = window.spark.llmPrompt([promptText] as any, ...[])

      const result = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const parsed = JSON.parse(result)
      setSuggestedHashtags(parsed.hashtags || [])
      toast.success('Smart hashtags generated!')
    } catch (error) {
      toast.error('Hashtag generation failed!')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectVariant = (variant: string) => {
    if (generatedCaption) {
      onCaptionSelect(generatedCaption[variant as keyof CaptionVariant])
      toast.success('Caption applied!')
    }
  }

  const handleApplyHook = () => {
    if (extractedHook) {
      onCaptionSelect(extractedHook)
      toast.success('Hook applied to Launchpad!')
    }
  }

  const handleApplyHashtags = () => {
    if (suggestedHashtags.length > 0) {
      const withHashtags = `${currentCaption}\n\n${suggestedHashtags.join(' ')}`
      onCaptionSelect(withHashtags)
      toast.success('Hashtags injected!')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-950/95 backdrop-blur-xl border-2 border-zinc-800">
        <DialogTitle className="text-3xl uppercase tracking-wider font-black flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-lime-400" />
          <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
            GHOSTWRITER AI
          </span>
        </DialogTitle>

        <Tabs defaultValue="toneshift" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50 border border-zinc-800">
            <TabsTrigger 
              value="toneshift" 
              className="data-[state=active]:bg-lime-500/20 data-[state=active]:text-lime-400 font-bold uppercase"
            >
              <Zap className="w-4 h-4 mr-2" />
              Tone Shifter
            </TabsTrigger>
            <TabsTrigger 
              value="lyrichook" 
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 font-bold uppercase"
            >
              <Music className="w-4 h-4 mr-2" />
              Lyric Hook
            </TabsTrigger>
            <TabsTrigger 
              value="hashtags" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 font-bold uppercase"
            >
              <Hash className="w-4 h-4 mr-2" />
              Hashtags
            </TabsTrigger>
          </TabsList>

          <TabsContent value="toneshift" className="space-y-4 mt-6">
            <p className="text-sm text-zinc-400">
              Transform your caption into 3 platform-optimized variants with different tones and styles.
            </p>
            
            <Button
              onClick={generateToneShift}
              disabled={!currentCaption.trim() || isGenerating}
              className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider border-2 border-lime-400 shadow-lg shadow-lime-400/30 active:scale-95 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  GENERATING...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  GENERATE 3 VARIANTS
                </>
              )}
            </Button>

            {generatedCaption && (
              <div className="space-y-4">
                <Card className="border-2 border-lime-500/30 bg-lime-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/50 font-black uppercase">
                        🔥 Street Hype
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generatedCaption.hype)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm mb-3 whitespace-pre-wrap">{generatedCaption.hype}</p>
                    <Button
                      onClick={() => handleSelectVariant('hype')}
                      className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-bold uppercase"
                      size="sm"
                    >
                      USE THIS
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-emerald-500/30 bg-emerald-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-black uppercase">
                        📢 Official Promo
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generatedCaption.promo)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm mb-3 whitespace-pre-wrap">{generatedCaption.promo}</p>
                    <Button
                      onClick={() => handleSelectVariant('promo')}
                      className="w-full bg-emerald-400 hover:bg-emerald-500 text-zinc-950 font-bold uppercase"
                      size="sm"
                    >
                      USE THIS
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-cyan-500/30 bg-cyan-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-black uppercase">
                        ⚡ Viral Punch
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generatedCaption.viral)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm mb-3 whitespace-pre-wrap">{generatedCaption.viral}</p>
                    <Button
                      onClick={() => handleSelectVariant('viral')}
                      className="w-full bg-cyan-400 hover:bg-cyan-500 text-zinc-950 font-bold uppercase"
                      size="sm"
                    >
                      USE THIS
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="lyrichook" className="space-y-4 mt-6">
            <div className="space-y-3">
              <Label className="text-sm font-black uppercase text-zinc-400">
                PASTE FULL TRACK LYRICS
              </Label>
              <Textarea
                value={lyricInput}
                onChange={(e) => setLyricInput(e.target.value)}
                placeholder="Paste your track lyrics here..."
                className="min-h-[200px] resize-none bg-zinc-950 border-zinc-700 focus:border-emerald-500 text-sm font-mono"
              />
            </div>

            <Button
              onClick={extractLyricHook}
              disabled={!lyricInput.trim() || isGenerating}
              className="w-full bg-emerald-400 hover:bg-emerald-500 text-zinc-950 font-black uppercase tracking-wider border-2 border-emerald-400 shadow-lg shadow-emerald-400/30 active:scale-95 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  EXTRACTING...
                </>
              ) : (
                <>
                  <Music className="w-5 h-5 mr-2" />
                  EXTRACT HARDEST 4 LINES
                </>
              )}
            </Button>

            {extractedHook && (
              <Card className="border-2 border-emerald-500/30 bg-emerald-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-black uppercase">
                      EXTRACTED HOOK
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(extractedHook)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm mb-3 whitespace-pre-wrap">{extractedHook}</p>
                  <Button
                    onClick={handleApplyHook}
                    className="w-full bg-emerald-400 hover:bg-emerald-500 text-zinc-950 font-bold uppercase"
                  >
                    APPLY TO LAUNCHPAD
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="hashtags" className="space-y-4 mt-6">
            <p className="text-sm text-zinc-400">
              AI analyzes your caption and suggests the most relevant hashtags from the vault.
            </p>

            <Button
              onClick={generateSmartHashtags}
              disabled={!currentCaption.trim() || isGenerating}
              className="w-full bg-cyan-400 hover:bg-cyan-500 text-zinc-950 font-black uppercase tracking-wider border-2 border-cyan-400 shadow-lg shadow-cyan-400/30 active:scale-95 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ANALYZING...
                </>
              ) : (
                <>
                  <Hash className="w-5 h-5 mr-2" />
                  GENERATE SMART HASHTAGS
                </>
              )}
            </Button>

            {suggestedHashtags.length > 0 && (
              <Card className="border-2 border-cyan-500/30 bg-cyan-500/5">
                <CardContent className="p-4">
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-black uppercase mb-3">
                    AI SUGGESTED
                  </Badge>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {suggestedHashtags.map(tag => (
                      <Badge
                        key={tag}
                        className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 cursor-pointer hover:bg-cyan-500/20"
                        onClick={() => copyToClipboard(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={handleApplyHashtags}
                    className="w-full bg-cyan-400 hover:bg-cyan-500 text-zinc-950 font-bold uppercase"
                  >
                    INJECT INTO CAPTION
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <Label className="text-xs font-black uppercase text-zinc-400">HASHTAG VAULT</Label>
              {Object.entries(hashtagVault).map(([category, tags]) => (
                <div key={category}>
                  <p className="text-xs font-bold uppercase text-zinc-500 mb-2">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-zinc-800 border-zinc-700"
                        onClick={() => copyToClipboard(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
