"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { sql, type User, type Session } from "./db"

const SESSION_COOKIE_NAME = "dental_clinic_session"
const SESSION_EXPIRY_DAYS = 7

function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: number): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS)

  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return token
}

export async function getSession(): Promise<(Session & { user: User }) | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  const sessions = await sql`
    SELECT s.*, u.id as user_id, u.email, u.name, u.role, u.created_at as user_created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `

  if (sessions.length === 0) {
    return null
  }

  const session = sessions[0]
  return {
    id: session.id,
    user_id: session.user_id,
    token: session.token,
    expires_at: session.expires_at,
    created_at: session.created_at,
    user: {
      id: session.user_id,
      email: session.email,
      password_hash: "",
      name: session.name,
      role: session.role,
      created_at: session.user_created_at,
      updated_at: session.user_created_at,
    },
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user || null
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== "admin") {
    redirect("/dashboard")
  }
  return user
}

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

async function ensureLoginAttemptsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      success BOOLEAN DEFAULT false
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time
    ON login_attempts (email, attempted_at)
  `
}

async function checkRateLimit(email: string): Promise<boolean> {
  await ensureLoginAttemptsTable()
  const since = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000).toISOString()
  const result = await sql`
    SELECT COUNT(*) as count FROM login_attempts
    WHERE email = ${email.toLowerCase()}
      AND attempted_at > ${since}
      AND success = false
  `
  return Number(result[0].count) >= MAX_LOGIN_ATTEMPTS
}

async function recordLoginAttempt(email: string, success: boolean) {
  await ensureLoginAttemptsTable()
  await sql`
    INSERT INTO login_attempts (email, success) VALUES (${email.toLowerCase()}, ${success})
  `
  // Clean up old attempts older than 24 hours
  await sql`
    DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '24 hours'
  `
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim()

    const locked = await checkRateLimit(normalizedEmail)
    if (locked) {
      return {
        success: false,
        error: `Too many failed attempts. Try again after ${LOCKOUT_MINUTES} minutes.`,
      }
    }

    const users = await sql`
      SELECT * FROM users WHERE email = ${normalizedEmail}
    `

    if (users.length === 0) {
      await recordLoginAttempt(normalizedEmail, false)
      return { success: false, error: "Invalid email or password" }
    }

    const user = users[0] as User
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      await recordLoginAttempt(normalizedEmail, false)
      return { success: false, error: "Invalid email or password" }
    }

    await recordLoginAttempt(normalizedEmail, true)
    await createSession(user.id)
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An error occurred during login" }
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    await sql`DELETE FROM sessions WHERE token = ${token}`
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
  redirect("/login")
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === "admin"
}
