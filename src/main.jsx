import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import { ProductsProvider } from "./context/ProductsContext.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ProductsProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </ProductsProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);