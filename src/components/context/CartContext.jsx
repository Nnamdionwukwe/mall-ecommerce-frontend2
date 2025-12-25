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

        const token = localStorage.getItem("token");

        if (!token) {
          console.log("⚠️ No token found, cart will be empty");
          setCart([]);
          setIsLoading(false);
          return;
        }

        console.log("🔍 Fetching cart from API...");

        const response = await fetch(`${API_BASE_URL}/carts`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log("📦 Cart API Response:", data);

        if (response.ok && data.success) {
          setCart(data.data.items || []);
          console.log(`✅ Cart loaded: ${data.data.items?.length || 0} items`);
        } else {
          console.error("❌ Failed to load cart:", data.message);
          setCart([]);
        }
      } catch (err) {
        console.error("❌ Error loading cart from MongoDB:", err);
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

        if (!token) {
          setError("Please login to add items to cart");
          return;
        }

        console.log(`➕ Adding to cart:`, product.name, "Qty:", quantity);

        const response = await fetch(`${API_BASE_URL}/carts/add`, {
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

        const data = await response.json();
        console.log("➕ Add to cart response:", data);

        if (response.ok && data.success) {
          setCart(data.data.items || []);
          console.log(
            `✅ Item added. Cart now has ${data.data.items?.length || 0} items`
          );
        } else {
          setError(data.message || "Failed to add item");
          console.error("❌ Error adding to cart:", data.message);
        }
      } catch (err) {
        console.error("❌ Error adding to cart:", err);
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

        if (!token) {
          setError("Please login to modify cart");
          return;
        }

        console.log(`🗑️ Removing from cart:`, productId);

        const response = await fetch(
          `${API_BASE_URL}/carts/remove/${productId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        console.log("🗑️ Remove response:", data);

        if (response.ok && data.success) {
          setCart(data.data.items || []);
          console.log(
            `✅ Item removed. Cart now has ${
              data.data.items?.length || 0
            } items`
          );
        } else {
          setError(data.message || "Failed to remove item");
          console.error("❌ Error removing from cart:", data.message);
        }
      } catch (err) {
        console.error("❌ Error removing from cart:", err);
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

        if (!token) {
          setError("Please login to modify cart");
          return;
        }

        console.log(`📝 Updating quantity:`, productId, "New qty:", quantity);

        // Optimistically update the UI first
        setCart((prevCart) =>
          prevCart.map((item) => {
            const itemProductId =
              item.productId?._id || item.productId || item._id;
            const compareId = productId.toString();

            if (itemProductId.toString() === compareId) {
              return { ...item, quantity };
            }
            return item;
          })
        );

        const response = await fetch(
          `${API_BASE_URL}/carts/update/${productId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity }),
          }
        );

        const data = await response.json();
        console.log("📝 Update response:", data);

        if (response.ok && data.success) {
          setCart(data.data.items || []);
          console.log(
            `✅ Quantity updated. Cart now has ${
              data.data.items?.length || 0
            } items`
          );
        } else {
          setError(data.message || "Failed to update quantity");
          console.error("❌ Error updating quantity:", data.message);
          // Reload cart on failure
          const reloadResponse = await fetch(`${API_BASE_URL}/carts`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const reloadData = await reloadResponse.json();
          if (reloadData.success) {
            setCart(reloadData.data.items || []);
          }
        }
      } catch (err) {
        console.error("❌ Error updating quantity:", err);
        setError(err.message);
      }
    },
    [API_BASE_URL, removeFromCart]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to modify cart");
        return;
      }

      console.log(`🗑️ Clearing entire cart`);

      const response = await fetch(`${API_BASE_URL}/carts/clear`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("🗑️ Clear cart response:", data);

      if (response.ok && data.success) {
        setCart([]);
        console.log(`✅ Cart cleared`);
      } else {
        setError(data.message || "Failed to clear cart");
        console.error("❌ Error clearing cart:", data.message);
      }
    } catch (err) {
      console.error("❌ Error clearing cart:", err);
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
