import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

async function getAuthenticatedUserId() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return decoded.userId || null;
  } catch {
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB();

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to view this order",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID",
        },
        { status: 400 }
      );
    }

    const order = await Order.findOne({
      _id: id,
      user: userId,
    }).lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load order",
      },
      { status: 500 }
    );
  }
}