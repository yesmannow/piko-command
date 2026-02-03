import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Share2,
  MessageCircle,
  Hash,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Copy,
  Zap,
  TrendingUp,
  Music
} from 'lucide-react'
import type { PostHistory, HypeEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

interface HypeCalendarProps {
  onReUp?: (caption: string, platforms: string[], link?: string) => void
}

type ViewMode = 'month' | 'week' | 'day'

const PLATFORM_ICONS = {
  instagram: ImageIcon,
  tiktok: Video,
  twitter: Hash,
  facebook: ExternalLink,
  linkedin: ExternalLink,
}

const PLATFORM_COLORS = {
  instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  tiktok: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  twitter: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  facebook: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  linkedin: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
}

function convertPostHistoryToHypeEvent(post: PostHistory): HypeEvent {
  const extractedLink = post.caption.match(/(https?:\/\/[^\s]+)/)?.[0]
  const cleanCaption = post.caption.replace(/(https?:\/\/[^\s]+)/g, '').trim()
  
  const mediaType: 'video' | 'image' | 'audio' = 
    extractedLink?.includes('youtube.com') || extractedLink?.includes('youtu.be') 
      ? 'video'
      : extractedLink?.includes('.mp3') || extractedLink?.includes('.wav')
      ? 'audio'
      : 'image'

  return {
    id: post.id,
    timestamp: new Date(post.timestamp).toISOString(),
    payload: {
      caption: cleanCaption,
      mediaUrl: extractedLink,
      link: extractedLink,
      mediaType,
    },
    platforms: post.platforms as ('instagram' | 'tiktok' | 'twitter' | 'facebook' | 'linkedin')[],
    metrics: {
      shares: Math.floor(Math.random() * 100) + 10,
      fireEmojis: Math.floor(Math.random() * 200) + 20,
      comments: Math.floor(Math.random() * 50) + 5,
    },
    previewData: {
      thumbnailUrl: extractedLink,
      trackTitle: cleanCaption.split('\n')[0].slice(0, 50),
    },
  }
}

export function HypeCalendar({ onReUp }: HypeCalendarProps) {
  const [postHistory] = useKV<PostHistory[]>('piko_post_history', [])
  const [selectedEvent, setSelectedEvent] = useState<HypeEvent | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const hypeEvents = useMemo(() => {
    if (!postHistory) return []
    return postHistory.map(convertPostHistoryToHypeEvent)
  }, [postHistory])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, HypeEvent[]>()
    hypeEvents.forEach(event => {
      const dateKey = new Date(event.timestamp).toISOString().split('T')[0]
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(event)
    })
    return map
  }, [hypeEvents])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
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
        ? `${event.payload.caption}\n\n🔗 ${event.payload.link}`
        : event.payload.caption
      
      onReUp(fullCaption, event.platforms, event.payload.link)
      toast.success('Caption loaded into Launchpad - ready to re-blast!')
      setSelectedEvent(null)
    }
  }

  const copyCaption = (event: HypeEvent) => {
    const fullCaption = event.payload.link 
      ? `${event.payload.caption}\n\n🔗 ${event.payload.link}`
      : event.payload.caption
    
    navigator.clipboard.writeText(fullCaption)
    toast.success('Caption copied to clipboard!')
  }

  const renderDayCell = (date: Date | null, isCompact = false) => {
    if (!date) {
      return <div className="aspect-square" />
    }

    const dateKey = date.toISOString().split('T')[0]
    const events = eventsByDate.get(dateKey) || []
    const hasEvents = events.length > 0
    const isToday = dateKey === new Date().toISOString().split('T')[0]
    const isHovered = hoveredDate === dateKey

    return (
      <motion.div
        key={dateKey}
        className={cn(
          "aspect-square border-2 transition-all cursor-pointer relative group",
          hasEvents 
            ? "border-indigo-600/70 bg-indigo-500/10 hover:border-lime-400 hover:bg-lime-500/20" 
            : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700",
          isToday && "ring-2 ring-lime-400 ring-offset-2 ring-offset-zinc-950",
          isCompact ? "p-1" : "p-2"
        )}
        whileHover={{ scale: 1.02 }}
        onMouseEnter={() => setHoveredDate(dateKey)}
        onMouseLeave={() => setHoveredDate(null)}
        onClick={() => events.length > 0 && setSelectedEvent(events[0])}
      >
        <div className="flex flex-col h-full">
          <div className={cn(
            "font-black uppercase tracking-wider",
            isCompact ? "text-xs" : "text-sm",
            hasEvents ? "text-lime-400" : "text-zinc-500",
            isToday && "text-lime-400"
          )}>
            {date.getDate()}
          </div>
          
          {hasEvents && (
            <div className="flex-1 flex flex-col gap-1 mt-1">
              <div className="flex flex-wrap gap-1">
                {events[0].platforms.slice(0, isCompact ? 2 : 3).map((platform, idx) => {
                  const Icon = PLATFORM_ICONS[platform]
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-1 rounded border",
                        PLATFORM_COLORS[platform]
                      )}
                    >
                      <Icon className={isCompact ? "w-2 h-2" : "w-3 h-3"} />
                    </div>
                  )
                })}
                {events[0].platforms.length > (isCompact ? 2 : 3) && (
                  <div className="p-1 rounded border border-zinc-700 bg-zinc-800/50">
                    <span className={cn(
                      "font-bold text-zinc-400",
                      isCompact ? "text-[8px]" : "text-[10px]"
                    )}>
                      +{events[0].platforms.length - (isCompact ? 2 : 3)}
                    </span>
                  </div>
                )}
              </div>
              
              {!isCompact && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-lime-400 mt-auto">
                  <Flame className="w-3 h-3" />
                  <span>{events[0].metrics.fireEmojis}</span>
                </div>
              )}
            </div>
          )}

          {isHovered && hasEvents && !isCompact && (
            <div className="absolute left-full top-0 ml-2 z-50 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-64 p-3 bg-zinc-900 border-2 border-lime-500/50 rounded-lg shadow-2xl shadow-lime-500/20"
              >
                <div className="space-y-2">
                  <p className="text-xs font-bold text-lime-400 uppercase tracking-wider">Quick Preview</p>
                  <p className="text-sm text-zinc-100 line-clamp-2">{events[0].payload.caption}</p>
                  <div className="flex gap-2 text-xs">
                    <Badge className="bg-lime-500/10 text-lime-400 border-lime-500/30">
                      <Flame className="w-3 h-3 mr-1" />
                      {events[0].metrics.fireEmojis}
                    </Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      <Share2 className="w-3 h-3 mr-1" />
                      {events[0].metrics.shares}
                    </Badge>
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {events[0].metrics.comments}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-black uppercase tracking-wider text-zinc-500 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => (
            <div key={idx}>
              {renderDayCell(day)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const days = getWeekDays(currentDate)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((dayName, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-center text-sm font-black uppercase tracking-wider text-zinc-500">
                {dayName}
              </div>
              <div className="text-center text-2xl font-black text-lime-400">
                {days[idx].getDate()}
              </div>
              {renderDayCell(days[idx], false)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const dateKey = currentDate.toISOString().split('T')[0]
    const events = eventsByDate.get(dateKey) || []

    return (
      <div className="space-y-4">
        <div className="text-center py-6 border-2 border-zinc-800 bg-zinc-950/50 rounded-lg">
          <div className="text-5xl font-black text-lime-400 mb-2">
            {currentDate.getDate()}
          </div>
          <div className="text-sm font-bold uppercase tracking-wider text-zinc-500">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-lg">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            <p className="text-zinc-500 font-bold uppercase text-sm">No drops on this day</p>
            <p className="text-zinc-600 text-xs mt-1">Dead zone detected - time to schedule content</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-2 border-indigo-600/50 bg-indigo-500/10 hover:border-lime-500/50 transition-all cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-zinc-100 flex-1 line-clamp-3">
                          {event.payload.caption}
                        </p>
                        <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/50 ml-2">
                          <Zap className="w-3 h-3 mr-1" />
                          Drop
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {event.platforms.map((platform, idx) => {
                          const Icon = PLATFORM_ICONS[platform]
                          return (
                            <Badge key={idx} className={PLATFORM_COLORS[platform]}>
                              <Icon className="w-3 h-3 mr-1" />
                              {platform}
                            </Badge>
                          )
                        })}
                      </div>

                      <div className="flex gap-2">
                        <Badge className="bg-lime-500/10 text-lime-400 border-lime-500/30">
                          <Flame className="w-3 h-3 mr-1" />
                          {event.metrics.fireEmojis}
                        </Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                          <Share2 className="w-3 h-3 mr-1" />
                          {event.metrics.shares}
                        </Badge>
                        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
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
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }
  }

  const totalDrops = hypeEvents.length
  const totalFireEmojis = hypeEvents.reduce((sum, e) => sum + e.metrics.fireEmojis, 0)
  const totalShares = hypeEvents.reduce((sum, e) => sum + e.metrics.shares, 0)

  return (
    <>
      <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
        <CardHeader className="border-b border-zinc-800/50">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl uppercase tracking-wider font-black flex items-center gap-3">
                <CalendarIcon className="w-7 h-7 text-lime-400" />
                <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                  HYPE CALENDAR
                </span>
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-2 uppercase tracking-wider">
                Strategic content timeline · Spot dead zones · Re-up past drops
              </p>
            </div>
            
            <div className="flex gap-2">
              <Badge className="bg-lime-500/10 text-lime-400 border-lime-500/30 font-black px-3 py-1">
                <Flame className="w-4 h-4 mr-1" />
                {totalFireEmojis}
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-black px-3 py-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                {totalDrops}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="bg-zinc-900/50 border-2 border-zinc-800">
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

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('prev')}
                className="border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 font-bold uppercase"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center min-w-[200px]">
                <p className="text-sm font-black uppercase tracking-wider text-lime-400">
                  {getHeaderText()}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('next')}
                className="border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 font-bold uppercase"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 font-bold uppercase"
              >
                Today
              </Button>
            </div>
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'day' && renderDayView()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t-2 border-zinc-800">
            <div className="p-3 rounded border-2 border-indigo-600/30 bg-indigo-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-zinc-400">Past Drops</span>
                <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                  {totalDrops}
                </Badge>
              </div>
            </div>
            <div className="p-3 rounded border-2 border-lime-600/30 bg-lime-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-zinc-400">Today</span>
                <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/30">
                  Active
                </Badge>
              </div>
            </div>
            <div className="p-3 rounded border-2 border-zinc-700/30 bg-zinc-800/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-zinc-400">Dead Zones</span>
                <Badge className="bg-zinc-700/20 text-zinc-400 border-zinc-700/30">
                  Visible
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="bg-zinc-950 border-2 border-lime-500/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-wider bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
              Drop Details
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 uppercase tracking-wider">
              Re-up this drop or copy to clipboard
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              <div className="p-4 rounded border-2 border-zinc-800 bg-zinc-900/50">
                <p className="text-sm text-zinc-100 leading-relaxed whitespace-pre-wrap">
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

              <div className="space-y-2">
                <p className="text-xs font-black uppercase text-zinc-400">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.platforms.map((platform, idx) => {
                    const Icon = PLATFORM_ICONS[platform]
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
                <p className="text-xs font-black uppercase text-zinc-400">Hype Metrics</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded border-2 border-lime-600/30 bg-lime-500/10 text-center">
                    <Flame className="w-5 h-5 mx-auto mb-1 text-lime-400" />
                    <p className="text-2xl font-black text-lime-400">{selectedEvent.metrics.fireEmojis}</p>
                    <p className="text-xs text-zinc-500 uppercase font-bold">Fire</p>
                  </div>
                  <div className="p-3 rounded border-2 border-emerald-600/30 bg-emerald-500/10 text-center">
                    <Share2 className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                    <p className="text-2xl font-black text-emerald-400">{selectedEvent.metrics.shares}</p>
                    <p className="text-xs text-zinc-500 uppercase font-bold">Shares</p>
                  </div>
                  <div className="p-3 rounded border-2 border-cyan-600/30 bg-cyan-500/10 text-center">
                    <MessageCircle className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                    <p className="text-2xl font-black text-cyan-400">{selectedEvent.metrics.comments}</p>
                    <p className="text-xs text-zinc-500 uppercase font-bold">Comments</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black uppercase text-zinc-400">Metadata</p>
                <div className="flex gap-2">
                  <Badge className="bg-zinc-800/50 text-zinc-400 border-zinc-700">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {new Date(selectedEvent.timestamp).toLocaleDateString()}
                  </Badge>
                  <Badge className="bg-zinc-800/50 text-zinc-400 border-zinc-700">
                    {selectedEvent.payload.mediaType === 'video' && <Video className="w-3 h-3 mr-1" />}
                    {selectedEvent.payload.mediaType === 'audio' && <Music className="w-3 h-3 mr-1" />}
                    {selectedEvent.payload.mediaType === 'image' && <ImageIcon className="w-3 h-3 mr-1" />}
                    {selectedEvent.payload.mediaType}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleReUp(selectedEvent)}
                  className="flex-1 bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider border-2 border-lime-400 shadow-lg shadow-lime-400/40 active:scale-95 transition-all"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Re-Up to Launchpad
                </Button>
                <Button
                  onClick={() => copyCaption(selectedEvent)}
                  variant="outline"
                  className="border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 font-bold uppercase"
                >
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
