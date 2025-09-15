"use client"

export class MessageService {
  private static instance: MessageService
  private listeners: Set<(chatId: string, messages: any[]) => void> = new Set()

  static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService()
    }
    return MessageService.instance
  }

  // Subscribe to message updates for a specific chat
  subscribe(callback: (chatId: string, messages: any[]) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // Send a message (simulating server communication)
  async sendMessage(chatId: string, message: any) {
    try {
      // Get current messages
      const allChats = JSON.parse(localStorage.getItem("chattersphere_chats") || "{}")
      const currentMessages = allChats[chatId] || []

      // Add new message
      const updatedMessages = [...currentMessages, message]
      allChats[chatId] = updatedMessages

      // Save to localStorage (simulating server storage)
      localStorage.setItem("chattersphere_chats", JSON.stringify(allChats))

      // Notify all listeners
      this.notifyListeners(chatId, updatedMessages)

      return { success: true, message: "Message sent successfully" }
    } catch (error) {
      return { success: false, error: "Failed to send message" }
    }
  }

  // Get messages for a chat
  getMessages(chatId: string) {
    const allChats = JSON.parse(localStorage.getItem("chattersphere_chats") || "{}")
    return allChats[chatId] || []
  }

  // Get all chats for a user
  getUserChats(userId: string) {
    const allChats = JSON.parse(localStorage.getItem("chattersphere_chats") || "{}")
    const userChats: { [key: string]: any[] } = {}

    Object.keys(allChats).forEach((chatId) => {
      if (chatId.includes(userId)) {
        userChats[chatId] = allChats[chatId]
      }
    })

    return userChats
  }

  // Mark messages as read
  markAsRead(chatId: string, userId: string) {
    const allChats = JSON.parse(localStorage.getItem("chattersphere_chats") || "{}")
    const messages = allChats[chatId] || []

    const updatedMessages = messages.map((msg: any) => ({
      ...msg,
      read: msg.receiverId === userId ? true : msg.read,
    }))

    allChats[chatId] = updatedMessages
    localStorage.setItem("chattersphere_chats", JSON.stringify(allChats))

    this.notifyListeners(chatId, updatedMessages)
  }

  private notifyListeners(chatId: string, messages: any[]) {
    this.listeners.forEach((callback) => callback(chatId, messages))
  }
}

// Export singleton instance
export const messageService = MessageService.getInstance()
