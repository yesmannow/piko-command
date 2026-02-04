import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Repeat, Send, Bookmark, MoreHorizontal } from 'lucide-react'

interface SocialPreviewProps {
  caption: string
  smartLink?: string
  mediaUrl?: string
  hashtags?: string[]
}

export function SocialPreview({ caption, smartLink, mediaUrl }: SocialPreviewProps) {
  const [platform, setPlatform] = useState<'x' | 'instagram'>('x')
  
  const fullCaption = smartLink 
    ? `${caption}\n\n🔗 ${smartLink}` 
    : caption
  
  const mockDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const formatCaption = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const hashtagRegex = /#(\w+)/g
    const mentionRegex = /@(\w+)/g

    return text
      .replace(urlRegex, '<span class="text-lime-400 underline">$1</span>')
      .replace(hashtagRegex, '<span class="text-cyan-400 font-semibold">#$1</span>')
      .replace(mentionRegex, '<span class="text-lime-400 font-semibold">@$1</span>')
  }

  if (!caption.trim()) {
    return (
      <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
        <CardContent className="p-12 text-center">
          <p className="text-zinc-600 font-bold">Write a caption to see platform previews</p>
        </CardContent>
      </Card>
    )
  }

  const XPreview = () => (
    <div className="bg-zinc-950 border-2 border-zinc-800 p-4 rounded-lg">
      <div className="flex space-x-3">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@PikoMusic" />
          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-black">PK</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <span className="font-bold text-white">PIKO</span>
              <span className="text-zinc-500 text-sm">@PikoMusic</span>
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-500 text-sm">{mockDate}</span>
            </div>
            <MoreHorizontal className="text-zinc-500 w-4 h-4" />
          </div>
          <div 
            className="text-white mt-2 whitespace-pre-wrap break-words leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatCaption(fullCaption.slice(0, 280)) }}
          />
          {fullCaption.length > 280 && (
            <p className="text-red-400 text-xs mt-2 font-bold">⚠️ Caption exceeds X character limit</p>
          )}
          {mediaUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border-2 border-zinc-800">
              <div className="bg-zinc-900 aspect-video flex items-center justify-center text-zinc-500">
                Media Preview
              </div>
            </div>
          )}
          <div className="flex justify-between text-zinc-500 mt-3 max-w-md">
            <button className="flex items-center space-x-1 hover:text-lime-400 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>24</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-lime-400 transition-colors">
              <Repeat className="w-4 h-4" />
              <span>12</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-lime-400 transition-colors">
              <Heart className="w-4 h-4" />
              <span>148</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-lime-400 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const InstagramPreview = () => (
    <div className="bg-zinc-950 border-2 border-zinc-800 rounded-lg overflow-hidden max-w-[400px] mx-auto">
      <div className="flex items-center justify-between p-3 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="pikomusic" />
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-yellow-500 text-white font-black text-xs">PK</AvatarFallback>
          </Avatar>
          <span className="font-bold text-white text-sm">pikomusic</span>
        </div>
        <MoreHorizontal className="text-white w-4 h-4" />
      </div>
      
      <div className="aspect-square bg-zinc-900 border-y-2 border-zinc-800 flex items-center justify-center text-zinc-500 relative max-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-yellow-500/10" />
        {mediaUrl ? (
          <span className="relative z-10">Media Preview</span>
        ) : (
          <div className="text-center relative z-10">
            <p className="text-sm">No Media</p>
            <p className="text-xs mt-1">1:1 or 9:16 Format</p>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4 text-white">
            <Heart className="w-6 h-6 hover:text-lime-400 cursor-pointer transition-colors" />
            <MessageCircle className="w-6 h-6 hover:text-lime-400 cursor-pointer transition-colors" />
            <Send className="w-6 h-6 hover:text-lime-400 cursor-pointer transition-colors" />
          </div>
          <Bookmark className="w-6 h-6 text-white hover:text-lime-400 cursor-pointer transition-colors" />
        </div>

        <div className="text-sm">
          <p className="font-bold text-white mb-1">2,491 likes</p>
          <p>
            <span className="font-bold text-white mr-2">pikomusic</span>
            <span 
              className="text-zinc-300 whitespace-pre-wrap break-words leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatCaption(fullCaption.slice(0, 300)) }}
            />
            {fullCaption.length > 300 && (
              <button className="text-zinc-500 ml-1 hover:text-zinc-400">...more</button>
            )}
          </p>
          <p className="text-zinc-500 mt-1 cursor-pointer hover:text-zinc-400">View all 142 comments</p>
          <p className="text-zinc-500 text-xs mt-1 uppercase">{mockDate}</p>
        </div>
      </div>
    </div>
  )

  return (
    <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl h-full">
      <CardHeader className="border-b border-zinc-800/50">
        <CardTitle className="text-xl uppercase tracking-wider font-black flex items-center gap-3">
          <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
            VISUAL CHECK
          </span>
        </CardTitle>
        <p className="text-xs text-zinc-500 mt-2">
          Real-time platform preview
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="x" className="w-full" onValueChange={(val) => setPlatform(val as 'x' | 'instagram')}>
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border-2 border-zinc-800 p-1">
            <TabsTrigger 
              value="x"
              className="data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950 font-bold uppercase transition-all"
            >
              X / TWITTER
            </TabsTrigger>
            <TabsTrigger 
              value="instagram"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white font-bold uppercase transition-all"
            >
              INSTAGRAM
            </TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <div className="mb-3">
              <Badge className="bg-zinc-900 text-zinc-400 border-zinc-700 text-xs font-mono">
                {fullCaption.length}/{platform === 'x' ? '280' : '2200'} characters
              </Badge>
            </div>
            <div className="h-[500px] overflow-y-auto pr-2">
              <TabsContent value="x" className="mt-0">
                <XPreview />
              </TabsContent>
              <TabsContent value="instagram" className="mt-0">
                <InstagramPreview />
              </TabsContent>
            </div>
          </div>
        </Tabs>
        
        {smartLink && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <span className="font-bold uppercase tracking-wider">Smart Link Active:</span>
              <code className="bg-zinc-900 px-2 py-1 rounded text-lime-400 font-mono">{smartLink}</code>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
