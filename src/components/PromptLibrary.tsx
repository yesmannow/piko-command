import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit2, 
  Copy,
  BookOpen,
  Zap
} from 'lucide-react'

interface PromptTemplate {
  id: string
  name: string
  description: string
  prompt: string
  category: 'hype' | 'promo' | 'viral' | 'storytelling' | 'custom'
  createdAt: number
}

interface PromptLibraryProps {
  onUsePrompt: (prompt: string) => void
}

const defaultPrompts: PromptTemplate[] = [
  {
    id: 'street-hype',
    name: 'Street Hype',
    description: 'High-energy, emoji-heavy captions for maximum engagement',
    prompt: 'Generate a street-level, high-energy caption with heavy emoji usage (🔥, 💿, 🚀). Focus on excitement and raw energy. Include #PikoMusic #NewHipHop #YouTubeMusic. Keep under 200 characters.',
    category: 'hype',
    createdAt: Date.now()
  },
  {
    id: 'official-promo',
    name: 'Official Promo',
    description: 'Professional, CTA-focused promotional content',
    prompt: 'Create a clean, professional promotional caption with a strong call-to-action. Include relevant hashtags and maintain a polished brand voice. Keep under 200 characters.',
    category: 'promo',
    createdAt: Date.now()
  },
  {
    id: 'viral-hook',
    name: 'Viral Hook',
    description: 'Short, punchy captions designed for maximum virality',
    prompt: 'Write a short, punchy caption optimized for TikTok/X virality. Maximum engagement focus. Under 150 characters.',
    category: 'viral',
    createdAt: Date.now()
  },
  {
    id: 'storyteller',
    name: 'The Storyteller',
    description: 'Narrative-driven captions that connect emotionally',
    prompt: 'Craft a narrative-driven caption that tells a story and creates emotional connection. Use vivid imagery and personal voice. 200-300 characters.',
    category: 'storytelling',
    createdAt: Date.now()
  }
]

export function PromptLibrary({ onUsePrompt }: PromptLibraryProps) {
  const [customPrompts, setCustomPrompts] = useKV<PromptTemplate[]>('prompt-library', [])
  const [isCreating, setIsCreating] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null)
  
  const [newPrompt, setNewPrompt] = useState({
    name: '',
    description: '',
    prompt: '',
    category: 'custom' as PromptTemplate['category']
  })

  const allPrompts = [...defaultPrompts, ...(customPrompts || [])]

  const handleCreatePrompt = () => {
    if (!newPrompt.name.trim() || !newPrompt.prompt.trim()) {
      toast.error('Name and prompt are required')
      return
    }

    const template: PromptTemplate = {
      id: `custom-${Date.now()}`,
      name: newPrompt.name,
      description: newPrompt.description,
      prompt: newPrompt.prompt,
      category: newPrompt.category,
      createdAt: Date.now()
    }

    setCustomPrompts((current) => [...(current || []), template])
    setNewPrompt({ name: '', description: '', prompt: '', category: 'custom' })
    setIsCreating(false)
    toast.success('Prompt template saved!')
  }

  const handleDeletePrompt = (id: string) => {
    setCustomPrompts((current) => (current || []).filter(p => p.id !== id))
    toast.success('Prompt deleted')
  }

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt)
      toast.success('Prompt copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const categoryColors = {
    hype: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
    promo: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    viral: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    storytelling: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    custom: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
  }

  return (
    <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
      <CardHeader className="border-b border-zinc-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl uppercase tracking-wider font-black flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <span className="bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">
              PROMPT LIBRARY
            </span>
          </CardTitle>
          
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button 
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase text-xs"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-2 border-zinc-800 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-wider text-lime-400">
                  Create Prompt Template
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-black text-zinc-400">
                    Template Name
                  </Label>
                  <Input
                    value={newPrompt.name}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Underground Energy"
                    className="bg-zinc-900 border-zinc-700 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-black text-zinc-400">
                    Description
                  </Label>
                  <Input
                    value={newPrompt.description}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this prompt style"
                    className="bg-zinc-900 border-zinc-700 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-black text-zinc-400">
                    Category
                  </Label>
                  <select
                    value={newPrompt.category}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, category: e.target.value as PromptTemplate['category'] }))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="hype">Street Hype</option>
                    <option value="promo">Official Promo</option>
                    <option value="viral">Viral</option>
                    <option value="storytelling">Storytelling</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-black text-zinc-400">
                    Prompt Instructions
                  </Label>
                  <Textarea
                    value={newPrompt.prompt}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, prompt: e.target.value }))}
                    placeholder="Enter detailed prompt instructions for the AI..."
                    className="min-h-[150px] bg-zinc-900 border-zinc-700 focus:border-emerald-500 font-mono text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCreatePrompt}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase"
                  >
                    Save Template
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCreating(false)
                      setNewPrompt({ name: '', description: '', prompt: '', category: 'custom' })
                    }}
                    variant="outline"
                    className="border-2 border-zinc-700 hover:bg-zinc-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Save and reuse AI prompt templates for consistent caption generation
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        {allPrompts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-zinc-800" />
            <p className="text-zinc-500 font-bold">No prompt templates yet</p>
            <p className="text-sm text-zinc-600 mt-1">Create your first template to get started</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {allPrompts.map((template) => (
              <Card
                key={template.id}
                className="border-2 border-zinc-800 bg-zinc-900/50 hover:border-emerald-500/50 transition-all group"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-base mb-1 truncate">{template.name}</h3>
                      <p className="text-xs text-zinc-500 line-clamp-2">{template.description}</p>
                    </div>
                    <Badge className={`${categoryColors[template.category]} text-xs font-bold uppercase flex-shrink-0`}>
                      {template.category}
                    </Badge>
                  </div>

                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-400 font-mono line-clamp-3">
                    {template.prompt}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={() => onUsePrompt(template.prompt)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase text-xs h-8"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Use
                    </Button>
                    
                    <Button
                      onClick={() => handleCopyPrompt(template.prompt)}
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 hover:bg-zinc-800 h-8"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>

                    {!template.id.startsWith('street-') && !template.id.startsWith('official-') && !template.id.startsWith('viral-') && !template.id.startsWith('storyteller') && (
                      <Button
                        onClick={() => handleDeletePrompt(template.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-900/50 hover:bg-red-950 text-red-400 h-8"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
