import {
  Request,
  Response,
  NextFunction
}
from "express";

import {
  verifyToken
}
from "../utils/jwt";

export const authenticate =
(
  req: any,
  res: Response,
  next: NextFunction
) => {

  const token = req.cookies?.token;

  if (!token) {

    return res.status(401)
      .json({
        message:
          "No token provided"
      });

  }

  try {

    req.user =
      verifyToken(token);

    next();

  } catch {

    return res.status(401)
      .json({
        message:
          "Invalid token"
      });

  }
};