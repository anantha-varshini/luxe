"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { addToCart } from "@/redux/cartSlice";
import { toggleWishlist } from "@/redux/wishlistSlice";

export default function ProductDetails({ product }) {
  const dispatch = useDispatch();

  const wishlistItems = useSelector(
    (state) => state.wishlist.items
  );

  const isWishlisted = wishlistItems.some(
    (item) => item._id === product._id
  );

  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0]
  );

  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || ""
  );

  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || ""
  );

  const [quantity, setQuantity] = useState(1);

  const [relatedProducts, setRelatedProducts] =
    useState([]);

  useEffect(() => {
    async function loadRelated() {
      try {
        const response = await fetch(
          `/api/products?category=${encodeURIComponent(
            product.categoryName
          )}&limit=4`
        );

        const data = await response.json();

        if (data.success) {
          setRelatedProducts(
            data.products.filter(
              (item) => item._id !== product._id
            )
          );
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadRelated();
  }, [product.categoryName, product._id]);

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image:
          product.images?.[0] || "",
        quantity,
        size: selectedSize,
        color: selectedColor,
      })
    );
  };

  const image =
    selectedImage ||
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1000";

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-3xl bg-gray-100">
              <img
                src={image}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>

            {product.images?.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.map(
                  (productImage, index) => (
                    <button
                      key={`${productImage}-${index}`}
                      onClick={() =>
                        setSelectedImage(productImage)
                      }
                      className={`overflow-hidden rounded-xl border-2 ${
                        selectedImage === productImage
                          ? "border-black"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={productImage}
                        alt={`${product.name} ${index + 1}`}
                        className="aspect-square w-full object-cover"
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
              {product.categoryName}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star
                  size={17}
                  className="fill-yellow-400 text-yellow-400"
                />
                <span className="text-sm font-medium">
                  {product.rating?.toFixed(1) || "0.0"}
                </span>
              </div>

              <span className="text-sm text-gray-400">
                {product.reviewCount || 0} reviews
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-3xl font-bold">
                ₹{product.price.toLocaleString("en-IN")}
              </span>

              {product.compareAtPrice && (
                <span className="text-lg text-gray-400 line-through">
                  ₹
                  {product.compareAtPrice.toLocaleString(
                    "en-IN"
                  )}
                </span>
              )}
            </div>

            <p className="mt-6 leading-7 text-gray-600">
              {product.description}
            </p>

            {product.colors?.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-3 text-sm font-semibold">
                  Color
                </h3>

                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        setSelectedColor(color)
                      }
                      className={`rounded-full border px-4 py-2 text-sm ${
                        selectedColor === color
                          ? "border-black bg-black text-white"
                          : "border-gray-200"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold">
                  Size
                </h3>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        setSelectedSize(size)
                      }
                      className={`min-w-12 rounded-lg border px-4 py-2 text-sm ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <div className="flex items-center rounded-xl border border-gray-200">
                <button
                  onClick={() =>
                    setQuantity(
                      Math.max(1, quantity - 1)
                    )
                  }
                  className="p-3"
                >
                  <Minus size={16} />
                </button>

                <span className="w-8 text-center text-sm font-medium">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(quantity + 1)
                  }
                  className="p-3"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>

              <button
                onClick={() =>
                  dispatch(toggleWishlist(product))
                }
                className="flex h-14 w-14 items-center justify-center rounded-xl border border-gray-200"
              >
                <Heart
                  size={20}
                  className={
                    isWishlisted
                      ? "fill-red-500 text-red-500"
                      : ""
                  }
                />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 border-y border-gray-100 py-5 text-center text-xs text-gray-500">
              <div>Free shipping</div>
              <div>Easy returns</div>
              <div>Secure checkout</div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold">
              You may also like
            </h2>

            <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <RelatedCard
                  key={item._id}
                  product={item}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function RelatedCard({ product }) {
  return (
    <a
      href={`/products/${product._id}`}
      className="group"
    >
      <div className="overflow-hidden rounded-2xl bg-gray-100">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <h3 className="mt-3 text-sm font-semibold">
        {product.name}
      </h3>

      <p className="mt-1 text-sm">
        ₹{product.price.toLocaleString("en-IN")}
      </p>
    </a>
  );
}