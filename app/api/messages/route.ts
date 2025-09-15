import { type NextRequest, NextResponse } from "next/server"
import { saveMessage, getMessages } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const senderId = searchParams.get("senderId")
    const receiverId = searchParams.get("receiverId")

    if (!senderId || !receiverId) {
      return NextResponse.json({ error: "Missing senderId or receiverId" }, { status: 400 })
    }

    const messages = await getMessages(senderId, receiverId)

    // Format messages for frontend
    const formattedMessages = messages.map((msg) => ({
      id: msg.id.toString(),
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      message: msg.content,
      timestamp: msg.created_at,
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { senderId, receiverId, message } = await request.json()

    if (!senderId || !receiverId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const savedMessage = await saveMessage(senderId, receiverId, message)

    // Format message for frontend
    const formattedMessage = {
      id: savedMessage.id.toString(),
      senderId: savedMessage.sender_id,
      receiverId: savedMessage.receiver_id,
      message: savedMessage.content,
      timestamp: savedMessage.created_at,
    }

    return NextResponse.json({ success: true, message: formattedMessage })
  } catch (error) {
    console.error("Error saving message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
