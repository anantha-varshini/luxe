import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import Product from "@/models/Product";

import "@/models/Category";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(
      request.url
    );

    const search =
      searchParams.get("search")?.trim() || "";

    const category =
      searchParams.get("category")?.trim() || "";

    const gender =
      searchParams.get("gender")?.trim() || "";

    const size =
      searchParams.get("size")?.trim() || "";

    const color =
      searchParams.get("color")?.trim() || "";

    const minPrice =
      searchParams.get("minPrice");

    const maxPrice =
      searchParams.get("maxPrice");

    const rating =
      searchParams.get("rating");

    const featured =
      searchParams.get("featured");

    const isNew =
      searchParams.get("isNew");

    const sort =
      searchParams.get("sort") || "newest";

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );

    const limit = Math.max(
      Number(searchParams.get("limit")) || 20,
      1
    );

    const skip = (page - 1) * limit;

    /* =========================
       BASE QUERY
    ========================= */

    const query = {
      active: true,
    };

    /* =========================
       SEARCH
    ========================= */

    if (search) {
      const safeSearch =
        escapeRegex(search);

      query.$or = [
        {
          name: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          categoryName: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          tags: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }

    /* =========================
       CATEGORY
    ========================= */

    if (category) {
      query.categoryName = {
        $regex: `^${escapeRegex(
          category
        )}$`,
        $options: "i",
      };
    }

    /* =========================
       GENDER
    ========================= */

    if (gender) {
      query.gender = {
        $regex: `^${escapeRegex(
          gender
        )}$`,
        $options: "i",
      };
    }

    /* =========================
       SIZE
    ========================= */

    if (size) {
      query.sizes = {
        $in: [size],
      };
    }

    /* =========================
       COLOR
    ========================= */

    if (color) {
      query.colors = {
        $in: [color],
      };
    }

    /* =========================
       PRICE
    ========================= */

    if (minPrice || maxPrice) {
      query.price = {};

      if (
        minPrice &&
        !Number.isNaN(Number(minPrice))
      ) {
        query.price.$gte =
          Number(minPrice);
      }

      if (
        maxPrice &&
        !Number.isNaN(Number(maxPrice))
      ) {
        query.price.$lte =
          Number(maxPrice);
      }
    }

    /* =========================
       RATING
    ========================= */

    if (
      rating &&
      !Number.isNaN(Number(rating))
    ) {
      query.rating = {
        $gte: Number(rating),
      };
    }

    /* =========================
       FEATURED
    ========================= */

    if (featured === "true") {
      query.featured = true;
    }

    /* =========================
       NEW PRODUCTS
    ========================= */

    if (isNew === "true") {
      query.isNew = true;
    }

    /* =========================
       SORTING
    ========================= */

    let sortQuery = {
      isNew: -1,
      createdAt: -1,
    };

    if (sort === "price-low") {
      sortQuery = {
        price: 1,
      };
    }

    if (sort === "price-high") {
      sortQuery = {
        price: -1,
      };
    }

    if (sort === "rating") {
      sortQuery = {
        rating: -1,
        reviewCount: -1,
      };
    }

    if (sort === "name") {
      sortQuery = {
        name: 1,
      };
    }

    if (sort === "newest") {
      sortQuery = {
        isNew: -1,
        createdAt: -1,
      };
    }

    /* =========================
       COUNT
    ========================= */

    const total =
      await Product.countDocuments(query);

    /* =========================
       PRODUCTS
    ========================= */

    const products =
      await Product.find(query)
        .populate(
          "category",
          "name slug"
        )
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean();

    /* =========================
       PAGINATION
    ========================= */

    const totalPages = Math.max(
      Math.ceil(total / limit),
      1
    );

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(
      "PRODUCTS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to fetch products",
        products: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   ESCAPE REGEX
========================= */

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}