import { useStorefront } from "./StorefrontContext.jsx";

export function ProductsProvider({ children }) {
  return children;
}

export const useProducts = () => {
  return useStorefront();
};
