// import { useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { useAuth } from "../../context/AuthContext";
// import { useCurrency } from "../../context/CurrencyContext";
// import styles from "./CartPage.module.css";
// import { Trash2, Plus, Minus, ShoppingCart, Loader } from "lucide-react";
// import LoginRequiredModal from "../../LoginRequiredModal/LoginRequiredModal";
// import AuthModal from "../../AuthModal/AuthModal";

// const CartPage = () => {
//   const navigate = useNavigate();
//   const { user, token } = useAuth();
//   const { formatPrice } = useCurrency();

//   const [cart, setCart] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [loginModalOpen, setLoginModalOpen] = useState(false);
//   const [showAuth, setShowAuth] = useState(false);

//   const API_BASE = "https://mall-ecommerce-api-production.up.railway.app/api";

//   // Fetch cart from backend
//   const fetchCart = async () => {
//     if (!user || !token) return;

//     try {
//       setLoading(true);
//       const response = await fetch(`${API_BASE}/carts`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const data = await response.json();
//       console.log("📦 Cart fetched:", data);

//       if (data.success) {
//         setCart(data.data.items || []);
//       } else {
//         console.error("Error fetching cart:", data.message);
//       }
//     } catch (err) {
//       console.error("Error fetching cart:", err);
//       setError("Failed to load cart");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load cart on component mount
//   useEffect(() => {
//     if (user && token) {
//       fetchCart();
//     }
//   }, [user, token]);

//   // Remove item from cart
//   const removeFromCart = async (productId) => {
//     if (!token) return;

//     try {
//       const response = await fetch(`${API_BASE}/carts/remove/${productId}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const data = await response.json();
//       console.log("✅ Item removed:", data);

//       if (data.success) {
//         setCart(data.data.items || []);
//         setError("");
//       } else {
//         setError(data.message || "Failed to remove item");
//       }
//     } catch (err) {
//       console.error("Error removing from cart:", err);
//       setError("Failed to remove item");
//     }
//   };

//   // Update item quantity
//   const updateQuantity = async (productId, quantity) => {
//     if (!token) return;

//     if (quantity <= 0) {
//       removeFromCart(productId);
//       return;
//     }

//     try {
//       const response = await fetch(`${API_BASE}/carts/update/${productId}`, {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ quantity }),
//       });

//       const data = await response.json();
//       console.log("✅ Quantity updated:", data);

//       if (data.success) {
//         setCart(data.data.items || []);
//         setError("");
//       } else {
//         setError(data.message || "Failed to update quantity");
//       }
//     } catch (err) {
//       console.error("Error updating quantity:", err);
//       setError("Failed to update quantity");
//     }
//   };

//   // Clear entire cart
//   const clearCart = async () => {
//     if (!window.confirm("Are you sure you want to clear your cart?")) return;

//     if (!token) return;

//     try {
//       const response = await fetch(`${API_BASE}/carts/clear`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const data = await response.json();
//       console.log("✅ Cart cleared:", data);

//       if (data.success) {
//         setCart([]);
//         setError("");
//       } else {
//         setError(data.message || "Failed to clear cart");
//       }
//     } catch (err) {
//       console.error("Error clearing cart:", err);
//       setError("Failed to clear cart");
//     }
//   };

//   // Calculate totals
//   const totalPrice = cart.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );
//   const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
//   const tax = totalPrice * 0.1;
//   const total = totalPrice + tax;

//   const handleCheckout = () => {
//     if (!user) {
//       setLoginModalOpen(true);
//       return;
//     }
//     navigate("/checkout");
//   };

//   const handleLoginRedirect = () => {
//     setLoginModalOpen(false);
//     setShowAuth(true);
//   };

//   if (loading) {
//     return (
//       <div className={styles.container}>
//         <div className={styles.loadingContainer}>
//           <Loader className={styles.spinner} size={40} />
//           <p>Loading your cart...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.container}>
//       <div className={styles.wrapper}>
//         <header className={styles.header}>
//           <h1 className={styles.title}>Shopping Cart</h1>
//         </header>

//         {error && (
//           <div className={styles.errorMessage}>
//             {error}
//             <button onClick={() => setError("")}>✕</button>
//           </div>
//         )}

//         {cart.length === 0 ? (
//           <div className={styles.emptyCart}>
//             <ShoppingCart className={styles.emptyIcon} />
//             <p className={styles.emptyText}>Your cart is empty</p>
//             <button
//               className={styles.continueBtn}
//               onClick={() => navigate("/shop")}
//             >
//               Continue Shopping
//             </button>
//           </div>
//         ) : (
//           <div className={styles.content}>
//             <div className={styles.cartItems}>
//               {cart.map((item) => (
//                 <div
//                   key={item.productId || item._id}
//                   className={styles.cartItem}
//                 >
//                   <img
//                     src={item.image || item.images?.[0]}
//                     alt={item.name}
//                     className={styles.itemImage}
//                     onError={(e) => (e.target.src = "/placeholder.png")}
//                   />
//                   <div className={styles.itemDetails}>
//                     <h3 className={styles.itemName}>{item.name}</h3>
//                     <p className={styles.itemPrice}>
//                       {formatPrice(item.price)}
//                     </p>
//                     <div className={styles.quantityControl}>
//                       <button
//                         onClick={() =>
//                           updateQuantity(
//                             item.productId || item._id,
//                             item.quantity - 1
//                           )
//                         }
//                         className={styles.quantityBtn}
//                         disabled={item.quantity <= 1}
//                       >
//                         <Minus size={16} />
//                       </button>
//                       <input
//                         type="number"
//                         value={item.quantity}
//                         onChange={(e) => {
//                           const newQuantity = parseInt(e.target.value) || 1;
//                           updateQuantity(
//                             item.productId || item._id,
//                             newQuantity
//                           );
//                         }}
//                         className={styles.quantityInput}
//                         min="1"
//                       />
//                       <button
//                         onClick={() =>
//                           updateQuantity(
//                             item.productId || item._id,
//                             item.quantity + 1
//                           )
//                         }
//                         className={styles.quantityBtn}
//                       >
//                         <Plus size={16} />
//                       </button>
//                       <span className={styles.subtotal}>
//                         Subtotal: {formatPrice(item.price * item.quantity)}
//                       </span>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => removeFromCart(item.productId || item._id)}
//                     className={styles.removeBtn}
//                     title="Remove item"
//                   >
//                     <Trash2 size={20} />
//                   </button>
//                 </div>
//               ))}
//             </div>

//             <div className={styles.orderSummary}>
//               <h2 className={styles.summaryTitle}>Order Summary</h2>
//               <div className={styles.summaryDetails}>
//                 <div className={styles.summaryRow}>
//                   <span>Items ({totalItems})</span>
//                   <span>{formatPrice(totalPrice)}</span>
//                 </div>
//                 <div className={styles.summaryRow}>
//                   <span>Shipping</span>
//                   <span className={styles.freeShipping}>Free</span>
//                 </div>
//                 <div className={styles.summaryRow}>
//                   <span>Tax (10%):</span>
//                   <span>{formatPrice(tax)}</span>
//                 </div>
//               </div>
//               <div className={styles.totalSection}>
//                 <span>Total</span>
//                 <span className={styles.totalAmount}>{formatPrice(total)}</span>
//               </div>
//               <button
//                 className={styles.checkoutBtn}
//                 onClick={handleCheckout}
//                 disabled={cart.length === 0}
//               >
//                 Proceed to Checkout
//               </button>
//               <button
//                 className={styles.continueBtn}
//                 onClick={() => navigate("/shop")}
//               >
//                 Continue Shopping
//               </button>
//               {cart.length > 0 && (
//                 <button className={styles.clearBtn} onClick={clearCart}>
//                   Clear Cart
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       <LoginRequiredModal
//         isOpen={loginModalOpen}
//         feature="Checkout"
//         onClose={() => setLoginModalOpen(false)}
//         onLogin={handleLoginRedirect}
//       />

//       {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
//     </div>
//   );
// };

// export default CartPage;

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useCurrency } from "../../context/CurrencyContext";
import styles from "./CartPage.module.css";
import { Trash2, Plus, Minus, ShoppingCart, Loader } from "lucide-react";
import LoginRequiredModal from "../../LoginRequiredModal/LoginRequiredModal";
import AuthModal from "../../AuthModal/AuthModal";

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  // ✅ Use cart context instead of local state
  const {
    cart,
    isLoading,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotals,
    fetchCart,
  } = useCart();

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Fetch cart when component mounts
  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  // Calculate totals using context function
  const { subtotal, tax, total, itemCount } = getCartTotals();

  const handleCheckout = () => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }
    navigate("/checkout");
  };

  const handleLoginRedirect = () => {
    setLoginModalOpen(false);
    setShowAuth(true);
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    await clearCart();
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Loader className={styles.spinner} size={40} />
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Shopping Cart</h1>
        </header>

        {cart.length === 0 ? (
          <div className={styles.emptyCart}>
            <ShoppingCart className={styles.emptyIcon} />
            <p className={styles.emptyText}>Your cart is empty</p>
            <button
              className={styles.continueBtn}
              onClick={() => navigate("/shop")}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.cartItems}>
              {cart.map((item) => (
                <div
                  key={item.productId || item._id}
                  className={styles.cartItem}
                >
                  <img
                    src={item.image || item.images?.[0]}
                    alt={item.name}
                    className={styles.itemImage}
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemPrice}>
                      {formatPrice(item.price)}
                    </p>
                    <div className={styles.quantityControl}>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId || item._id,
                            item.quantity - 1
                          )
                        }
                        className={styles.quantityBtn}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          updateQuantity(
                            item.productId || item._id,
                            newQuantity
                          );
                        }}
                        className={styles.quantityInput}
                        min="1"
                      />
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId || item._id,
                            item.quantity + 1
                          )
                        }
                        className={styles.quantityBtn}
                      >
                        <Plus size={16} />
                      </button>
                      <span className={styles.subtotal}>
                        Subtotal: {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId || item._id)}
                    className={styles.removeBtn}
                    title="Remove item"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.orderSummary}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span>Items ({itemCount})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span className={styles.freeShipping}>Free</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Tax (10%):</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>
              <div className={styles.totalSection}>
                <span>Total</span>
                <span className={styles.totalAmount}>{formatPrice(total)}</span>
              </div>
              <button
                className={styles.checkoutBtn}
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Proceed to Checkout
              </button>
              <button
                className={styles.continueBtn}
                onClick={() => navigate("/shop")}
              >
                Continue Shopping
              </button>
              {cart.length > 0 && (
                <button className={styles.clearBtn} onClick={handleClearCart}>
                  Clear Cart
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <LoginRequiredModal
        isOpen={loginModalOpen}
        feature="Checkout"
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLoginRedirect}
      />

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default CartPage;
