import connectDB from "../../lib/mongoDB";
import User from "../../models/User";
import {
  verifyRefreshToken,
  authenticateToken,
  generateAccessToken,
  generateRefreshToken,
} from "../../lib/auth";
import hashPassword from "../../lib/bycrypt";
import { strict } from "assert";

function refreshAccessToken(req) {
  const refreshToken = req.cookies.refreshToken;
  const decodedRefresh = refreshToken && verifyRefreshToken(refreshToken);

  if (!decodedRefresh) {
    const err = new Error("Invalid token provided");
    err.statusCode = 403;
    throw err;
  }

  const id = decodedRefresh.userId;

  const accessToken = generateAccessToken(id);

  return { id, accessToken };
}

export default async function handler(req, res) {
  await connectDB();

  switch (req.method) {
    case "GET":
      try {
        //validate token
        let userId = await authenticateToken(req);
        let newAccessToken;

        //try to refresh accessToken
        if (!userId) {
          const { id, accessToken } = refreshAccessToken(req);
          userId = id;
          newAccessToken = accessToken;
        }

        const user = await User.findById(userId).select("-password");

        if (!user) {
          const err = new Error("User not found");
          err.statusCode = 404;
          throw err;
        }

        res.status(200).json({ success: true, data: user, newAccessToken });
      } catch (err) {
        res
          .status(err.statusCode || 500)
          .json({ success: false, error: err.message });
      }
      break;

    case "DELETE":
      try {
        const { password } = req.body;

        let userId = await authenticateToken(req);

        //try to refresh accessToken
        if (!userId) {
          const { id, accessToken } = refreshAccessToken(req);
          userId = id;
        }

        const user = await User.findById(userId).select("+password");

        if (!user) {
          const err = new Error("User not found");
          err.statusCode = 404;
          throw err;
        }

        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
          const err = new Error("Invalid password is provided");
          err.statusCode = 401;
          throw err;
        }

        await User.findByIdAndDelete(userId);

        res
          .status(200)
          .json({ success: true, message: "User deleted successfully" });
      } catch (err) {
        res
          .status(err.statusCode || 500)
          .json({ success: false, error: err.message });
      }
      break;

    case "POST":
      try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
          const err = new Error("This email already exists");
          err.statusCode = 400;
          throw err;
        }

        const hashedPassword = await hashPassword(password);

        await User.create({ email, password: hashedPassword });

        const user = await User.findOne({ email })
          .select("__v")
          .select("-password");

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, //7days
        });

        res.status(200).json({
          success: true,
          message: "User created successfully",
          data: user,
          accessToken,
        });
      } catch (err) {
        res
          .status(err.statusCode || 500)
          .json({ success: false, error: err.message });
      }
      break;

    case "PATCH":
      try {
        const userId = await authenticateToken(req);
        let newAccessToken;

        //try to refresh accessToken
        if (!userId) {
          const { id, accessToken } = refreshAccessToken(req);
          userId = id;
          newAccessToken = accessToken;
        }

        let updatedUser;
        //when user updates password
        if (req.body.curPassword) {
          const { curPassword, newPassword } = req.body;
          const user = await User.findById(userId).select("+password");
          const isValidPassword = await user.comparePassword(curPassword);

          if (!isValidPassword) {
            const err = new Error("Invalid password is provided");
            err.statusCode = 401;
            throw err;
          }

          const hashedPassword = await hashPassword(newPassword);

          updatedUser = await User.findByIdAndUpdate(
            userId,
            {
              password: hashedPassword,
            },
            { new: true, runValidators: true }
          ).select("-password");
        }

        if (req.body.email) {
          const existingUser = await User.findOne(req.body);

          if (existingUser) {
            const err = new Error("This email already exists");
            err.statusCode = 400;
            throw err;
          }
        }

        if (!req.body.curPassword)
          updatedUser = await User.findByIdAndUpdate(userId, req.body, {
            new: true,
            runValidators: true,
          }).select("-password");

        res.status(200).json({
          success: true,
          message: "User updated successfully",
          data: updatedUser,
          newAccessToken,
        });
      } catch (err) {
        res
          .status(err.statusCode || 500)
          .json({ success: false, error: err.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE", "PATCH"]);
      res
        .status(405)
        .json({ success: false, error: `Method ${req.method} not allowed` });
  }
}
