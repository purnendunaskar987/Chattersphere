import { neon } from "@neondatabase/serverless"
import crypto from "crypto"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: number
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}

export async function createUser(name: string, email: string, password: string) {
  try {
    const userId = crypto.randomUUID()
    const result = await sql`
      INSERT INTO neon_auth.users_sync (id, name, email, raw_json, created_at, updated_at)
      VALUES (${userId}, ${name}, ${email}, ${JSON.stringify({ password })}, NOW(), NOW())
      RETURNING id, name, email, created_at, updated_at
    `
    return result[0] as User
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    const result = await sql`
      SELECT id, name, email, raw_json, created_at, updated_at
      FROM neon_auth.users_sync
      WHERE email = ${email}
      AND deleted_at IS NULL
    `

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    const userData = user.raw_json as { password: string }

    if (userData.password === password) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      } as User
    }

    return null
  } catch (error) {
    console.error("Error authenticating user:", error)
    throw error
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT id FROM neon_auth.users_sync 
      WHERE email = ${email} 
      AND deleted_at IS NULL
    `
    return result.length > 0
  } catch (error) {
    console.error("Error checking email existence:", error)
    throw error
  }
}

export async function getAllUsers() {
  try {
    const result = await sql`
      SELECT id, name, email, created_at, updated_at
      FROM neon_auth.users_sync
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `
    return result as User[]
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

export async function saveMessage(senderId: string, receiverId: string, content: string) {
  try {
    const result = await sql`
      INSERT INTO messages (sender_id, receiver_id, content, created_at, updated_at)
      VALUES (${senderId}, ${receiverId}, ${content}, NOW(), NOW())
      RETURNING id, sender_id, receiver_id, content, created_at
    `
    return result[0] as Message
  } catch (error) {
    console.error("Error saving message:", error)
    throw error
  }
}

export async function getMessages(userId1: string, userId2: string) {
  try {
    const result = await sql`
      SELECT id, sender_id, receiver_id, content, created_at
      FROM messages
      WHERE (sender_id = ${userId1} AND receiver_id = ${userId2})
         OR (sender_id = ${userId2} AND receiver_id = ${userId1})
      ORDER BY created_at ASC
    `
    return result as Message[]
  } catch (error) {
    console.error("Error fetching messages:", error)
    throw error
  }
}
