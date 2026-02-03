import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  InstagramLogo, 
  XLogo
import 
interface SocialPreviewProps {
  smartLink?: string

interface SocialPreviewProps {
  caption: string
  smartLink?: string
}

export function SocialPreview({ caption, smartLink }: SocialPreviewProps) {
  const formatCaption = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const hashtagRegex = /#(\w+)/g
    const mentionRegex = /@(\w+)/g

    const formatted = text
      .replace(urlRegex, '<span class="text-lime-400 underline">$1</span>')
      .replace(hashtagRegex, '<span class="text-cyan-400 font-semibold">#$1</span>')
      .replace(mentionRegex, '<span class="text-lime-400 font-semibold">@$1</span>')

    return formatted
  }

  const fullCaption = smartLink 
    ? `${caption}\n\n🔗 ${smartLink}` 
    : caption

  if (!caption.trim()) {
    return (
      <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
        <CardContent className="p-12 text-center">
        </CardContent>
    )

    <Card className="border-2 border-lime-500/50 bg-zinc-950/95 backdrop-
        <CardTitle className="text-xl uppercase trac
          <spa
          </span>
        <p cl
     
   

          
            <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50 font-black uppercase">
              Instagram
          </div>
          <div className="grid grid-cols-1 lg:grid-
              <div className="flex items-center justify-between mb-2">
                  <XLogo classNa
                <
                  {f
              </div>
                <di
                    <div className=
                    </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-zinc-500">@piko_music</span>
                        <span className="text-zinc-500 text-sm
                      
                    
                      />
                        <p className="text-red-400 text-xs mt-2 font-bold">⚠️ Caption exceeds Twitte
                    </div>

                    
                

                      <span>1.2K</span>
                    <div className="fle
                      <span>94</span>
                  </div>
              </div>

              <div cl
                  <InstagramLogo className="w-4 h-4" weight="bold" />
                </h3>
                  {fullC
              </div>
                <div className="bg-zinc-950 border-b border-zinc-800 p-3">
                    <div className="w-8 h-8 rounded-full bg
                    </div>
                      <p className="text-sm font-bold text-white">piko_music</p>
                    </d
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-white">PIKO</span>
                        <span className="text-zinc-500">@piko_music</span>
                        <span className="text-zinc-700">·</span>
                        <span className="text-zinc-500 text-sm">now</span>
                      </div>
                      
                      <div 
                        className="text-white text-base leading-relaxed whitespace-pre-wrap break-words"
                        dangerouslySetInnerHTML={{ __html: formatCaption(fullCaption.slice(0, 280)) }}
                      />
                      {fullCaption.length > 280 && (
                        <p className="text-red-400 text-xs mt-2 font-bold">⚠️ Caption exceeds Twitter limit</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-zinc-500 text-sm pt-2 border-t border-zinc-800">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>247</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>1.2K</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Send className="w-4 h-4" />
                      <span>94</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-pink-400 flex items-center gap-2">
                  <InstagramLogo className="w-4 h-4" weight="bold" />
                  Instagram
                </h3>
                <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/50 text-xs font-mono">
                  {fullCaption.length}/2200
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

                <div className="aspect-square bg-zinc-900 flex items-center justify-center relative max-h-[300px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-yellow-500/10" />
                  <div className="text-center text-zinc-700 relative z-10">
                    <InstagramLogo className="w-16 h-16 mx-auto mb-2" weight="thin" />
                    <p className="text-sm">Post / Reel Preview</p>
                    <p className="text-xs mt-1">1:1 or 9:16 Format</p>
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
                      className="text-zinc-300 leading-relaxed break-words"
                      dangerouslySetInnerHTML={{ __html: formatCaption(fullCaption.slice(0, 300)) }}
                    />
                    {fullCaption.length > 300 && (
                      <button className="text-zinc-500 ml-1">...more</button>
                    )}
                  </div>

                  <div className="text-zinc-500 text-xs">
                    <span className="font-semibold">2,431 likes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {smartLink && (
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                <span className="font-bold uppercase tracking-wider">Smart Link Active:</span>
                <code className="bg-zinc-900 px-2 py-1 rounded text-lime-400 font-mono">{smartLink}</code>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
                  </div>
                </div>

                <div className="aspect-square bg-zinc-900 flex items-center justify-center relative max-h-[300px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-yellow-500/10" />
                  <div className="text-center text-zinc-700 relative z-10">
                    <InstagramLogo className="w-16 h-16 mx-auto mb-2" weight="thin" />
                    <p className="text-sm">Post / Reel Preview</p>
                    <p className="text-xs mt-1">1:1 or 9:16 Format</p>
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
                      className="text-zinc-300 leading-relaxed break-words"
                      dangerouslySetInnerHTML={{ __html: formatCaption(fullCaption.slice(0, 300)) }}
                    />
                    {fullCaption.length > 300 && (
                      <button className="text-zinc-500 ml-1">...more</button>
                    )}
                  </div>

                  <div className="text-zinc-500 text-xs">
                    <span className="font-semibold">2,431 likes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {smartLink && (
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                <span className="font-bold uppercase tracking-wider">Smart Link Active:</span>
                <code className="bg-zinc-900 px-2 py-1 rounded text-lime-400 font-mono">{smartLink}</code>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
