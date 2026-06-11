import { PrismaClient } from '../generated/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '../utils/email'

const prisma = new PrismaClient()

export const registerUser = async (username: string, email: string, password: string) => {
  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('Email already registered')

  // Hash password
  const password_hash = await bcrypt.hash(password, 10)

  // Create user
  const user = await prisma.user.create({
    data: { username, email, password_hash }
  })

  // Assign default role: Collaborator
  const collaboratorRole = await prisma.role.findUnique({
    where: { role_name: 'Collaborator' }
  })
  if (collaboratorRole) {
    await prisma.userRole.create({
      data: { user_id: user.user_id, role_id: collaboratorRole.role_id }
    })
  }

  return { message: 'User registered successfully', user_id: user.user_id }
}

export const loginUser = async (email: string, password: string) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      user_roles: { include: { role: true } }
    }
  })
  if (!user) throw new Error('Invalid email or password')
  if (!user.is_active) throw new Error('Account is deactivated')

  // Check password
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) throw new Error('Invalid email or password')

  // Build roles array
  const roles = user.user_roles.map(ur => ur.role.role_name)

  // Generate JWT
  const token = jwt.sign(
    { user_id: user.user_id, email: user.email, roles },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
  )

  return {
    token,
    user: {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      roles
    }
  }
}

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('No account found with that email')

  // Generate token
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Save token to database
  await prisma.user.update({
    where: { email },
    data: {
      reset_token: token,
      reset_token_expires: expires
    }
  })

  // Send email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
  await sendPasswordResetEmail(email, resetUrl)

  return { message: 'Password reset email sent' }
}

export const resetPassword = async (token: string, newPassword: string) => {
  // Find user with valid token
  const user = await prisma.user.findFirst({
    where: {
      reset_token: token,
      reset_token_expires: { gt: new Date() }
    }
  })
  if (!user) throw new Error('Invalid or expired reset token')

  // Hash new password
  const password_hash = await bcrypt.hash(newPassword, 10)

  // Update password and clear token
  await prisma.user.update({
    where: { user_id: user.user_id },
    data: {
      password_hash,
      reset_token: null,
      reset_token_expires: null
    }
  })

  return { message: 'Password reset successfully' }
}