import useSWR, { mutate } from "swr";
import { useRouter } from "next/router";
import { useState } from "react";
import { ProductCard } from "./Product.styled";
import { StyledLink } from "../Link/Link.styled";
import Comments from "../Comments";
import ProductForm from "../ProductForm";

export default function Product() {
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading } = useSWR(`/api/products/${id}`);
  const [isEditMode, setIsEditMode] = useState(false);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data) {
    return null;
  }

  async function handleEditProduct(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const productData = Object.fromEntries(formData);

    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      console.error(response.status);
      return;
    }

    setIsEditMode(false);
    mutate(`/api/products/${id}`);
  }

  async function handleDeleteProduct(productId) {
    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      const data = await response.json();
      router.push("/");
    } else {
      console.error(response.status);
    }
  }

  return (
    <ProductCard>
      <h2>{data.name}</h2>
      <p>Description: {data.description}</p>
      <p>
        Price: {data.price} {data.currency}
      </p>
      {data.reviews.length > 0 && <Comments reviews={data.reviews} />}
      <StyledLink href="/">Back to all</StyledLink>
      <button type="button" onClick={() => setIsEditMode(!isEditMode)}>
        {isEditMode ? "Cancel" : "Edit"}
      </button>
      <button type="button" onClick={() => handleDeleteProduct(id)}>
        Delete
      </button>
      {isEditMode && (
        <ProductForm onSubmit={handleEditProduct} formHeading="Edit Fish" />
      )}
    </ProductCard>
  );
}
