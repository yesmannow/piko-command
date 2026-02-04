import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  MessageCircle,
  Image as ImageIcon,
  ExternalLink,
  Zap,
  Copy,
  Calendar as CalendarIcon,
  Share2,
  Hash,
  Video
} from 'lucide-react'

interface PostHistory {
  id: string
  caption: string
  platforms: string[]
  timestamp: number
  linkInBio: boolean
}

interface HypeCalendarProps {
  onReUp?: (caption: string, platforms: string[], link?: string) => void
}

interface HypeEvent {
  id: string
  platforms: string[]
  timestamp: Date
  payload: {
    caption: string
    link?: string
  }
  metrics: {
    fireEmojis: number
    shares: number
    comments: number
  }
  type: 'youtube' | 'audio' | 'text'
  thumbnailUrl?: string
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: ImageIcon,
  tiktok: Video,
  twitter: Hash,
  facebook: ExternalLink,
  linkedin: ExternalLink
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-gradient-to-br from-purple-500 to-pink-500 text-white',
  tiktok: 'bg-black text-white',
  twitter: 'bg-blue-500 text-white',
  facebook: 'bg-blue-600 text-white',
  linkedin: 'bg-blue-700 text-white'
}

export function HypeCalendar({ onReUp }: HypeCalendarProps) {
  const [postHistory] = useKV<PostHistory[]>('piko_post_history', [])
  const [selectedEvent, setSelectedEvent] = useState<HypeEvent | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month')
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const events = useMemo(() => {
    if (!postHistory) return []
    
    return postHistory.map((post): HypeEvent => {
      const extractedLink = post.caption.match(/https?:\/\/[^\s]+/)?.[0]
      
      const type = 
        extractedLink?.includes('youtube.com') || extractedLink?.includes('youtu.be')
          ? 'youtube'
          : extractedLink?.includes('.mp3') || extractedLink?.includes('.wav')
          ? 'audio'
          : 'text'

      return {
        id: post.id,
        platforms: post.platforms,
        timestamp: new Date(post.timestamp),
        payload: {
          caption: post.caption,
          link: extractedLink
        },
        metrics: {
          fireEmojis: Math.floor(Math.random() * 100),
          shares: Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 30)
        },
        type,
        thumbnailUrl: extractedLink
      }
    })
  }, [postHistory])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, HypeEvent[]>()
    events.forEach((event) => {
      const dateKey = event.timestamp.toISOString().split('T')[0]
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(event)
    })
    return map
  }, [events])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDay.getDay()
    const days: (Date | null)[] = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    const days: Date[] = []
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7))
      return newDate
    })
  }

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const handleReUp = (event: HypeEvent) => {
    if (onReUp) {
      const fullCaption = event.payload.link 
        ? event.payload.caption 
        : event.payload.caption
      onReUp(fullCaption, event.platforms, event.payload.link)
      setSelectedEvent(null)
      toast.success('Caption loaded into Launchpad!')
    }
  }

  const handleCopyCaption = (event: HypeEvent) => {
    const textToCopy = event.payload.link 
      ? `${event.payload.caption}\n\n🔗 ${event.payload.link}` 
      : event.payload.caption
    
    navigator.clipboard.writeText(textToCopy)
    toast.success('Caption copied to clipboard!')
  }

  const renderDayCell = (date: Date | null, index: number = 0) => {
    if (!date) {
      return <div key={`empty-${index}`} className="aspect-square" />
    }

    const dateKey = date.toISOString().split('T')[0]
    const dayEvents = eventsByDate.get(dateKey) || []
    const hasEvents = dayEvents.length > 0
    const isToday = date.toDateString() === new Date().toDateString()
    const isHovered = hoveredDate === dateKey

    return (
      <motion.div
        key={dateKey}
        className={`
          aspect-square border-2 p-2 transition-all cursor-pointer
          ${hasEvents 
            ? "border-lime-500/70 bg-lime-500/10 hover:bg-lime-500/20" 
            : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
          }
          ${isToday ? "ring-2 ring-lime-400" : ""}
          ${isHovered ? "scale-95" : ""}
        `}
        whileHover={{ scale: 0.95 }}
        onClick={() => hasEvents && setSelectedEvent(dayEvents[0])}
        onMouseEnter={() => setHoveredDate(dateKey)}
        onMouseLeave={() => setHoveredDate(null)}
      >
        <div className="flex flex-col h-full justify-between">
          <div className={`
            font-black uppercase text-xs
            ${hasEvents ? "text-lime-400" : "text-zinc-600"}
            ${isToday ? "text-lime-300" : ""}
          `}>
            {date.getDate()}
          </div>
          {hasEvents && (
            <div className="space-y-1">
              <div className="flex flex-wrap gap-1">
                {dayEvents[0].platforms.slice(0, 3).map((platform, idx) => {
                  const Icon = PLATFORM_ICONS[platform] || Zap
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded flex items-center justify-center ${
                        PLATFORM_COLORS[platform] || 'bg-zinc-700'
                      }`}
                    >
                      <Icon className="w-2.5 h-2.5" />
                    </div>
                  )
                })}
                {dayEvents.length > 1 && (
                  <div className="p-1 rounded bg-zinc-800 text-white">
                    <span className="font-bold text-zinc-400 text-[8px]">
                      +{dayEvents.length - 1}
                    </span>
                  </div>
                )}
              </div>
              
              {isHovered && (
                <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/50 text-[8px] px-1 py-0">
                  <Flame className="w-2 h-2 mr-0.5" />
                  <span>{dayEvents[0].metrics.fireEmojis}</span>
                </Badge>
              )}
            </div>
          )}
          
          {isHovered && hasEvents && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute z-10 mt-1"
            >
              <div className="bg-zinc-900 border border-lime-500/50 rounded p-2 shadow-lg">
                <p className="text-xs font-bold text-zinc-200 line-clamp-2">
                  {dayEvents[0].payload.caption.substring(0, 50)}...
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/50 text-[8px]">
                    <Flame className="w-2 h-2 mr-0.5" />
                    {dayEvents[0].metrics.fireEmojis}
                  </Badge>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-[8px]">
                    <Share2 className="w-2 h-2 mr-0.5" />
                    {dayEvents[0].metrics.shares}
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 text-[8px]">
                    <MessageCircle className="w-3 h-3 mr-0.5" />
                    {dayEvents[0].metrics.comments}
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    )
  }

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate)
    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center font-black text-xs text-zinc-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => renderDayCell(day))}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const days = getWeekDays(currentDate)

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => (
            <div key={idx} className="text-center">
              <div className="font-black text-xs text-zinc-500 uppercase tracking-wider mb-2">
                {day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
              </div>
              {renderDayCell(day)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const dateKey = currentDate.toISOString().split('T')[0]
    const dayEvents = eventsByDate.get(dateKey) || []

    return (
      <div className="space-y-4">
        <div className="text-center py-3 border-2 border-zinc-800 rounded bg-zinc-900/50">
          <h3 className="text-2xl font-black uppercase tracking-wider text-lime-400">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
        </div>

        {dayEvents.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded">
            <p className="text-zinc-500 font-bold">No drops on this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-2 border-lime-600/50 bg-lime-500/5 hover:border-lime-500 transition-all cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <p className="text-sm leading-relaxed text-zinc-200 line-clamp-3">
                        {event.payload.caption}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/50">
                          <Zap className="w-3 h-3 mr-1" />
                          {event.type}
                        </Badge>
                        {event.platforms.map((platform, idx) => {
                          const Icon = PLATFORM_ICONS[platform] || Zap
                          return (
                            <Badge key={idx} className={PLATFORM_COLORS[platform]}>
                              <Icon className="w-3 h-3 mr-1" />
                              {platform}
                            </Badge>
                          )
                        })}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/50">
                          <Flame className="w-3 h-3 mr-1" />
                          {event.metrics.fireEmojis}
                        </Badge>
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                          <Share2 className="w-3 h-3 mr-1" />
                          {event.metrics.shares}
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          {event.metrics.comments}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const navigate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') navigateMonth(direction)
    else if (viewMode === 'week') navigateWeek(direction)
    else navigateDay(direction)
  }

  const getHeaderText = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } else if (viewMode === 'week') {
      const weekStart = getWeekDays(currentDate)[0]
      const weekEnd = getWeekDays(currentDate)[6]
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    }
  }

  const totalDrops = events.length
  const totalFireEmojis = events.reduce((sum, e) => sum + e.metrics.fireEmojis, 0)
  const totalShares = events.reduce((sum, e) => sum + e.metrics.shares, 0)

  return (
    <>
      <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
        <CardHeader className="border-b border-zinc-800/50">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl uppercase tracking-wider font-black flex items-center gap-3">
                <Flame className="w-7 h-7 text-lime-400" />
                <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                  HYPE MAP
                </span>
              </CardTitle>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">
                Your distribution history visualized
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-lime-500/10 text-lime-400 border border-lime-500/30 font-black uppercase">
                <Flame className="w-3 h-3 mr-1" />
                {totalFireEmojis}
              </Badge>
              <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-black uppercase">
                <Share2 className="w-3 h-3 mr-1" />
                {totalShares}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'day' | 'week' | 'month')} className="w-auto">
              <TabsList className="grid grid-cols-3 bg-zinc-900/50 border-2 border-zinc-800">
                <TabsTrigger 
                  value="day" 
                  className="font-bold uppercase text-xs data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950"
                >
                  Day
                </TabsTrigger>
                <TabsTrigger 
                  value="week" 
                  className="font-bold uppercase text-xs data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950"
                >
                  Week
                </TabsTrigger>
                <TabsTrigger 
                  value="month" 
                  className="font-bold uppercase text-xs data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950"
                >
                  Month
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('prev')}
                variant="outline"
                size="sm"
                className="border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-[200px] text-center">
                <p className="font-black uppercase text-sm text-zinc-300 tracking-wider">
                  {getHeaderText()}
                </p>
              </div>
              <Button
                onClick={() => navigate('next')}
                variant="outline"
                size="sm"
                className="border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 active:scale-95 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setCurrentDate(new Date())}
                variant="outline"
                size="sm"
                className="border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 font-bold uppercase active:scale-95 transition-all"
              >
                Today
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === 'month' && renderMonthView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'day' && renderDayView()}
            </motion.div>
          </AnimatePresence>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t-2 border-zinc-800">
            <div className="p-3 rounded border-2 border-lime-600/50 bg-lime-500/5">
              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block mb-1">
                  Total Drops
                </span>
                <span className="text-2xl font-black text-lime-400 tabular-nums">
                  {totalDrops}
                </span>
              </div>
            </div>
            <div className="p-3 rounded border-2 border-lime-600/50 bg-lime-500/5">
              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block mb-1">
                  Active Platforms
                </span>
                <span className="text-2xl font-black text-lime-400 tabular-nums">
                  {new Set(events.flatMap(e => e.platforms)).size}
                </span>
              </div>
            </div>
            <div className="p-3 rounded border-2 border-cyan-600/50 bg-cyan-500/5">
              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block mb-1">
                  Total Shares
                </span>
                <span className="text-2xl font-black text-cyan-400 tabular-nums">
                  {totalShares}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="border-2 border-lime-500/50 bg-zinc-950 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-wider text-lime-400">
              DROP DETAILS
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              View metrics and re-use this content
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="p-4 rounded border-2 border-zinc-800 bg-zinc-900/50">
                <p className="text-sm leading-relaxed text-zinc-200">
                  {selectedEvent.payload.caption}
                </p>
                {selectedEvent.payload.link && (
                  <a
                    href={selectedEvent.payload.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-lime-400 hover:text-lime-300 mt-3 font-mono"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {selectedEvent.payload.link}
                  </a>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded border-2 border-lime-600/50 bg-lime-500/5 text-center">
                  <Flame className="w-6 h-6 text-lime-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-zinc-400 uppercase">Fire</p>
                  <p className="text-xl font-black text-lime-400">{selectedEvent.metrics.fireEmojis}</p>
                </div>
                <div className="p-3 rounded border-2 border-cyan-600/50 bg-cyan-500/5 text-center">
                  <Share2 className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-zinc-400 uppercase">Shares</p>
                  <p className="text-xl font-black text-cyan-400">{selectedEvent.metrics.shares}</p>
                </div>
                <div className="p-3 rounded border-2 border-purple-600/50 bg-purple-500/5 text-center">
                  <MessageCircle className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-zinc-400 uppercase">Comments</p>
                  <p className="text-xl font-black text-purple-400">{selectedEvent.metrics.comments}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.platforms.map((platform, idx) => {
                    const Icon = PLATFORM_ICONS[platform] || Zap
                    return (
                      <Badge key={idx} className={PLATFORM_COLORS[platform]}>
                        <Icon className="w-3 h-3 mr-1" />
                        {platform}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-zinc-800 text-zinc-400">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {selectedEvent.timestamp.toLocaleDateString()}
                  </Badge>
                  <Badge className="bg-zinc-800 text-zinc-400">
                    {selectedEvent.timestamp.toLocaleTimeString()}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleCopyCaption(selectedEvent)}
                  variant="outline"
                  className="flex-1 border-2 border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 font-bold uppercase active:scale-95 transition-all"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Caption
                </Button>
                <Button
                  onClick={() => handleReUp(selectedEvent)}
                  className="flex-1 bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider active:scale-95 transition-all"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Re-Up
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
