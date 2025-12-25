import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

// Create Cart Context
const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://mall-ecommerce-api-production.up.railway.app/api";

  // Fetch cart from MongoDB on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token"); // JWT token from login

        const response = await fetch(`${API_BASE_URL}/cart`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }

        const data = await response.json();

        if (data.success && data.data.items) {
          setCart(data.data.items);
        } else {
          setCart([]);
        }
      } catch (err) {
        console.error("Error loading cart from MongoDB:", err);
        setError(err.message);
        setCart([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [API_BASE_URL]);

  // Add item to cart
  const addToCart = useCallback(
    async (product, quantity = 1) => {
      try {
        setError(null);

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE_URL}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product._id,
            quantity,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add item to cart");
        }

        const data = await response.json();

        if (data.success) {
          setCart(data.data.items);
        }
      } catch (err) {
        console.error("Error adding to cart:", err);
        setError(err.message);
      }
    },
    [API_BASE_URL]
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    async (productId) => {
      try {
        setError(null);

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/cart/remove/${productId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove item from cart");
        }

        const data = await response.json();

        if (data.success) {
          setCart(data.data.items);
        }
      } catch (err) {
        console.error("Error removing from cart:", err);
        setError(err.message);
      }
    },
    [API_BASE_URL]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (productId, quantity) => {
      try {
        setError(null);

        if (quantity <= 0) {
          await removeFromCart(productId);
          return;
        }

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/cart/update/${productId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update quantity");
        }

        const data = await response.json();

        if (data.success) {
          setCart(data.data.items);
        }
      } catch (err) {
        console.error("Error updating quantity:", err);
        setError(err.message);
      }
    },
    [API_BASE_URL, removeFromCart]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setError(null);

      const token = localStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }

      const data = await response.json();

      if (data.success) {
        setCart([]);
      }
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError(err.message);
    }
  }, [API_BASE_URL]);

  // Calculate total price
  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  // Calculate total items
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
    isLoading,
    error,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use Cart Context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
