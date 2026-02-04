import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  InstagramLogo, 
  TiktokLogo, 
  XLogo, 
  FacebookLogo, 
  LinkedinLogo 
} from '@phosphor-icons/react'
import { Heart, MessageCircle, Send, Bookmark, Eye } from 'lucide-react'

interface PlatformPreviewProps {
  caption: string
  selectedPlatforms: string[]
}

export function PlatformPreview({ caption, selectedPlatforms }: PlatformPreviewProps) {
  const characterLimits = {
    twitter: 280,
    instagram: 2200,
    tiktok: 2200,
    facebook: 63206,
    linkedin: 3000
  }

  const getCharacterCount = (platform: string) => {
    const limit = characterLimits[platform as keyof typeof characterLimits] || 2200
    const percentage = (caption.length / limit) * 100
    const color = percentage > 90 ? 'text-red-400' : percentage > 70 ? 'text-yellow-400' : 'text-lime-400'
    return { count: caption.length, limit, percentage, color }
  }

  const formatCaption = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const hashtagRegex = /#(\w+)/g
    const mentionRegex = /@(\w+)/g

    const formatted = text
      .replace(urlRegex, '<span class="text-blue-400 underline">$1</span>')
      .replace(hashtagRegex, '<span class="text-cyan-400 font-semibold">#$1</span>')
      .replace(mentionRegex, '<span class="text-blue-400 font-semibold">@$1</span>')

    return formatted
  }

  if (!caption.trim()) {
    return (
      <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-900 flex items-center justify-center">
            <Eye className="w-8 h-8 text-zinc-700" />
          </div>
          <p className="text-zinc-500 font-bold uppercase tracking-wide">
            Write a caption to see platform previews
          </p>
        </CardContent>
      </Card>
    )
  }

  const availablePlatforms = selectedPlatforms.length > 0 
    ? selectedPlatforms 
    : ['instagram', 'tiktok', 'twitter']

  const hasReelsAndTikTok = availablePlatforms.includes('instagram') && availablePlatforms.includes('tiktok')

  return (
    <Card className="border-2 border-cyan-500/50 bg-zinc-950/90 backdrop-blur-xl shadow-2xl shadow-cyan-500/20">
      <CardHeader className="border-b border-zinc-800/50">
        <CardTitle className="text-xl uppercase tracking-wider font-black flex items-center gap-3">
          <Eye className="w-6 h-6 text-cyan-400" />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            PLATFORM PREVIEW
          </span>
        </CardTitle>
        <p className="text-xs text-zinc-500 mt-1">Postiz-style side-by-side comparison</p>
      </CardHeader>
      <CardContent className="p-6">
        {hasReelsAndTikTok ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 pb-2">
              <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50 font-black uppercase">
                <InstagramLogo className="w-3 h-3 mr-1" weight="bold" />
                Reels
              </Badge>
              <span className="text-zinc-600 font-black">VS</span>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-black uppercase">
                <TiktokLogo className="w-3 h-3 mr-1" weight="bold" />
                TikTok
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-black uppercase tracking-wider text-pink-400 flex items-center gap-2">
                    <InstagramLogo className="w-4 h-4" weight="bold" />
                    Instagram Reels
                  </h3>
                  <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50 text-xs">
                    {getCharacterCount('instagram').count}/{getCharacterCount('instagram').limit}
                  </Badge>
                </div>
                <div className="border-2 border-pink-500/30 rounded-lg overflow-hidden bg-black hover:border-pink-500/60 transition-all">
                  <div className="bg-zinc-950 border-b border-zinc-800 p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center text-white text-xs font-black">
                        P
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">piko_music</p>
                        <p className="text-xs text-zinc-500">Music · Artist</p>
                      </div>
                    </div>
                  </div>

                  <div className="aspect-[9/16] max-h-[500px] bg-zinc-900 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-yellow-500/10" />
                    <div className="text-center text-zinc-700 relative z-10">
                      <InstagramLogo className="w-16 h-16 mx-auto mb-2" weight="thin" />
                      <p className="text-sm">Vertical Reel Preview</p>
                      <p className="text-xs mt-1">9:16 Format</p>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-950 space-y-3">
                    <div className="flex items-center gap-4 text-white">
                      <Heart className="w-6 h-6" />
                      <MessageCircle className="w-6 h-6" />
                      <Send className="w-6 h-6" />
                      <Bookmark className="w-6 h-6 ml-auto" />
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-bold text-white mr-2">piko_music</span>
                      <span 
                        className="text-zinc-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatCaption(caption.slice(0, 200)) }}
                      />
                      {caption.length > 200 && (
                        <span className="text-zinc-500 ml-1">...more</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <TiktokLogo className="w-4 h-4" weight="bold" />
                    TikTok
                  </h3>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
                    {getCharacterCount('tiktok').count}/{getCharacterCount('tiktok').limit}
                  </Badge>
                </div>
                <div className="border-2 border-cyan-500/30 rounded-lg overflow-hidden bg-black hover:border-cyan-500/60 transition-all">
                  <div className="bg-zinc-950 border-b border-zinc-800 p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-white text-xs font-black">
                        P
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">@piko.music</p>
                        <p className="text-xs text-zinc-500">Hip-Hop Artist</p>
                      </div>
                    </div>
                  </div>

                  <div className="aspect-[9/16] max-h-[500px] bg-zinc-900 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-pink-500/10" />
                    <div className="text-center text-zinc-700 relative z-10">
                      <TiktokLogo className="w-16 h-16 mx-auto mb-2" weight="thin" />
                      <p className="text-sm">Vertical Video Preview</p>
                      <p className="text-xs mt-1">9:16 Format</p>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-950">
                    <div className="text-sm">
                      <span className="font-bold text-white mr-2">@piko.music</span>
                      <span 
                        className="text-zinc-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatCaption(caption.slice(0, 150)) }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {availablePlatforms.filter(p => !['instagram', 'tiktok'].includes(p)).length > 0 && (
              <div className="pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-3">Other Selected Platforms</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availablePlatforms.includes('twitter') && (
                    <div className="border-2 border-blue-500/30 rounded-lg overflow-hidden bg-zinc-950 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <XLogo className="w-4 h-4 text-blue-400" weight="bold" />
                        <span className="text-xs font-black text-blue-400">X (TWITTER)</span>
                        <Badge className={`${getCharacterCount('twitter').color} ml-auto border-0 text-xs font-mono`}>
                          {getCharacterCount('twitter').count}/{getCharacterCount('twitter').limit}
                        </Badge>
                      </div>
                      <div className="text-xs text-zinc-300 line-clamp-3" dangerouslySetInnerHTML={{ __html: formatCaption(caption) }} />
                    </div>
                  )}
                  
                  {availablePlatforms.includes('facebook') && (
                    <div className="border-2 border-blue-600/30 rounded-lg overflow-hidden bg-zinc-950 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FacebookLogo className="w-4 h-4 text-blue-500" weight="bold" />
                        <span className="text-xs font-black text-blue-500">FACEBOOK</span>
                        <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs ml-auto">
                          {getCharacterCount('facebook').count}
                        </Badge>
                      </div>
                      <div className="text-xs text-zinc-300 line-clamp-3" dangerouslySetInnerHTML={{ __html: formatCaption(caption) }} />
                    </div>
                  )}

                  {availablePlatforms.includes('linkedin') && (
                    <div className="border-2 border-blue-700/30 rounded-lg overflow-hidden bg-zinc-950 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <LinkedinLogo className="w-4 h-4 text-blue-600" weight="bold" />
                        <span className="text-xs font-black text-blue-600">LINKEDIN</span>
                        <Badge className="bg-blue-600/20 text-blue-500 border-0 text-xs ml-auto">
                          {getCharacterCount('linkedin').count}
                        </Badge>
                      </div>
                      <div className="text-xs text-zinc-300 line-clamp-3" dangerouslySetInnerHTML={{ __html: formatCaption(caption) }} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Tabs defaultValue={availablePlatforms[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 bg-zinc-900/50 border-2 border-zinc-800">
              {availablePlatforms.includes('instagram') && (
                <TabsTrigger 
                  value="instagram" 
                  className="font-bold uppercase text-xs data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400"
                >
                  <InstagramLogo className="w-4 h-4 mr-1" weight="bold" />
                  IG
                </TabsTrigger>
              )}
              {availablePlatforms.includes('tiktok') && (
                <TabsTrigger 
                  value="tiktok" 
                  className="font-bold uppercase text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
                >
                  <TiktokLogo className="w-4 h-4 mr-1" weight="bold" />
                  TT
                </TabsTrigger>
              )}
              {availablePlatforms.includes('twitter') && (
                <TabsTrigger 
                  value="twitter" 
                  className="font-bold uppercase text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
                >
                  <XLogo className="w-4 h-4 mr-1" weight="bold" />
                  X
                </TabsTrigger>
              )}
              {availablePlatforms.includes('facebook') && (
                <TabsTrigger 
                  value="facebook" 
                  className="font-bold uppercase text-xs data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-500"
                >
                  <FacebookLogo className="w-4 h-4 mr-1" weight="bold" />
                  FB
                </TabsTrigger>
              )}
              {availablePlatforms.includes('linkedin') && (
                <TabsTrigger 
                  value="linkedin" 
                  className="font-bold uppercase text-xs data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-600"
                >
                  <LinkedinLogo className="w-4 h-4 mr-1" weight="bold" />
                  LI
                </TabsTrigger>
              )}
            </TabsList>

            {availablePlatforms.includes('instagram') && (
              <TabsContent value="instagram" className="mt-4">
                <div className="border-2 border-pink-500/30 rounded-lg overflow-hidden bg-black">
                  <div className="bg-zinc-950 border-b border-zinc-800 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center text-white text-xs font-black">
                        P
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">piko_music</p>
                        <p className="text-xs text-zinc-500">Music · Artist</p>
                      </div>
                    </div>
                    <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50 text-xs">
                      {getCharacterCount('instagram').count}/{getCharacterCount('instagram').limit}
                    </Badge>
                  </div>

                  <div className="aspect-square bg-zinc-900 flex items-center justify-center">
                    <div className="text-center text-zinc-700">
                      <InstagramLogo className="w-16 h-16 mx-auto mb-2" weight="thin" />
                      <p className="text-sm">Cover Art / Video Preview</p>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-950 space-y-3">
                    <div className="flex items-center gap-4 text-white">
                      <Heart className="w-6 h-6" />
                      <MessageCircle className="w-6 h-6" />
                      <Send className="w-6 h-6" />
                      <Bookmark className="w-6 h-6 ml-auto" />
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-bold text-white mr-2">piko_music</span>
                      <span 
                        className="text-zinc-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatCaption(caption.slice(0, 200)) }}
                      />
                      {caption.length > 200 && (
                        <span className="text-zinc-500 ml-1">...more</span>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}

            {availablePlatforms.includes('tiktok') && (
              <TabsContent value="tiktok" className="mt-4">
                <div className="border-2 border-cyan-500/30 rounded-lg overflow-hidden bg-black">
                  <div className="bg-zinc-950 border-b border-zinc-800 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-white text-xs font-black">
                        P
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">@piko.music</p>
                        <p className="text-xs text-zinc-500">Hip-Hop Artist</p>
                      </div>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
                      {getCharacterCount('tiktok').count}/{getCharacterCount('tiktok').limit}
                    </Badge>
                  </div>

                  <div className="aspect-[9/16] max-h-96 bg-zinc-900 flex items-center justify-center">
                    <div className="text-center text-zinc-700">
                      <TiktokLogo className="w-16 h-16 mx-auto mb-2" weight="thin" />
                      <p className="text-sm">Vertical Video Preview</p>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-950">
                    <div className="text-sm">
                      <span className="font-bold text-white mr-2">@piko.music</span>
                      <span 
                        className="text-zinc-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatCaption(caption.slice(0, 150)) }}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}

            {availablePlatforms.includes('twitter') && (
              <TabsContent value="twitter" className="mt-4">
                <div className="border-2 border-blue-500/30 rounded-lg overflow-hidden bg-black">
                  <div className="bg-zinc-950 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                        P
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-white">PIKO</span>
                          <span className="text-zinc-500">@piko_music</span>
                          <span className="text-zinc-700">·</span>
                          <span className="text-zinc-500 text-sm">now</span>
                          <Badge className={`${getCharacterCount('twitter').color} ml-auto border-0 text-xs font-mono`}>
                            {getCharacterCount('twitter').count}/{getCharacterCount('twitter').limit}
                          </Badge>
                        </div>
                        
                        <div 
                          className="text-white text-base leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: formatCaption(caption) }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}

            {availablePlatforms.includes('facebook') && (
              <TabsContent value="facebook" className="mt-4">
                <div className="border-2 border-blue-600/30 rounded-lg overflow-hidden bg-zinc-950">
                  <div className="p-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-black">
                        P
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">PIKO Music</p>
                        <p className="text-xs text-zinc-500">Just now · 🌎</p>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs ml-auto">
                        {getCharacterCount('facebook').count}/{getCharacterCount('facebook').limit}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div 
                      className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatCaption(caption) }}
                    />
                  </div>
                </div>
              </TabsContent>
            )}

            {availablePlatforms.includes('linkedin') && (
              <TabsContent value="linkedin" className="mt-4">
                <div className="border-2 border-blue-700/30 rounded-lg overflow-hidden bg-zinc-950">
                  <div className="p-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white text-sm font-black">
                        P
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">PIKO</p>
                        <p className="text-xs text-zinc-500">Hip-Hop Artist | Content Creator</p>
                        <p className="text-xs text-zinc-600">Just now</p>
                      </div>
                      <Badge className="bg-blue-600/20 text-blue-500 border-blue-600/50 text-xs ml-auto">
                        {getCharacterCount('linkedin').count}/{getCharacterCount('linkedin').limit}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div 
                      className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatCaption(caption) }}
                    />
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
