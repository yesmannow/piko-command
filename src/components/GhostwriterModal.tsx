import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/comp
import { Textarea }
import { Tabs, TabsContent, Tab
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Sparkles, Copy, Zap, Music, Hash } from 'lucide-react'


  hype: string
  viral: string


 

}: GhostwriterModalProps) 
  const [lyric
  const [genera
  const [sugges
 

    community: ['#SupportIndieMusic', '#UndergroundHipHop', '#Real

  const generateToneShift = async 
      t
    }
    setIsGeneratin
    try {








      setGeneratedCaption
        promo: result.promo || '',
      })
      toast.success('3 caption styles generated!')
      toast.error('AI generation failed. Try again!')
    } finally {
   

    if (!lyricInput.trim()) {
      return


     



   - Hit 
   - Work standalone without full song context



      setExtractedHook(hook.trim())

      console.error(error)

  }

      toast.error('Enter a caption first!')

    setIsGenerating(true)




TASK:

{
}`
      co

    } catch (error) {
      console.error(e
      setIsGenerating(false)
  }
  const handleS
      onCaptionSelect(genera
    }


      toast.success('Hook applied to Laun
  }
  const handleApplyHashtags = () => {
      const 
     



  }
  return (

       
            <

     
          </DialogDescription>

          <TabsList className="grid w-
              value="tone-shift"
            >
              Tone Shift

              className="font-bold uppercase text-xs data-[state=active]:bg

            </TabsTrigger>

            >
              Hashtag Vault
          </TabsList>
          <TabsConten
              <CardContent className="p-4">
                  Transfor
               
                  <p classNa
     
   

                    <>
                      REMIXING...
                  ) : (
            
     

            </Card>

         
                    hype: { label: 'STREET HYPE', color: 'lime', emoji: '🔥' },

                  const co

                      <CardContent cla
                          <Badge classNam

     
                            onClick={() => copyToClipboard(generatedCaptions[variant])}

               
 
                        </div>
  

                        </Button>
                    </Card>
                })}
            )}

            <Card className="border-2 border-zinc-800 bg-z
                <div>
               
                  <Textarea
     
   

                  AI will extract the <strong>hardest 4 lines</str
                <Button
                  disabled={isGenerating || !lyri
                >
     
   

                      <Music cl
                    </>
                </Button>
            </Card>
     
   

                    </Badge>
                      variant="ghost"
                      onClick={() => copyToClipboard(extractedHo
                    >
                    </Button>
                  <div className="p-4 rou
     
   

                  </Button>
              </Card>
          </TabsContent>
   

          
                <div className="p-3 rounded border b
                  <p className="text-sm text-zinc-300">{currentCaption || 'No caption entered yet'}</p>
                <Butto
                  disabled={isGenerating || !currentCaption.trim()}
                >
                    <>
                      ANALYZ
                  )
                      <H
                    </>
                </Button>
            </Card>
            {suggestedH

                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-black
                    </Badge>
                      va
                      onClick={(
                    >
             
                  <div className="p-3 rounded 
                      {s
                          
                        
                        </Badge>
                    </div>
             
                    className="w-full bg-lime-40
                    INJE
                </CardCont
            )}
            <Card className="border-
                <p className="text-xs font-bold text-zinc-400 uppercase mb-3">HASHTAG VAULT LIBRARY</p>
             
                      <p className="text-xs fon
                        {ta
                          
                     

                        ))}
                    </div>
                </div>
            </Card>
        </Tabs>
    </Dialog>
}






































































































































































































































