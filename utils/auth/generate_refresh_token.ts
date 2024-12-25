import jwt from "jsonwebtoken";
import { User } from "../../dtos/user";

export const generateRefreshToken = (
  user: User,
  refreshTokenSecret: string,
  expiryTime: string
) => {
  const refreshToken = jwt.sign(user, refreshTokenSecret, {
    expiresIn: expiryTime,
  });

  return refreshToken;
};
