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

  const authHeader =
    req.headers.authorization;

  if (!authHeader) {

    return res.status(401)
      .json({
        message:
          "No token provided"
      });

  }

  const token =
    authHeader.split(" ")[1];

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