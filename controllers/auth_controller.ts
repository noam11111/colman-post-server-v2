import { UserModel } from "../models/user_model";
import { Request, Response } from "express";
import { User } from "../dtos/user";
import { createNewUser } from "../services/user_service";
import { generateAccessToken } from "../utils/auth/generate_access_token";
import { generateRefreshToken } from "../utils/auth/generate_refresh_token";

let refreshTokens: string[] = [];

export const register = async (req: Request, res: Response) => {
  const user: User = req.body;
  try {
    const userExistsCheck = await UserModel.findOne({ email: user.email });
    if (userExistsCheck) {
      throw Error("User already exists");
    }

    await createNewUser(user);

    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email, password });

    if (!user) {
      throw Error("Invalid Cardentials");
    }

    const accessToken = generateAccessToken(
      convertUserToPlain(user),
      process.env.ACCESS_TOKEN_SECRET,
      process.env.TOKEN_EXPIRATION
    );
    const refreshToken = generateRefreshToken(
      convertUserToPlain(user),
      process.env.REFRESH_TOKEN_SECRET,
      "1d"
    );

    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
    res.status(200).send(accessToken);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const logout = (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw Error("No refresh token provided");

  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

  res.clearCookie("refreshToken");
  res.status(200).send("Logged out successfully");
};

export const convertUserToPlain = (user: User): User => {
  return {
    _id: user._id.toString(),
    username: user.username,
    password: user.password,
    email: user.password,
  };
};
