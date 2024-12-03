import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../database";
import { ApiError, encryptPassword, isPasswordMatch } from "../utils";
import config from "../config/config";
import { IUser } from "../database";

const jwtSecret = config.JWT_SECRET as string;
const COOKIE_EXPIRATION_DAYS = 90;
const expirationDate = new Date(
  Date.now() + COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
);
const cookieOptions = {
  expires: expirationDate,
  secure: false,
  httpOnly: true,
};

const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const UserExists = await User.findOne({ email });
    if (UserExists) {
      throw new ApiError(400, "User Already Exists !");
    }
    const user = await User.create({
      name,
      email,
      password: await encryptPassword(password),
    });
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
    };
    res.json({
      status: 200,
      message: "User created successfully",
      data: userData,
    });
  } catch (err: any) {
    res.json({
      status: 500,
      message: err.message,
    });
  }
};

const createSendToken = async (user: IUser, res: Response) => {
  const { name, email, password } = user;
  const token = jwt.sign({ name, email, password }, jwtSecret, {
    expiresIn: "1d",
  });
  if (config.env === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  return token;
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !isPasswordMatch(password, user.password as string)) {
      throw new ApiError(400, "Incorrect email or password");
    }
    const token = await createSendToken(user!, res);
    res.json({
      status: 500,
      message: "User logged in successfully!",
      token,
    });
  } catch (err: any) {
    res.json({
      status: 500,
      message: err.message,
    });
  }
};

export default {
  register,
  login,
};
