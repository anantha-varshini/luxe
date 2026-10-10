import ProductListing from "@/components/ProductListing";

export default async function KidsPage({ searchParams }) {
  const params = await searchParams;

  return (
    <ProductListing
      title="Kids Collection"
      description="Comfortable and stylish everyday fashion for kids."
      gender="Kids"
      searchParams={params || {}}
    />
  );
}