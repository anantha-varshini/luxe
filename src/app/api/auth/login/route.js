import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB  from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    const token = generateToken(user._id.toString());

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}