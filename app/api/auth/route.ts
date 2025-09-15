import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json()

    if (action === "login") {
      const user = await authenticateUser(email, password)

      if (user) {
        // Return user data without password
        const publicUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          isOnline: true,
          lastSeen: user.updated_at,
          createdAt: user.created_at,
        }

        return NextResponse.json({ success: true, user: publicUser })
      } else {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
