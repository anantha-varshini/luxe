import { NextResponse } from "next/server";
import mongoose from "mongoose";

import Order from "@/models/Order";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

const allowedStatuses = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const allowedPaymentStatuses = [
  "PENDING",
  "PAID",
  "FAILED",
];

export async function GET(request, { params }) {
  try {
    await connectDB();

    await requireAdmin();

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

    const order = await Order.findById(id)
      .populate("user", "name email")
      .lean();

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
    console.error(
      "ADMIN GET ORDER ERROR:",
      error
    );

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
        message: "Failed to load order",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    await requireAdmin();

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

    const body = await request.json();

    const { orderStatus, paymentStatus } = body;

    const updates = {};

    if (orderStatus !== undefined) {
      if (!allowedStatuses.includes(orderStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid order status",
          },
          { status: 400 }
        );
      }

      updates.orderStatus = orderStatus;
    }

    if (paymentStatus !== undefined) {
      if (
        !allowedPaymentStatuses.includes(
          paymentStatus
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid payment status",
          },
          { status: 400 }
        );
      }

      updates.paymentStatus = paymentStatus;
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        {
          success: false,
          message: "No changes supplied",
        },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("user", "name email")
      .lean();

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
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error(
      "ADMIN UPDATE ORDER ERROR:",
      error
    );

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
        message: "Failed to update order",
      },
      { status: 500 }
    );
  }
}