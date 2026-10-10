import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          user: null,
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      user,
    });
  } catch (error) {
    console.error("ME_ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}