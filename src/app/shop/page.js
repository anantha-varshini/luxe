import ShopClient from "@/components/ShopClient";

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;

  return (
    <ShopClient
      initialParams={{
        search: params?.search || "",
        category: params?.category || "",
        gender: params?.gender || "",
        size: params?.size || "",
        color: params?.color || "",
        minPrice: params?.minPrice || "",
        maxPrice: params?.maxPrice || "",
        sort: params?.sort || "newest",
        page: params?.page || "1",
      }}
    />
  );
}