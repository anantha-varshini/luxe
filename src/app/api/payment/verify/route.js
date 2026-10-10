import { NextResponse } from "next/server";
import crypto from "crypto";

import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification data is incomplete",
        },
        { status: 400 }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    order.paymentStatus = "PAID";
    order.paymentMethod = "ONLINE";
    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.error("RAZORPAY VERIFY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Payment verification failed",
      },
      { status: 500 }
    );
  }
}