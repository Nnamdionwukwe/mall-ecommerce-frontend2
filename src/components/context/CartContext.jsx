// import React, {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   useEffect,
// } from "react";

// // Create Cart Context
// const CartContext = createContext();

// const CART_STORAGE_KEY = "cart_items";

// // Cart Provider Component
// export const CartProvider = ({ children }) => {
//   const [cart, setCart] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Load cart from localStorage on mount
//   useEffect(() => {
//     const loadCart = () => {
//       try {
//         const savedCart = localStorage.getItem(CART_STORAGE_KEY);
//         if (savedCart) {
//           setCart(JSON.parse(savedCart));
//         }
//       } catch (error) {
//         console.error("Error loading cart from localStorage:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadCart();
//   }, []);

//   // Save cart to localStorage whenever it changes
//   useEffect(() => {
//     if (!isLoading) {
//       try {
//         localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
//       } catch (error) {
//         console.error("Error saving cart to localStorage:", error);
//       }
//     }
//   }, [cart, isLoading]);

//   // Add item to cart
//   const addToCart = useCallback((product) => {
//     setCart((prevCart) => {
//       const existingItem = prevCart.find((item) => item._id === product._id);

//       if (existingItem) {
//         // Increase quantity if product already exists
//         return prevCart.map((item) =>
//           item._id === product._id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }

//       // Add new product with quantity 1
//       return [...prevCart, { ...product, quantity: 1 }];
//     });
//   }, []);

//   // Remove item from cart
//   const removeFromCart = useCallback((productId) => {
//     setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
//   }, []);

//   // Update item quantity
//   const updateQuantity = useCallback(
//     (productId, quantity) => {
//       if (quantity <= 0) {
//         removeFromCart(productId);
//         return;
//       }

//       setCart((prevCart) =>
//         prevCart.map((item) =>
//           item._id === productId ? { ...item, quantity } : item
//         )
//       );
//     },
//     [removeFromCart]
//   );

//   // Clear entire cart
//   const clearCart = useCallback(() => {
//     setCart([]);
//   }, []);

//   //   const clearCart = () => {
//   //   setCart([]);
//   //   localStorage.removeItem('cart');
//   // };

//   // Calculate total price
//   const totalPrice = cart.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   // Calculate total items
//   const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

//   const value = {
//     cart,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     clearCart,
//     totalPrice,
//     totalItems,
//     isLoading,
//   };

//   return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
// };

// // Custom hook to use Cart Context
// export const useCart = () => {
//   const context = useContext(CartContext);

//   if (!context) {
//     throw new Error("useCart must be used within a CartProvider");
//   }

//   return context;
// };

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const API_BASE = "https://mall-ecommerce-api-production.up.railway.app/api";

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Fetch cart from backend whenever user/token changes
  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      setCart([]);
      setCartCount(0);
    }
  }, [user, token]);

  // Update cart count whenever cart changes
  useEffect(() => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);

    // Dispatch custom event for other components listening
    window.dispatchEvent(
      new CustomEvent("cartUpdated", { detail: { count, cart } })
    );
  }, [cart]);

  // Fetch cart from backend
  const fetchCart = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/carts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("📦 Cart fetched:", data);

      if (data.success) {
        setCart(data.data.items || []);
      }
    } catch (err) {
      console.error("❌ Error fetching cart:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (product) => {
    if (!token) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      setIsLoading(true);
      console.log("🛒 Adding to cart:", product.name);

      const response = await fetch(`${API_BASE}/carts/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      const data = await response.json();
      console.log("✅ Add to cart response:", data);

      if (data.success) {
        // Update local state with the new cart from backend
        setCart(data.data.items || []);
        alert(`${product.name} added to cart!`);
      } else {
        alert(data.message || "Failed to add item to cart");
      }
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      alert("Failed to add item to cart");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/carts/remove/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setCart(data.data.items || []);
      } else {
        alert(data.message || "Failed to remove item");
      }
    } catch (err) {
      console.error("❌ Error removing from cart:", err);
      alert("Failed to remove item");
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    if (!token) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/carts/update/${productId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (data.success) {
        setCart(data.data.items || []);
      } else {
        alert(data.message || "Failed to update quantity");
      }
    } catch (err) {
      console.error("❌ Error updating quantity:", err);
      alert("Failed to update quantity");
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/carts/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setCart([]);
      } else {
        alert(data.message || "Failed to clear cart");
      }
    } catch (err) {
      console.error("❌ Error clearing cart:", err);
      alert("Failed to clear cart");
    }
  };

  // Calculate cart totals
  const getCartTotals = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total,
      itemCount: cartCount,
    };
  };

  const value = {
    cart,
    cartCount,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart,
    getCartTotals,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
