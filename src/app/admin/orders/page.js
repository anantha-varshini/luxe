"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Package,
  Shield,
  RefreshCw,
} from "lucide-react";

const orderStatuses = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const paymentStatuses = [
  "PENDING",
  "PAID",
  "FAILED",
];

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN"
  )}`;
}

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function statusClass(status) {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-700";

    case "SHIPPED":
      return "bg-blue-100 text-blue-700";

    case "PROCESSING":
      return "bg-yellow-100 text-yellow-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "CONFIRMED":
      return "bg-purple-100 text-purple-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/orders",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load admin orders"
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to load admin orders"
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateOrder(
    orderId,
    changes
  ) {
    try {
      setSavingId(orderId);
      setError("");

      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(changes),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update order"
        );
      }

      setOrders((current) =>
        current.map((order) =>
          String(order._id) === String(orderId)
            ? data.order
            : order
        )
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to update order"
      );
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-sm text-gray-500">
            Loading admin orders...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield size={16} />
            Admin
          </div>

          <h1 className="mt-1 text-3xl font-semibold">
            Order Management
          </h1>

          <p className="mt-2 text-gray-500">
            Manage customer orders and payment
            status.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium hover:border-black"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!orders.length ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <Package
            size={42}
            className="mx-auto text-gray-300"
          />

          <h2 className="mt-4 text-xl font-semibold">
            No orders yet
          </h2>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-semibold">
                      {order.orderNumber}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>

                  <div className="mt-4 text-sm">
                    <p className="font-medium">
                      {order.user?.name ||
                        "Customer"}
                    </p>

                    <p className="text-gray-500">
                      {order.user?.email ||
                        "No email"}
                    </p>
                  </div>
                </div>

                <div className="text-left lg:text-right">
                  <p className="text-sm text-gray-500">
                    Total
                  </p>

                  <p className="text-2xl font-semibold">
                    {formatPrice(order.total)}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {order.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 border-t pt-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Order Status
                  </label>

                  <select
                    value={order.orderStatus}
                    disabled={
                      savingId === order._id
                    }
                    onChange={(event) =>
                      updateOrder(order._id, {
                        orderStatus:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                  >
                    {orderStatuses.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Payment Status
                  </label>

                  <select
                    value={order.paymentStatus}
                    disabled={
                      savingId === order._id
                    }
                    onChange={(event) =>
                      updateOrder(order._id, {
                        paymentStatus:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                  >
                    {paymentStatuses.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-500">
                  {order.items?.length || 0}{" "}
                  {order.items?.length === 1
                    ? "item"
                    : "items"}
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/orders/${order._id}`}
                    className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium hover:border-black"
                  >
                    View Order
                  </Link>

                  <Link
                    href={`/orders/${order._id}/tracking`}
                    className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Track
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}