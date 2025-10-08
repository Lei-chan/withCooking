import connectDB from "@/app/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import User from "@/app/lib/modelSchemas/User";
import {
  passwordUpdateSchema,
  userOtherUpdateSchema,
  userSchema,
} from "@/app/lib/validation";
import {
  authenticateToken,
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  hashPassword,
} from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const create = searchParams.get("create");

    const body = await req.json();
    const { email, password } = body;

    let user;
    if (create === "true") {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        const err: any = new Error("This email already exists");
        err.statusCode = 400;
        throw err;
      }

      const result = userSchema.safeParse({ email, password });

      if (!result.success) {
        const errTarget = result.error.issues[0];
        return NextResponse.json(
          {
            success: false,
            error: `<Error field: ${String(errTarget.path[0])}> ${
              errTarget.message
            }`,
          },
          { status: 400 }
        );
      }

      const hashedPassword = await hashPassword(password);

      await User.create({ email, password: hashedPassword });

      user = await User.findOne({ email }).select("-password");
    }

    if (create === "false") {
      user = await User.findOne({ email }).select("+password");
      if (!user) {
        const err: any = new Error("User not found");
        err.statusCode = 404;
        throw err;
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        const err: any = new Error("Invalid password is provided");
        err.statusCode = 401;
        throw err;
      }
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const cookieStore = await cookies();

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7days
    });

    return NextResponse.json(
      {
        success: true,
        message: `User ${
          create === "true" ? "created" : "logged in"
        } successfully`,
        data: {
          _id: user._id,
          email: user.email,
          recipes: user.recipes,
          createdAt: user.createdAt,
        },
        accessToken,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    let { id, newAccessToken } = await authenticateToken(req);

    //try to refresh accessToken when access token is expired
    if (!id) {
      const tokenInfo = await refreshAccessToken();
      id = tokenInfo.id;
      newAccessToken = tokenInfo.newAccessToken;
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      const err: any = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    return NextResponse.json(
      { success: true, data: user, newAccessToken },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    let { id, newAccessToken } = await authenticateToken(req);

    //try to refresh accessToken when access token is expired
    if (!id) {
      const tokenInfo = await refreshAccessToken();
      id = tokenInfo.id;
      newAccessToken = tokenInfo.newAccessToken;
    }

    let updatedUser;

    const body = await req.json();
    const { curPassword, newPassword, email } = body;

    //when user updates password
    if (curPassword) {
      const result = passwordUpdateSchema.safeParse({ newPassword });

      if (!result.success) {
        const errTarget = result.error.issues[0];
        const err: any = new Error(
          `<Error field: New password> ${errTarget.message}`
        );
        err.statusCode = 400;

        throw err;
      }

      const user = await User.findById(id).select("+password");
      if (!user) {
        const err: any = new Error("User not found");
        err.statusCode = 404;
        throw err;
      }

      const isValidPassword = await user.comparePassword(curPassword);
      if (!isValidPassword) {
        const err: any = new Error("Invalid password is provided");
        err.statusCode = 401;
        throw err;
      }

      const hashedPassword = await hashPassword(newPassword);

      updatedUser = await User.findByIdAndUpdate(
        id,
        {
          password: hashedPassword,
        },
        { new: true, runValidators: true }
      ).select("-password");
    }

    //when user updates fields that is not password
    if (!curPassword && email) {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        const err: any = new Error("This email already exists");
        err.statusCode = 400;
        throw err;
      }

      const result = userOtherUpdateSchema.safeParse(body);

      if (!result.success) {
        const errTarget = result.error.issues[0];
        const err: any = new Error(
          `<Error field: ${String(errTarget.path[0])}> ${errTarget.message}`
        );
        err.statusCode = 400;

        throw err;
      }

      updatedUser = await User.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      }).select("-password");
    }

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        data: updatedUser,
        newAccessToken,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    let { id, newAccessToken } = await authenticateToken(req);

    //try to refresh accessToken when access token is expired
    if (!id) {
      const tokenInfo = await refreshAccessToken();
      id = tokenInfo.id;
      newAccessToken = tokenInfo.newAccessToken;
    }

    const user = await User.findById(id).select("+password");

    if (!user) {
      const err: any = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    const deletedUser = await User.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
