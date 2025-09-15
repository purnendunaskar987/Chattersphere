"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, MessageCircle } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isOnline: boolean
  lastSeen: Date
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  read: boolean
}

interface ChatInterfaceProps {
  user: User
  targetUser: User
  onBack: () => void
}

export function ChatInterface({ user, targetUser, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const chatId = [user.id, targetUser.id].sort().join("-")

  useEffect(() => {
    // Load existing messages for this chat
    const loadMessages = () => {
      const allChats = JSON.parse(localStorage.getItem("chattersphere_chats") || "{}")
      const chatMessages = allChats[chatId] || []
      setMessages(chatMessages)
    }

    loadMessages()

    pollingRef.current = setInterval(() => {
      loadMessages()
    }, 1000) // Poll every second for new messages

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "chattersphere_chats") {
        loadMessages()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [chatId])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (newMessage.trim()) {
      setIsTyping(true)
      const typingTimeout = setTimeout(() => {
        setIsTyping(false)
      }, 2000)

      return () => clearTimeout(typingTimeout)
    } else {
      setIsTyping(false)
    }
  }, [newMessage])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)

    const message: Message = {
      id: `${Date.now()}-${user.id}`,
      senderId: user.id,
      receiverId: targetUser.id,
      content: newMessage.trim(),
      timestamp: new Date(),
      read: false,
    }

    // Update messages state immediately for better UX
    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)

    // Save to localStorage (simulating server communication)
    const allChats = JSON.parse(localStorage.getItem("chattersphere_chats") || "{}")
    allChats[chatId] = updatedMessages
    localStorage.setItem("chattersphere_chats", JSON.stringify(allChats))

    // Broadcast message to other tabs/windows
    window.dispatchEvent(new StorageEvent("storage", { key: "chattersphere_chats" }))

    if (targetUser.isOnline && Math.random() > 0.2) {
      setTimeout(
        () => {
          const contextualReplies = [
            "Thanks for your message! 😊",
            "That's really interesting!",
            "I completely agree with you.",
            "Tell me more about that.",
            "How has your day been?",
            "That sounds amazing!",
            "I'm doing well, thanks for asking!",
            "What do you think we should do next?",
            "That's a great point!",
            "I was just thinking about that too.",
            "You're right.",
            "That made me smile 😄",
          ]

          const autoReply: Message = {
            id: `${Date.now() + 1}-${targetUser.id}`,
            senderId: targetUser.id,
            receiverId: user.id,
            content: contextualReplies[Math.floor(Math.random() * contextualReplies.length)],
            timestamp: new Date(),
            read: false,
          }

          const currentChats = JSON.parse(localStorage.getItem("chattersphere_chats") || "{}")
          const currentMessages = currentChats[chatId] || []
          const newMessages = [...currentMessages, autoReply]
          currentChats[chatId] = newMessages
          localStorage.setItem("chattersphere_chats", JSON.stringify(currentChats))

          // Trigger update across all instances
          window.dispatchEvent(new StorageEvent("storage", { key: "chattersphere_chats" }))
        },
        800 + Math.random() * 2000, // Random delay between 0.8-2.8 seconds
      )
    }

    setNewMessage("")
    setIsLoading(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatMessageTime = (timestamp: Date) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Chat Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-muted">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                {getInitials(targetUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-bold text-lg">{targetUser.name}</h2>
              <div className="flex items-center gap-2">
                <Badge variant={targetUser.isOnline ? "default" : "secondary"} className="text-xs">
                  {targetUser.isOnline ? "🟢 Online" : "⚫ Offline"}
                </Badge>
                <span className="text-xs text-muted-foreground">{targetUser.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 container mx-auto px-4 py-6 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="font-medium">Chat with {targetUser.name}</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderId === user.id
                  return (
                    <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      <div className="flex items-end gap-2 max-w-[80%]">
                        {!isOwnMessage && (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(targetUser.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 shadow-sm ${
                            isOwnMessage
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted text-foreground border border-border rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground/70"
                            }`}
                          >
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground border border-border rounded-lg px-4 py-2 max-w-[70%]">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-xs ml-2">You are typing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-3 p-4 bg-muted/30 rounded-lg">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Type a message to ${targetUser.name}...`}
                disabled={isLoading}
                className="flex-1 border-0 bg-background shadow-sm"
              />
              <Button type="submit" disabled={!newMessage.trim() || isLoading} size="sm" className="px-6">
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
