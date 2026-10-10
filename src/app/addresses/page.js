"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Edit,
  MapPin,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const emptyForm = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  async function loadAddresses() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/addresses", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load addresses"
        );
      }

      setAddresses(data.addresses || []);
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Failed to load addresses"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  function openEditForm(address) {
    setEditingId(address._id);

    setForm({
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressLine: address.addressLine || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "India",
      isDefault: Boolean(address.isDefault),
    });

    setShowForm(true);
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleChange(event) {
    const { name, value, type, checked } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const isEditing = Boolean(editingId);

      const response = await fetch("/api/addresses", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isEditing
            ? {
                ...form,
                addressId: editingId,
              }
            : form
        ),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save address"
        );
      }

      closeForm();

      await loadAddresses();
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Unable to save address"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(addressId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `/api/addresses?id=${addressId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete address"
        );
      }

      await loadAddresses();
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Unable to delete address"
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 transition hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-500">
              LUXE
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-900">
              My Addresses
            </h1>

            <p className="mt-2 text-neutral-500">
              Manage your saved delivery addresses.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            <Plus size={17} />
            Add Address
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  {editingId
                    ? "Edit Address"
                    : "Add New Address"}
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Enter your delivery information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Full Name
                </label>

                <input
                  required
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Phone
                </label>

                <input
                  required
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  type="tel"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Postal Code
                </label>

                <input
                  required
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="Postal code"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Address
                </label>

                <textarea
                  required
                  name="addressLine"
                  value={form.addressLine}
                  onChange={handleChange}
                  placeholder="House number, street, area"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  City
                </label>

                <input
                  required
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  State
                </label>

                <input
                  required
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Country
                </label>

                <input
                  required
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleChange}
                  className="h-4 w-4"
                />

                <span className="text-sm text-neutral-700">
                  Make this my default address
                </span>
              </label>

              <div className="flex gap-3 pt-2 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Address"
                    : "Save Address"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-full border border-neutral-300 px-7 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm text-neutral-500">
            Loading addresses...
          </div>
        ) : addresses.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
            <MapPin
              size={36}
              className="mx-auto text-neutral-400"
            />

            <h2 className="mt-4 text-xl font-semibold">
              No saved addresses
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Add an address to make checkout faster.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {addresses.map((address) => (
              <article
                key={address._id}
                className="rounded-2xl border border-neutral-200 bg-white p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                      <MapPin size={18} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        {address.fullName}
                      </h3>

                      {address.isDefault && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                          <Check size={12} />
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-1 text-sm leading-6 text-neutral-600">
                  <p>{address.addressLine}</p>

                  <p>
                    {address.city}, {address.state}{" "}
                    {address.postalCode}
                  </p>

                  <p>{address.country}</p>

                  <p className="pt-2 font-medium text-neutral-900">
                    {address.phone}
                  </p>
                </div>

                <div className="mt-6 flex gap-3 border-t border-neutral-100 pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(address)
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-50"
                  >
                    <Edit size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(address._id)
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}