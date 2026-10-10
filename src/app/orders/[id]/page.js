"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getStatusClass(status) {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-700";

    case "SHIPPED":
      return "bg-blue-100 text-blue-700";

    case "PROCESSING":
      return "bg-yellow-100 text-yellow-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function OrderDetailsPage() {
  const params = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params?.id) {
      loadOrder(params.id);
    }
  }, [params?.id]);

  async function loadOrder(id) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/orders/${id}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load order");
      }

      setOrder(data.order);
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center text-gray-500">
          Loading order...
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-semibold">
            Unable to load order
          </h1>

          <p className="mt-3 text-red-600">
            {error || "Order not found"}
          </p>

          <Link
            href="/orders"
            className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
          >
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link
        href="/orders"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← Back to Orders
      </Link>

      <div className="mt-8 flex flex-col gap-5 border-b pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Order Details
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            {order.orderNumber}
          </h1>

          <p className="mt-2 text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <span
          className={`self-start rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
            order.orderStatus
          )}`}
        >
          {order.orderStatus}
        </span>
      </div>

      {/* Products */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">
          Items
        </h2>

        <div className="mt-4 divide-y rounded-2xl border bg-white">
          {(order.items || []).map((item, index) => (
            <div
              key={`${item.product || "item"}-${index}`}
              className="flex gap-4 p-5"
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-medium">
                  {item.name}
                </h3>

                <div className="mt-2 space-y-1 text-sm text-gray-500">
                  {item.size && (
                    <p>Size: {item.size}</p>
                  )}

                  {item.color && (
                    <p>Color: {item.color}</p>
                  )}

                  <p>Quantity: {item.quantity}</p>
                </div>
              </div>

              <div className="text-right font-medium">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* Shipping */}
        <section>
          <h2 className="text-xl font-semibold">
            Shipping Address
          </h2>

          <div className="mt-4 rounded-2xl border bg-white p-6 text-sm leading-7">
            <p className="font-semibold">
              {order.shippingAddress?.fullName}
            </p>

            <p>
              {order.shippingAddress?.phone}
            </p>

            <p className="mt-2">
              {order.shippingAddress?.address}
            </p>

            <p>
              {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.state}
            </p>

            <p>
              {order.shippingAddress?.postalCode}
            </p>

            <p>
              {order.shippingAddress?.country}
            </p>
          </div>
        </section>

        {/* Payment */}
        <section>
          <h2 className="text-xl font-semibold">
            Payment
          </h2>

          <div className="mt-4 rounded-2xl border bg-white p-6">
            <div className="flex justify-between border-b pb-3">
              <span className="text-gray-500">
                Method
              </span>

              <span className="font-medium">
                {order.paymentMethod}
              </span>
            </div>

            <div className="flex justify-between border-b py-3">
              <span className="text-gray-500">
                Payment Status
              </span>

              <span className="font-medium">
                {order.paymentStatus}
              </span>
            </div>

            <div className="flex justify-between pt-4">
              <span className="text-lg font-semibold">
                Total
              </span>

              <span className="text-lg font-semibold">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Order Summary */}
      <section className="mt-8 rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-semibold">
          Order Summary
        </h2>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">
              Subtotal
            </span>

            <span>
              {formatPrice(order.subtotal)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">
              Shipping
            </span>

            <span>
              {order.shipping === 0
                ? "Free"
                : formatPrice(order.shipping)}
            </span>
          </div>

          <div className="flex justify-between border-t pt-4 text-lg font-semibold">
            <span>Total</span>

            <span>
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}