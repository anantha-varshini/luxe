"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { addToCart } from "@/redux/cartSlice";
import { toggleWishlist } from "@/redux/wishlistSlice";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const wishlistItems = useSelector(
    (state) => state.wishlist?.items || []
  );

  const isWishlisted = wishlistItems.some(
    (item) =>
      String(item._id) === String(product._id)
  );

  const image =
    product.images &&
    product.images.length > 0
      ? product.images[0]
      : "/products/placeholder.jpg";

  const price = Number(product.price || 0);

  const compareAtPrice = Number(
    product.compareAtPrice || 0
  );

  const firstSize =
    product.sizes && product.sizes.length > 0
      ? product.sizes[0]
      : "";

  const firstColor =
    product.colors && product.colors.length > 0
      ? product.colors[0]
      : "";

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();

    dispatch(toggleWishlist(product));
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    dispatch(
      addToCart({
        productId: product._id,
        product: product,
        quantity: 1,
        size: firstSize,
        color: firstColor,
      })
    );
  };

  return (
    <article className="group min-w-0">
      {/* IMAGE */}

      <div className="relative overflow-hidden rounded-2xl bg-gray-100">
        <Link href={`/products/${product._id}`}>
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={image}
              alt={product.name || "Product"}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        </Link>

        {/* NEW BADGE */}

        {product.isNew && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm">
            New
          </span>
        )}

        {/* WISHLIST */}

        <button
          type="button"
          onClick={handleWishlist}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-105"
          aria-label="Add to wishlist"
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

        {/* ADD TO CART */}

        <button
          type="button"
          onClick={handleAddToCart}
          className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100"
        >
          <ShoppingBag size={16} />

          Add to Cart
        </button>
      </div>

      {/* PRODUCT DETAILS */}

      <Link href={`/products/${product._id}`}>
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            {product.brand || "Fashion Store"}
          </p>

          <h3 className="mt-1 line-clamp-2 min-h-[48px] font-medium text-gray-900">
            {product.name}
          </h3>

          {/* PRICE */}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">
              ₹{price.toLocaleString("en-IN")}
            </span>

            {compareAtPrice > price && (
              <span className="text-sm text-gray-400 line-through">
                ₹
                {compareAtPrice.toLocaleString(
                  "en-IN"
                )}
              </span>
            )}
          </div>

          {/* COLORS */}

          {product.colors &&
            product.colors.length > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                {product.colors.length} colors
              </p>
            )}

          {/* RATING */}

          {Number(product.rating || 0) > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              ★ {Number(product.rating).toFixed(1)}
              {product.reviewCount
                ? ` (${product.reviewCount})`
                : ""}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}