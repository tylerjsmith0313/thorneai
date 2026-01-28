"use client"

import { useState, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { 
  Brain, Upload, Link, FileText, File, Trash2, 
  Send, Loader2, CheckCircle, AlertCircle, X,
  BookOpen, GraduationCap, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useSWR, { mutate } from "swr"
import { DefaultChatTransport } from "@/utils/chat-transport" // Import DefaultChatTransport

interface KnowledgeDocument {
  id: string
  title: string
  documentType: string
  sourceUrl?: string
  status: string
  createdAt: string
}

interface AcademyContent {
  id: string
  title: string
  category: string
  content: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function NeuralLink() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [uploadType, setUploadType] = useState<"file" | "url" | "text">("text")
  const [docTitle, setDocTitle] = useState("")
  const [docContent, setDocContent] = useState("")
  const [docUrl, setDocUrl] = useState("")
  const [docCategory, setDocCategory] = useState("general")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")

  // Fetch user's documents
  const { data: documents, isLoading: docsLoading } = useSWR<KnowledgeDocument[]>(
    isOpen ? "/api/ai/documents" : null,
    fetcher
  )

  // Fetch academy content
  const { data: academyContent } = useSWR<AcademyContent[]>(
    isOpen && activeTab === "academy" ? "/api/ai/academy" : null,
    fetcher
  )

  // Chat for training the AI
  const { messages, append, status, setMessages } = useChat({
    id: "neural-link-training",
    api: "/api/ai/training-chat",
  })

  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || status === "streaming") return
    append({ role: "user", content: inputValue })
    setInputValue("")
  }, [inputValue, append, status])

  const handleUploadDocument = async () => {
    if (!docTitle.trim()) return
    
    setIsUploading(true)
    setUploadStatus("idle")

    try {
      const response = await fetch("/api/ai/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: docTitle,
          content: docContent,
          sourceUrl: docUrl || null,
          documentType: uploadType === "url" ? "webpage" : uploadType === "file" ? "document" : "text",
          category: docCategory,
        }),
      })

      if (response.ok) {
        setUploadStatus("success")
        setDocTitle("")
        setDocContent("")
        setDocUrl("")
        mutate("/api/ai/documents")
        setTimeout(() => setUploadStatus("idle"), 3000)
      } else {
        setUploadStatus("error")
      }
    } catch {
      setUploadStatus("error")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    try {
      await fetch(`/api/ai/documents/${id}`, { method: "DELETE" })
      mutate("/api/ai/documents")
    } catch (error) {
      console.error("Failed to delete document:", error)
    }
  }

  const getMessageText = (msg: typeof messages[0]) => {
    if (!msg.parts || !Array.isArray(msg.parts)) return ""
    return msg.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Brain size={16} className="text-indigo-500" />
          Neural Link
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
          <DialogTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-xl">
              <Brain size={20} />
            </div>
            <div>
              <span className="text-lg font-bold">Neural Link</span>
              <p className="text-xs text-white/80 font-normal mt-0.5">Train AgyntSynq with your knowledge</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full justify-start rounded-none border-b bg-slate-50 p-1 h-auto">
            <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-white">
              <Sparkles size={14} />
              Training Chat
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2 data-[state=active]:bg-white">
              <FileText size={14} />
              Documents
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2 data-[state=active]:bg-white">
              <Upload size={14} />
              Upload
            </TabsTrigger>
            <TabsTrigger value="academy" className="gap-2 data-[state=active]:bg-white">
              <GraduationCap size={14} />
              Flourish Academy
            </TabsTrigger>
          </TabsList>

          {/* Training Chat Tab */}
          <TabsContent value="chat" className="m-0 flex flex-col h-[500px]">
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="p-4 bg-indigo-100 rounded-2xl mb-4">
                    <Brain size={32} className="text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Train Your AI Assistant</h3>
                  <p className="text-sm text-slate-500 max-w-md">
                    Use this chat to teach AgyntSynq about your business, products, 
                    sales processes, and anything else that will help it assist you better.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {[
                      "Teach me about your product",
                      "What's your sales process?",
                      "Common objections you face",
                      "Your ideal customer profile",
                    ].map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        size="sm"
                        className="text-xs bg-transparent"
                        onClick={() => {
                          setInputValue(prompt)
                        }}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{getMessageText(msg)}</p>
                      </div>
                    </div>
                  ))}
                  {status === "streaming" && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-2xl px-4 py-3">
                        <Loader2 size={16} className="animate-spin text-indigo-600" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Teach AgyntSynq something new..."
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim() || status === "streaming"}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="m-0 h-[500px]">
            <ScrollArea className="h-full p-4">
              {docsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="animate-spin text-indigo-600" />
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          {doc.documentType === "webpage" ? (
                            <Link size={16} className="text-indigo-600" />
                          ) : (
                            <File size={16} className="text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{doc.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {doc.documentType}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-500"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="p-4 bg-slate-100 rounded-2xl mb-4">
                    <FileText size={32} className="text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">No Documents Yet</h3>
                  <p className="text-sm text-slate-500 max-w-md">
                    Upload documents, paste text, or add URLs to train AgyntSynq on your specific knowledge.
                  </p>
                  <Button 
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setActiveTab("upload")}
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Your First Document
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="m-0 h-[500px]">
            <ScrollArea className="h-full p-6">
              <div className="max-w-xl mx-auto space-y-6">
                <div className="flex gap-2">
                  {[
                    { type: "text" as const, icon: FileText, label: "Text" },
                    { type: "url" as const, icon: Link, label: "URL" },
                    { type: "file" as const, icon: Upload, label: "File" },
                  ].map(({ type, icon: Icon, label }) => (
                    <Button
                      key={type}
                      variant={uploadType === type ? "default" : "outline"}
                      className={`flex-1 gap-2 ${uploadType === type ? "bg-indigo-600" : "bg-transparent"}`}
                      onClick={() => setUploadType(type)}
                    >
                      <Icon size={16} />
                      {label}
                    </Button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Title</label>
                    <Input
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="Give this knowledge a name..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Category</label>
                    <Select value={docCategory} onValueChange={setDocCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="customer_service">Customer Service</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="processes">Processes</SelectItem>
                        <SelectItem value="objections">Objection Handling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {uploadType === "url" && (
                    <div>
                      <label className="text-sm font-medium text-slate-700">URL</label>
                      <Input
                        value={docUrl}
                        onChange={(e) => setDocUrl(e.target.value)}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>
                  )}

                  {uploadType === "text" && (
                    <div>
                      <label className="text-sm font-medium text-slate-700">Content</label>
                      <Textarea
                        value={docContent}
                        onChange={(e) => setDocContent(e.target.value)}
                        placeholder="Paste your knowledge here... This could be product info, sales scripts, FAQs, or anything else you want AgyntSynq to know."
                        className="mt-1 min-h-[200px]"
                      />
                    </div>
                  )}

                  {uploadType === "file" && (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                      <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                      <p className="text-sm text-slate-500">
                        Drag and drop a file here, or click to browse
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Supported: PDF, TXT, DOCX, MD
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.txt,.docx,.md"
                      />
                    </div>
                  )}

                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleUploadDocument}
                    disabled={isUploading || !docTitle.trim()}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : uploadStatus === "success" ? (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Added to Knowledge Base!
                      </>
                    ) : uploadStatus === "error" ? (
                      <>
                        <AlertCircle size={16} className="mr-2" />
                        Failed - Try Again
                      </>
                    ) : (
                      <>
                        <Brain size={16} className="mr-2" />
                        Add to Knowledge Base
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Flourish Academy Tab */}
          <TabsContent value="academy" className="m-0 h-[500px]">
            <ScrollArea className="h-full p-4">
              <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <GraduationCap size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900">Flourish Academy</h3>
                    <p className="text-sm text-emerald-700">
                      AgyntSynq is pre-trained with all Flourish Academy content including sales techniques, 
                      closing strategies, and marketing best practices.
                    </p>
                  </div>
                </div>
              </div>

              {academyContent && academyContent.length > 0 ? (
                <div className="grid gap-3">
                  {academyContent.map((content) => (
                    <div
                      key={content.id}
                      className="p-4 bg-white rounded-xl border hover:border-emerald-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <BookOpen size={16} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{content.title}</p>
                            <Badge variant="secondary" className="mt-1 text-xs capitalize">
                              {content.category.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                        {content.content.substring(0, 150)}...
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { title: "Sales Fundamentals", category: "sales" },
                    { title: "Closing Techniques", category: "closing" },
                    { title: "Lead Generation Strategies", category: "lead_generation" },
                    { title: "Objection Handling Scripts", category: "objection_handling" },
                    { title: "Email Templates", category: "email_templates" },
                    { title: "Customer Service Excellence", category: "customer_service" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="p-4 bg-white rounded-xl border flex items-center gap-3"
                    >
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <BookOpen size={16} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <Badge variant="secondary" className="mt-1 text-xs capitalize">
                          {item.category.replace("_", " ")}
                        </Badge>
                      </div>
                      <CheckCircle size={16} className="ml-auto text-emerald-500" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
