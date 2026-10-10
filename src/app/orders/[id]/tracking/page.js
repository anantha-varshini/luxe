"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Check,
  Package,
  Truck,
  Home,
  XCircle,
  ArrowLeft,
} from "lucide-react";

const statuses = [
  {
    key: "PLACED",
    label: "Order Placed",
    description: "Your order has been successfully placed.",
    icon: Package,
  },
  {
    key: "CONFIRMED",
    label: "Order Confirmed",
    description: "Your order has been confirmed.",
    icon: Check,
  },
  {
    key: "PROCESSING",
    label: "Processing",
    description: "Your order is being prepared.",
    icon: Package,
  },
  {
    key: "SHIPPED",
    label: "Shipped",
    description: "Your order is on the way.",
    icon: Truck,
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    description: "Your order has been delivered.",
    icon: Home,
  },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    async function loadOrder() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/orders/${orderId}`, {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load order");
        }

        setOrder(data.order);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-center text-gray-500">Loading order tracking...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-xl font-semibold text-red-700">
            Unable to load order
          </h1>

          <p className="mt-2 text-sm text-red-600">{error}</p>

          <Link
            href="/orders"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white"
          >
            <ArrowLeft size={16} />
            Back to My Orders
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  const currentStatus = order.orderStatus;

  const currentIndex = statuses.findIndex(
    (status) => status.key === currentStatus
  );

  const isCancelled = currentStatus === "CANCELLED";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/orders"
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to My Orders
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">Order Tracking</p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              {order.orderNumber}
            </h1>
          </div>

          <div className="text-sm text-gray-500">
            Ordered on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Cancelled */}
      {isCancelled ? (
        <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-red-100 p-3 text-red-600">
              <XCircle size={24} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-red-700">
                Order Cancelled
              </h2>

              <p className="mt-1 text-sm text-red-600">
                This order has been cancelled.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Tracking Timeline */
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold">Order Status</h2>

          <div className="mt-8">
            {statuses.map((status, index) => {
              const Icon = status.icon;

              const completed = index <= currentIndex;
              const current = index === currentIndex;

              return (
                <div key={status.key} className="relative flex gap-4">
                  {/* Vertical line */}
                  {index !== statuses.length - 1 && (
                    <div
                      className={`absolute left-5 top-10 h-16 w-px ${
                        index < currentIndex
                          ? "bg-black"
                          : "bg-gray-200"
                      }`}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                      completed
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-white text-gray-400"
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  {/* Content */}
                  <div className="min-h-20 pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`font-medium ${
                          completed ? "text-black" : "text-gray-400"
                        }`}
                      >
                        {status.label}
                      </h3>

                      {current && (
                        <span className="rounded-full bg-black px-2.5 py-1 text-xs font-medium text-white">
                          Current
                        </span>
                      )}
                    </div>

                    <p
                      className={`mt-1 text-sm ${
                        completed ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {status.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Shipping Address */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Shipping Address</h2>

        <div className="mt-4 text-sm leading-6 text-gray-600">
          <p className="font-medium text-black">
            {order.shippingAddress?.fullName}
          </p>

          <p>{order.shippingAddress?.phone}</p>
          <p>{order.shippingAddress?.address}</p>

          <p>
            {order.shippingAddress?.city},{" "}
            {order.shippingAddress?.state}{" "}
            {order.shippingAddress?.postalCode}
          </p>

          <p>{order.shippingAddress?.country}</p>
        </div>
      </section>

      {/* Order Summary */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Order Summary</h2>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
            {order.orderStatus}
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {order.items?.map((item, index) => (
            <div
              key={`${item.product}-${index}`}
              className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
            >
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={item.image || "/products/placeholder.jpg"}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>

                <p className="mt-1 text-sm text-gray-500">
                  Size: {item.size || "N/A"} · Color:{" "}
                  {item.color || "N/A"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>

              <p className="font-medium">
                ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2 border-t border-gray-200 pt-5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Shipping</span>
            <span>
              {Number(order.shipping) === 0
                ? "Free"
                : `₹${Number(order.shipping).toLocaleString("en-IN")}`}
            </span>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold">
            <span>Total</span>
            <span>
              ₹{Number(order.total).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </section>

      {/* Bottom Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/orders/${order._id}`}
          className="flex-1 rounded-full border border-gray-300 px-5 py-3 text-center text-sm font-medium hover:bg-gray-50"
        >
          View Order Details
        </Link>

        <Link
          href="/shop"
          className="flex-1 rounded-full bg-black px-5 py-3 text-center text-sm font-medium text-white hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}