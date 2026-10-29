
const fs = require("fs");
const path = require("path");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const mongoose = require("mongoose");
const Product = require("../src/models/Product").default;
const Category = require("../src/models/Category").default;

const MONGODB_URI = process.env.MONGODB_URI;

/* =========================================
   LOAD LOCAL PRODUCT IMAGES
========================================= */

function loadLocalImages(folderName) {
  const folderPath = path.join(
    process.cwd(),
    "public",
    "images",
    folderName
  );

  if (!fs.existsSync(folderPath)) {
    throw new Error(`Image folder not found: ${folderPath}`);
  }

  const files = fs
    .readdirSync(folderPath)
    .filter((file) => /\.(jpg|jpeg|png|webp|avif)$/i.test(file))
    .sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );

  if (files.length === 0) {
    throw new Error(`No images found in ${folderPath}`);
  }

  console.log(`${folderName}: ${files.length} local images found`);

  return files.map((file) => `/images/${folderName}/${file}`);
}

const menImages = loadLocalImages("men");
const womenImages = loadLocalImages("women");
const kidsImages = loadLocalImages("kids");
const accessoriesImages = loadLocalImages("accessories");

/* =========================================
   COLORS
========================================= */

const clothingColors = [
  "Black",
  "White",
  "Blue",
  "Beige",
  "Green",
  "Pink",
  "Red",
  "Brown",
];

const accessoryColors = [
  "Black",
  "White",
  "Brown",
  "Beige",
  "Blue",
];

/* =========================================
   PRODUCT COLLECTIONS
========================================= */

const collections = [
  {
    gender: "Men",
    categoryName: "Men",
    categorySlug: "men",
    imageSet: menImages,
    products: [
      "Classic Cotton T-Shirt",
      "Slim Fit Denim Jeans",
      "Casual Oxford Shirt",
      "Essential Hoodie",
      "Regular Fit Chinos",
      "Lightweight Bomber Jacket",
      "Printed Casual Shirt",
      "Everyday Polo T-Shirt",
      "Relaxed Fit Joggers",
      "Formal Office Shirt",
      "Denim Jacket",
      "Crew Neck Sweatshirt",
      "Linen Summer Shirt",
      "Straight Fit Trousers",
      "Casual Oversized T-Shirt",
      "Zip-Up Hoodie",
      "Premium Knit Sweater",
      "Cotton Cargo Pants",
      "Classic Blazer",
      "Weekend Shorts",
    ],
  },
  {
    gender: "Women",
    categoryName: "Women",
    categorySlug: "women",
    imageSet: womenImages,
    products: [
      "Floral Summer Dress",
      "High-Waist Denim Jeans",
      "Classic White Blouse",
      "Oversized Casual Shirt",
      "Ribbed Knit Top",
      "Everyday Midi Dress",
      "Relaxed Fit Trousers",
      "Cropped Denim Jacket",
      "Cotton Casual T-Shirt",
      "Pleated Midi Skirt",
      "Linen Wide-Leg Pants",
      "Elegant Evening Dress",
      "Soft Knit Cardigan",
      "Printed Summer Top",
      "Casual Co-Ord Set",
      "Straight Fit Jeans",
      "Classic Women's Blazer",
      "Comfort Lounge Pants",
      "Sleeveless Summer Dress",
      "Everyday Women's Hoodie",
    ],
  },
  {
    gender: "Kids",
    categoryName: "Kids",
    categorySlug: "kids",
    imageSet: kidsImages,
    products: [
      "Kids Cotton T-Shirt",
      "Kids Denim Jeans",
      "Kids Printed Dress",
      "Kids Everyday Hoodie",
      "Kids Casual Shorts",
      "Kids Polo T-Shirt",
      "Kids Cotton Leggings",
      "Kids Checked Shirt",
      "Kids Sweatshirt",
      "Kids Party Dress",
      "Kids Jogger Pants",
      "Kids Graphic T-Shirt",
      "Kids Casual Jacket",
      "Kids Summer Top",
      "Kids Denim Shorts",
      "Kids Cotton Nightwear",
      "Kids Everyday Trousers",
      "Kids Floral Dress",
      "Kids Zip-Up Hoodie",
      "Kids Weekend Outfit",
    ],
  },
  {
    gender: "Unisex",
    categoryName: "Accessories",
    categorySlug: "accessories",
    imageSet: accessoriesImages,
    products: [
      "Classic Leather Belt",
      "Premium Leather Wallet",
      "Everyday Crossbody Bag",
      "Minimalist Shoulder Bag",
      "Classic Sunglasses",
      "Premium Wrist Watch",
      "Canvas Backpack",
      "Leather Card Holder",
      "Travel Duffel Bag",
      "Classic Baseball Cap",
      "Premium Bucket Hat",
      "Silk Fashion Scarf",
      "Everyday Tote Bag",
      "Compact Travel Wallet",
      "Leather Key Holder",
      "Statement Sunglasses",
      "Classic Beanie",
      "Minimal Crossbody Pouch",
      "Premium Laptop Bag",
      "Everyday Mini Backpack",
    ],
  },
];

const sizesByGender = {
  Men: ["S", "M", "L", "XL", "XXL"],
  Women: ["XS", "S", "M", "L", "XL"],
  Kids: ["2Y", "4Y", "6Y", "8Y", "10Y"],
  Unisex: ["ONE SIZE"],
};

/* =========================================
   HELPER FUNCTIONS
========================================= */

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getProductImages(imageSet, index) {
  // Use the downloaded image files for this category.
  // If fewer than 3 images exist, images may repeat.
  const imageCount = imageSet.length;

  return [
    imageSet[index % imageCount],
    imageSet[(index + 1) % imageCount],
    imageSet[(index + 2) % imageCount],
  ];
}

/* =========================================
   SEED DATABASE
========================================= */

async function seedDatabase() {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is missing. Check your .env.local file."
    );
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  let insertedCount = 0;
  let updatedCount = 0;

  for (const collection of collections) {
    const category = await Category.findOneAndUpdate(
      { slug: collection.categorySlug },
      {
        $set: {
          name: collection.categoryName,
          slug: collection.categorySlug,
          description:
            collection.categoryName === "Accessories"
              ? "Complete your look with premium accessories and modern essentials."
              : `${collection.categoryName} fashion collection`,
          image: collection.imageSet[0],
          active: true,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log(`\nCategory ready: ${collection.categoryName}`);

    for (let i = 0; i < collection.products.length; i++) {
      const name = collection.products[i];

      const slug = slugify(`${collection.categorySlug}-${name}`);

      let price;

      if (collection.categoryName === "Kids") {
        price = 399 + (i % 5) * 100;
      } else if (collection.categoryName === "Accessories") {
        price = 499 + (i % 8) * 250;
      } else {
        price = 799 + (i % 7) * 200;
      }

      const productImages = getProductImages(
        collection.imageSet,
        i
      );

      const availableColors =
        collection.categoryName === "Accessories"
          ? accessoryColors
          : clothingColors;

      const productColors = [
        availableColors[i % availableColors.length],
        availableColors[(i + 1) % availableColors.length],
      ];

      const sizes = sizesByGender[collection.gender];

      const variants = sizes.flatMap((size, sizeIndex) =>
        productColors.map((color, colorIndex) => ({
          size,
          color,
          stock: 5 + ((i + sizeIndex + colorIndex) % 20),
          sku: `${slug}-${size}-${color}`
            .replace(/[^a-z0-9-]/gi, "")
            .toUpperCase(),
        }))
      );

      const productData = {
        name,
        slug,

        description:
          collection.categoryName === "Accessories"
            ? `${name} from our premium accessories collection. Designed to complete your everyday style with a modern and versatile look.`
            : `${name} from our ${collection.gender.toLowerCase()} fashion collection. Designed for everyday comfort, modern style and versatile styling.`,

        price,
        compareAtPrice: price + 300,
        category: category._id,
        categoryName: collection.categoryName,
        gender: collection.gender,
        brand: "LUXE",

        // Local image paths from public/images/
        images: productImages,

        colors: productColors,
        sizes,
        variants,

        tags: [
          collection.categoryName.toLowerCase(),
          collection.gender.toLowerCase(),
          "fashion",
          "luxe",
          i % 2 === 0 ? "new" : "essential",
        ],

        featured: i < 6,
        isNew: i < 10,
        rating: Number((3.8 + (i % 13) / 10).toFixed(1)),
        reviewCount: 10 + i * 3,
        active: true,
      };

      const existingProduct = await Product.findOne({ slug });

      if (existingProduct) {
        await Product.updateOne(
          { _id: existingProduct._id },
          { $set: productData }
        );
        updatedCount++;
      } else {
        await Product.create(productData);
        insertedCount++;
      }
    }

    console.log(
      `${collection.categoryName}: ${collection.products.length} products ready.`
    );
  }

  const menCount = await Product.countDocuments({
    active: true,
    gender: "Men",
  });

  const womenCount = await Product.countDocuments({
    active: true,
    gender: "Women",
  });

  const kidsCount = await Product.countDocuments({
    active: true,
    gender: "Kids",
  });

  const accessoriesCount = await Product.countDocuments({
    active: true,
    categoryName: "Accessories",
  });

  const total = await Product.countDocuments({ active: true });

  console.log("\n========================================");
  console.log("         LUXE SEED COMPLETED");
  console.log("========================================");
  console.log(`New products:     ${insertedCount}`);
  console.log(`Updated products: ${updatedCount}`);
  console.log("\nProducts by category:");
  console.log(`Men:              ${menCount}`);
  console.log(`Women:            ${womenCount}`);
  console.log(`Kids:             ${kidsCount}`);
  console.log(`Accessories:      ${accessoriesCount}`);
  console.log(`\nTotal products:   ${total}`);
  console.log("========================================\n");

  await mongoose.disconnect();
}

seedDatabase()
  .catch((error) => {
    console.error("\nSeed failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
