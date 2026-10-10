"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { useSelector } from "react-redux";

import ProductGrid from "@/components/ProductGrid";

export default function WishlistPage() {
  const items = useSelector(
    (state) => state.wishlist?.items || []
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-semibold">
          My Wishlist
        </h1>

        <p className="mt-2 text-gray-500">
          {items.length}{" "}
          {items.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      {!items.length ? (
        <div className="mt-16 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 text-center">
          <Heart
            size={48}
            className="text-gray-300"
          />

          <h2 className="mt-5 text-xl font-semibold">
            Your wishlist is empty
          </h2>

          <p className="mt-2 text-gray-500">
            Save products you love and find them here.
          </p>

          <Link
            href="/shop"
            className="mt-6 rounded-xl bg-black px-6 py-3 font-semibold text-white"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          <ProductGrid products={items} />
        </div>
      )}
    </main>
  );
}