"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { clearCart } from "@/redux/cartSlice";

export default function ConfirmOrderPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const cartItems = useSelector(
    (state) => state.cart?.items || []
  );

  const [address, setAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Calculate subtotal.
   */
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(
        item.price ||
          item.product?.price ||
          0
      );

      const quantity = Number(
        item.quantity || 1
      );

      return total + price * quantity;
    }, 0);
  }, [cartItems]);

  const shipping = 0;
  const total = subtotal + shipping;

  /*
   * Load selected checkout address.
   */
  useEffect(() => {
    try {
      const savedAddress =
        sessionStorage.getItem(
          "luxeCheckoutAddress"
        );

      if (!savedAddress) {
        router.replace("/checkout");
        return;
      }

      setAddress(
        JSON.parse(savedAddress)
      );
    } catch (error) {
      console.error(
        "CONFIRM ADDRESS ERROR:",
        error
      );

      setError(
        "Unable to load your delivery address."
      );
    } finally {
      setPageLoading(false);
    }
  }, [router]);

  /*
   * Load Razorpay Checkout script.
   */
  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (
        document.getElementById(
          "razorpay-checkout-script"
        )
      ) {
        resolve(true);
        return;
      }

      const script =
        document.createElement("script");

      script.id =
        "razorpay-checkout-script";

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }

  /*
   * Save successful order information
   * and move to the success page.
   */
  function finishSuccessfulOrder(order) {
    sessionStorage.setItem(
      "luxeLastOrder",
      JSON.stringify({
        id: order?._id,
        orderNumber:
          order?.orderNumber ||
          "Your order",
        total:
          order?.total ?? total,
        paymentMethod:
          order?.paymentMethod ||
          paymentMethod,
        paymentStatus:
          order?.paymentStatus ||
          "PAID",
      })
    );

    dispatch(clearCart());

    sessionStorage.removeItem(
      "luxeCheckoutAddress"
    );

    const orderId = order?._id;

    if (orderId) {
      router.push(
        `/order-success?order=${orderId}`
      );
    } else {
      router.push("/order-success");
    }

    router.refresh();
  }

  /*
   * Start Razorpay payment.
   */
  async function startRazorpayPayment(order) {
    const scriptLoaded =
      await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error(
        "Unable to load Razorpay. Please check your internet connection and try again."
      );
    }

    const createPaymentResponse =
      await fetch(
        "/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            amount: order.total,
            orderId: order._id,
          }),
        }
      );

    const paymentData =
      await createPaymentResponse.json();

    if (!createPaymentResponse.ok) {
      throw new Error(
        paymentData.message ||
          "Unable to create Razorpay payment."
      );
    }

    const razorpayOrder =
      paymentData.razorpayOrder;

    const options = {
      key:
        process.env
          .NEXT_PUBLIC_RAZORPAY_KEY_ID,

      amount:
        razorpayOrder.amount,

      currency:
        razorpayOrder.currency,

      name: "LUXE",
      description:
        `Order ${order.orderNumber}`,

      order:
        razorpayOrder.id,

      prefill: {
        name:
          address?.fullName || "",
        contact:
          address?.phone || "",
      },

      notes: {
        orderId: String(order._id),
        orderNumber:
          order.orderNumber,
      },

      theme: {
        color: "#000000",
      },

      handler: async function (
        paymentResponse
      ) {
        try {
          setLoading(true);
          setError("");

          const verifyResponse =
            await fetch(
              "/api/payment/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,

                  orderId:
                    order._id,
                }),
              }
            );

          const verifyData =
            await verifyResponse.json();

          if (!verifyResponse.ok) {
            throw new Error(
              verifyData.message ||
                "Payment verification failed."
            );
          }

          finishSuccessfulOrder(
            verifyData.order || order
          );
        } catch (error) {
          console.error(
            "PAYMENT VERIFICATION ERROR:",
            error
          );

          setError(
            error.message ||
              "Payment verification failed."
          );

          setLoading(false);
        }
      },

      modal: {
        ondismiss: function () {
          setLoading(false);
          setError(
            "Payment was cancelled. Your order has not been marked as paid."
          );
        },
      },
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.on(
      "payment.failed",
      function (response) {
        console.error(
          "RAZORPAY PAYMENT FAILED:",
          response
        );

        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        );

        setLoading(false);
      }
    );

    razorpay.open();
  }

  /*
   * Place order.
   */
  async function handlePlaceOrder() {
    if (!address) {
      setError(
        "Please select a delivery address."
      );
      return;
    }

    if (!cartItems.length) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      /*
       * First create the normal LUXE order.
       */
      const response = await fetch(
        "/api/orders",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            items: cartItems.map(
              (item) => ({
                productId:
                  item.productId ||
                  item.product?._id ||
                  item.product?.id,

                quantity: Number(
                  item.quantity || 1
                ),

                size: item.size || "",
                color: item.color || "",
              })
            ),

            shippingAddress: address,
            paymentMethod,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          "ORDER API ERROR:",
          data
        );

        throw new Error(
          data.message ||
            "Unable to place order."
        );
      }

      const order =
        data.order || data;

      /*
       * ONLINE PAYMENT
       *
       * Do NOT clear the cart yet.
       * Payment must be completed and verified first.
       */
      if (paymentMethod === "ONLINE") {
        await startRazorpayPayment(order);
        return;
      }

      /*
       * COD
       *
       * COD order is already successfully created,
       * so we can finish immediately.
       */
      finishSuccessfulOrder(order);
    } catch (error) {
      console.error(
        "PLACE ORDER ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while placing your order."
      );

      setLoading(false);
    }
  }

  /*
   * Empty cart.
   */
  if (
    !cartItems.length &&
    !pageLoading
  ) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <ShoppingBag
            size={52}
            strokeWidth={1.5}
            className="mx-auto text-gray-400"
          />

          <h1 className="mt-6 text-3xl font-semibold">
            Your cart is empty
          </h1>

          <p className="mt-3 text-gray-500">
            Add products before continuing
            to checkout.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  /*
   * Loading.
   */
  if (pageLoading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">
            Loading your order...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      {/* Back */}
      <Link
        href="/checkout"
        className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
      >
        <ArrowLeft size={16} />
        Back to Checkout
      </Link>

      {/* Heading */}
      <div className="mt-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-400">
          Final Step
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Confirm Your Order
        </h1>

        <p className="mt-2 text-gray-500">
          Review your address, products and
          payment method before placing your
          order.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_390px]">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Delivery Address */}
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <MapPin
                  size={19}
                  strokeWidth={1.7}
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Delivery Address
                </h2>

                <p className="text-sm text-gray-500">
                  Your order will be delivered
                  here.
                </p>
              </div>
            </div>

            {address && (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <p className="font-semibold">
                  {address.fullName}
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {address.address}
                  <br />
                  {address.city},{" "}
                  {address.state} -{" "}
                  {address.postalCode}
                  <br />
                  {address.country ||
                    "India"}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  Phone: {address.phone}
                </p>
              </div>
            )}

            <Link
              href="/checkout"
              className="mt-5 inline-block text-sm font-medium underline underline-offset-4"
            >
              Change address
            </Link>
          </section>

          {/* Products */}
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Your Items
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {cartItems.length}{" "}
                  {cartItems.length === 1
                    ? "product"
                    : "products"}{" "}
                  in your order
                </p>
              </div>

              <CheckCircle
                size={23}
                strokeWidth={1.6}
                className="text-green-600"
              />
            </div>

            <div className="mt-7 divide-y divide-gray-200">
              {cartItems.map(
                (item, index) => {
                  const product =
                    item.product || {};

                  const image =
                    item.image ||
                    product.image ||
                    product.images?.[0] ||
                    "/placeholder.png";

                  const name =
                    item.name ||
                    product.name ||
                    "Product";

                  const price = Number(
                    item.price ||
                      item.product?.price ||
                      0
                  );

                  const quantity = Number(
                    item.quantity || 1
                  );

                  return (
                    <div
                      key={
                        item.cartItemId ||
                        `${
                          item.productId ||
                          product._id ||
                          index
                        }-${
                          item.size || ""
                        }-${
                          item.color || ""
                        }`
                      }
                      className="flex gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <img
                          src={image}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-4">
                          <div>
                            <h3 className="font-medium">
                              {name}
                            </h3>

                            {(item.size ||
                              item.color) && (
                              <p className="mt-1 text-sm text-gray-500">
                                {item.size &&
                                  `Size: ${item.size}`}
                                {item.size &&
                                  item.color &&
                                  " · "}
                                {item.color &&
                                  `Color: ${item.color}`}
                              </p>
                            )}

                            <p className="mt-1 text-sm text-gray-500">
                              Qty: {quantity}
                            </p>
                          </div>

                          <p className="shrink-0 font-medium">
                            ₹
                            {(
                              price *
                              quantity
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold">
              Payment Method
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose how you would like to
              pay.
            </p>

            <div className="mt-6 space-y-3">
              {/* COD */}
              <label
                className={`flex cursor-pointer items-center justify-between rounded-2xl border p-5 transition ${
                  paymentMethod === "COD"
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={
                      paymentMethod ===
                      "COD"
                    }
                    onChange={() =>
                      setPaymentMethod(
                        "COD"
                      )
                    }
                    className="h-4 w-4"
                  />

                  <div>
                    <p className="font-semibold">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Pay when your order
                      arrives.
                    </p>
                  </div>
                </div>
              </label>

              {/* ONLINE */}
              <label
                className={`flex cursor-pointer items-center justify-between rounded-2xl border p-5 transition ${
                  paymentMethod ===
                  "ONLINE"
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={
                      paymentMethod ===
                      "ONLINE"
                    }
                    onChange={() =>
                      setPaymentMethod(
                        "ONLINE"
                      )
                    }
                    className="h-4 w-4"
                  />

                  <div>
                    <p className="font-semibold">
                      Online Payment
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Secure online payment
                      with Razorpay.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* RIGHT - SUMMARY */}
        <aside>
          <div className="sticky top-24 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-semibold">
              Order Summary
            </h2>

            <div className="mt-7 space-y-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>

                <span>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>

                <span>Free</span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  Total
                </span>

                <span className="text-2xl font-semibold">
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="mt-7 w-full rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? paymentMethod ===
                  "ONLINE"
                  ? "Opening Payment..."
                  : "Placing Order..."
                : paymentMethod ===
                    "ONLINE"
                  ? "Pay Online"
                  : "Place Order"}
            </button>

            <p className="mt-5 text-center text-xs leading-5 text-gray-400">
              By placing your order, you
              agree to our terms and
              conditions.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}