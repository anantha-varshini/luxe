"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  User,
  MapPin,
  Plus,
  Trash2,
  Save,
  Package,
  Shield,
} from "lucide-react";

const emptyAddress = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");

  const [addresses, setAddresses] = useState([]);

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [address, setAddress] =
    useState(emptyAddress);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/profile", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load profile"
        );
      }

      setUser(data.user);
      setName(data.user.name || "");
      setAddresses(data.user.addresses || []);
    } catch (err) {
      setError(
        err.message || "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAddressChange(event) {
    const { name, value } = event.target;

    setAddress((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function addAddress() {
    if (
      !address.fullName ||
      !address.phone ||
      !address.addressLine ||
      !address.city ||
      !address.state ||
      !address.postalCode
    ) {
      setError("Please fill all address fields.");
      return;
    }

    setAddresses((current) => [
      ...current,
      {
        ...address,
      },
    ]);

    setAddress(emptyAddress);
    setShowAddressForm(false);
    setError("");
  }

  function removeAddress(index) {
    setAddresses((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  async function saveProfile() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          addresses,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save profile"
        );
      }

      setUser(data.user);
      setName(data.user.name || "");
      setAddresses(data.user.addresses || []);

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err.message || "Failed to save profile"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-sm text-gray-500">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  if (error && !user) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-xl font-semibold text-red-700">
            Unable to load profile
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm text-gray-500">
          Account
        </p>

        <h1 className="mt-1 text-3xl font-semibold">
          My Profile
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your account and saved addresses.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        {/* Account Information */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
              <User size={20} />
            </div>

            <div>
              <h2 className="font-semibold">
                Account Information
              </h2>

              <p className="text-sm text-gray-500">
                Your LUXE account
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                value={user?.email || ""}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500"
              />
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <Shield size={17} />

                <span className="text-sm font-medium">
                  Account Role
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {user?.role === "admin"
                  ? "Administrator"
                  : "Customer"}
              </p>
            </div>

            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <Save size={17} />

              {saving
                ? "Saving..."
                : "Save Profile"}
            </button>
          </div>

          <div className="mt-6 border-t pt-6">
            <Link
              href="/orders"
              className="flex items-center gap-2 text-sm font-medium hover:underline"
            >
              <Package size={17} />
              View My Orders
            </Link>
          </div>
        </section>

        {/* Addresses */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
                <MapPin size={20} />
              </div>

              <div>
                <h2 className="font-semibold">
                  Saved Addresses
                </h2>

                <p className="text-sm text-gray-500">
                  {addresses.length}{" "}
                  {addresses.length === 1
                    ? "address"
                    : "addresses"}
                </p>
              </div>
            </div>

            {!showAddressForm && (
              <button
                type="button"
                onClick={() => {
                  setShowAddressForm(true);
                  setError("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium hover:border-black"
              >
                <Plus size={16} />
                Add Address
              </button>
            )}
          </div>

          {showAddressForm && (
            <div className="mt-6 rounded-2xl bg-gray-50 p-5">
              <h3 className="font-semibold">
                New Address
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  name="fullName"
                  placeholder="Full Name"
                  value={address.fullName}
                  onChange={handleAddressChange}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3"
                />

                <input
                  name="phone"
                  placeholder="Phone Number"
                  value={address.phone}
                  onChange={handleAddressChange}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3"
                />

                <input
                  name="addressLine"
                  placeholder="Address"
                  value={address.addressLine}
                  onChange={handleAddressChange}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 sm:col-span-2"
                />

                <input
                  name="city"
                  placeholder="City"
                  value={address.city}
                  onChange={handleAddressChange}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3"
                />

                <input
                  name="state"
                  placeholder="State"
                  value={address.state}
                  onChange={handleAddressChange}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3"
                />

                <input
                  name="postalCode"
                  placeholder="Postal Code"
                  value={address.postalCode}
                  onChange={handleAddressChange}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3"
                />

                <input
                  name="country"
                  placeholder="Country"
                  value={address.country}
                  onChange={handleAddressChange}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={addAddress}
                  className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white"
                >
                  Add Address
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm(false);
                    setAddress(emptyAddress);
                  }}
                  className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {!addresses.length && !showAddressForm ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                <MapPin
                  size={32}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-sm text-gray-500">
                  No saved addresses yet.
                </p>
              </div>
            ) : (
              addresses.map((item, index) => (
                <div
                  key={item._id || index}
                  className="rounded-2xl border border-gray-200 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {item.fullName}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.phone}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeAddress(index)
                      }
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete address"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="mt-3 text-sm leading-6 text-gray-600">
                    <p>{item.addressLine}</p>

                    <p>
                      {item.city}, {item.state}
                    </p>

                    <p>{item.postalCode}</p>

                    <p>{item.country}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {addresses.length > 0 && (
            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-black px-5 py-3 font-semibold transition hover:bg-black hover:text-white disabled:opacity-50"
            >
              <Save size={17} />

              {saving
                ? "Saving..."
                : "Save Addresses"}
            </button>
          )}
        </section>
      </div>
    </main>
  );
}