import { Request, Response } from 'express'
import { registerUser, loginUser, forgotPassword, resetPassword } from '../services/auth.service'

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields are required' })

    const result = await registerUser(username, email, password)
    res.status(201).json(result)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' })

    const result = await loginUser(email, password)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(401).json({ message: error.message })
  }
}

export const forgotPasswordHandler = async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const result = await forgotPassword(email)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export const resetPasswordHandler = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body
    if (!token || !password)
      return res.status(400).json({ message: 'Token and password are required' })

    const result = await resetPassword(token, password)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}