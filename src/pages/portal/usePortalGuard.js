import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCustomerPortalMe, logoutCustomerPortal } from "../../lib/api.js";

const CUSTOMER_CACHE_KEY = "tbm_portal_customer";
let cachedCustomer = null;

function loadCachedCustomer() {
  if (cachedCustomer) return cachedCustomer;

  try {
    const raw = sessionStorage.getItem(CUSTOMER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    cachedCustomer = parsed || null;
    return cachedCustomer;
  } catch {
    return null;
  }
}

function saveCachedCustomer(customer) {
  cachedCustomer = customer || null;

  try {
    if (customer) {
      sessionStorage.setItem(CUSTOMER_CACHE_KEY, JSON.stringify(customer));
    } else {
      sessionStorage.removeItem(CUSTOMER_CACHE_KEY);
    }
  } catch {
    // Best-effort cache only.
  }
}

export function usePortalGuard() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(() => loadCachedCustomer());
  const [loading, setLoading] = useState(() => !loadCachedCustomer());

  const loadCustomer = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);

      try {
        const data = await fetchCustomerPortalMe();
        const nextCustomer = data?.customer || null;
        saveCachedCustomer(nextCustomer);
        setCustomer(nextCustomer);
      } catch {
        saveCachedCustomer(null);
        setCustomer(null);
        navigate("/portal/login", { replace: true });
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  const logout = useCallback(async () => {
    try {
      await logoutCustomerPortal();
    } finally {
      saveCachedCustomer(null);
      setCustomer(null);
      navigate("/portal/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const hasCached = Boolean(loadCachedCustomer());
    loadCustomer({ silent: hasCached });
  }, [loadCustomer]);

  return {
    customer,
    loading,
    reloadCustomer: loadCustomer,
    logout,
  };
}
