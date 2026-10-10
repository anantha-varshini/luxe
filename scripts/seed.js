const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({
  path: ".env.local",
});

const categorySchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
    image: String,
    active: Boolean,
  },
  {
    timestamps: true,
  }
);

const variantSchema = new mongoose.Schema(
  {
    size: String,
    color: String,
    stock: Number,
    sku: String,
  },
  {
    _id: false,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: String,
    slug: {
      type: String,
      unique: true,
    },
    description: String,
    price: Number,
    compareAtPrice: Number,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    categoryName: String,
    gender: String,
    brand: String,
    images: [String],
    colors: [String],
    sizes: [String],
    variants: [variantSchema],
    tags: [String],
    featured: Boolean,
    isNew: Boolean,
    rating: Number,
    reviewCount: Number,
    active: Boolean,
  },
  {
    timestamps: true,
  }
);

const Category =
  mongoose.models.Category ||
  mongoose.model("Category", categorySchema);

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

const categories = [
  {
    name: "Men",
    slug: "men",
    description: "Modern fashion for men.",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
    active: true,
  },

  {
    name: "Women",
    slug: "women",
    description: "Contemporary styles for women.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800",
    active: true,
  },

  {
    name: "Kids",
    slug: "kids",
    description: "Comfortable styles for kids.",
    image:
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800",
    active: true,
  },

  {
    name: "Accessories",
    slug: "accessories",
    description: "Complete your look.",
    image:
      "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=800",
    active: true,
  },
];

const productsData = [
  {
    name: "Classic Oversized T-Shirt",
    slug: "classic-oversized-t-shirt",
    description:
      "A relaxed everyday t-shirt crafted for comfort and effortless style.",
    price: 899,
    compareAtPrice: 1199,
    categoryName: "Men",
    gender: "Men",
    brand: "Urban Edit",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=900",
    ],
    colors: ["Black", "White", "Beige"],
    sizes: ["S", "M", "L", "XL"],
    variants: [],
    tags: ["tshirt", "casual", "oversized"],
    featured: true,
    isNew: true,
    rating: 4.5,
    reviewCount: 124,
    active: true,
  },

  {
    name: "Relaxed Linen Shirt",
    slug: "relaxed-linen-shirt",
    description:
      "Lightweight linen shirt with a relaxed silhouette for warm days.",
    price: 1599,
    compareAtPrice: 1999,
    categoryName: "Men",
    gender: "Men",
    brand: "Urban Edit",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900",
    ],
    colors: ["White", "Blue", "Beige"],
    sizes: ["S", "M", "L", "XL"],
    variants: [],
    tags: ["shirt", "linen", "summer"],
    featured: true,
    isNew: true,
    rating: 4.7,
    reviewCount: 89,
    active: true,
  },

  {
    name: "Minimal Everyday Hoodie",
    slug: "minimal-everyday-hoodie",
    description:
      "Soft everyday hoodie with a clean minimal design.",
    price: 1899,
    compareAtPrice: 2499,
    categoryName: "Men",
    gender: "Unisex",
    brand: "Core Studio",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900",
    ],
    colors: ["Black", "Green", "Beige"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    variants: [],
    tags: ["hoodie", "casual", "streetwear"],
    featured: true,
    isNew: false,
    rating: 4.6,
    reviewCount: 211,
    active: true,
  },

  {
    name: "Wide Leg Denim",
    slug: "wide-leg-denim",
    description:
      "Relaxed wide-leg denim designed for a contemporary silhouette.",
    price: 2199,
    compareAtPrice: 2799,
    categoryName: "Women",
    gender: "Women",
    brand: "Studio Line",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900",
    ],
    colors: ["Blue", "Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    variants: [],
    tags: ["jeans", "denim", "wide-leg"],
    featured: true,
    isNew: true,
    rating: 4.8,
    reviewCount: 156,
    active: true,
  },

  {
    name: "Essential Knit Top",
    slug: "essential-knit-top",
    description:
      "A versatile knit top that works from weekday to weekend.",
    price: 1299,
    compareAtPrice: 1699,
    categoryName: "Women",
    gender: "Women",
    brand: "Studio Line",
    images: [
      "https://images.unsplash.com/photo-1564257577054-0f6e6d3d7b1b?w=900",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=900",
    ],
    colors: ["White", "Black", "Pink"],
    sizes: ["XS", "S", "M", "L"],
    variants: [],
    tags: ["top", "knit", "minimal"],
    featured: false,
    isNew: true,
    rating: 4.4,
    reviewCount: 67,
    active: true,
  },

  {
    name: "Everyday Midi Dress",
    slug: "everyday-midi-dress",
    description:
      "An effortless midi dress with a clean everyday silhouette.",
    price: 2399,
    compareAtPrice: 2999,
    categoryName: "Women",
    gender: "Women",
    brand: "Studio Line",
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900",
    ],
    colors: ["Black", "Red", "Beige"],
    sizes: ["XS", "S", "M", "L", "XL"],
    variants: [],
    tags: ["dress", "midi", "casual"],
    featured: false,
    isNew: true,
    rating: 4.7,
    reviewCount: 98,
    active: true,
  },

  {
    name: "Kids Graphic Tee",
    slug: "kids-graphic-tee",
    description:
      "Soft cotton graphic t-shirt designed for everyday play.",
    price: 699,
    compareAtPrice: 899,
    categoryName: "Kids",
    gender: "Kids",
    brand: "Little Edit",
    images: [
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=900",
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=900",
    ],
    colors: ["White", "Blue", "Red"],
    sizes: ["XS", "S", "M", "L"],
    variants: [],
    tags: ["kids", "tshirt", "graphic"],
    featured: false,
    isNew: true,
    rating: 4.5,
    reviewCount: 43,
    active: true,
  },

  {
    name: "Canvas Everyday Tote",
    slug: "canvas-everyday-tote",
    description:
      "A spacious canvas tote for everyday essentials.",
    price: 799,
    compareAtPrice: 999,
    categoryName: "Accessories",
    gender: "Unisex",
    brand: "Core Studio",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=900",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900",
    ],
    colors: ["Black", "Beige", "Brown"],
    sizes: ["M"],
    variants: [],
    tags: ["bag", "tote", "accessory"],
    featured: false,
    isNew: true,
    rating: 4.6,
    reviewCount: 71,
    active: true,
  },
];

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing from .env.local"
      );
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB");

    await Category.deleteMany({});
    await Product.deleteMany({});

    const insertedCategories =
      await Category.insertMany(categories);

    const categoryMap = {};

    insertedCategories.forEach((category) => {
      categoryMap[category.name] = category._id;
    });

    const products = productsData.map((product) => ({
      ...product,
      category: categoryMap[product.categoryName],
    }));

    await Product.insertMany(products);

    console.log(
      `Inserted ${insertedCategories.length} categories`
    );

    console.log(
      `Inserted ${products.length} products`
    );

    await mongoose.disconnect();

    console.log("Seed completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();