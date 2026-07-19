import { Navigate, useParams } from "react-router-dom";

// Preserve legacy category URLs while using the complete collection browser
// (filters, sorting, counts and pagination) as the single category experience.
export default function Category() {
  const { slug } = useParams();
  return <Navigate to={`/collections/${slug || "products"}`} replace />;
}
