import ProductListing from "@/components/ProductListing";
import { getSaleProducts } from "@/lib/products";

export default async function SalePage({
  searchParams,
}) {
  const params = await searchParams;

  const products = getSaleProducts();

  return (
    <ProductListing
      title="Sale"
      description="Shop selected styles at special prices."
      products={products}
      searchParams={params}
    />
  );
}