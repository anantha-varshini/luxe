import { notFound } from "next/navigation";

import ProductDetails from "@/components/ProductDetails";

async function getProduct(id) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  try {
    const response = await fetch(
      `${baseUrl}/api/products/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return data.product || null;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export default async function ProductPage({ params }) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}