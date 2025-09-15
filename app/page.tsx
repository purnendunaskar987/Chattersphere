"use client"

import { useAuth } from "@/components/auth-provider"
import { AuthForm } from "@/components/auth-form"
import { ChatDashboard } from "@/components/chat-dashboard"

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ChatterSphere...</p>
        </div>
      </div>
    )
  }

  return <div className="min-h-screen bg-background">{user ? <ChatDashboard /> : <AuthForm />}</div>
}
