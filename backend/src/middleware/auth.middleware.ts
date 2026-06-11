import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: { user_id: number; email: string; roles: string[] }
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' })

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' })
    const hasRole = req.user.roles.some(r => roles.includes(r))
    if (!hasRole) return res.status(403).json({ message: 'Access denied' })
    next()
  }
}