"use client";

import Link from "next/link";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

export default function OrderSuccessPage() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const savedOrder = sessionStorage.getItem("luxeLastOrder");

      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
      }
    } catch (error) {
      console.error("ORDER SUCCESS STORAGE ERROR:", error);
    }
  }, []);

  const orderNumber =
    order?.orderNumber || "Your order";

  const orderId = order?.id || order?._id;

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center px-6 py-16">
      <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">

        <CheckCircle
          size={64}
          className="mx-auto text-green-600"
        />

        <h1 className="mt-6 text-3xl font-semibold">
          Order Placed Successfully!
        </h1>

        <p className="mt-3 text-gray-500">
          Thank you for shopping with LUXE.
          Your order has been received successfully.
        </p>

        <div className="mx-auto mt-8 max-w-md rounded-2xl bg-gray-50 p-6">
          <p className="text-sm text-gray-500">
            Order Number
          </p>

          <p className="mt-2 text-xl font-semibold">
            {orderNumber}
          </p>

          {order?.total !== undefined && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                Total Amount
              </p>

              <p className="mt-1 text-lg font-semibold">
                ₹{Number(order.total).toLocaleString("en-IN")}
              </p>
            </div>
          )}

          {order?.paymentMethod && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Payment Method
              </p>

              <p className="mt-1 font-medium">
                {order.paymentMethod}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

          {orderId ? (
            <Link
              href={`/orders/${orderId}`}
              className="inline-flex items-center justify-center rounded-full bg-black px-7 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              View Order
            </Link>
          ) : (
            <Link
              href="/orders"
              className="inline-flex items-center justify-center rounded-full bg-black px-7 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              My Orders
            </Link>
          )}

          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 px-7 py-3 text-sm font-semibold transition hover:border-black"
          >
            <ShoppingBag size={17} />
            Continue Shopping
          </Link>

        </div>

        <p className="mt-8 text-xs text-gray-400">
          You can view your complete order history from My Orders.
        </p>

        <Link
          href="/orders"
          className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
        >
          Go to My Orders
        </Link>
      </div>
    </main>
  );
}