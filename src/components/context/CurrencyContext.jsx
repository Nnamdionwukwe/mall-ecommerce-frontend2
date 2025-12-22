import React, { createContext, useContext } from "react";

// Create Currency Context
const CurrencyContext = createContext();

// Currency Provider Component
export function CurrencyProvider({ children }) {
  const formatPrice = (amount, currencyCode = "NGN") => {
    if (!amount || isNaN(amount)) return "₦0.00";

    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCurrencySymbol = (currencyCode = "NGN") => {
    const symbols = {
      NGN: "₦",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };
    return symbols[currencyCode] || "₦";
  };

  const value = {
    formatPrice,
    getCurrencySymbol,
    defaultCurrency: "NGN",
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Custom Hook to use Currency Context
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
