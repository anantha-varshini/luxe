import ProductCard from "@/components/ProductCard";

export default function ProductGrid({
  products = [],
  emptyMessage = "No products found.",
}) {
  if (!products.length) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center rounded-2xl border border-dashed border-gray-300">
        <p className="text-gray-500">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
        />
      ))}
    </div>
  );
} 