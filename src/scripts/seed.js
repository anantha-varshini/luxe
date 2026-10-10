const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const mongoose = require("mongoose");

const Product = require("../src/models/Product").default;
const Category = require("../src/models/Category").default;

const MONGODB_URI = process.env.MONGODB_URI;

/* =========================================================
   CATEGORY-SPECIFIC IMAGE SETS

   IMPORTANT:
   NEVER reuse an image URL between these arrays.
========================================================= */

const menImages = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  "https://images.unsplash.com/photo-1516826957135-700dedea698c",
  "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc",
  "https://images.unsplash.com/photo-1627225924765-552d49cf47ad",
  "https://images.unsplash.com/photo-1610652492500-ded49ceeb378",
  "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4",
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
  "https://images.unsplash.com/photo-1598033129183-c4f50c736f10",
  "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3",
  "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126",
  "https://images.unsplash.com/photo-1564859228273-274232fdb516",
  "https://images.unsplash.com/photo-1551028719-00167b16eac5",
  "https://images.unsplash.com/photo-1548883354-7622d03aca27",
  "https://images.unsplash.com/photo-1578681994506-b8f463449011",
  "https://images.unsplash.com/photo-1596755389378-c31d21fd1273",
  "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176",
  "https://images.unsplash.com/photo-1552902865-b72c031ac5ea",
  "https://images.unsplash.com/photo-1516257984-b1b4d707412e",
  "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab",
  "https://images.unsplash.com/photo-1589310243389-96a5483213a8",
].map(
  (url) => `${url}?auto=format&fit=crop&w=900&q=80`
);

const womenImages = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae",
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
  "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b",
  "https://images.unsplash.com/photo-1551028719-00167b16eac5",
  "https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127",
  "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3",
  "https://images.unsplash.com/photo-1591369822096-ffd140ec948f",
  "https://images.unsplash.com/photo-1581044777550-4cfa60707c03",
  "https://images.unsplash.com/photo-1506629905607-d9c297d83cfb",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
  "https://images.unsplash.com/photo-1572804013427-4d7ca7268217",
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8",
  "https://images.unsplash.com/photo-1571513800374-df1bbe650e56",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
].map(
  (url) => `${url}?auto=format&fit=crop&w=900&q=80`
);

const kidsImages = [
  "https://images.unsplash.com/photo-1503919545889-aef636e10ad4",
  "https://images.unsplash.com/photo-1519457431-44ccd64a579b",
  "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6",
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9",
  "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42",
  "https://images.unsplash.com/photo-1599623560574-39d485900c95",
  "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01",
  "https://images.unsplash.com/photo-1522771930-78848d9293e8",
  "https://images.unsplash.com/photo-1560807707-8cc77767d783",
  "https://images.unsplash.com/photo-1607453998774-d533f65dac99",
  "https://images.unsplash.com/photo-1544776193-352d25ca82cd",
  "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42",
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96",
  "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42",
  "https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa",
  "https://images.unsplash.com/photo-1602030028438-4cf153cbae9e",
  "https://images.unsplash.com/photo-1596464716127-f2a82984de30",
  "https://images.unsplash.com/photo-1555009306-2e5a9f0e9a6e",
  "https://images.unsplash.com/photo-1560506840-ec148e82a604",
  "https://images.unsplash.com/photo-1599623560574-39d485900c95",
].map(
  (url) => `${url}?auto=format&fit=crop&w=900&q=80`
);

const accessoriesImages = [
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
  "https://images.unsplash.com/photo-1594223274512-ad4803739b7c",
  "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d",
  "https://images.unsplash.com/photo-1559563458-527698bf5295",
  "https://images.unsplash.com/photo-1627123424574-724758594e93",
  "https://images.unsplash.com/photo-1585488435151-2b0f6a6f3c4a",
  "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3",
  "https://images.unsplash.com/photo-1508057198894-247b23fe5ade",
  "https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  "https://images.unsplash.com/photo-1552346154-21d32810aba3",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
  "https://images.unsplash.com/photo-1511556532299-8f662fc26c06",
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
].map(
  (url) => `${url}?auto=format&fit=crop&w=900&q=80`
);

/* =========================================================
   COLORS
========================================================= */

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

/* =========================================================
   COLLECTIONS
========================================================= */

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

/* =========================================================
   SIZES
========================================================= */

const sizesByGender = {
  Men: ["S", "M", "L", "XL", "XXL"],
  Women: ["XS", "S", "M", "L", "XL"],
  Kids: ["2Y", "4Y", "6Y", "8Y", "10Y"],
  Unisex: ["ONE SIZE"],
};

/* =========================================================
   SLUGIFY
========================================================= */

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* =========================================================
   CREATE UNIQUE IMAGES FOR EACH PRODUCT
========================================================= */

function getProductImages(imageSet, index) {
  const imageCount = imageSet.length;

  return [
    imageSet[index % imageCount],
    imageSet[(index + 1) % imageCount],
    imageSet[(index + 2) % imageCount],
  ];
}

/* =========================================================
   SEED DATABASE
========================================================= */

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

  /* =======================================================
     PROCESS EACH CATEGORY
  ======================================================= */

  for (const collection of collections) {
    /* =====================================================
       CATEGORY
    ===================================================== */

    const category = await Category.findOneAndUpdate(
      {
        slug: collection.categorySlug,
      },
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

    console.log(
      `\nCategory ready: ${collection.categoryName}`
    );

    /* =====================================================
       PRODUCTS
    ===================================================== */

    for (
      let i = 0;
      i < collection.products.length;
      i++
    ) {
      const name = collection.products[i];

      const slug = slugify(
        `${collection.categorySlug}-${name}`
      );

      /* ===================================================
         PRICE
      =================================================== */

      let price;

      if (collection.categoryName === "Kids") {
        price = 399 + (i % 5) * 100;
      } else if (
        collection.categoryName === "Accessories"
      ) {
        price = 499 + (i % 8) * 250;
      } else {
        price = 799 + (i % 7) * 200;
      }

      /* ===================================================
         CATEGORY-SPECIFIC IMAGES

         Men uses ONLY menImages
         Women uses ONLY womenImages
         Kids uses ONLY kidsImages
         Accessories uses ONLY accessoriesImages
      =================================================== */

      const productImages = getProductImages(
        collection.imageSet,
        i
      );

      /* ===================================================
         COLORS
      =================================================== */

      const availableColors =
        collection.categoryName === "Accessories"
          ? accessoryColors
          : clothingColors;

      const productColors = [
        availableColors[
          i % availableColors.length
        ],
        availableColors[
          (i + 1) %
            availableColors.length
        ],
      ];

      /* ===================================================
         SIZES
      =================================================== */

      const sizes =
        sizesByGender[collection.gender];

      /* ===================================================
         VARIANTS
      =================================================== */

      const variants = sizes.flatMap(
        (size, sizeIndex) =>
          productColors.map(
            (color, colorIndex) => ({
              size,
              color,

              stock:
                5 +
                ((i +
                  sizeIndex +
                  colorIndex) %
                  20),

              sku: `${slug}-${size}-${color}`
                .replace(
                  /[^a-z0-9-]/gi,
                  ""
                )
                .toUpperCase(),
            })
          )
      );

      /* ===================================================
         PRODUCT DATA
      =================================================== */

      const productData = {
        name,

        slug,

        description:
          collection.categoryName ===
          "Accessories"
            ? `${name} from our premium accessories collection. Designed to complete your everyday style with a modern and versatile look.`
            : `${name} from our ${collection.gender.toLowerCase()} fashion collection. Designed for everyday comfort, modern style and versatile styling.`,

        price,

        compareAtPrice: price + 300,

        category: category._id,

        categoryName:
          collection.categoryName,

        gender: collection.gender,

        brand: "LUXE",

        /* CATEGORY-SPECIFIC IMAGES */
        images: productImages,

        colors: productColors,

        sizes,

        variants,

        tags: [
          collection.categoryName.toLowerCase(),
          collection.gender.toLowerCase(),
          "fashion",
          "luxe",
          i % 2 === 0
            ? "new"
            : "essential",
        ],

        featured: i < 6,

        isNew: i < 10,

        rating: Number(
          (
            3.8 +
            (i % 13) / 10
          ).toFixed(1)
        ),

        reviewCount: 10 + i * 3,

        active: true,
      };

      /* ===================================================
         UPDATE OR CREATE

         IMPORTANT:
         Existing products are updated so that old
         category/image assignments are corrected.
      =================================================== */

      const existingProduct =
        await Product.findOne({ slug });

      if (existingProduct) {
        await Product.updateOne(
          {
            _id: existingProduct._id,
          },
          {
            $set: productData,
          }
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

  /* =======================================================
     FINAL COUNTS
  ======================================================= */

  const menCount =
    await Product.countDocuments({
      active: true,
      gender: "Men",
    });

  const womenCount =
    await Product.countDocuments({
      active: true,
      gender: "Women",
    });

  const kidsCount =
    await Product.countDocuments({
      active: true,
      gender: "Kids",
    });

  const accessoriesCount =
    await Product.countDocuments({
      active: true,
      categoryName: "Accessories",
    });

  const total =
    await Product.countDocuments({
      active: true,
    });

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

/* =========================================================
   RUN
========================================================= */

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