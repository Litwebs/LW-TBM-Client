import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import BrandSpinner from "./components/BrandSpinner.jsx";

import CartDrawer from "./components/CartDrawer.jsx";
import ToastHost from "./components/ToastHost.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ScrollTopButton from "./components/ScrollTopButton.jsx";
import GaPageTracker from "./components/GaPageTracker.jsx";
import CookieConsent from "./components/CookieConsent.jsx";

import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import Category from "./pages/Category.jsx";
import Product from "./pages/Product.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Account from "./pages/Account.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import Addresses from "./pages/Addresses.jsx";
import PaymentMethods from "./pages/PaymentMethods.jsx";
import PortalLogin from "./pages/portal/PortalLogin.jsx";
import PortalDashboard from "./pages/portal/PortalDashboard.jsx";
import PortalOrders from "./pages/portal/PortalOrders.jsx";
import PortalOrderDetails from "./pages/portal/PortalOrderDetails.jsx";
import PortalPayments from "./pages/portal/PortalPayments.jsx";
import PortalAddresses from "./pages/portal/PortalAddresses.jsx";
import PortalProfile from "./pages/portal/PortalProfile.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import Reviews from "./pages/Reviews.jsx";
import FAQs from "./pages/FAQs.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";

const Policies = lazy(() => import("./pages/Policies.jsx"));

export default function App() {
  return (
    <>
      <GaPageTracker />
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections/:slug" element={<Shop />} />
          <Route path="/categories/:slug" element={<Category />} />
          <Route path="/products/:slug" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<Checkout />} />
          <Route path="/checkout/cancel" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account/login" element={<Login />} />
          <Route path="/account/register" element={<Register />} />
          <Route path="/account/forgot" element={<ForgotPassword />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/orders" element={<Orders />} />
          <Route path="/account/orders/:id" element={<OrderDetail />} />
          <Route path="/account/addresses" element={<Addresses />} />
          <Route path="/account/payments" element={<PaymentMethods />} />

          <Route path="/portal/login" element={<PortalLogin />} />
          <Route path="/portal" element={<PortalDashboard />} />
          <Route path="/portal/orders" element={<PortalOrders />} />
          <Route path="/portal/orders/:id" element={<PortalOrderDetails />} />
          <Route path="/portal/payments" element={<PortalPayments />} />
          <Route path="/portal/addresses" element={<PortalAddresses />} />
          <Route path="/portal/profile" element={<PortalProfile />} />

          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/policies"
            element={
              <Suspense fallback={<BrandSpinner label="Loading policies" />}>
                <Policies />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <ToastHost />
      <ScrollTopButton />
      <CookieConsent />
    </>
  );
}
