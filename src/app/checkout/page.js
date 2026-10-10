"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function CheckoutPage() {
  const router = useRouter();

  const cartItems = useSelector(
    (state) => state.cart?.items || []
  );

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  /*
   * Calculate subtotal.
   *
   * Cart items may store price directly as item.price
   * OR inside item.product.price.
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
   * Load logged-in user's profile and saved addresses.
   */
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoadingProfile(true);

        const response = await fetch("/api/profile", {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to load your saved addresses."
          );
          return;
        }

        setProfile(data.user);

        /*
         * If the user has no saved addresses,
         * automatically show the new address form.
         */
        if (!data.user?.addresses?.length) {
          setShowNewAddress(true);
        }
      } catch (error) {
        console.error(
          "CHECKOUT PROFILE ERROR:",
          error
        );

        setError(
          "Unable to load your saved addresses."
        );
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, []);

  /*
   * Handle new address form changes.
   */
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /*
   * Select an existing saved address.
   *
   * The selected address is stored temporarily
   * and the customer moves directly to confirmation.
   */
  function continueWithAddress(address) {
    setError("");

    try {
      const checkoutAddress = {
        fullName: address.fullName || "",
        phone: address.phone || "",
        address:
          address.address ||
          address.addressLine ||
          "",
        city: address.city || "",
        state: address.state || "",
        postalCode: address.postalCode || "",
        country: address.country || "India",
      };

      sessionStorage.setItem(
        "luxeCheckoutAddress",
        JSON.stringify(checkoutAddress)
      );

      router.push("/checkout/confirm");
    } catch (error) {
      console.error(
        "CHECKOUT ADDRESS ERROR:",
        error
      );

      setError(
        "Unable to continue with this address."
      );
    }
  }

  /*
   * Continue with a newly entered address.
   */
  function handleNewAddress(event) {
    event.preventDefault();
    setError("");

    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.postalCode.trim()
    ) {
      setError(
        "Please complete all address fields."
      );

      return;
    }

    try {
      sessionStorage.setItem(
        "luxeCheckoutAddress",
        JSON.stringify(form)
      );

      router.push("/checkout/confirm");
    } catch (error) {
      console.error(
        "NEW ADDRESS ERROR:",
        error
      );

      setError(
        "Unable to continue. Please try again."
      );
    }
  }

  /*
   * If cart is empty, don't allow checkout.
   */
  if (!cartItems.length) {
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
            Add some products before continuing to
            checkout.
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

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      {/* Back */}
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
      >
        <ArrowLeft size={16} />
        Back to Cart
      </Link>

      {/* Heading */}
      <div className="mt-8">
        <h1 className="text-4xl font-semibold tracking-tight">
          Checkout
        </h1>

        <p className="mt-2 text-gray-500">
          Select your delivery address to continue.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_390px]">
        {/* LEFT */}
        <section>
          {/* Saved Addresses */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  Delivery Address
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Choose where you want your order
                  delivered.
                </p>
              </div>

              <MapPin
                size={24}
                strokeWidth={1.6}
                className="shrink-0 text-gray-500"
              />
            </div>

            {loadingProfile ? (
              <div className="mt-8 rounded-2xl bg-gray-50 p-6 text-sm text-gray-500">
                Loading your saved addresses...
              </div>
            ) : profile?.addresses?.length > 0 ? (
              <div className="mt-8 space-y-4">
                {profile.addresses.map(
                  (address, index) => (
                    <button
                      key={
                        address._id || index
                      }
                      type="button"
                      onClick={() =>
                        continueWithAddress(
                          address
                        )
                      }
                      className="group w-full rounded-2xl border border-gray-200 p-5 text-left transition hover:border-black hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div className="min-w-0">
                          <p className="font-semibold">
                            {address.fullName}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-gray-600">
                            {address.addressLine ||
                              address.address}
                            <br />
                            {address.city},{" "}
                            {address.state} -{" "}
                            {address.postalCode}
                            <br />
                            {address.country ||
                              "India"}
                          </p>

                          <p className="mt-3 text-sm text-gray-500">
                            Phone:{" "}
                            {address.phone}
                          </p>
                        </div>

                        <span className="shrink-0 text-sm font-semibold text-gray-500 transition group-hover:text-black">
                          Use this
                          <span className="ml-1">
                            →
                          </span>
                        </span>
                      </div>
                    </button>
                  )
                )}
              </div>
            ) : null}

            {/* Add New Address */}
            {!showNewAddress && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setShowNewAddress(true);
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold transition hover:border-black"
              >
                <Plus size={17} />
                Add New Address
              </button>
            )}

            {/* New Address Form */}
            {showNewAddress && (
              <form
                onSubmit={handleNewAddress}
                className="mt-8 border-t border-gray-200 pt-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Add New Address
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Enter a new delivery address.
                    </p>
                  </div>

                  {profile?.addresses?.length >
                    0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewAddress(false);
                        setError("");
                      }}
                      className="text-sm text-gray-500 underline underline-offset-4 hover:text-black"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="mt-6 grid gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                    />
                  </div>

                  {/* Phone + Postal */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Phone
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Postal Code
                      </label>

                      <input
                        type="text"
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleChange}
                        placeholder="Postal code"
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Address
                    </label>

                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="House number, street, area"
                      rows={4}
                      required
                      className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                    />
                  </div>

                  {/* City + State */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        City
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="City"
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        State
                      </label>

                      <input
                        type="text"
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        placeholder="State"
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Country
                    </label>

                    <input
                      type="text"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 w-full rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Continue to Confirm Order
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* RIGHT - ORDER SUMMARY */}
        <aside>
          <div className="sticky top-24 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-semibold">
              Order Summary
            </h2>

            <div className="mt-7 space-y-5">
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

                  /*
                   * FIX:
                   * Read price from item.price first,
                   * then item.product.price.
                   */
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
                        `${item.productId || product._id || index}-${item.size || ""}-${item.color || ""}`
                      }
                      className="flex gap-4"
                    >
                      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <img
                          src={image}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-3">
                          <p className="text-sm font-medium">
                            {name}
                          </p>

                          <p className="shrink-0 text-sm font-medium">
                            ₹
                            {(
                              price *
                              quantity
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>

                        {(item.size ||
                          item.color) && (
                          <p className="mt-1 text-xs text-gray-500">
                            {item.size &&
                              `Size: ${item.size}`}
                            {item.size &&
                              item.color &&
                              " · "}
                            {item.color &&
                              `Color: ${item.color}`}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-gray-500">
                          Qty: {quantity}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* Totals */}
            <div className="mt-7 border-t border-gray-200 pt-5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>

                <span>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="mt-4 flex justify-between text-sm text-gray-500">
                <span>Shipping</span>

                <span>Free</span>
              </div>

              <div className="mt-5 border-t border-gray-200 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    Total
                  </span>

                  <span className="text-xl font-semibold">
                    ₹
                    {total.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
              Select a saved address above to
              continue to order confirmation.
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}