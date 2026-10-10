import ShopClient from "@/components/ShopClient";

export default function ProductListing({
  title,
  description,
  searchParams = {},
  gender = "",
}) {
  return (
    <ShopClient
      title={title}
      description={description}
      initialParams={{
        search: searchParams.search || "",
        category: searchParams.category || "",
        gender:
          gender ||
          searchParams.gender ||
          "",
        size: searchParams.size || "",
        color: searchParams.color || "",
        minPrice:
          searchParams.minPrice || "",
        maxPrice:
          searchParams.maxPrice || "",
        rating:
          searchParams.rating || "",
        sort:
          searchParams.sort || "newest",
        page:
          searchParams.page || "1",
      }}
    />
  );
}