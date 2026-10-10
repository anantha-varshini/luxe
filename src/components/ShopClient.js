"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import ProductGrid from "@/components/ProductGrid";

export default function ShopClient({
  initialParams = {},
  title = "Shop",
  description = "Discover our latest collection of fashion, essentials and everyday styles.",
}) {
  const [products, setProducts] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);

  const [params, setParams] = useState({
    search: initialParams.search || "",
    category: initialParams.category || "",
    gender: initialParams.gender || "",
    size: initialParams.size || "",
    color: initialParams.color || "",
    minPrice: initialParams.minPrice || "",
    maxPrice: initialParams.maxPrice || "",
    rating: initialParams.rating || "",
    sort: initialParams.sort || "newest",
    page: initialParams.page || "1",
  });

  const [searchInput, setSearchInput] = useState(
    initialParams.search || ""
  );

  /*
   * LOAD PRODUCTS
   */
  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setLoading(true);

        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== ""
          ) {
            query.set(key, String(value));
          }
        });

        const response = await fetch(
          `/api/products?${query.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch products"
          );
        }

        setProducts(data.products || []);

        setPagination(
          data.pagination || {
            page: 1,
            total: 0,
            totalPages: 1,
          }
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Failed to load products:",
            error
          );

          setProducts([]);

          setPagination({
            page: 1,
            total: 0,
            totalPages: 1,
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [params]);

  /*
   * UPDATE PARAMETERS
   */
  const updateParams = (next) => {
    const cleaned = {
      search: next.search || "",
      category: next.category || "",
      gender: next.gender || "",
      size: next.size || "",
      color: next.color || "",
      minPrice: next.minPrice || "",
      maxPrice: next.maxPrice || "",
      rating: next.rating || "",
      sort: next.sort || "newest",
      page: next.page || "1",
    };

    setParams(cleaned);
    setSearchInput(cleaned.search);

    const query = new URLSearchParams();

    Object.entries(cleaned).forEach(([key, value]) => {
      if (value) {
        query.set(key, value);
      }
    });

    const queryString = query.toString();

    window.history.replaceState(
      null,
      "",
      queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname
    );
  };

  /*
   * SEARCH
   */
  const handleSearch = (e) => {
    e.preventDefault();

    updateParams({
      ...params,
      search: searchInput.trim(),
      page: "1",
    });
  };

  /*
   * CLEAR FILTERS
   *
   * Keep gender on /men, /women and /kids.
   */
  const clearFilters = () => {
    updateParams({
      search: "",
      category: "",
      gender: params.gender || "",
      size: "",
      color: "",
      minPrice: "",
      maxPrice: "",
      rating: "",
      sort: "newest",
      page: "1",
    });
  };

  /*
   * PAGINATION
   */
  const pageNumbers = useMemo(() => {
    const pages = [];

    const currentPage = Number(
      pagination.page || 1
    );

    const totalPages = Number(
      pagination.totalPages || 1
    );

    let start = Math.max(
      1,
      currentPage - 2
    );

    let end = Math.min(
      totalPages,
      start + 4
    );

    if (end - start < 4) {
      start = Math.max(
        1,
        end - 4
      );
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [pagination]);

  /*
   * RENDER
   */
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* HEADER */}

      <div className="mb-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
          Collection
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          {title}
        </h1>

        <p className="mt-3 max-w-2xl text-gray-500">
          {description}
        </p>
      </div>

      {/* SEARCH + SORT */}

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-xl"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={searchInput}
              onChange={(e) =>
                setSearchInput(e.target.value)
              }
              placeholder="Search products..."
              className="w-full rounded-l-xl border border-r-0 border-gray-200 py-3 pl-11 pr-4 outline-none focus:border-black"
            />
          </div>

          <button
            type="submit"
            className="rounded-r-xl bg-black px-6 text-sm font-semibold text-white"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {pagination.total} products
          </span>

          <div className="relative">
            <select
              value={params.sort || "newest"}
              onChange={(e) =>
                updateParams({
                  ...params,
                  sort: e.target.value,
                  page: "1",
                })
              }
              className="appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-10 text-sm outline-none"
            >
              <option value="newest">
                Newest
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="rating">
                Top Rated
              </option>

              <option value="name">
                Name
              </option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            />
          </div>
        </div>
      </div>

      {/* FILTER BAR */}

      <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Filters
          </h2>

          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-red-500 hover:underline"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {/* CATEGORY */}

          <select
            value={params.category}
            onChange={(e) =>
              updateParams({
                ...params,
                category: e.target.value,
                page: "1",
              })
            }
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black"
          >
            <option value="">
              All Categories
            </option>

            <option value="Shirts">
              Shirts
            </option>

            <option value="T-Shirts">
              T-Shirts
            </option>

            <option value="Jeans">
              Jeans
            </option>

            <option value="Trousers">
              Trousers
            </option>

            <option value="Dresses">
              Dresses
            </option>

            <option value="Jackets">
              Jackets
            </option>

            <option value="Hoodies">
              Hoodies
            </option>

            <option value="Sweaters">
              Sweaters
            </option>

            <option value="Skirts">
              Skirts
            </option>

            <option value="Accessories">
              Accessories
            </option>

            <option value="Shoes">
              Shoes
            </option>
          </select>

          {/* GENDER */}

          <select
            value={params.gender}
            onChange={(e) =>
              updateParams({
                ...params,
                gender: e.target.value,
                page: "1",
              })
            }
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black"
          >
            <option value="">
              All Genders
            </option>

            <option value="Men">
              Men
            </option>

            <option value="Women">
              Women
            </option>

            <option value="Kids">
              Kids
            </option>

            <option value="Unisex">
              Unisex
            </option>
          </select>

          {/* SIZE */}

          <select
            value={params.size}
            onChange={(e) =>
              updateParams({
                ...params,
                size: e.target.value,
                page: "1",
              })
            }
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black"
          >
            <option value="">
              All Sizes
            </option>

            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>

          {/* COLOR */}

          <select
            value={params.color}
            onChange={(e) =>
              updateParams({
                ...params,
                color: e.target.value,
                page: "1",
              })
            }
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black"
          >
            <option value="">
              All Colors
            </option>

            <option value="Black">
              Black
            </option>

            <option value="White">
              White
            </option>

            <option value="Blue">
              Blue
            </option>

            <option value="Red">
              Red
            </option>

            <option value="Green">
              Green
            </option>

            <option value="Beige">
              Beige
            </option>

            <option value="Pink">
              Pink
            </option>

            <option value="Brown">
              Brown
            </option>
          </select>

          {/* MIN PRICE */}

          <select
            value={params.minPrice}
            onChange={(e) =>
              updateParams({
                ...params,
                minPrice: e.target.value,
                page: "1",
              })
            }
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black"
          >
            <option value="">
              Min Price
            </option>

            <option value="500">
              ₹500+
            </option>

            <option value="1000">
              ₹1,000+
            </option>

            <option value="1500">
              ₹1,500+
            </option>

            <option value="2000">
              ₹2,000+
            </option>

            <option value="3000">
              ₹3,000+
            </option>
          </select>

          {/* MAX PRICE */}

          <select
            value={params.maxPrice}
            onChange={(e) =>
              updateParams({
                ...params,
                maxPrice: e.target.value,
                page: "1",
              })
            }
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black"
          >
            <option value="">
              Max Price
            </option>

            <option value="999">
              Under ₹999
            </option>

            <option value="1499">
              Under ₹1,499
            </option>

            <option value="1999">
              Under ₹1,999
            </option>

            <option value="2499">
              Under ₹2,499
            </option>

            <option value="2999">
              Under ₹2,999
            </option>

            <option value="4999">
              Under ₹4,999
            </option>

            <option value="9999">
              Under ₹9,999
            </option>
          </select>

          {/* RATING */}

          <select
            value={params.rating}
            onChange={(e) =>
              updateParams({
                ...params,
                rating: e.target.value,
                page: "1",
              })
            }
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black"
          >
            <option value="">
              Any Rating
            </option>

            <option value="4.5">
              4.5 ★ & above
            </option>

            <option value="4">
              4 ★ & above
            </option>

            <option value="3.5">
              3.5 ★ & above
            </option>

            <option value="3">
              3 ★ & above
            </option>
          </select>
        </div>
      </div>

      {/* PRODUCTS */}

      <div className="w-full min-w-0">
        {loading ? (
          <LoadingGrid />
        ) : (
          <ProductGrid
            products={products}
            emptyMessage="No products match your filters."
          />
        )}

        {/* PAGINATION */}

        {!loading &&
          pagination.totalPages > 1 && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={pagination.page === 1}
                onClick={() =>
                  updateParams({
                    ...params,
                    page: String(
                      pagination.page - 1
                    ),
                  })
                }
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {pageNumbers.map((page) => (
                <button
                  type="button"
                  key={page}
                  onClick={() =>
                    updateParams({
                      ...params,
                      page: String(page),
                    })
                  }
                  className={`h-10 w-10 rounded-lg text-sm ${
                    Number(
                      pagination.page
                    ) === page
                      ? "bg-black text-white"
                      : "border border-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={
                  Number(
                    pagination.page
                  ) >=
                  Number(
                    pagination.totalPages
                  )
                }
                onClick={() =>
                  updateParams({
                    ...params,
                    page: String(
                      Number(
                        pagination.page
                      ) + 1
                    ),
                  })
                }
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

/*
 * LOADING SKELETON
 */

function LoadingGrid() {
  return (
    <div className="grid w-full grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map(
        (_, index) => (
          <div key={index}>
            <div className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-100" />

            <div className="mt-4 h-3 w-20 animate-pulse rounded bg-gray-100" />

            <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-gray-100" />

            <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-gray-100" />
          </div>
        )
      )}
    </div>
  );
}