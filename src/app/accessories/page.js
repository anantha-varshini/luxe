import ProductListing from "@/components/ProductListing";

export default async function AccessoriesPage({ searchParams }) {
  const params = await searchParams;

  return (
    <ProductListing
      title="Accessories"
      description="Complete your look with premium accessories and modern essentials."
      searchParams={params || {}}
    />
  );
}