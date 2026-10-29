
import nextEnv from "@next/env";
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";

nextEnv.loadEnvConfig(process.cwd());

import Product from "./src/models/Product.js";
import Category from "./src/models/Category.js";

const TARGET_PER_CATEGORY = 20;

const collections = [
  {
    name: "Men",
    gender: "Men",
    folder: "men",
    products: [
      "Classic Oversized T-Shirt",
      "Relaxed Linen Shirt",
      "Essential Crew Neck Tee",
      "Classic Oxford Shirt",
      "Casual Denim Jacket",
      "Slim Fit Chinos",
      "Everyday Polo Shirt",
      "Premium Hoodie",
      "Straight Fit Jeans",
      "Lightweight Bomber Jacket",
      "Textured Knit Sweater",
      "Casual Cargo Trousers",
      "Minimalist Sweatshirt",
      "Linen Blend Trousers",
      "Classic Checked Shirt",
      "Relaxed Fit Shorts",
      "Zip-Up Track Jacket",
      "Essential Tank Top",
      "Tailored Casual Blazer",
      "Everyday Joggers",
    ],
  },
  {
    name: "Women",
    gender: "Women",
    folder: "women",
    products: [
      "Wide Leg Denim",
      "Essential Knit Top",
      "Everyday Midi Dress",
      "Classic White Blouse",
      "Relaxed Linen Shirt",
      "High Rise Straight Jeans",
      "Ribbed Tank Top",
      "Tailored Wide Leg Trousers",
      "Floral Summer Dress",
      "Cropped Denim Jacket",
      "Soft Knit Cardigan",
      "Pleated Midi Skirt",
      "Classic Blazer",
      "Relaxed Cotton Tee",
      "Sleeveless Maxi Dress",
      "Straight Fit Trousers",
      "Textured Knit Sweater",
      "Casual Denim Shorts",
      "Minimalist Co-ord Set",
      "Everyday Button-Up Shirt",
    ],
  },
  {
    name: "Kids",
    gender: "Kids",
    folder: "kids",
    products: [
      "Kids Graphic Tee",
      "Everyday Cotton T-Shirt",
      "Kids Casual Shirt",
      "Color Block Sweatshirt",
      "Kids Denim Jeans",
      "Comfort Joggers",
      "Printed Summer Dress",
      "Kids Hoodie",
      "Casual Cotton Shorts",
      "Striped Polo Tee",
      "Lightweight Jacket",
      "Kids Leggings",
      "Everyday Sweatpants",
      "Printed Button-Up Shirt",
      "Kids Denim Jacket",
      "Soft Knit Sweater",
      "Casual Cotton Dress",
      "Kids Track Pants",
      "Essential Tank Top",
      "Weekend Outfit Set",
    ],
  },
  {
    name: "Accessories",
    gender: "Unisex",
    folder: "accessories",
    products: [
      "Canvas Everyday Tote",
      "Minimalist Crossbody Bag",
      "Classic Baseball Cap",
      "Everyday Bucket Hat",
      "Compact Wallet",
      "Classic Leather Belt",
      "Canvas Shoulder Bag",
      "Minimalist Backpack",
      "Everyday Sunglasses",
      "Knit Winter Beanie",
      "Classic Silk Scarf",
      "Travel Organizer Pouch",
      "Everyday Card Holder",
      "Structured Handbag",
      "Casual Baseball Cap",
      "Textured Tote Bag",
      "Everyday Waist Bag",
      "Classic Woven Belt",
      "Compact Crossbody Pouch",
      "Weekend Travel Bag",
    ],
  },
];

function getLocalImages(folder) {
  const directory = path.join(
    process.cwd(),
    "public",
    "images",
    folder
  );

  if (!fs.existsSync(directory)) {
    throw new Error(`Image folder not found: ${directory}`);
  }

  const files = fs
    .readdirSync(directory)
    .filter((file) => /\.(jpg|jpeg|png|webp|avif)$/i.test(file))
    .sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );

  if (files.length !== TARGET_PER_CATEGORY) {
    throw new Error(
      `${folder}: expected ${TARGET_PER_CATEGORY} images, found ${files.length}. No product updates have started yet.`
    );
  }

  return files.map((file) => `/images/${folder}/${file}`);
}

function makeSlug(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeDescription(name, category) {
  return `${name} from the LUXE ${category} collection. Designed for everyday style, comfort, and versatile wear.`;
}

async function findCategory(collection) {
  const category = await Category.findOne({
    $or: [
      { name: collection.name },
      { slug: makeSlug(collection.name) },
    ],
  });

  if (!category) {
    throw new Error(
      `Category "${collection.name}" was not found in MongoDB. Check your existing category names before running this script again.`
    );
  }

  return category;
}

async function main() {
  const mongoUri =
    process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "MongoDB URI missing. Check the MONGODB_URI value in .env.local."
    );
  }

  // Validate all image folders before connecting or changing products.
  const imageSets = new Map();

  for (const collection of collections) {
    imageSets.set(
      collection.name,
      getLocalImages(collection.folder)
    );
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  // Validate category documents before changing products.
  const categoryDocuments = new Map();

  for (const collection of collections) {
    const category = await findCategory(collection);
    categoryDocuments.set(collection.name, category);
  }

  // Refuse to proceed if a category already has more than 20 products.
  // This prevents silent deletion or unexpected category counts.
  for (const collection of collections) {
    const filter =
      collection.name === "Accessories"
        ? { categoryName: "Accessories" }
        : { gender: collection.gender };

    const count = await Product.countDocuments(filter);

    if (count > TARGET_PER_CATEGORY) {
      throw new Error(
        `${collection.name} already has ${count} products. Nothing was changed by this script. Review the category filter before proceeding.`
      );
    }
  }

  for (const collection of collections) {
    const category = categoryDocuments.get(collection.name);
    const images = imageSets.get(collection.name);

    const filter =
      collection.name === "Accessories"
        ? { categoryName: "Accessories" }
        : { gender: collection.gender };

    // Existing products are kept and sorted deterministically.
    const existingProducts = await Product.find(filter).sort({
      createdAt: 1,
      _id: 1,
    });

    // Match existing products to the provided names where possible.
    const unusedNames = [...collection.products];
    const assignedNames = new Map();

    for (const product of existingProducts) {
      const matchingIndex = unusedNames.findIndex(
        (name) =>
          makeSlug(name) === makeSlug(product.name)
      );

      if (matchingIndex !== -1) {
        assignedNames.set(
          String(product._id),
          unusedNames.splice(matchingIndex, 1)[0]
        );
      }
    }

    // Give unmatched existing products the remaining catalog names.
    for (const product of existingProducts) {
      if (!assignedNames.has(String(product._id))) {
        const name = unusedNames.shift();

        if (!name) {
          throw new Error(
            `Could not assign a catalog name to ${product.name}.`
          );
        }

        assignedNames.set(String(product._id), name);
      }
    }

    // Update existing records without changing their _id or slug.
    for (let i = 0; i < existingProducts.length; i++) {
      const product = existingProducts[i];

      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            images: [images[i]],
            category: category._id,
            categoryName: collection.name,
            gender: collection.gender,
          },
        },
        { runValidators: true }
      );

      console.log(
        `Updated existing: ${collection.name} — ${product.name} → ${images[i]}`
      );
    }

    // Create only the missing products.
    const missingCount =
      TARGET_PER_CATEGORY - existingProducts.length;

    const newProducts = [];

    for (let i = 0; i < missingCount; i++) {
      const imageIndex = existingProducts.length + i;
      const name = unusedNames[i];

      if (!name) {
        throw new Error(
          `Missing a product name for ${collection.name} index ${imageIndex}.`
        );
      }

      const slug = `${makeSlug(collection.name)}-${makeSlug(name)}`;

      newProducts.push({
        name,
        slug,
        description: makeDescription(name, collection.name),
        price: 799 + ((imageIndex * 137) % 1700),
        compareAtPrice: null,
        category: category._id,
        categoryName: collection.name,
        gender: collection.gender,
        brand: "LUXE",
        images: [images[imageIndex]],
        colors: ["Black", "White"],
        sizes: ["S", "M", "L", "XL"],
        variants: ["S", "M", "L", "XL"].map((size) => ({
          size,
          color: "Black",
          stock: 10,
          sku: `LUXE-${makeSlug(collection.name).toUpperCase()}-${String(
            imageIndex + 1
          ).padStart(2, "0")}-${size}`,
        })),
        tags: [makeSlug(collection.name), "everyday"],
        featured: imageIndex < 4,
        isNew: true,
        rating: 0,
        reviewCount: 0,
        active: true,
      });
    }

    if (newProducts.length > 0) {
      await Product.insertMany(newProducts, {
        ordered: true,
      });

      for (const product of newProducts) {
        console.log(
          `Created: ${collection.name} — ${product.name}`
        );
      }
    }

    const finalCount = await Product.countDocuments(filter);

    if (finalCount !== TARGET_PER_CATEGORY) {
      throw new Error(
        `${collection.name}: expected 20 products after update, found ${finalCount}.`
      );
    }

    console.log(
      `${collection.name}: verified ${finalCount} products using ${images.length} local images.`
    );
  }

  // Verify that all 80 assigned primary image paths are unique.
  const allProducts = await Product.find({
    categoryName: { $in: collections.map((item) => item.name) },
  }).select("categoryName gender images");

  const primaryImages = allProducts
    .map((product) => product.images?.[0])
    .filter(Boolean);

  const uniqueImages = new Set(primaryImages);

  if (primaryImages.length !== 80 || uniqueImages.size !== 80) {
    throw new Error(
      `Final image verification failed: ${primaryImages.length} primary images, ${uniqueImages.size} unique. Review category filters and image assignments.`
    );
  }

  console.log("\nSUCCESS: LUXE now has 80 products and 80 unique primary image paths.");
  console.log("Men: 20 | Women: 20 | Kids: 20 | Accessories: 20");
}

main()
  .catch((error) => {
    console.error("\nLUXE update failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
