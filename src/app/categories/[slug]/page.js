import ShopClient from "@/components/ShopClient";

export default async function CategoryPage({
  params,
}) {
  const { slug } = await params;

  const categoryName = decodeURIComponent(slug);

  return (
    <ShopClient
      initialParams={{
        category: categoryName,
        page: "1",
        sort: "newest",
      }}
    />
  );
}