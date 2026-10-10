"use client";

import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import {
  removeFromCart,
  updateQuantity,
} from "@/redux/cartSlice";

export default function CartPage() {
  const dispatch = useDispatch();

  const items = useSelector(
    (state) => state.cart?.items || []
  );

  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.product?.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const shipping =
    subtotal >= 3000 || subtotal === 0
      ? 0
      : 99;

  const total = subtotal + shipping;

  if (!items.length) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-16">
        <div className="text-center">
          <ShoppingBag
            size={50}
            className="mx-auto text-gray-300"
          />

          <h1 className="mt-6 text-3xl font-semibold">
            Your cart is empty
          </h1>

          <p className="mt-3 text-gray-500">
            Looks like you haven't added anything yet.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-xl bg-black px-7 py-3 font-semibold text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">
        Shopping Cart
      </h1>

      <p className="mt-2 text-gray-500">
        {items.length}{" "}
        {items.length === 1 ? "item" : "items"}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Cart Items */}
        <div className="space-y-6">
          {items.map((item) => {
            const product = item.product;

            const image =
              product?.images?.[0] ||
              "/products/placeholder.jpg";

            const price = Number(
              product?.price || 0
            );

            return (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex gap-4 rounded-2xl border border-gray-200 p-4 sm:gap-6"
              >
                <Link
                  href={`/products/${item.productId}`}
                  className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-40 sm:w-32"
                >
                  <img
  src={image}
  alt={product?.name || "Product"}
  className="absolute inset-0 h-full w-full object-cover"
/>
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-semibold hover:underline"
                      >
                        {product?.name}
                      </Link>

                      <p className="mt-1 text-sm text-gray-500">
                        {product?.brand || "LUXE"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          removeFromCart({
                            productId:
                              item.productId,
                            size: item.size,
                            color: item.color,
                          })
                        )
                      }
                      className="text-gray-400 hover:text-red-500"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      Size: {item.size || "-"}
                    </span>

                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      Color: {item.color || "-"}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center rounded-xl border border-gray-300">
                      <button
                        type="button"
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              productId:
                                item.productId,
                              size: item.size,
                              color: item.color,
                              quantity:
                                item.quantity - 1,
                            })
                          )
                        }
                        className="p-2 disabled:opacity-30"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="w-10 text-center text-sm font-medium">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              productId:
                                item.productId,
                              size: item.size,
                              color: item.color,
                              quantity:
                                item.quantity + 1,
                            })
                          )
                        }
                        className="p-2"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <p className="text-lg font-semibold">
                      ₹
                      {(
                        price * item.quantity
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>
                {shipping === 0
                  ? "Free"
                  : `₹${shipping}`}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <Link
  href="/checkout"
  className="mt-6 flex w-full items-center justify-center rounded-full bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-neutral-800"
>
  Proceed to Checkout
</Link>

          <Link
            href="/shop"
            className="mt-3 flex w-full items-center justify-center rounded-xl border border-gray-300 px-6 py-4 font-semibold"
          >
            Continue Shopping
          </Link>

          {subtotal < 3000 && (
            <p className="mt-5 text-center text-xs text-gray-500">
              Add ₹
              {(3000 - subtotal).toLocaleString(
                "en-IN"
              )}{" "}
              more to get free shipping.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}