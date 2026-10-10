import Link from "next/link";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
  await connectDB();

  const [featured, newProducts, categories] =
    await Promise.all([
      Product.find({
        active: true,
        featured: true,
      })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean(),

      Product.find({
        active: true,
        isNew: true,
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),

      Category.find({
        active: true,
      })
        .sort({ name: 1 })
        .limit(4)
        .lean(),
    ]);

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gray-100">
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
              New Collection
            </p>

            <h1 className="mt-5 max-w-xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
              Style that feels like you.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
              Discover modern essentials, timeless
              silhouettes and everyday pieces designed
              for your wardrobe.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-xl bg-black px-7 py-4 text-sm font-semibold text-white"
              >
                Shop Collection
              </Link>

              <Link
                href="/shop?sort=newest"
                className="rounded-xl border border-gray-300 bg-white px-7 py-4 text-sm font-semibold"
              >
                New Arrivals
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200"
              alt="Fashion collection"
              className="h-[520px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
                Explore
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Shop by category
              </h2>
            </div>

            <Link
              href="/shop"
              className="hidden text-sm font-semibold underline sm:block"
            >
              View all
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category._id.toString()}
                href={`/shop?category=${encodeURIComponent(
                  category.name
                )}`}
                className="group overflow-hidden rounded-2xl bg-gray-100"
              >
                <div className="relative">
                  <img
                    src={
                      category.image ||
                      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700"
                    }
                    alt={category.name}
                    className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">
                    <h3 className="text-xl font-semibold text-white">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
                  Curated for you
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Featured pieces
                </h2>
              </div>

              <Link
                href="/shop"
                className="text-sm font-semibold underline"
              >
                Shop all
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard
                  key={product._id.toString()}
                  product={{
                    ...product,
                    _id: product._id.toString(),
                    category:
                      product.category?.toString(),
                    createdAt:
                      product.createdAt?.toISOString(),
                    updatedAt:
                      product.updatedAt?.toISOString(),
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      {newProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
                Just dropped
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                New arrivals
              </h2>
            </div>

            <Link
              href="/shop?sort=newest"
              className="text-sm font-semibold underline"
            >
              See all
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {newProducts.map((product) => (
              <ProductCard
                key={product._id.toString()}
                product={{
                  ...product,
                  _id: product._id.toString(),
                  category:
                    product.category?.toString(),
                  createdAt:
                    product.createdAt?.toISOString(),
                  updatedAt:
                    product.updatedAt?.toISOString(),
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* TRENDING PRODUCTS */}
      {featured.length > 0 && (
        <section className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
                  What people love
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Trending now
                </h2>
              </div>

              <Link
                href="/shop"
                className="text-sm font-semibold underline"
              >
                View all
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard
                  key={`trending-${product._id.toString()}`}
                  product={{
                    ...product,
                    _id: product._id.toString(),
                    category:
                      product.category?.toString(),
                    createdAt:
                      product.createdAt?.toISOString(),
                    updatedAt:
                      product.updatedAt?.toISOString(),
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROMOTIONAL BANNER */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-black">
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1600"
            alt="Latest fashion collection"
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />

          <div className="relative px-8 py-24 text-center text-white sm:px-16">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-300">
              Limited Collection
            </p>

            <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-bold sm:text-5xl">
              Elevate your everyday style.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-gray-300">
              Discover pieces made for effortless looks,
              from everyday essentials to statement styles.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-block rounded-xl bg-white px-8 py-4 text-sm font-semibold text-black"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* STYLE COLLECTIONS */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Discover
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Find your everyday style
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Link
            href="/shop?category=Casual"
            className="group relative overflow-hidden rounded-3xl"
          >
            <img
              src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=900"
              alt="Casual fashion"
              className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <div className="absolute bottom-0 p-7 text-white">
              <p className="text-sm uppercase tracking-widest text-gray-300">
                Everyday
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Casual
              </h3>
            </div>
          </Link>

          <Link
            href="/shop?category=Formal"
            className="group relative overflow-hidden rounded-3xl"
          >
            <img
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900"
              alt="Formal fashion"
              className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <div className="absolute bottom-0 p-7 text-white">
              <p className="text-sm uppercase tracking-widest text-gray-300">
                Refined
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Formal
              </h3>
            </div>
          </Link>

          <Link
            href="/shop?category=Streetwear"
            className="group relative overflow-hidden rounded-3xl"
          >
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900"
              alt="Streetwear fashion"
              className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <div className="absolute bottom-0 p-7 text-white">
              <p className="text-sm uppercase tracking-widest text-gray-300">
                Urban
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Streetwear
              </h3>
            </div>
          </Link>
        </div>
      </section>

      {/* WHY SHOP WITH US */}
      <section className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 sm:grid-cols-3 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
              ✓
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              Quality Products
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Carefully selected styles made for everyday
              comfort and confidence.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
              ↗
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              Easy Shopping
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Browse collections, discover your favorites
              and shop with ease.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
              ★
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              Designed for You
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Modern styles that make it easy to build a
              wardrobe you love.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-black text-white">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            Find your style
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            Your wardrobe. Your rules.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-gray-400">
            Explore our complete collection and find
            pieces that work for every part of your day.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-block rounded-xl bg-white px-7 py-4 text-sm font-semibold text-black"
          >
            Explore Shop
          </Link>
        </div>
      </section>
    </main>
  );
}