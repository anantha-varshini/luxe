"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
            Join LUXE
          </p>

          <h1 className="text-4xl font-light">
            Create account
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest">
              Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-black/20 bg-transparent px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-black/20 bg-transparent px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full border border-black/20 bg-transparent px-4 py-3 outline-none focus:border-black"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black py-4 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="font-medium text-black underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}