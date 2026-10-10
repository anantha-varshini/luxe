import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import "@/models/Category";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    const product = await Product.findOne({
      _id: id,
      active: true,
    })
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Product details API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load product",
      },
      { status: 500 }
    );
  }
}