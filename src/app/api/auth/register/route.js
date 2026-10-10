import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: "Name, email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          message: "Password must contain at least 6 characters",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "An account with this email already exists",
        },
        {
          status: 409,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user._id.toString());

    const response = NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      {
        status: 201,
      }
    );

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
    console.error("REGISTER_ERROR:", error);

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