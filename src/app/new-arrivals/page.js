import ProductListing from "@/components/ProductListing";
import { getNewArrivals } from "@/lib/products";

export default async function NewArrivalsPage({
  searchParams,
}) {
  const params = await searchParams;

  const products = getNewArrivals();

  return (
    <ProductListing
      title="New Arrivals"
      description="Discover the latest additions to our fashion collection."
      products={products}
      searchParams={params}
    />
  );
}