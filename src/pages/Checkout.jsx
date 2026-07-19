import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldIcon, ToolIcon, TruckIcon } from "../components/Icons.jsx";
import { useApp } from "../context/AppContext.jsx";
import { useStorefront } from "../context/StorefrontContext.jsx";
import {
  fetchCustomerPortalMe,
  fetchPublicDeliveryOptions,
  fetchPublicDeliveryFee,
  fetchPublicOrderByCheckoutSession,
} from "../lib/api.js";
import { trackBeginCheckout, trackPurchase } from "../lib/analytics.js";
import Seo from "../components/Seo.jsx";
import VariantAttributes from "../components/VariantAttributes.jsx";

function toUiStatus(apiStatus) {
  if (apiStatus === "refunded" || apiStatus === "partially_refunded") return "Refunded";
  if (apiStatus === "failed" || apiStatus === "cancelled") return "Cancelled";
  if (apiStatus === "paid" || apiStatus === "partially_paid" || apiStatus === "pending") {
    return "Processing";
  }
  return "Processing";
}

function toUiDeliveryStatus(apiDeliveryStatus) {
  if (!apiDeliveryStatus) return "Ordered";
  return String(apiDeliveryStatus)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const CHECKOUT_STAGES = ["Ordered", "Paid", "Dispatched", "In transit", "Delivered"];
const CHECKOUT_CONFIRMATION_STEPS = [
  {
    key: "confirmed",
    title: "Payment Confirmed",
    description: "Your payment has been processed successfully.",
    Icon: ShieldIcon,
  },
  {
    key: "prepared",
    title: "Being Prepared",
    description: "Your items will be carefully packed.",
    Icon: ToolIcon,
  },
  {
    key: "delivery",
    title: "Out for Delivery",
    description: "Your order will be delivered to your door.",
    Icon: TruckIcon,
  },
];

function getCheckoutStageIndex(order) {
  const deliveryStatus = String(order?.deliveryStatus || "").toLowerCase();
  if (deliveryStatus === "delivered") return 4;
  if (deliveryStatus === "in transit" || deliveryStatus === "in_transit") return 3;
  if (deliveryStatus === "dispatched") return 2;
  if (String(order?.status || "").toLowerCase() === "processing") return 1;
  return 0;
}

function getConfirmationStepState(doneStageIndex, index) {
  if (doneStageIndex >= 4) return "done";
  if (index === 0) return "done";
  if (doneStageIndex >= 3) return index <= 2 ? (index < 2 ? "done" : "active") : "pending";
  if (doneStageIndex >= 1) return index <= 1 ? (index < 1 ? "done" : "active") : "pending";
  return index === 0 ? "active" : "pending";
}

function CheckoutConfirmationPending({ navigate }) {
  return (
    <div className="container checkout-complete-shell">
      <Seo
        title="Order Confirmation"
        description="Your payment was successful and your order is being prepared."
        path="/checkout/success"
      />
      <section className="checkout-complete-hero">
        <div className="checkout-complete-badge" aria-hidden="true">
          <ShieldIcon />
        </div>
        <h1 className="checkout-complete-title">Thank You for Your Order!</h1>
        <p className="checkout-complete-subtitle">
          Your payment was successful and your order is being prepared.
        </p>
      </section>

      <section className="checkout-complete-panel">
        <div className="checkout-progress-list">
          {CHECKOUT_CONFIRMATION_STEPS.map(({ key, title, description, Icon }, index) => {
            const state = index === 0 ? "done" : index === 1 ? "active" : "pending";
            return (
              <div className={`checkout-progress-item is-${state}`} key={key}>
                <div className="checkout-progress-icon">
                  <Icon />
                </div>
                <div>
                  <h2>{title}</h2>
                  <p>{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="checkout-confirmation-note">
        A confirmation email has been sent with your order details and tracking information.
      </section>

      <section className="checkout-complete-meta">
        <div className="checkout-complete-actions">
          <button
            onClick={() => navigate("/collections/products")}
            className="btn checkout-complete-primary-btn"
          >
            Continue Shopping
          </button>
        </div>
      </section>
    </div>
  );
}

export default function Checkout() {
  const {
    cart,
    subtotal,
    clearCart,
    upsertOrder,
    updateQty,
    user,
    toast,
    lineUnitPrice,
    lineImageUrl,
  } = useApp();
  const { createCheckoutOrder, validateDiscountForCart } = useStorefront();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlDiscountCode = searchParams.get("discount") || "";
  const sessionId = searchParams.get("session_id") || "";
  const isSuccessView = location.pathname === "/checkout/success";
  const isCancelView = location.pathname === "/checkout/cancel";
  const [form, setForm] = useState({
    email: user?.email || "",
    firstName: user?.name || "",
    lastName: "",
    phone: "",
    address: "",
    address2: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    billingAddress: "",
    billingAddress2: "",
    billingCity: "",
    billingPostcode: "",
    billingCountry: "United Kingdom",
    notes: "",
  });
  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsAcceptedAt, setTermsAcceptedAt] = useState("");
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(1);
  const [deliveryFeeLoading, setDeliveryFeeLoading] = useState(true);
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [deliveryMethodCode, setDeliveryMethodCode] = useState("");
  const [vatRate, setVatRate] = useState(0);
  const [vatIncludedInPrices, setVatIncludedInPrices] = useState(true);
  const [discountInput, setDiscountInput] = useState(String(urlDiscountCode || "").toUpperCase());
  const [appliedDiscountCode, setAppliedDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountApplying, setDiscountApplying] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [portalCustomer, setPortalCustomer] = useState(null);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const loadedSessionRef = useRef("");
  const checkoutTrackedRef = useRef("");
  const termsRef = useRef(null);
  const checkoutEmail =
    sessionStorage.getItem("tbm_checkout_email") || form.email || user?.email || "";
  const savedAddresses = useMemo(
    () =>
      (portalCustomer?.addresses || []).filter(
        (address) =>
          String(address?.line1 || "").trim() &&
          String(address?.city || "").trim() &&
          String(address?.postcode || "").trim(),
      ),
    [portalCustomer?.addresses],
  );
  const hasSavedAddresses = savedAddresses.length > 0;

  const totalBeforeDiscount = subtotal + deliveryFee;
  const total = Math.max(0, totalBeforeDiscount - discountAmount);
  const vatAmount =
    vatRate > 0
      ? vatIncludedInPrices
        ? Number(((total * vatRate) / (100 + vatRate)).toFixed(2))
        : Number(((total * vatRate) / 100).toFixed(2))
      : 0;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const doneStageIndex = done ? getCheckoutStageIndex(done) : 0;

  useEffect(() => {
    if (isSuccessView || isCancelView) return;
    if (!cart.length) return;

    const signature = cart.map((line) => `${line.key}:${line.qty}`).join("|");
    if (!signature || checkoutTrackedRef.current === signature) return;

    checkoutTrackedRef.current = signature;
    trackBeginCheckout({
      cart,
      lineUnitPrice,
      coupon: appliedDiscountCode || undefined,
    });
  }, [appliedDiscountCode, cart, isCancelView, isSuccessView, lineUnitPrice]);

  useEffect(() => {
    if (isSuccessView || isCancelView) return;

    let cancelled = false;
    const loadDeliveryFee = async () => {
      setDeliveryFeeLoading(true);
      try {
        const optionsPayload = await fetchPublicDeliveryOptions({
          postcode: form.postcode,
          country: form.country,
        });
        if (cancelled) return;

        const options = Array.isArray(optionsPayload?.options) ? optionsPayload.options : [];
        setDeliveryOptions(options);
        setVatRate(Number(optionsPayload?.vatRate || 0));
        setVatIncludedInPrices(Boolean(optionsPayload?.vatIncludedInPrices));

        const fallbackOption = options[0];
        const selectedByBackend = options.find((opt) => opt.code === optionsPayload?.selectedCode);
        const existing = options.find((opt) => opt.code === deliveryMethodCode);
        const nextOption = existing || selectedByBackend || fallbackOption;

        if (nextOption?.code) {
          setDeliveryMethodCode(nextOption.code);
          setDeliveryFee(Number(nextOption.fee || 0));
        } else {
          const fee = await fetchPublicDeliveryFee();
          if (!cancelled) setDeliveryFee(fee);
        }
      } catch {
        if (!cancelled) {
          setDeliveryOptions([]);
          setDeliveryMethodCode("");
          setVatRate(0);
          setVatIncludedInPrices(true);
          try {
            const fee = await fetchPublicDeliveryFee();
            if (!cancelled) setDeliveryFee(fee);
          } catch {
            if (!cancelled) setDeliveryFee(1);
          }
        }
      } finally {
        if (!cancelled) setDeliveryFeeLoading(false);
      }
    };

    const timer = setTimeout(loadDeliveryFee, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [deliveryMethodCode, form.country, form.postcode, isCancelView, isSuccessView]);

  useEffect(() => {
    if (!urlDiscountCode) return;
    setDiscountInput(String(urlDiscountCode).toUpperCase());
  }, [urlDiscountCode]);

  useEffect(() => {
    if (!urlDiscountCode) return;
    if (appliedDiscountCode) return;
    if (!cart.length) return;

    const normalized = String(urlDiscountCode).trim().toUpperCase();
    if (!normalized) return;

    let cancelled = false;
    const validateInitialDiscount = async () => {
      setDiscountApplying(true);
      setDiscountError("");
      try {
        const result = await validateDiscountForCart({
          customer: {
            email: form.email || user?.email,
            firstName: form.firstName || user?.name,
            lastName: form.lastName || "",
            phone: form.phone,
          },
          cartItems: cart,
          discountCode: normalized,
        });
        if (cancelled) return;
        const amount = Number(result?.discountAmount || 0);
        setAppliedDiscountCode(normalized);
        setDiscountAmount(amount > 0 ? amount : 0);
        if (amount <= 0) {
          setDiscountError("Code is valid, but no eligible items were found in your cart.");
        }
      } catch (err) {
        if (!cancelled) {
          setAppliedDiscountCode("");
          setDiscountAmount(0);
          setDiscountError(err?.message || "Invalid discount code");
        }
      } finally {
        if (!cancelled) setDiscountApplying(false);
      }
    };

    validateInitialDiscount();
    return () => {
      cancelled = true;
    };
  }, [
    appliedDiscountCode,
    cart,
    form.email,
    form.firstName,
    form.lastName,
    form.phone,
    urlDiscountCode,
    user?.email,
    user?.name,
    validateDiscountForCart,
  ]);

  useEffect(() => {
    if (!isSuccessView || !sessionId) return;
    if (loadedSessionRef.current === sessionId) return;

    loadedSessionRef.current = sessionId;

    let cancelled = false;

    const loadOrderFromSession = async () => {
      setStatusLoading(true);
      try {
        const payload = await fetchPublicOrderByCheckoutSession(sessionId);
        const apiOrder = payload?.order;
        if (!apiOrder || cancelled) return;

        const normalizedOrder = {
          id: apiOrder.orderId,
          contactEmail: checkoutEmail,
          date: apiOrder.createdAt || new Date().toISOString(),
          status: toUiStatus(apiOrder.status),
          deliveryStatus: toUiDeliveryStatus(apiOrder.deliveryStatus),
          subtotal: Number(apiOrder.subtotal || 0),
          shipping_fee: Number(apiOrder.deliveryFee || 0),
          tax: 0,
          total: Number(apiOrder.total || 0),
          shipping: {
            name: [form.firstName, form.lastName].filter(Boolean).join(" ") || "Customer",
            line1: apiOrder?.deliveryAddress?.line1 || "",
            city: apiOrder?.deliveryAddress?.city || "",
            postcode: apiOrder?.deliveryAddress?.postcode || "",
            country: apiOrder?.deliveryAddress?.country || "United Kingdom",
          },
          paymentMethod: {
            brand: "Stripe",
            last4: "",
            exp: "",
          },
          items: (apiOrder.items || []).map((item, idx) => ({
            key: `${apiOrder.orderId}-${idx}`,
            qty: Number(item.quantity || 1),
            variant: {
              name: item.name || "Variant",
              sku: item.sku || "",
            },
            product: {
              title: item.name || "Item",
              image: "/images/hero-bg.jpg",
              price: Number(item.price || 0),
              slug: "",
            },
          })),
        };

        upsertOrder(normalizedOrder);
        setDone(normalizedOrder);
        clearCart();

        const purchaseKey = `tbm_ga4_purchase_${apiOrder.orderId || sessionId}`;
        if (!sessionStorage.getItem(purchaseKey)) {
          trackPurchase({ order: apiOrder });
          sessionStorage.setItem(purchaseKey, "1");
        }
      } catch (err) {
        if (!cancelled) {
          toast(err?.message || "Could not verify checkout status yet.");
        }
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    };

    loadOrderFromSession();

    return () => {
      cancelled = true;
    };
  }, [
    clearCart,
    checkoutEmail,
    form.firstName,
    form.lastName,
    isSuccessView,
    sessionId,
    toast,
    upsertOrder,
  ]);

  useEffect(() => {
    if (isSuccessView || isCancelView) return;

    let cancelled = false;

    const loadPortalCustomer = async () => {
      try {
        const payload = await fetchCustomerPortalMe();
        const customer = payload?.customer || null;
        if (cancelled || !customer) return;

        setPortalCustomer(customer);
        setForm((prev) => ({
          ...prev,
          email: customer?.email || prev.email,
          firstName: customer?.firstName || prev.firstName,
          lastName: customer?.lastName || prev.lastName,
          phone: customer?.phone || prev.phone,
        }));
      } catch {
        if (!cancelled) setPortalCustomer(null);
      }
    };

    loadPortalCustomer();
    return () => {
      cancelled = true;
    };
  }, [isCancelView, isSuccessView]);

  useEffect(() => {
    if (!hasSavedAddresses) {
      setSelectedAddressIndex(-1);
      return;
    }

    const defaultIndex = savedAddresses.findIndex((address) => Boolean(address?.isDefault));
    setSelectedAddressIndex(defaultIndex >= 0 ? defaultIndex : 0);
  }, [hasSavedAddresses, savedAddresses]);

  useEffect(() => {
    if (isEditingDetails) return;
    if (!hasSavedAddresses || selectedAddressIndex < 0) return;
    const selectedAddress = savedAddresses[selectedAddressIndex];
    if (!selectedAddress) return;

    setForm((prev) => ({
      ...prev,
      address: selectedAddress?.line1 || "",
      address2: selectedAddress?.line2 || "",
      city: selectedAddress?.city || "",
      postcode: selectedAddress?.postcode || "",
      country: selectedAddress?.country || "United Kingdom",
    }));
  }, [hasSavedAddresses, isEditingDetails, savedAddresses, selectedAddressIndex]);

  const validate = () => {
    const e = {};
    const required =
      hasSavedAddresses && !isEditingDetails
        ? []
        : ["firstName", "lastName", "address", "city", "postcode", "country"];

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email address";
    }

    required.forEach((f) => {
      if (!String(form[f] || "").trim()) e[f] = "This field is required";
    });

    if (form.firstName.trim() && form.firstName.trim().length > 100) {
      e.firstName = "First name must be 100 characters or less";
    }

    if (form.lastName.trim() && form.lastName.trim().length > 100) {
      e.lastName = "Last name must be 100 characters or less";
    }

    if (!form.phone.trim()) {
      e.phone = "Phone is required";
    } else if (!/^\+?[0-9()\-\s]{7,20}$/.test(form.phone.trim())) {
      e.phone = "Enter a valid phone number";
    }

    if (hasSavedAddresses && !isEditingDetails && selectedAddressIndex < 0) {
      e.selectedAddress = "Select a delivery address";
    }

    if (form.address.trim() && form.address.trim().length < 3) {
      e.address = "Address must be at least 3 characters";
    }

    if (form.city.trim() && form.city.trim().length < 2) {
      e.city = "City must be at least 2 characters";
    }

    if (form.postcode.trim() && form.postcode.trim().length < 3) {
      e.postcode = "Postcode must be at least 3 characters";
    }

    if (form.notes.trim().length > 1000) {
      e.notes = "Order notes must be 1000 characters or less";
    }

    if (!billingSameAsDelivery) {
      ["billingAddress", "billingCity", "billingPostcode", "billingCountry"].forEach((field) => {
        if (!String(form[field] || "").trim()) e[field] = "This field is required";
      });
      if (form.billingAddress.trim() && form.billingAddress.trim().length < 3) {
        e.billingAddress = "Address must be at least 3 characters";
      }
      if (form.billingCity.trim() && form.billingCity.trim().length < 2) {
        e.billingCity = "City must be at least 2 characters";
      }
      if (form.billingPostcode.trim() && form.billingPostcode.trim().length < 3) {
        e.billingPostcode = "Postcode must be at least 3 characters";
      }
    }

    if (!termsAccepted)
      e.termsAccepted = "You must accept the Terms & Conditions and Privacy Policy";

    if (!deliveryMethodCode) {
      e.deliveryMethod = "Select a delivery option";
    }

    setErrors(e);
    if (e.termsAccepted) {
      window.requestAnimationFrame(() => {
        termsRef.current?.focus();
        termsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
    return Object.keys(e).length === 0;
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedAddress =
      hasSavedAddresses && !isEditingDetails && selectedAddressIndex >= 0
        ? savedAddresses[selectedAddressIndex]
        : null;

    if (hasSavedAddresses && !isEditingDetails && !selectedAddress) {
      setErrors((prev) => ({ ...prev, selectedAddress: "Select a delivery address" }));
      return;
    }

    setSubmitting(true);
    try {
      const address = {
        line1: selectedAddress?.line1 || form.address,
        line2: selectedAddress?.line2 || form.address2,
        city: selectedAddress?.city || form.city,
        postcode: selectedAddress?.postcode || form.postcode,
        country: selectedAddress?.country || form.country,
      };
      const billingAddress = billingSameAsDelivery
        ? { ...address }
        : {
            line1: form.billingAddress,
            line2: form.billingAddress2,
            city: form.billingCity,
            postcode: form.billingPostcode,
            country: form.billingCountry,
          };

      const created = await createCheckoutOrder({
        customer: {
          email: form.email,
          firstName: form.firstName || portalCustomer?.firstName || "",
          lastName: form.lastName || portalCustomer?.lastName || "",
          phone: form.phone,
          address,
        },
        cartItems: cart,
        deliveryAddress: address,
        billingAddress,
        billingSameAsDelivery,
        deliveryMethod: {
          code: deliveryMethodCode,
        },
        legalAcceptance: {
          accepted: true,
          acceptedAt: termsAcceptedAt || new Date().toISOString(),
          acceptedSource: "checkout_ui",
          termsVersion: "2026-07-14",
          policyUrls: {
            terms: `${window.location.origin}/policies#terms`,
            privacy: `${window.location.origin}/policies#privacy`,
            shipping: `${window.location.origin}/policies#shipping`,
            returns: `${window.location.origin}/policies#returns`,
          },
        },
        customerInstructions: form.notes,
        discountCode: appliedDiscountCode || undefined,
      });

      if (created?.checkoutUrl) {
        sessionStorage.setItem("tbm_checkout_email", form.email);
        window.location.assign(created.checkoutUrl);
        return;
      }

      throw new Error("Could not start secure checkout.");
    } catch (err) {
      toast(err?.message || "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isCancelView) {
    return (
      <div
        className="container"
        style={{
          padding: "80px 0",
          textAlign: "center",
          minHeight: "52vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Seo
          title="Checkout Cancelled"
          description="Your checkout was cancelled. Your basket has been kept so you can try again."
          path="/checkout/cancel"
        />
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 40,
            fontWeight: 400,
            letterSpacing: "0.05em",
            marginBottom: 16,
            color: "#fff",
          }}
        >
          Checkout Cancelled
        </h1>
        <p className="muted" style={{ marginBottom: 28, color: "var(--dm-ink-soft)" }}>
          No payment was taken. Your cart is still saved.
        </p>
        <div
          style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}
        >
          <button onClick={() => navigate("/checkout")} className="btn checkout-submit-btn">
            Return to Checkout
          </button>
          <button onClick={() => navigate("/cart")} className="btn btn-outline">
            View Cart
          </button>
        </div>
      </div>
    );
  }

  if (isSuccessView && statusLoading) {
    return <CheckoutConfirmationPending navigate={navigate} />;
  }

  if (isSuccessView && !done) {
    return <CheckoutConfirmationPending navigate={navigate} />;
  }

  if (done)
    return (
      <div className="container checkout-complete-shell">
        <Seo
          title="Checkout"
          description="Complete your wall panel order with fast UK delivery."
          path="/checkout"
        />
        <section className="checkout-complete-hero">
          <div className="checkout-complete-badge" aria-hidden="true">
            <ShieldIcon />
          </div>
          <h1 className="checkout-complete-title">Thank You for Your Order!</h1>
          <p className="checkout-complete-subtitle">
            Your payment was successful and your order is being prepared.
          </p>
        </section>

        <section className="checkout-complete-panel">
          <div className="checkout-progress-list">
            {CHECKOUT_CONFIRMATION_STEPS.map(({ key, title, description, Icon }, index) => {
              const state = getConfirmationStepState(doneStageIndex, index);
              return (
                <div className={`checkout-progress-item is-${state}`} key={key}>
                  <div className="checkout-progress-icon">
                    <Icon />
                  </div>
                  <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="checkout-confirmation-note">
          A confirmation email has been sent with your order details and tracking information.
        </section>

        <section className="checkout-complete-meta">
          <p>
            Order <strong>{done.id}</strong>
          </p>
          <p>{done.contactEmail || checkoutEmail || "your email"}</p>
          <div className="checkout-complete-actions">
            <button
              onClick={() => navigate("/collections/products")}
              className="btn checkout-complete-primary-btn"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate(`/account/orders/${done.id}`)}
              className="btn btn-outline checkout-complete-secondary-btn"
            >
              View Order
            </button>
          </div>
        </section>
      </div>
    );

  if (cart.length === 0)
    return (
      <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
        <h2>Your cart is empty.</h2>
        <button onClick={() => navigate("/collections/products")} className="btn mt-32">
          Shop Panels
        </button>
      </div>
    );

  const applyDiscount = async (event) => {
    event?.preventDefault?.();
    const normalized = String(discountInput || "")
      .trim()
      .toUpperCase();
    if (!normalized) return;

    setDiscountApplying(true);
    setDiscountError("");
    try {
      const result = await validateDiscountForCart({
        customer: {
          email: form.email || user?.email,
          firstName: form.firstName || user?.name,
          lastName: form.lastName || "",
          phone: form.phone,
        },
        cartItems: cart,
        discountCode: normalized,
      });

      const amount = Number(result?.discountAmount || 0);
      setAppliedDiscountCode(normalized);
      setDiscountAmount(amount > 0 ? amount : 0);
      if (amount <= 0) {
        setDiscountError("Code is valid, but no eligible items were found in your cart.");
      }
    } catch (err) {
      setAppliedDiscountCode("");
      setDiscountAmount(0);
      setDiscountError(err?.message || "Invalid discount code");
    } finally {
      setDiscountApplying(false);
    }
  };

  const clearDiscount = () => {
    setAppliedDiscountCode("");
    setDiscountAmount(0);
    setDiscountError("");
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Checkout</h1>
      </div>
      <form onSubmit={submit} className="checkout-layout">
        <div>
          <h3 style={{ fontSize: 13, letterSpacing: "0.18em", marginBottom: 20 }}>Contact</h3>
          <div className="form-row">
            <label>Email</label>
            <input
              className={errors.email ? "is-invalid" : ""}
              value={form.email}
              readOnly={Boolean(portalCustomer?.email) && !isEditingDetails}
              onChange={(e) => update("email", e.target.value)}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div className="form-row">
            <label>Phone</label>
            <input
              className={errors.phone ? "is-invalid" : ""}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
            {errors.phone && <div className="form-error">{errors.phone}</div>}
          </div>

          <h3 style={{ fontSize: 13, letterSpacing: "0.18em", margin: "32px 0 20px" }}>
            Delivery Address
          </h3>
          {hasSavedAddresses && !isEditingDetails ? (
            <>
              <p className="muted" style={{ marginBottom: 16 }}>
                Select one of your saved addresses.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-compact"
                  onClick={() => {
                    setIsEditingDetails(true);
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.selectedAddress;
                      return next;
                    });
                  }}
                >
                  Edit details
                </button>
              </div>
              <div className="address-grid checkout-address-grid">
                {savedAddresses.map((address, index) => {
                  const isSelected = index === selectedAddressIndex;
                  return (
                    <label
                      key={`${address.line1}-${address.postcode}-${index}`}
                      className={`address-card checkout-address-card ${isSelected ? "is-selected" : ""}`}
                    >
                      <div className="address-label" style={{ marginBottom: 12 }}>
                        <input
                          type="radio"
                          name="checkout-address"
                          checked={isSelected}
                          onChange={() => setSelectedAddressIndex(index)}
                          style={{ marginRight: 8 }}
                        />
                        {address?.isDefault ? "Default address" : `Address ${index + 1}`}
                      </div>
                      <div className="address-body">
                        {address?.line1}
                        {address?.line2 ? (
                          <>
                            <br />
                            {address.line2}
                          </>
                        ) : null}
                        <br />
                        {address?.city}, {address?.postcode}
                        <br />
                        {address?.country || "United Kingdom"}
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.selectedAddress ? (
                <div className="form-error">{errors.selectedAddress}</div>
              ) : null}
            </>
          ) : (
            <>
              {portalCustomer?.email && hasSavedAddresses ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <p className="muted" style={{ marginBottom: 0 }}>
                    Editing details manually for this order.
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline btn-compact"
                    onClick={() => {
                      setIsEditingDetails(false);
                    }}
                  >
                    Use saved addresses
                  </button>
                </div>
              ) : null}
              {portalCustomer?.email && !hasSavedAddresses ? (
                <p className="muted" style={{ marginBottom: 16 }}>
                  No saved addresses found in your account. Add one now or continue by entering a
                  delivery address below.
                </p>
              ) : null}
              <div className="form-row cols-2">
                <div>
                  <label>First Name</label>
                  <input
                    className={errors.firstName ? "is-invalid" : ""}
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                  />
                  {errors.firstName && <div className="form-error">{errors.firstName}</div>}
                </div>
                <div>
                  <label>Last Name</label>
                  <input
                    className={errors.lastName ? "is-invalid" : ""}
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                  />
                  {errors.lastName && <div className="form-error">{errors.lastName}</div>}
                </div>
              </div>
              <div className="form-row">
                <label>Address line 1</label>
                <input
                  className={errors.address ? "is-invalid" : ""}
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
                {errors.address && <div className="form-error">{errors.address}</div>}
              </div>
              <div className="form-row">
                <label>Address line 2 (optional)</label>
                <input value={form.address2} onChange={(e) => update("address2", e.target.value)} />
              </div>
              <div className="form-row cols-2">
                <div>
                  <label>City</label>
                  <input
                    className={errors.city ? "is-invalid" : ""}
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                  {errors.city && <div className="form-error">{errors.city}</div>}
                </div>
                <div>
                  <label>Postcode</label>
                  <input
                    className={errors.postcode ? "is-invalid" : ""}
                    value={form.postcode}
                    onChange={(e) => update("postcode", e.target.value)}
                  />
                  {errors.postcode && <div className="form-error">{errors.postcode}</div>}
                </div>
              </div>

              <div className="form-row">
                <label>Country</label>
                <input
                  className={errors.country ? "is-invalid" : ""}
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                />
                {errors.country && <div className="form-error">{errors.country}</div>}
              </div>
            </>
          )}

          <h3 style={{ fontSize: 13, letterSpacing: "0.18em", margin: "32px 0 20px" }}>
            Billing Address
          </h3>
          <label className="checkout-choice-row">
            <input
              type="checkbox"
              checked={billingSameAsDelivery}
              onChange={(event) => {
                setBillingSameAsDelivery(event.target.checked);
                setErrors((current) => {
                  const next = { ...current };
                  ["billingAddress", "billingCity", "billingPostcode", "billingCountry"].forEach(
                    (field) => delete next[field],
                  );
                  return next;
                });
              }}
            />
            <span>Use shipping address as billing address</span>
          </label>
          {!billingSameAsDelivery && (
            <div className="checkout-billing-fields">
              <div className="form-row">
                <label>Address line 1</label>
                <input
                  className={errors.billingAddress ? "is-invalid" : ""}
                  value={form.billingAddress}
                  onChange={(event) => update("billingAddress", event.target.value)}
                />
                {errors.billingAddress && <div className="form-error">{errors.billingAddress}</div>}
              </div>
              <div className="form-row">
                <label>Address line 2 (optional)</label>
                <input
                  value={form.billingAddress2}
                  onChange={(event) => update("billingAddress2", event.target.value)}
                />
              </div>
              <div className="form-row cols-2">
                <div>
                  <label>City</label>
                  <input
                    className={errors.billingCity ? "is-invalid" : ""}
                    value={form.billingCity}
                    onChange={(event) => update("billingCity", event.target.value)}
                  />
                  {errors.billingCity && <div className="form-error">{errors.billingCity}</div>}
                </div>
                <div>
                  <label>Postcode</label>
                  <input
                    className={errors.billingPostcode ? "is-invalid" : ""}
                    value={form.billingPostcode}
                    onChange={(event) => update("billingPostcode", event.target.value)}
                  />
                  {errors.billingPostcode && (
                    <div className="form-error">{errors.billingPostcode}</div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <label>Country</label>
                <input
                  className={errors.billingCountry ? "is-invalid" : ""}
                  value={form.billingCountry}
                  onChange={(event) => update("billingCountry", event.target.value)}
                />
                {errors.billingCountry && <div className="form-error">{errors.billingCountry}</div>}
              </div>
            </div>
          )}

          <h3 style={{ fontSize: 13, letterSpacing: "0.18em", margin: "32px 0 20px" }}>
            Delivery Method
          </h3>
          <div className="form-row">
            <label>Choose delivery option</label>
            <select
              className={errors.deliveryMethod ? "is-invalid" : ""}
              value={deliveryMethodCode}
              onChange={(event) => {
                const code = event.target.value;
                setDeliveryMethodCode(code);
                const selectedOption = deliveryOptions.find((opt) => opt.code === code);
                if (selectedOption) {
                  setDeliveryFee(Number(selectedOption.fee || 0));
                }
                setErrors((current) => ({ ...current, deliveryMethod: undefined }));
              }}
            >
              {!deliveryOptions.length ? <option value="">Standard delivery</option> : null}
              {deliveryOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label} - A3{Number(option.fee || 0).toFixed(2)}
                </option>
              ))}
            </select>
            {errors.deliveryMethod && <div className="form-error">{errors.deliveryMethod}</div>}
          </div>

          <h3 style={{ fontSize: 13, letterSpacing: "0.18em", margin: "32px 0 20px" }}>Payment</h3>
          <p className="muted" style={{ marginBottom: 8 }}>
            You will be redirected to secure Stripe checkout to complete payment.
          </p>

          <h3 style={{ fontSize: 13, letterSpacing: "0.18em", margin: "32px 0 20px" }}>
            Order Notes (optional)
          </h3>
          <div className="form-row">
            <textarea
              className={errors.notes ? "is-invalid" : ""}
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Delivery instructions, etc."
            />
            {errors.notes && <div className="form-error">{errors.notes}</div>}
          </div>
        </div>
        <div className="summary">
          <h3>Order Summary</h3>
          {cart.map((it) => (
            <div key={it.key} style={{ display: "flex", gap: 12, padding: "10px 0", fontSize: 13 }}>
              <img
                src={lineImageUrl(it)}
                style={{ width: 50, height: 50, objectFit: "cover" }}
                alt=""
              />
              <div style={{ flex: 1 }}>
                <div>{it.product.title}</div>
                <div className="muted">{it.variant?.name || "Default"}</div>
                <VariantAttributes variant={it.variant} compact />
                {Number(it.variant?.compareAtPrice || 0) > Number(lineUnitPrice(it) || 0) ? (
                  <div className="muted" style={{ marginTop: 4 }}>
                    <span style={{ textDecoration: "line-through", marginRight: 8 }}>
                      £{(Number(it.variant?.compareAtPrice || 0) * it.qty).toFixed(2)}
                    </span>
                    <span>£{(Number(lineUnitPrice(it) || 0) * it.qty).toFixed(2)}</span>
                  </div>
                ) : null}
                <div
                  style={{
                    display: "inline-flex",
                    border: "1px solid var(--dm-silver-line-strong)",
                    marginTop: 8,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => updateQty(it.key, it.qty - 1)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRight: "1px solid var(--dm-silver-line-strong)",
                    }}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span
                    style={{ minWidth: 30, display: "grid", placeItems: "center", fontSize: 12 }}
                  >
                    {it.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQty(it.key, it.qty + 1)}
                    style={{
                      width: 26,
                      height: 26,
                      borderLeft: "1px solid var(--dm-silver-line-strong)",
                    }}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>£{(lineUnitPrice(it) * it.qty).toFixed(2)}</div>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <div className="form-row" style={{ marginBottom: 10 }}>
              <label>Discount code</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={discountInput}
                  onChange={(event) => {
                    setDiscountInput(event.target.value.toUpperCase());
                    setDiscountError("");
                  }}
                  placeholder="Enter code"
                />
                <button
                  type="button"
                  onClick={applyDiscount}
                  className="btn btn-outline"
                  disabled={discountApplying || !String(discountInput || "").trim()}
                >
                  {discountApplying ? "Applying..." : "Apply"}
                </button>
                {appliedDiscountCode ? (
                  <button type="button" className="btn btn-outline" onClick={clearDiscount}>
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
            {appliedDiscountCode ? (
              <div className="muted" style={{ marginTop: 4 }}>
                Applied: {appliedDiscountCode}
              </div>
            ) : null}
            {discountError ? <div className="form-error">{discountError}</div> : null}
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{deliveryFeeLoading ? "Loading..." : `£${deliveryFee.toFixed(2)}`}</span>
            </div>
            {appliedDiscountCode ? (
              <div className="summary-row">
                <span>Discount ({appliedDiscountCode})</span>
                <span>-£{discountAmount.toFixed(2)}</span>
              </div>
            ) : null}
            {vatRate > 0 ? (
              <div className="summary-row">
                <span>
                  {vatIncludedInPrices ? `VAT (${vatRate}%) included` : `VAT (${vatRate}%)`}
                </span>
                <span>£{vatAmount.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="summary-row total">
              <span>Total</span>
              <span>{deliveryFeeLoading ? "Calculating..." : `£${total.toFixed(2)}`}</span>
            </div>
          </div>

          <div className={`checkout-terms ${errors.termsAccepted ? "is-invalid" : ""}`}>
            <input
              ref={termsRef}
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) => {
                const checked = event.target.checked;
                setTermsAccepted(checked);
                setTermsAcceptedAt(checked ? new Date().toISOString() : "");
                setErrors((current) => ({ ...current, termsAccepted: undefined }));
              }}
            />
            <span>
              I have read and agree to the{" "}
              <Link to="/policies#terms" target="_blank" rel="noopener noreferrer">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link to="/policies#privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </Link>
              . You can also review our{" "}
              <Link to="/policies#shipping" target="_blank" rel="noopener noreferrer">
                Delivery Policy
              </Link>{" "}
              and{" "}
              <Link to="/policies#returns" target="_blank" rel="noopener noreferrer">
                Returns &amp; Refunds Policy
              </Link>
              .
            </span>
          </div>
          {errors.termsAccepted && (
            <div className="form-error checkout-terms-error">{errors.termsAccepted}</div>
          )}
          <button
            type="submit"
            className="btn btn-full btn-lg mt-32 checkout-submit-btn"
            style={{ marginTop: 24 }}
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
