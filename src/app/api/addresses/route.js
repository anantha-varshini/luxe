import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

async function getAuthenticatedUser() {
  const cookieStore = await import("next/headers").then(
    (module) => module.cookies()
  );

  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded?.userId) {
      return null;
    }

    return decoded.userId;
  } catch (error) {
    console.error("JWT ERROR:", error);
    return null;
  }
}

/*
  GET
  Return all addresses for the logged-in user.
*/
export async function GET() {
  try {
    await connectDB();

    const userId = await getAuthenticatedUser();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const user = await User.findById(userId).select(
      "addresses"
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      addresses: user.addresses || [],
    });
  } catch (error) {
    console.error("GET ADDRESSES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch addresses",
      },
      { status: 500 }
    );
  }
}

/*
  POST
  Add a new address.
*/
export async function POST(request) {
  try {
    await connectDB();

    const userId = await getAuthenticatedUser();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      postalCode,
      country = "India",
      isDefault = false,
    } = body;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !postalCode?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all required address fields",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (!Array.isArray(user.addresses)) {
      user.addresses = [];
    }

    /*
      If this is the first address, automatically make
      it the default address.
    */
    const shouldBeDefault =
      user.addresses.length === 0 || isDefault === true;

    if (shouldBeDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push({
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country.trim() || "India",
      isDefault: shouldBeDefault,
    });

    await user.save();

    const newAddress =
      user.addresses[user.addresses.length - 1];

    return NextResponse.json(
      {
        success: true,
        message: "Address added successfully",
        address: newAddress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADD ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/*
  PUT
  Update an existing address.
*/
export async function PUT(request) {
  try {
    await connectDB();

    const userId = await getAuthenticatedUser();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      addressId,
      fullName,
      phone,
      addressLine,
      city,
      state,
      postalCode,
      country = "India",
      isDefault = false,
    } = body;

    if (!addressId) {
      return NextResponse.json(
        {
          success: false,
          message: "Address ID is required",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "Address not found",
        },
        { status: 404 }
      );
    }

    if (isDefault) {
      user.addresses.forEach((item) => {
        item.isDefault = false;
      });
    }

    address.fullName = fullName?.trim() || address.fullName;
    address.phone = phone?.trim() || address.phone;
    address.addressLine =
      addressLine?.trim() || address.addressLine;
    address.city = city?.trim() || address.city;
    address.state = state?.trim() || address.state;
    address.postalCode =
      postalCode?.trim() || address.postalCode;
    address.country =
      country?.trim() || address.country;

    address.isDefault = Boolean(isDefault);

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error("UPDATE ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/*
  DELETE
  Delete an address.
*/
export async function DELETE(request) {
  try {
    await connectDB();

    const userId = await getAuthenticatedUser();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json(
        {
          success: false,
          message: "Address ID is required",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "Address not found",
        },
        { status: 404 }
      );
    }

    const wasDefault = address.isDefault;

    user.addresses.pull(addressId);

    /*
      If the deleted address was the default one,
      automatically make the first remaining address
      the new default.
    */
    if (
      wasDefault &&
      user.addresses.length > 0
    ) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}