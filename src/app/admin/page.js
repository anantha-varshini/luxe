
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-3xl font-bold">
        Admin Dashboard
      </h1>

      <p className="mt-3 text-gray-600">
        Manage your LUXE store and customer orders.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/orders"
          className="rounded-2xl border border-gray-200 p-7 transition hover:shadow-lg"
        >
          <Package size={32} />

          <h2 className="mt-5 text-xl font-semibold">
            Manage Orders
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            View customer orders and update their status.
          </p>

          <span className="mt-5 flex items-center gap-2 text-sm font-semibold">
            View Orders <ArrowRight size={16} />
          </span>
        </Link>
      </div>
    </main>
  );
}
