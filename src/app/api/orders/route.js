import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

function generateOrderNumber() {
  return `LUXE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

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

/*
|--------------------------------------------------------------------------
| GET /api/orders
|--------------------------------------------------------------------------
| Returns orders belonging to the logged-in customer.
*/
export async function GET() {
  try {
    await connectDB();

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to view your orders",
        },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user",
        },
        { status: 400 }
      );
    }

    const orders = await Order.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load orders",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/orders
|--------------------------------------------------------------------------
*/
export async function POST(request) {
  try {
    await connectDB();

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login before placing an order",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      items,
      shippingAddress,
      paymentMethod = "COD",
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty",
        },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Shipping address is required",
        },
        { status: 400 }
      );
    }

    if (!shippingAddress.fullName) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name is required",
        },
        { status: 400 }
      );
    }

    if (!shippingAddress.phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is required",
        },
        { status: 400 }
      );
    }

    if (!shippingAddress.address) {
      return NextResponse.json(
        {
          success: false,
          message: "Address is required",
        },
        { status: 400 }
      );
    }

    if (!shippingAddress.city) {
      return NextResponse.json(
        {
          success: false,
          message: "City is required",
        },
        { status: 400 }
      );
    }

    if (!shippingAddress.state) {
      return NextResponse.json(
        {
          success: false,
          message: "State is required",
        },
        { status: 400 }
      );
    }

    if (!shippingAddress.postalCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Postal code is required",
        },
        { status: 400 }
      );
    }

    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method",
        },
        { status: 400 }
      );
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const productId = item.productId || item.id || item._id;

      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid product in cart",
          },
          { status: 400 }
        );
      }

      const product = await Product.findById(productId);

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Product not found: ${productId}`,
          },
          { status: 404 }
        );
      }

      const quantity = Number(item.quantity) || 1;

      if (quantity < 1) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid product quantity",
          },
          { status: 400 }
        );
      }

      let selectedVariant = null;

      if (Array.isArray(product.variants) && product.variants.length > 0) {
        selectedVariant = product.variants.find(
          (variant) =>
            variant.size === (item.size || item.selectedSize) &&
            variant.color === (item.color || item.selectedColor)
        );

        if (!selectedVariant) {
          return NextResponse.json(
            {
              success: false,
              message: `Selected size/color is not available for ${product.name}`,
            },
            { status: 400 }
          );
        }

        if (selectedVariant.stock < quantity) {
          return NextResponse.json(
            {
              success: false,
              message: `Not enough stock for ${product.name}`,
            },
            { status: 400 }
          );
        }
      }

      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid price for ${product.name}`,
          },
          { status: 400 }
        );
      }

      const itemTotal = price * quantity;

      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image:
          product.images?.[0] ||
          product.image ||
          "",
        size: item.size || item.selectedSize || "",
        color: item.color || item.selectedColor || "",
        quantity,
        price,
      });
    }

    const shipping = 0;
    const total = subtotal + shipping;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),

      user: userId,

      items: orderItems,

      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address:
          shippingAddress.address ||
          shippingAddress.addressLine ||
          "",
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || "India",
      },

      subtotal,
      shipping,
      total,

      paymentMethod,

      paymentStatus:
        paymentMethod === "COD" ? "PENDING" : "PENDING",

      orderStatus: "PLACED",
    });

    return NextResponse.json({
  success: true,
  message: "Order placed successfully",
  order: {
    _id: order._id.toString(),
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
  },
});
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create order",
      },
      { status: 500 }
    );
  }
}