import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/butto
import { Collapsible, CollapsibleContent, Col
import { Github, Eye, EyeOff, Save, CheckCircle

  githubToken: string
import { toast } from 'sonner'
import { Github, Eye, EyeOff, Save, CheckCircle, AlertCircle, ChevronDown, Info, Loader2 } from 'lucide-react'
import { checkGitHubConnection } from '@/lib/githubAssetUploader'

interface VaultCredentials {
  githubToken: string
}

  const [isChecking, setIsCheckin

    if (!credential
    

    toast.success('GitHub credentials saved securel

    setCredentials(prev => {
      return { ...base, githubToken: value }


    if (!credentials?.githubToken?.trim()) {
      return

    s

        githubToken: credentials.githubToken,
        githubOwner: 'yesmannow'


      } else {
        toast.error('Connect
    } catch {
      toast.error('Connection check failed')
      
  }
  c

  return (
      <TabsList className="grid w-full grid-
          value="github" 
        >
     

          className="da
          <Link2 className="w-4


      <Alert className={isConfigured() ? 'border-second
          {isConfigured() ? (
              <CheckCircle className="w-5 h-5
                GitHub configure
        

              <AlertDesc
              </AlertDescription>
          )}
      </Alert>
      <Collapsible open={showSetupGu
          <CardHeader className="pb-3">
       
             
                </div>
              </div>
          </Car
            <CardContent c
     
   

                  <li>Click "G
                  <li>Select scopes: <strong>re
   

          
                  <strong className="text-foregroun
                <p className="text-xs text-muted-foreground">
                </p>

                <Info className="w-4 h-4 text-primary" />
         
              </Alert>
          </CollapsibleC
      </Collapsible>
      <Card className
          <CardTitle clas
            GITHUB NATIVE STORAGE
         
          </CardDescription>
        <CardContent classNam
            <Label cla
              <bu

                {showToken ? (
                ) : (
                )}
            </Label>
              
              onChange={(e) => updateToken(e.target.value)}
              className="bg-muted/50 font-mono"
            <p className="text-xs text-muted-foreground">
            </p>

            <Al
              
                    <CheckCircle className="w-4 h-4 text-emer
                      Connection successful! Repository access ver
                  </>
                  <>
               
            
              
            </

            onClick={handleCheckConnection}
            variant="outline"
          >
              <>
                CHECKING...
            ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              </>
          </Button>
      </Card>
      <Button
        className="w-full bg-prim
      >
        SAVE VAULT
      </TabsContent>
      <TabsContent value="social">
      </TabsContent>
  )
































































































































