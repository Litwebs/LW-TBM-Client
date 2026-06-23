import { products } from "./products.js";

const p = (id) => products.find((x) => x.id === id) || products[0];

export const mockOrders = [
  {
    id: "PL20260612",
    date: "2026-06-12T10:24:00Z",
    status: "Delivered",
    deliveryStatus: "Delivered",
    tracking: "DPD-9381 2204 1188",
    carrier: "DPD",
    eta: "2026-06-15",
    deliveredOn: "2026-06-15T11:42:00Z",
    paymentMethod: { brand: "Visa", last4: "4242", exp: "08/29" },
    shipping: { name: "Hossein Mousavi", line1: "14 Sterling Mews", city: "London", postcode: "E2 8AT", country: "United Kingdom" },
    items: [
      { key: "a1", product: p("p1"), qty: 6, variant: { Colour: "Light Oak", Size: "2400 x 600mm" } },
      { key: "a2", product: p("p9"), qty: 2, variant: { Colour: "Light Oak" } },
    ],
    subtotal: 201.92, shipping_fee: 0, tax: 40.38, total: 242.30,
  },
  {
    id: "PL20260524",
    date: "2026-05-24T16:08:00Z",
    status: "In Transit",
    deliveryStatus: "Out for delivery",
    tracking: "DPD-7711 5520 9914",
    carrier: "DPD",
    eta: "2026-06-25",
    paymentMethod: { brand: "Mastercard", last4: "5318", exp: "01/28" },
    shipping: { name: "Hossein Mousavi", line1: "14 Sterling Mews", city: "London", postcode: "E2 8AT", country: "United Kingdom" },
    items: [
      { key: "b1", product: p("p3"), qty: 4, variant: { Colour: "Walnut", Size: "2400 x 600mm" } },
    ],
    subtotal: 107.96, shipping_fee: 0, tax: 21.59, total: 129.55,
  },
  {
    id: "PL20260418",
    date: "2026-04-18T09:12:00Z",
    status: "Processing",
    deliveryStatus: "Preparing for dispatch",
    tracking: null,
    carrier: "Pending",
    eta: "2026-06-27",
    paymentMethod: { brand: "Visa", last4: "4242", exp: "08/29" },
    shipping: { name: "Hossein Mousavi", line1: "Studio 3, 88 Kingsland Rd", city: "London", postcode: "E2 8DA", country: "United Kingdom" },
    items: [
      { key: "c1", product: p("p7"), qty: 3, variant: { Colour: "Black Marble" } },
      { key: "c2", product: p("p15"), qty: 8, variant: { Colour: "Light Oak" } },
    ],
    subtotal: 202.89, shipping_fee: 9.99, tax: 42.58, total: 255.46,
  },
  {
    id: "PL20260227",
    date: "2026-02-27T14:55:00Z",
    status: "Delivered",
    deliveryStatus: "Delivered",
    tracking: "RM-AB12 3456 78GB",
    carrier: "Royal Mail",
    eta: "2026-03-02",
    deliveredOn: "2026-03-02T13:20:00Z",
    paymentMethod: { brand: "PayPal", last4: "—", exp: "—" },
    shipping: { name: "Hossein Mousavi", line1: "14 Sterling Mews", city: "London", postcode: "E2 8AT", country: "United Kingdom" },
    items: [
      { key: "d1", product: p("p19"), qty: 1, variant: {} },
    ],
    subtotal: 356, shipping_fee: 0, tax: 71.20, total: 427.20,
  },
  {
    id: "PL20251119",
    date: "2025-11-19T08:31:00Z",
    status: "Refunded",
    deliveryStatus: "Returned",
    tracking: "DPD-4401 9911 0023",
    carrier: "DPD",
    eta: "2025-11-22",
    paymentMethod: { brand: "Visa", last4: "4242", exp: "08/29" },
    shipping: { name: "Hossein Mousavi", line1: "14 Sterling Mews", city: "London", postcode: "E2 8AT", country: "United Kingdom" },
    items: [
      { key: "e1", product: p("p8"), qty: 2, variant: { Colour: "Mirror Gold" } },
    ],
    subtotal: 75.98, shipping_fee: 0, tax: 15.20, total: 91.18,
  },
];

export const mockAddresses = [
  { id: "ad1", label: "Home", name: "Hossein Mousavi", line1: "14 Sterling Mews", line2: "", city: "London", postcode: "E2 8AT", country: "United Kingdom", phone: "+44 7700 900418", default: true },
  { id: "ad2", label: "Studio", name: "Hossein Mousavi", line1: "Studio 3, 88 Kingsland Rd", line2: "Shoreditch", city: "London", postcode: "E2 8DA", country: "United Kingdom", phone: "+44 7700 900418", default: false },
];

export const mockPayments = [
  { id: "pm1", brand: "Visa", last4: "4242", exp: "08/29", holder: "H. Mousavi", default: true },
  { id: "pm2", brand: "Mastercard", last4: "5318", exp: "01/28", holder: "H. Mousavi", default: false },
  { id: "pm3", brand: "PayPal", last4: "—", exp: "—", holder: "hm.mousavi.02@gmail.com", default: false },
];

export const statusTone = (status) => {
  switch (status) {
    case "Delivered": return { bg: "#e8f3ec", fg: "#1f6b3a" };
    case "In Transit": return { bg: "#eaf0fb", fg: "#244a9a" };
    case "Processing": return { bg: "#fbf3e3", fg: "#8a6a1e" };
    case "Refunded": return { bg: "#f5e9e9", fg: "#8a2a2a" };
    default: return { bg: "#eee", fg: "#333" };
  }
};