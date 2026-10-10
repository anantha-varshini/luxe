"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { addToCart } from "@/redux/cartSlice";
import { toggleWishlist } from "@/redux/wishlistSlice";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const wishlistItems = useSelector(
    (state) => state.wishlist.items
  );

  const isWishlisted = wishlistItems.some(
    (item) => item._id === product._id
  );

  const image =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800";

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image,
        quantity: 1,
        size: product.sizes?.[0] || "M",
        color: product.colors?.[0] || "Default",
      })
    );
  };

  return (
    <article className="group relative">
      <div className="relative overflow-hidden rounded-2xl bg-gray-100">
        <Link href={`/products/${product._id}`}>
          <img
            src={image}
            alt={product.name}
            className="h-[360px] w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>

        {product.isNew && (
          <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
            New
          </span>
        )}

        <button
          type="button"
          onClick={() => dispatch(toggleWishlist(product))}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-105"
          aria-label="Toggle wishlist"
        >
          <Heart
            size={18}
            className={
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-700"
            }
          />
        </button>

        <button
          type="button"
          onClick={handleAddToCart}
          className="absolute bottom-3 left-3 right-3 flex translate-y-2 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold opacity-0 shadow-md transition group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ShoppingBag size={17} />
          Add to Cart
        </button>
      </div>

      <div className="pt-4">
        <p className="text-xs uppercase tracking-wider text-gray-500">
          {product.categoryName}
        </p>

        <Link href={`/products/${product._id}`}>
          <h3 className="mt-1 line-clamp-1 text-base font-semibold text-gray-900 hover:underline">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              ₹{product.price.toLocaleString("en-IN")}
            </span>

            {product.compareAtPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.compareAtPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Star
              size={14}
              className="fill-yellow-400 text-yellow-400"
            />
            {product.rating?.toFixed(1) || "0.0"}
          </div>
        </div>
      </div>
    </article>
  );
}