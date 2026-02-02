import { getSupabase } from '@/lib/supabase/client'
import bcrypt from 'bcryptjs'
import type { User } from '@/lib/types'

// Default admin credentials
const DEFAULT_ADMIN = {
  username: 'Admin',
  password: 'Jessica26',
  display_name: 'Amministratore',
  role: 'admin' as const,
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate session token
export function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// Initialize default admin user if not exists
export async function initializeDefaultUser(): Promise<void> {
  const supabase = getSupabase()
  
  // Check if admin exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', DEFAULT_ADMIN.username)
    .single()
  
  if (!existingUser) {
    const passwordHash = await hashPassword(DEFAULT_ADMIN.password)
    
    await supabase.from('users').insert({
      username: DEFAULT_ADMIN.username,
      password_hash: passwordHash,
      display_name: DEFAULT_ADMIN.display_name,
      role: DEFAULT_ADMIN.role,
    })
  }
}

// Login function
export async function login(username: string, password: string): Promise<{ user: User; token: string } | null> {
  const supabase = getSupabase()
  
  // Get user by username
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()
  
  if (error || !user) {
    return null
  }
  
  // Verify password
  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) {
    return null
  }
  
  // Generate session token
  const token = generateSessionToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days
  
  // Create session
  await supabase.from('sessions').insert({
    user_id: user.id,
    token,
    expires_at: expiresAt.toISOString(),
  })
  
  // Update last login
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', user.id)
  
  return { user, token }
}

// Validate session
export async function validateSession(token: string): Promise<User | null> {
  const supabase = getSupabase()
  
  // Get session
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*, users(*)')
    .eq('token', token)
    .gte('expires_at', new Date().toISOString())
    .single()
  
  if (error || !session) {
    return null
  }
  
  return session.users as User
}

// Logout function
export async function logout(token: string): Promise<void> {
  const supabase = getSupabase()
  
  await supabase
    .from('sessions')
    .delete()
    .eq('token', token)
}

// Clean expired sessions
export async function cleanExpiredSessions(): Promise<void> {
  const supabase = getSupabase()
  
  await supabase
    .from('sessions')
    .delete()
    .lt('expires_at', new Date().toISOString())
}