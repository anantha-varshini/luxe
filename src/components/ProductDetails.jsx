"use client";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { addToCart } from "@/redux/cartSlice";
import { toggleWishlist } from "@/redux/wishlistSlice";

export default function ProductDetails({ product }) {
  const dispatch = useDispatch();

  const wishlistItems = useSelector(
    (state) => state.wishlist?.items || []
  );

  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0] || "/products/placeholder.jpg"
  );

  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || ""
  );

  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || ""
  );

  const [quantity, setQuantity] = useState(1);

  const isWishlisted = wishlistItems.some(
    (item) => String(item._id) === String(product._id)
  );

  const selectedVariant = product.variants?.find(
    (variant) =>
      variant.size === selectedSize &&
      variant.color === selectedColor
  );

  const stock = selectedVariant
    ? selectedVariant.stock
    : 0;

  const price = Number(product.price || 0);

  const compareAtPrice = Number(
    product.compareAtPrice || 0
  );

  const discount =
    compareAtPrice > price
      ? Math.round(
          ((compareAtPrice - price) / compareAtPrice) * 100
        )
      : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }

    if (!selectedColor) {
      alert("Please select a color.");
      return;
    }

    if (stock <= 0) {
      alert("This variant is out of stock.");
      return;
    }

    if (quantity > stock) {
      alert(`Only ${stock} items are available.`);
      return;
    }

    dispatch(
      addToCart({
        productId: product._id,
        product,
        quantity,
        size: selectedSize,
        color: selectedColor,
        price,
        image:
          product.images?.[0] ||
          "/products/placeholder.jpg",
      })
    );

    alert("Product added to cart.");
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product));
  };

  const increaseQuantity = () => {
    if (quantity < stock) {
      setQuantity((current) => current + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-black">
          Home
        </Link>

        <span className="mx-2">/</span>

        <Link href="/shop" className="hover:text-black">
          Shop
        </Link>

        <span className="mx-2">/</span>

        <span className="text-gray-900">
          {product.name}
        </span>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* IMAGE SECTION */}
        <div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100">
           <img
  src={selectedImage}
  alt={product.name}
  className="absolute inset-0 h-full w-full object-cover"
/>

            {product.isNew && (
              <span className="absolute left-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow">
                New
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 ${
                    selectedImage === image
                      ? "border-black"
                      : "border-transparent"
                  }`}
                >
                  <img
  src={image}
  alt={`${product.name} ${index + 1}`}
  className="absolute inset-0 h-full w-full object-cover"
/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS SECTION */}
        <div className="flex flex-col">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-400">
            {product.brand || "LUXE"}
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            {product.name}
          </h1>

          {/* Rating */}
          {Number(product.rating || 0) > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star
                  size={17}
                  className="fill-black text-black"
                />

                <span className="font-medium">
                  {Number(product.rating).toFixed(1)}
                </span>
              </div>

              <span className="text-sm text-gray-500">
                {product.reviewCount || 0} reviews
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-semibold">
              ₹{price.toLocaleString("en-IN")}
            </span>

            {compareAtPrice > price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ₹{compareAtPrice.toLocaleString("en-IN")}
                </span>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="font-semibold">
              Description
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              {product.description}
            </p>
          </div>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">
                  Color
                </h2>

                <span className="text-sm text-gray-500">
                  {selectedColor}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                {product.colors.map((color) => {
                  const available = product.variants?.some(
                    (variant) =>
                      variant.color === color &&
                      variant.stock > 0
                  );

                  return (
                    <button
                      key={color}
                      type="button"
                      disabled={!available}
                      onClick={() => {
                        setSelectedColor(color);
                        setQuantity(1);
                      }}
                      className={`rounded-full border px-5 py-2 text-sm transition ${
                        selectedColor === color
                          ? "border-black bg-black text-white"
                          : "border-gray-300 bg-white text-gray-900"
                      } ${
                        !available
                          ? "cursor-not-allowed opacity-40 line-through"
                          : "hover:border-black"
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="mt-8">
              <h2 className="font-semibold">
                Size
              </h2>

              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {product.sizes.map((size) => {
                  const available = product.variants?.some(
                    (variant) =>
                      variant.size === size &&
                      variant.color === selectedColor &&
                      variant.stock > 0
                  );

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!available}
                      onClick={() => {
                        setSelectedSize(size);
                        setQuantity(1);
                      }}
                      className={`rounded-xl border py-3 text-sm font-medium ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-300"
                      } ${
                        !available
                          ? "cursor-not-allowed opacity-40"
                          : "hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="mt-6">
            {stock > 0 ? (
              <p className="text-sm font-medium text-green-600">
                {stock} available
              </p>
            ) : (
              <p className="text-sm font-medium text-red-600">
                This combination is out of stock
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="mt-6">
            <h2 className="font-semibold">
              Quantity
            </h2>

            <div className="mt-3 flex w-fit items-center rounded-xl border border-gray-300">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="p-3 disabled:opacity-30"
              >
                <Minus size={18} />
              </button>

              <span className="w-12 text-center font-medium">
                {quantity}
              </span>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={
                  stock <= 0 || quantity >= stock
                }
                className="p-3 disabled:opacity-30"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={stock <= 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <ShoppingBag size={20} />

              {stock > 0
                ? "Add to Cart"
                : "Out of Stock"}
            </button>

            <button
              type="button"
              onClick={handleWishlist}
              className="flex h-[56px] w-[56px] items-center justify-center rounded-xl border border-gray-300"
              aria-label="Wishlist"
            >
              <Heart
                size={21}
                className={
                  isWishlisted
                    ? "fill-red-500 text-red-500"
                    : ""
                }
              />
            </button>
          </div>

          {/* Product information */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">
                  Category
                </p>

                <p className="mt-1 font-medium">
                  {product.categoryName ||
                    product.category?.name ||
                    "Fashion"}
                </p>
              </div>

              <div>
                <p className="text-gray-400">
                  Gender
                </p>

                <p className="mt-1 font-medium">
                  {product.gender}
                </p>
              </div>

              <div>
                <p className="text-gray-400">
                  Brand
                </p>

                <p className="mt-1 font-medium">
                  {product.brand || "LUXE"}
                </p>
              </div>

              <div>
                <p className="text-gray-400">
                  SKU
                </p>

                <p className="mt-1 font-medium">
                  {selectedVariant?.sku || "Available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}