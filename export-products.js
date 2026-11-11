
import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import Product from "./src/models/Product.js";

async function exportProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB Atlas");

    const products = await Product.find({}).lean();

    fs.writeFileSync(
      "products.json",
      JSON.stringify(products, null, 2),
      "utf-8"
    );

    console.log(`Successfully exported ${products.length} products`);
    console.log("File created: products.json");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Export failed:", error);
    await mongoose.disconnect();
  }
}

exportProducts();
