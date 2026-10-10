import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";

export default async function ProductPage({ params }) {
  const { id } = await params;

  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* BACK */}
        <Link
          href="/shop"
          className="mb-8 inline-block text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Back to Shop
        </Link>

        <div className="grid gap-10 md:grid-cols-2">
          {/* IMAGE */}
          <div className="overflow-hidden rounded-3xl bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="h-full max-h-[700px] w-full object-cover"
            />
          </div>

          {/* DETAILS */}
          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase tracking-widest text-gray-500">
              {product.categoryLabel}
            </p>

            <h1 className="mt-3 text-4xl font-black">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-bold">
                ₹{product.price.toLocaleString("en-IN")}
              </span>

              <span className="text-lg text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-yellow-500">
                ★ {product.rating}
              </span>

              <span className="text-sm text-gray-500">
                {product.reviews} customer reviews
              </span>
            </div>

            <p className="mt-6 leading-7 text-gray-600">
              {product.description}
            </p>

            {/* COLOR */}
            <div className="mt-7">
              <h3 className="mb-2 font-semibold">
                Color
              </h3>

              <div className="flex items-center gap-3">
                <span
                  className="h-8 w-8 rounded-full border"
                  style={{
                    backgroundColor:
                      product.color.toLowerCase(),
                  }}
                />

                <span>{product.color}</span>
              </div>
            </div>

            {/* SIZE */}
            <div className="mt-7">
              <h3 className="mb-3 font-semibold">
                Available Sizes
              </h3>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium hover:border-black"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* BUTTON */}
            <button className="mt-8 w-full rounded-xl bg-black px-6 py-4 font-bold text-white transition hover:bg-gray-800">
              Add to Cart
            </button>

            <button className="mt-3 w-full rounded-xl border border-black px-6 py-4 font-bold transition hover:bg-gray-100">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}