import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogHeader,
  DialogDescrip
import { toast
import {
  ChevronLeft,
  Flame,
  MessageCircle,
  Image 
  ExternalLink,
  Zap,
  Music
import t

  onReUp?: (capt


  instag
  twitter: Hash
  linke

  instagram: 
  twitt
  linkedin: 'bg-blue-

  const extractedLink = post.cap

    extractedLink?.includes('
      : extractedLink?.includes('.mp3') || extractedLink?.includes('.wav
 

    timestamp: new Date(post.timestamp).

      link: extractedLin
    },
    metrics: {
      fireEmojis
    },
      thumbnailUrl: extra
 

export function HypeCalen
  const [selectedEvent, setSelectedEvent] = useState<HypeEvent 
  const [currentDate, setCurrentDate] = useState(new Date())

    if (!postHistory) return []
  }, [postHistory])
 

      if (!map.has(dateKey)) {
      }
    })
  
  const getDaysInMonth = (date: Date) => {
    const month = date.getMonth()
    const lastD
    const startingDayOfWeek = firstDay.getDay()
    const days:
    for (let i 

    for (l
    }
    return days

    const startOfWeek = new 
    
    for (let i = 0; i < 7;
      day.setDat
    }
  }
  const naviga
      const newDate = new Date(prev)
      return newDate
  }
  cons
      const newDat
      return newDate
  }
  cons
   
 

  const handleReUp = (event: HypeEvent) => {
      const fullCaption = event.payload.link 
        : event.payload.caption
      onReUp(fullCaption, event.platforms, event.payload.link
      setSelectedEvent(null)
  }

      ? `${event.payload.caption}\n\
    
    toast.success('Caption copied to clipboard!')


    }
    const dateKey = date.toISOString().split('
    const hasEvents = events.leng
    const isHovered = hoveredDate === dateKey
    return (
        key={dateKey}
       
            ? "border-indigo-600/70
      
        )}
        onMouseEnt

        <div className="flex flex-col h-fu
            "font-black uppercase t
            hasEvents ? "text-lim
          )}>
          </div>
          {hasEvents && (
              <div className="flex flex-wrap ga

                    <div
    
                        PLATFORM_COLORS[platform]
                    >
     
    
                  <div className="p-1 rounde
                      "font-bold text-zin
     

               
   

                  <span>{events[0].metr
              )}
          )}
    
              <motion.div
                animate={{ opacit
              >
                  <p className="text-xs font
                  <d
     
               
   

                      <MessageCircle className="w-3 h-3 m
                    </Badge>
                </div>
            </div>
        </div>
    )



      <div className="space-
          {weekDays.map(day => (
              {day}
          ))}
      
   

        </div>
    )

    const days = getWeekDays(currentDate)

      
   

              </div>
                {
              {renderDayCell(days[idx], false
          ))}
      </div>
  }
  const renderDayView = () => {
    const events = eventsByDate.get(dateKey) || []
    return (
     
   

          </div>

          <div className="text-center py-12 border-2 border-da
            <p className="tex
    
          <div className="space-y-3">
              <motion.div
   

                <Card className="border-2 border-indigo-600/50 bg-i
                
                    <div className="space-y-3"
     

                          <Zap className="w-3 h-3 mr
                        </Badge>
                      
                        {event.platforms.map((platform, idx) => {
                          return (

            
                 

                      
                          {event.metrics.fireEmojis}
                    
                          {event.metrics.shares}
                        <Badge className="bg-cyan-500/10 text-cyan-40
                          {event.metrics.comments}
                      </div>
          
              </motion.div>
          </div>
      </div>
  }
  const
    else if (viewMode === 'week') navigateWeek
  }
  const getHeaderText = () => {
      return currentDate.toLocaleDateString('e
      const weekStart = getWeekDays(currentDate)[0]
      return `${weekStart.toLocaleDate
      return 
  }
  const totalDro
  const to
  return (
      <Card className="border-2 border-zinc-800 bg-zinc-950/9
          <div className="flex items-start justify-b
              <CardTitle className="text-2xl uppercase tracking-wider font-black flex ite
                <span className="bg-gradient-to-r from-
                </span>
              <p classNa
              </p>
            
              <Badge className="bg-lime-500/1
                {totalFireEmojis}
              <Badge cla
                {tota
            </div>
        </CardHeader>
        <CardConten
            <Tabs v
                <TabsTrigger 
                  className="font-bold uppercase text-xs data-[state=active]:bg-lime-
                  Day
                <TabsTrigger 
                  className="font-bold uppercase text-xs
                  Week
                <TabsTrigger 
                  className
                  Month
              </Ta

              
                size="sm"
                className="border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10
                <ChevronLeft className="w-4 h-4
              
                <p cla
                

            

              >
              </Button>
              <Button
                size="sm"
                className="border-2 border-zin
                Today
            </d

            <AnimatePresence mode="wait">
                key={viewMode}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                {viewMode === 'month' && renderMonthView
                {viewMode === 'day' && renderDayView
            </AnimatePresenc

            <div className="p-3 rounded border-2 border-i
                <span className="text-xs font-bl
                  {totalDrop
              </div>
            <div className="p-3 rounded border-2 border-lime-600
                <span className="text-xs font-blac
                  Active
              </div>
            <div class
                <span class
                  
            
          </di
      </Card>
     
   

            <DialogDescription cl
            </DialogDescription>


            
                </p>
                  <a
                    target="_bla
                    className="flex items-center gap-2 text-xs text-lime-400 hover:text-lime-300 mt-3 font-mono"
                   
                  
             
              
                <div className="flex flex-wrap g
                    const Icon = PL
                      <Badg
                        {platform}
                  
             

            
     
   

                    <Share2 clas
                    <p className="text-xs
                  <div className="p-3 rounded border-2 border-cyan-600

            
              </div>
              <div className="space-y-2">
                <div className="flex gap-2"
                    <CalendarIcon className="w-3 
                  </Badge>
                    {sele
                    
                  </Badge>
              </div>
              <div c
                  onClick={() => handleReUp(sel
                >
             
              
            
     
   

        </DialogContent>
    </>
}






















































































































































































































































































































































