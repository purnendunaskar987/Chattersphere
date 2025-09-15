"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogOut, MessageCircle, Search, ArrowLeft } from "lucide-react"
import { ChatInterface } from "@/components/chat-interface"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isOnline: boolean
  lastSeen: Date
}

export function ChatDashboard() {
  const { user, logout } = useAuth()
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch("/api/users")
        const users = await response.json()

        const otherUsers = users
          .filter((u: any) => u.id !== user?.id)
          .map((u: any) => ({
            ...u,
            lastSeen: new Date(u.lastSeen),
            isOnline: u.isOnline && new Date().getTime() - new Date(u.lastSeen).getTime() < 5 * 60 * 1000,
          }))

        setAllUsers(otherUsers)
        if (!isSearching) {
          setFilteredUsers(otherUsers)
        }
      } catch (error) {
        console.error("Error loading users:", error)
      }
    }

    if (user) {
      loadUsers()
      const userPolling = setInterval(loadUsers, 1000)
      return () => clearInterval(userPolling)
    }
  }, [user, isSearching])

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(allUsers)
      setIsSearching(false)
      return
    }

    const filtered = allUsers.filter(
      (targetUser) =>
        targetUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        targetUser.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredUsers(filtered)
    setIsSearching(true)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setFilteredUsers(allUsers)
    setIsSearching(false)
  }

  const handleStartChat = (targetUser: User) => {
    setSelectedUser(targetUser)
    setShowChat(true)
  }

  const handleBackToUsers = () => {
    setShowChat(false)
    setSelectedUser(null)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(lastSeen).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "online"
    if (minutes < 60) return `last seen ${minutes}m ago`
    if (hours < 24) return `last seen ${hours}h ago`
    return `last seen ${days}d ago`
  }

  if (showChat && selectedUser) {
    return <ChatInterface user={user!} targetUser={selectedUser} onBack={handleBackToUsers} />
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6" />
            <h1 className="text-xl font-semibold">ChatterSphere</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm opacity-90">Welcome, {user?.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="bg-card border-b border-border p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search or start new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-muted/30 border-0 focus:bg-card focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button onClick={handleSearch} size="sm" className="px-4">
              Search
            </Button>
            {isSearching && (
              <Button onClick={handleClearSearch} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                All
              </Button>
            )}
          </div>
          {isSearching && (
            <p className="text-sm text-muted-foreground mt-2">
              {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{isSearching ? "No users found" : "No contacts yet"}</h3>
              <p className="text-muted-foreground">
                {isSearching
                  ? `No users match "${searchQuery}". Try a different search term.`
                  : "Invite friends to register on ChatterSphere to start chatting!"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredUsers.map((targetUser) => (
                <div
                  key={targetUser.id}
                  className="flex items-center gap-3 p-4 hover:bg-muted/30 cursor-pointer transition-colors active:bg-muted/50"
                  onClick={() => handleStartChat(targetUser)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(targetUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    {targetUser.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-card rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-card-foreground truncate">{targetUser.name}</h3>
                      <span className="text-xs text-muted-foreground ml-2">
                        {targetUser.isOnline ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-2 py-0.5">
                            online
                          </Badge>
                        ) : (
                          formatLastSeen(targetUser.lastSeen)
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{targetUser.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
