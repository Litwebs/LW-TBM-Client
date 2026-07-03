import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import { ProductsProvider } from "./context/ProductsContext.jsx";
import { StorefrontProvider } from "./context/StorefrontContext.jsx";
import "./styles/global.css";

const redirect = sessionStorage.getItem("redirect");

if (redirect) {
  sessionStorage.removeItem("redirect");
  window.history.replaceState(null, "", redirect);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <StorefrontProvider>
          <ProductsProvider>
            <AppProvider>
              <App />
            </AppProvider>
          </ProductsProvider>
        </StorefrontProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
