import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { trackAddToCart } from "../lib/analytics.js";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);
//
const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const imageUrl = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.url || value.fileUrl || value.secure_url || value.path || "";
};

export function AppProvider({ children }) {
  const [cart, setCart] = useState(() => load("pl_cart", []));
  const [user, setUser] = useState(() => load("pl_user", null));
  const [recentlyViewed, setRecentlyViewed] = useState(() => load("pl_recent", []));
  const [orders, setOrders] = useState(() => load("pl_orders", []));
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => save("pl_cart", cart), [cart]);
  useEffect(() => save("pl_user", user), [user]);
  useEffect(() => save("pl_recent", recentlyViewed), [recentlyViewed]);
  useEffect(() => save("pl_orders", orders), [orders]);

  const toast = useCallback((message) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const lineUnitPrice = useCallback(
    (line) => Number(line?.variant?.price ?? line?.product?.price ?? 0),
    [],
  );

  const lineImageUrl = useCallback((line) => {
    const selectedVariant = (line?.product?.variants || []).find(
      (variant) => String(variant?.id || "") === String(line?.variant?.variantId || ""),
    );

    return (
      imageUrl(line?.variant?.thumbnailImage) ||
      imageUrl(selectedVariant?.thumbnailImage) ||
      imageUrl(selectedVariant?.images?.[0]) ||
      imageUrl(line?.product?.image)
    );
  }, []);

  const addToCart = useCallback(
    (product, qty = 1, variant = {}) => {
      const normalizedVariant = {
        variantId:
          variant?.variantId ||
          variant?.id ||
          product?.selectedVariantId ||
          product?.variants?.[0]?.id,
        name: variant?.name || variant?.label || "Default",
        price: Number(variant?.price ?? product?.price ?? 0),
        thumbnailImage: variant?.thumbnailImage || null,
      };

      if (!normalizedVariant.variantId) {
        toast("This product has no selectable variant yet.");
        return;
      }

      setCart((prev) => {
        const key = `${product.id}:${normalizedVariant.variantId}`;
        const existing = prev.find((it) => it.key === key);
        if (existing) {
          return prev.map((it) =>
            it.key === key ? { ...it, qty: it.qty + qty, variant: normalizedVariant } : it,
          );
        }
        return [...prev, { key, product, qty, variant: normalizedVariant }];
      });

      trackAddToCart({
        product,
        variant: normalizedVariant,
        quantity: qty,
      });

      setCartOpen(true);
      toast(`Added: ${product.title.slice(0, 40)}`);
    },
    [toast],
  );

  const updateQty = (key, qty) =>
    setCart((prev) => prev.map((it) => (it.key === key ? { ...it, qty: Math.max(1, qty) } : it)));
  const removeFromCart = (key) => setCart((prev) => prev.filter((it) => it.key !== key));
  const clearCart = useCallback(() => setCart([]), []);

  const trackView = useCallback((productId) => {
    setRecentlyViewed((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 8));
  }, []);

  const login = (email) => {
    setUser({ email, name: email.split("@")[0] });
    toast("Welcome back");
  };
  const register = (email, name) => {
    setUser({ email, name });
    toast("Account created");
  };
  const logout = () => {
    setUser(null);
    toast("Signed out");
  };

  const placeOrder = (details, items, total) => {
    const order = {
      id: "PL" + Date.now().toString().slice(-8),
      date: new Date().toISOString(),
      items,
      total,
      details,
      status: "Processing",
    };
    setOrders((prev) => [order, ...prev]);
    clearCart();
    return order;
  };

  const upsertOrder = useCallback((orderLike) => {
    if (!orderLike?.id) return;
    setOrders((prev) => {
      const next = [...prev];
      const idx = next.findIndex((o) => o.id === orderLike.id);
      if (idx >= 0) {
        next[idx] = { ...next[idx], ...orderLike };
      } else {
        next.unshift(orderLike);
      }
      return next;
    });
  }, []);

  const subtotal = cart.reduce((s, it) => s + lineUnitPrice(it) * it.qty, 0);
  const cartCount = cart.reduce((s, it) => s + it.qty, 0);

  return (
    <AppCtx.Provider
      value={{
        cart,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        subtotal,
        cartCount,
        lineUnitPrice,
        lineImageUrl,
        user,
        login,
        register,
        logout,
        cartOpen,
        setCartOpen,
        searchOpen,
        setSearchOpen,
        menuOpen,
        setMenuOpen,
        toast,
        toasts,
        recentlyViewed,
        trackView,
        orders,
        placeOrder,
        upsertOrder,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}
