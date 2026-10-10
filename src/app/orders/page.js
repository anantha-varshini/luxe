"use client";

import Link from "next/link";
import { Package, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/orders", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const text = await response.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            `Invalid server response (${response.status})`
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              `Failed to load orders (${response.status})`
          );
        }

        if (!cancelled) {
          setOrders(
            Array.isArray(data.orders)
              ? data.orders
              : []
          );
        }
      } catch (err) {
        console.error("ORDERS PAGE ERROR:", err);

        if (!cancelled) {
          setError(
            err.message || "Failed to load orders"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-sm text-gray-500">
            Loading orders...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-xl font-semibold text-red-700">
            Unable to load orders
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
            >
              Try Again
            </button>

            <Link
              href="/shop"
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!orders.length) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
          <Package
            size={56}
            className="text-gray-300"
          />

          <h1 className="mt-6 text-3xl font-semibold">
            My Orders
          </h1>

          <p className="mt-3 max-w-md text-gray-500">
            You haven't placed any orders yet.
            Start shopping and your orders will
            appear here.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-7 py-3 text-sm font-semibold text-white"
          >
            <ShoppingBag size={17} />
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm text-gray-500">
          Account
        </p>

        <h1 className="mt-1 text-3xl font-semibold">
          My Orders
        </h1>

        <p className="mt-2 text-gray-500">
          {orders.length}{" "}
          {orders.length === 1
            ? "order"
            : "orders"}{" "}
          found
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="rounded-2xl border border-gray-200 bg-white p-6"
          >
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Order Number
                </p>

                <h2 className="mt-1 font-semibold">
                  {order.orderNumber}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {order.createdAt
                    ? new Date(
                        order.createdAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    : ""}
                </p>
              </div>

              <span className="w-fit rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold">
                {order.orderStatus}
              </span>
            </div>

            {/* Items */}
            <div className="py-5">
              <div className="space-y-4">
                {order.items
                  ?.slice(0, 4)
                  .map((item, index) => (
                    <div
                      key={`${item.product}-${index}`}
                      className="flex items-center gap-4"
                    >
                      <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.size &&
                            `Size: ${item.size}`}
                          {item.size &&
                            item.color &&
                            " • "}
                          {item.color &&
                            `Color: ${item.color}`}
                          {" • "}
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="text-sm font-semibold">
                        ₹
                        {Number(
                          item.price || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  ))}
              </div>

              {order.items?.length > 4 && (
                <p className="mt-4 text-sm text-gray-500">
                  +{" "}
                  {order.items.length - 4} more{" "}
                  {order.items.length - 4 === 1
                    ? "item"
                    : "items"}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-5 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total
                </p>

                <p className="text-xl font-semibold">
                  ₹
                  {Number(
                    order.total || 0
                  ).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/orders/${order._id}/tracking`}
                  className="rounded-full border border-gray-300 px-5 py-2.5 text-center text-sm font-medium hover:border-black"
                >
                  Track Order
                </Link>

                <Link
                  href={`/orders/${order._id}`}
                  className="rounded-full bg-black px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-800"
                >
                  View Order
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}