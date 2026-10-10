import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export function generateToken(userId) {
  return jwt.sign(
    {
      userId,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);

  if (!decoded?.userId) {
    return null;
  }

  await connectDB();

  const user = await User.findById(decoded.userId).select("-password");

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }

  return user;
}