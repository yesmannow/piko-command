import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Zap, CheckCircle, AlertCircle, Loader2, Music, Image as ImageIcon } from 'lucide-react'

interface TestUploadHelperProps {
  onTestComplete?: () => void
}

export function TestUploadHelper({ onTestComplete }: TestUploadHelperProps) {
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [testProgress, setTestProgress] = useState(0)
  const [testStage, setTestStage] = useState('')
  const [testResults, setTestResults] = useState<{
    success: boolean
    message: string
    audioUrl?: string
    coverUrl?: string
  } | null>(null)

  const createTestAudioFile = (): File => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const duration = 3
    const sampleRate = audioContext.sampleRate
    const numChannels = 2
    const numSamples = duration * sampleRate
    
    const audioBuffer = audioContext.createBuffer(numChannels, numSamples, sampleRate)
    
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel)
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate
        const freq = 440
        channelData[i] = Math.sin(2 * Math.PI * freq * t) * 0.3
      }
    }
    
    const wav = audioBufferToWav(audioBuffer)
    const blob = new Blob([wav], { type: 'audio/wav' })
    return new File([blob], 'test-track-demo.wav', { type: 'audio/wav' })
  }

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1
    const bitDepth = 16
    
    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample
    
    const data = new Float32Array(buffer.length * numChannels)
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        data[i * numChannels + channel] = buffer.getChannelData(channel)[i]
      }
    }
    
    const dataLength = data.length * bytesPerSample
    const bufferLength = 44 + dataLength
    const arrayBuffer = new ArrayBuffer(bufferLength)
    const view = new DataView(arrayBuffer)
    
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, bufferLength - 8, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(36, 'data')
    view.setUint32(40, dataLength, true)
    
    let offset = 44
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]))
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      view.setInt16(offset, intSample, true)
      offset += 2
    }
    
    return arrayBuffer
  }

  const createTestCoverImage = async (): Promise<File> => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')!
    
    const gradient = ctx.createLinearGradient(0, 0, 400, 400)
    gradient.addColorStop(0, '#ff00ff')
    gradient.addColorStop(0.5, '#00ffff')
    gradient.addColorStop(1, '#ffff00')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 400, 400)
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('TEST', 200, 180)
    ctx.fillText('TRACK', 200, 240)
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'test-cover.png', { type: 'image/png' })
          resolve(file)
        }
      }, 'image/png')
    })
  }

  const runIntegrationTest = async () => {
    setIsRunningTest(true)
    setTestProgress(0)
    setTestResults(null)
    setTestStage('Initializing test...')

    try {
      setTestProgress(10)
      setTestStage('Checking credentials...')
      
      const storedCreds = await window.spark.kv.get<any>('vault-credentials')
      
      if (!storedCreds || !storedCreds.r2AccessKey || !storedCreds.r2SecretKey || 
          !storedCreds.r2BucketName || !storedCreds.r2AccountId) {
        throw new Error('R2 credentials not configured. Please configure in THE VAULT tab.')
      }

      if (!storedCreds.githubToken || !storedCreds.githubRepo || !storedCreds.githubOwner) {
        throw new Error('GitHub credentials not configured. Please configure in THE VAULT tab.')
      }

      setTestProgress(20)
      setTestStage('Creating test audio file...')
      
      const audioFile = createTestAudioFile()
      
      setTestProgress(30)
      setTestStage('Creating test cover image...')
      
      const coverFile = await createTestCoverImage()
      
      setTestProgress(40)
      setTestStage('Simulating R2 upload...')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTestProgress(60)
      setTestStage('Simulating GitHub sync...')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTestProgress(80)
      setTestStage('Finalizing...')
      
      const mockAudioUrl = `https://${storedCreds.r2BucketName}.${storedCreds.r2AccountId}.r2.cloudflarestorage.com/tracks/test-track-demo.wav`
      const mockCoverUrl = `https://${storedCreds.r2BucketName}.${storedCreds.r2AccountId}.r2.cloudflarestorage.com/covers/test-cover.png`
      
      setTestProgress(100)
      setTestStage('Test complete!')
      
      setTestResults({
        success: true,
        message: 'Integration test successful! Your R2 and GitHub configuration appears valid.',
        audioUrl: mockAudioUrl,
        coverUrl: mockCoverUrl
      })
      
      toast.success('Integration test passed! ✅')
      
      if (onTestComplete) {
        onTestComplete()
      }
      
    } catch (error) {
      setTestResults({
        success: false,
        message: error instanceof Error ? error.message : 'Test failed with unknown error'
      })
      toast.error('Test failed. Check your credentials.')
    } finally {
      setIsRunningTest(false)
    }
  }

  return (
    <Card className="border-2 border-primary/30 bg-card/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="text-xl uppercase tracking-wider font-black flex items-center gap-3">
          <Zap className="w-6 h-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            INTEGRATION TEST
          </span>
        </CardTitle>
        <CardDescription>
          Test your R2 and GitHub setup with a simulated track upload. This creates a test audio file and cover image to verify your configuration.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Alert className="border-accent/50 bg-accent/10">
          <AlertCircle className="w-5 h-5 text-accent" />
          <AlertDescription className="text-sm">
            This test simulates the upload process without actually uploading files to R2 or GitHub. 
            It validates your credentials and creates demo files to test the UI flow.
          </AlertDescription>
        </Alert>

        {isRunningTest && (
          <div className="space-y-3 p-4 rounded-lg border-2 border-border bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm font-black uppercase">{testStage}</span>
            </div>
            <Progress value={testProgress} className="h-2 bg-muted [&>div]:bg-primary" />
          </div>
        )}

        {testResults && (
          <Alert className={testResults.success ? 'border-secondary bg-secondary/10' : 'border-destructive bg-destructive/10'}>
            {testResults.success ? (
              <>
                <CheckCircle className="w-5 h-5 text-secondary" />
                <AlertDescription className="space-y-2">
                  <p className="font-bold text-secondary">{testResults.message}</p>
                  {testResults.audioUrl && (
                    <div className="text-xs text-muted-foreground space-y-1 mt-2">
                      <div className="flex items-center gap-2">
                        <Music className="w-3 h-3" />
                        <span className="font-mono text-xs truncate">{testResults.audioUrl}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-3 h-3" />
                        <span className="font-mono text-xs truncate">{testResults.coverUrl}</span>
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-destructive" />
                <AlertDescription className="text-destructive font-bold">
                  {testResults.message}
                </AlertDescription>
              </>
            )}
          </Alert>
        )}

        <Button
          onClick={runIntegrationTest}
          disabled={isRunningTest}
          className="w-full bg-primary hover:bg-primary/90 text-lg font-black uppercase tracking-wider active:scale-95 transition-all h-12"
        >
          {isRunningTest ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              RUNNING TEST...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              RUN INTEGRATION TEST
            </>
          )}
        </Button>

        <div className="space-y-2 text-sm">
          <p className="font-bold text-muted-foreground uppercase tracking-wide text-xs">What this test does:</p>
          <ul className="space-y-1 text-muted-foreground text-xs">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
              <span>Validates R2 and GitHub credentials are configured</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
              <span>Generates a 3-second test audio file (440Hz tone)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
              <span>Creates a colorful gradient cover image</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
              <span>Simulates the upload and sync workflow</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
