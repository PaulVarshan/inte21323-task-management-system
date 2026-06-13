import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET or REFRESH_TOKEN_SECRET is not defined in the environment.");
}

export const generateAccessToken = (
  userId: string,
  role: string
) => {
  return jwt.sign(
    {
      userId,
      role
    },
    JWT_SECRET,
    {
      expiresIn: "15m" // Short-lived access token
    }
  );
};

export const generateRefreshToken = (
  userId: string
) => {
  return jwt.sign(
    {
      userId
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d" // Long-lived refresh token
    }
  );
};

export const verifyToken = (
  token: string
) => {
  return jwt.verify(
    token,
    JWT_SECRET
  );
};

export const verifyRefreshToken = (
  token: string
) => {
  return jwt.verify(
    token,
    REFRESH_TOKEN_SECRET
  );
};