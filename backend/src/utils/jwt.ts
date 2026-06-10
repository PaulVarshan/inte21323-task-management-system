import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in the environment.");
}

export const generateToken = (
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
      expiresIn: "7d"
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