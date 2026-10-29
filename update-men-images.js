import nextEnv from "@next/env";
import mongoose from "mongoose";
nextEnv.loadEnvConfig(process.cwd());
import fs from "fs";
import path from "path";
import Product from "./src/models/Product.js";

const categories = [
  { name: "Men", gender: "Men", folder: "men", prefix: "men" },
  { name: "Women", gender: "Women", folder: "women", prefix: "women" },
  { name: "Kids", gender: "Kids", folder: "kids", prefix: "kids" },
  {
    name: "Accessories",
    gender: "Unisex",
    folder: "accessories",
    prefix: "accessories",
  },
];

function getImages(folder) {
  const folderPath = path.join(
    process.cwd(),
    "public",
    "images",
    folder
  );

  if (!fs.existsSync(folderPath)) {
    throw new Error(`Folder not found: ${folderPath}`);
  }

  const files = fs
    .readdirSync(folderPath)
    .filter((file) => /\.(jpg|jpeg|png|webp|avif)$/i.test(file))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );

  if (files.length === 0) {
    throw new Error(`No images found in ${folderPath}`);
  }

  return files.map((file) => `/images/${folder}/${file}`);
}

async function updateImages() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MongoDB URI missing from .env.local");
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    for (const category of categories) {
      const images = getImages(category.folder);

      const filter =
        category.name === "Accessories"
          ? { categoryName: "Accessories" }
          : { gender: category.gender };

      const products = await Product.find(filter).sort({
        createdAt: 1,
        _id: 1,
      });

      for (let i = 0; i < products.length; i++) {
        const productImages = [0, 1, 2].map(
          (offset) => images[(i + offset) % images.length]
        );

        await Product.updateOne(
          { _id: products[i]._id },
          { $set: { images: productImages } }
        );

        console.log(`Updated: ${products[i].name}`);
      }

      console.log(
        `${category.name}: updated ${products.length} products`
      );
    }

    console.log("All category image updates completed!");
  } finally {
    await mongoose.disconnect();
  }
}

updateImages().catch((error) => {
  console.error("Image update failed:", error.message);
  process.exitCode = 1;
});
