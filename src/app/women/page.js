import ProductListing from "@/components/ProductListing";

export default async function WomenPage({ searchParams }) {
  const params = await searchParams;

  return (
    <ProductListing
      title="Women's Collection"
      description="Discover modern essentials, casual wear and premium styles for women."
      gender="Women"
      searchParams={params || {}}
    />
  );
}