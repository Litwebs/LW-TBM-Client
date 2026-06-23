import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
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

  const addToCart = useCallback((product, qty = 1, variant = {}) => {
    setCart((prev) => {
      const key = product.id + JSON.stringify(variant);
      const existing = prev.find((it) => it.key === key);
      if (existing) return prev.map((it) => it.key === key ? { ...it, qty: it.qty + qty } : it);
      return [...prev, { key, product, qty, variant }];
    });
    setCartOpen(true);
    toast(`Added: ${product.title.slice(0, 40)}`);
  }, [toast]);

  const updateQty = (key, qty) => setCart((prev) => prev.map((it) => it.key === key ? { ...it, qty: Math.max(1, qty) } : it));
  const removeFromCart = (key) => setCart((prev) => prev.filter((it) => it.key !== key));
  const clearCart = () => setCart([]);

  const trackView = useCallback((productId) => {
    setRecentlyViewed((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 8));
  }, []);

  const login = (email) => { setUser({ email, name: email.split("@")[0] }); toast("Welcome back"); };
  const register = (email, name) => { setUser({ email, name }); toast("Account created"); };
  const logout = () => { setUser(null); toast("Signed out"); };

  const placeOrder = (details, items, total) => {
    const order = { id: "PL" + Date.now().toString().slice(-8), date: new Date().toISOString(), items, total, details, status: "Processing" };
    setOrders((prev) => [order, ...prev]);
    clearCart();
    return order;
  };

  const subtotal = cart.reduce((s, it) => s + it.product.price * it.qty, 0);
  const cartCount = cart.reduce((s, it) => s + it.qty, 0);

  return (
    <AppCtx.Provider value={{
      cart, addToCart, updateQty, removeFromCart, clearCart, subtotal, cartCount,
      user, login, register, logout,
      cartOpen, setCartOpen, searchOpen, setSearchOpen, menuOpen, setMenuOpen,
      toast, toasts, recentlyViewed, trackView, orders, placeOrder,
    }}>{children}</AppCtx.Provider>
  );
}