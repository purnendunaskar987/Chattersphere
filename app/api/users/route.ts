import { type NextRequest, NextResponse } from "next/server"
import { createUser, getAllUsers, checkEmailExists } from "@/lib/database"

export async function GET() {
  try {
    const users = await getAllUsers()
    // Return users with online status and without sensitive data
    const publicUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isOnline: true, // For now, assume all users are online
      lastSeen: user.updated_at,
      createdAt: user.created_at,
    }))
    return NextResponse.json(publicUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    const emailExists = await checkEmailExists(email)

    if (emailExists) {
      return NextResponse.json(
        {
          error: "An account with this email already exists. Please use a different email or try logging in.",
        },
        { status: 400 },
      )
    }

    // Create new user
    const user = await createUser(name, email, password)

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
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
