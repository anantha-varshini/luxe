import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const body = await request.json();

    const { amount, orderId } = body;

    if (!amount || !orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Amount and order ID are required",
        },
        { status: 400 }
      );
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${orderId}`,
      notes: {
        orderId: String(orderId),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      razorpayOrder,
    });
  } catch (error) {
    console.error("RAZORPAY CREATE ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create Razorpay order",
      },
      { status: 500 }
    );
  }
}