import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface Payload {
  sub: string;
}

export function ensureAuthentication(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authToken = request.headers.authorization;

  if (!authToken) {
    return response.status(401).json({
      message: "Operação não autorizada",
    });
  }

  // Bearer 25917592j17518056152
  // 750175085208316
  const [, token] = authToken.split(" ");
  try {
    const { sub } = verify(token, process.env.SECRET_JWT) as Payload;

    request.user_id = sub;

    return next(); //next --> passe adiante
  } catch (err) {
    return response.status(401).json({ message: err.message });
  }
}
