// src/lib/products.js

const productImages = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1551489186-cf8726f514f8?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1506629905607-d9c297d7c7b0?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&q=80",
];

const productNames = {
  men: [
    "Classic Cotton Shirt",
    "Premium Oxford Shirt",
    "Slim Fit T-Shirt",
    "Relaxed Linen Shirt",
    "Essential Polo",
    "Urban Denim Jacket",
    "Classic Denim Jeans",
    "Casual Overshirt",
    "Premium Chino Pants",
    "Everyday Hoodie",
    "Minimal Bomber Jacket",
    "Textured Casual Shirt",
    "Essential Crew Neck",
    "Modern Formal Shirt",
    "Weekend Casual Jacket",
  ],

  women: [
    "Elegant Summer Dress",
    "Classic Women's Shirt",
    "Relaxed Linen Dress",
    "Premium Blouse",
    "Floral Midi Dress",
    "Everyday Wide Leg Pants",
    "Classic Denim Jacket",
    "Soft Knit Sweater",
    "Minimal Co-ord Set",
    "Satin Evening Dress",
    "Casual Crop Shirt",
    "Pleated Midi Skirt",
    "Relaxed Cotton Top",
    "Modern Jumpsuit",
    "Classic Trench Coat",
  ],

  kids: [
    "Kids Cotton T-Shirt",
    "Kids Casual Shirt",
    "Kids Denim Jacket",
    "Kids Summer Dress",
    "Kids Polo T-Shirt",
    "Kids Printed Hoodie",
    "Kids Jogger Pants",
    "Kids Casual Shorts",
    "Kids Denim Jeans",
    "Kids Cotton Dress",
    "Kids Checked Shirt",
    "Kids Winter Jacket",
    "Kids Graphic Tee",
    "Kids Relaxed Pants",
    "Kids Everyday Hoodie",
  ],
};

const colors = [
  "Black",
  "White",
  "Blue",
  "Beige",
  "Brown",
  "Green",
  "Grey",
  "Pink",
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

const categoryDetails = {
  men: {
    label: "Men",
    basePrice: 899,
  },
  women: {
    label: "Women",
    basePrice: 999,
  },
  kids: {
    label: "Kids",
    basePrice: 599,
  },
};

function createProducts(category) {
  return productNames[category].map((name, index) => {
    const base = categoryDetails[category];

    return {
      id: `${category}-${index + 1}`,
      name,
      category,
      categoryLabel: base.label,
      image: productImages[index],
      price: base.basePrice + index * 150,
      originalPrice: base.basePrice + index * 150 + 400,
      color: colors[index % colors.length],
      sizes: [
        sizes[index % sizes.length],
        sizes[(index + 1) % sizes.length],
        sizes[(index + 2) % sizes.length],
      ],
      rating: Number((4.1 + (index % 9) / 10).toFixed(1)),
      reviews: 40 + index * 17,
      isNew: index < 6,
      isSale: index >= 7,
      description:
        "Premium quality fashion piece designed for everyday comfort and modern style.",
    };
  });
}

export const products = [
  ...createProducts("men"),
  ...createProducts("women"),
  ...createProducts("kids"),
];

export function getProductsByCategory(category) {
  return products.filter((product) => product.category === category);
}

export function getNewArrivals() {
  return products.filter((product) => product.isNew);
}

export function getSaleProducts() {
  return products.filter((product) => product.isSale);
}

export function getProductById(id) {
  return products.find((product) => product.id === id);
}

export const allCategories = ["Men", "Women", "Kids"];

export const allColors = colors;

export const allSizes = sizes;