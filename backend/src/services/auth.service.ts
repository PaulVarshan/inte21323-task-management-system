import { PrismaClient } from '../generated/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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