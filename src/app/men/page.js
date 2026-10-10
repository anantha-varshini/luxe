import ProductListing from "@/components/ProductListing";

export default async function MenPage({ searchParams }) {
  const params = await searchParams;

  return (
    <ProductListing
      title="Men's Collection"
      description="Discover modern essentials, casual wear and premium styles for men."
      gender="Men"
      searchParams={params || {}}
    />
  );
}