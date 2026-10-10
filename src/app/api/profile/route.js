import { NextResponse } from "next/server";

import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load profile",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const updates = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Name is required",
          },
          { status: 400 }
        );
      }

      if (name.length > 100) {
        return NextResponse.json(
          {
            success: false,
            message: "Name is too long",
          },
          { status: 400 }
        );
      }

      updates.name = name;
    }

    if (typeof body.avatar === "string") {
      updates.avatar = body.avatar.trim();
    }

    if (Array.isArray(body.addresses)) {
      const cleanedAddresses = body.addresses.map((address) => ({
        fullName: String(address.fullName || "").trim(),
        phone: String(address.phone || "").trim(),
        addressLine: String(
          address.addressLine || address.address || ""
        ).trim(),
        city: String(address.city || "").trim(),
        state: String(address.state || "").trim(),
        postalCode: String(address.postalCode || "").trim(),
        country: String(address.country || "India").trim(),
      }));

      for (const address of cleanedAddresses) {
        if (
          !address.fullName ||
          !address.phone ||
          !address.addressLine ||
          !address.city ||
          !address.state ||
          !address.postalCode
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "All address fields are required",
            },
            { status: 400 }
          );
        }
      }

      updates.addresses = cleanedAddresses;
    }

    const user = await User.findByIdAndUpdate(
      currentUser._id,
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Failed to update profile",
      },
      { status: 500 }
    );
  }
}