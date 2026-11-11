
import "dotenv/config";
import mongoose from "mongoose";
import fs from "node:fs";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "MONGODB_URI is missing. Check your .env.local file."
  );
}

const updates = JSON.parse(
  fs.readFileSync("./luxe-product-updates.json", "utf8")
);

async function main() {
  await mongoose.connect(uri);

  console.log("Connected to MongoDB Atlas.");

  const collection = mongoose.connection.collection("products");

  const ids = updates.map(
    (item) => new mongoose.Types.ObjectId(item._id)
  );

  const found = await collection.countDocuments({
    _id: { $in: ids }
  });

  if (found !== updates.length) {
    throw new Error(
      `Safety check failed: expected ${updates.length} matching products, found ${found}. No updates were made.`
    );
  }

  // First run: dry run only
  if (process.env.APPLY_UPDATES !== "true") {
    console.log(
      `DRY RUN: ${found} products are ready to update.`
    );

    console.log("No database changes were made.");

    console.log(
      "To apply, run: APPLY_UPDATES=true node --env-file=.env.local update-luxe-product-copy.js"
    );

    return;
  }

  // Update only name, slug and description
  const operations = updates.map((item) => ({
    updateOne: {
      filter: {
        _id: new mongoose.Types.ObjectId(item._id)
      },
      update: {
        $set: {
          name: item.name,
          slug: item.slug,
          description: item.description
        }
      }
    }
  }));

  const result = await collection.bulkWrite(
    operations,
    { ordered: true }
  );

  console.log(`Matched: ${result.matchedCount}`);
  console.log(`Modified: ${result.modifiedCount}`);

  console.log(
    "Updated only name, slug and description."
  );

  console.log(
    "Images and all other fields were left unchanged."
  );
}

main()
  .catch((error) => {
    console.error("Update failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
