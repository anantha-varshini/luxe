import { NextResponse } from "next/server";

import Order from "@/models/Order";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();

    await requireAdmin();

    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("ADMIN GET ORDERS ERROR:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        {
          success: false,
          message: "Please login",
        },
        { status: 401 }
      );
    }

    if (error.message === "Forbidden") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load admin orders",
      },
      { status: 500 }
    );
  }
}