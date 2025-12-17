import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./CartPage.module.css";
import { useCart } from "../../context/CartContext";
import { Trash2, Plus, Minus, ShoppingCart, LogOut } from "lucide-react";

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
    cart,
  } = useCart();

  const handleCheckout = () => {
    if (!user) {
      alert("Please login to checkout");
      return;
    }
    alert("Checkout feature coming soon!");
  };

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
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.cartItems}>
              {cart.map((item) => (
                <div key={item._id} className={styles.cartItem}>
                  <img
                    src={item.images}
                    alt={item.name}
                    className={styles.itemImage}
                  />

                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemPrice}>${item.price}</p>

                    <div className={styles.quantityControl}>
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                        className={styles.quantityBtn}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#d1d5db")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "#e5e7eb")
                        }
                      >
                        <Minus size={16} />
                      </button>

                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item._id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className={styles.quantityInput}
                        min="1"
                      />

                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                        className={styles.quantityBtn}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#d1d5db")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "#e5e7eb")
                        }
                      >
                        <Plus size={16} />
                      </button>

                      <span className={styles.subtotal}>
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    s
                    className={styles.removeBtn}
                    onMouseEnter={(e) => (e.target.style.color = "#b91c1c")}
                    onMouseLeave={(e) => (e.target.style.color = "#dc2626")}
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
                  <span>Items ({totalItems})</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span className={styles.freeShipping}>Free</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Tax (10%):</span>
                  <span>${(totalPrice * 0.1).toFixed(2)}</span>
                </div>
              </div>

              <div className={styles.totalSection}>
                <span>Total</span>
                <span className={styles.totalAmount}>
                  ${(totalPrice + totalPrice * 0.1).toFixed(2)}
                </span>
              </div>

              <button
                className={styles.checkoutBtn}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#4338ca")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#4f46e5")
                }
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>

              <button
                className={styles.continueBtn}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
                onClick={() => navigate("/shop")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

// useEffect(() => {
//   loadCart();
// }, []);

//   const loadCart = () => {
//     const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
//     setCart(savedCart);
//   };

//   const updateQuantity = (productId, newQuantity) => {
//     if (newQuantity < 1) return;

//     const updatedCart = cart.map((item) =>
//       item._id === productId ? { ...item, quantity: newQuantity } : item
//     );
//     setCart(updatedCart);
//     localStorage.setItem("cart", JSON.stringify(updatedCart));
//   };

//   const removeItem = (productId) => {
//     const updatedCart = cart.filter((item) => item._id !== productId);
//     setCart(updatedCart);
//     localStorage.setItem("cart", JSON.stringify(updatedCart));
//   };

//   const clearCart = () => {
//     setCart([]);
//     localStorage.removeItem("cart");
//   };

//   const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

//   const handleCheckout = () => {
//     if (!user) {
//       alert("Please login to checkout");
//       return;
//     }
//     alert("Checkout feature coming soon!");
//   };

//   if (cart.length === 0) {
//     return (
//       <div className={styles.container}>
//         <div className={styles.empty}>
//           <div className={styles.emptyIcon}>🛒</div>
//           <h2>Your cart is empty</h2>
//           <p>Add some products to get started!</p>
//           <button onClick={() => navigate("/")} className={styles.shopBtn}>
//             Start Shopping
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.container}>
//       <div className={styles.content}>
//         <div className={styles.header}>
//           <h1>Shopping Cart</h1>
//           <button onClick={clearCart} className={styles.clearBtn}>
//             Clear Cart
//           </button>
//         </div>

//         <div className={styles.cartLayout}>
//           <div className={styles.itemsSection}>
//             {cart.map((item) => (
//               <div key={item._id} className={styles.cartItem}>
//                 <img
//                   src={item.images?.[0] || "https://via.placeholder.com/100"}
//                   alt={item.name}
//                   className={styles.itemImage}
//                   onError={(e) =>
//                     (e.target.src = "https://via.placeholder.com/100")
//                   }
//                 />

//                 <div className={styles.itemInfo}>
//                   <h3 className={styles.itemName}>{item.name}</h3>
//                   <p className={styles.itemVendor}>{item.vendorName}</p>
//                   <p className={styles.itemPrice}>${item.price.toFixed(2)}</p>
//                 </div>

//                 <div className={styles.quantityControl}>
//                   <button
//                     onClick={() => updateQuantity(item._id, item.quantity - 1)}
//                     className={styles.quantityBtn}
//                   >
//                     −
//                   </button>
//                   <span className={styles.quantity}>{item.quantity}</span>
//                   <button
//                     onClick={() => updateQuantity(item._id, item.quantity + 1)}
//                     className={styles.quantityBtn}
//                   >
//                     +
//                   </button>
//                 </div>

//                 <div className={styles.itemTotal}>
//                   ${(item.price * item.quantity).toFixed(2)}
//                 </div>

//                 <button
//                   onClick={() => removeItem(item._id)}
//                   className={styles.removeBtn}
//                 >
//                   🗑️
//                 </button>
//               </div>
//             ))}
//           </div>

//           <div className={styles.summarySection}>
//             <div className={styles.summary}>
//               <h2>Order Summary</h2>

//               <div className={styles.summaryRow}>
//                 <span>Items ({itemCount}):</span>
//                 <span>${total.toFixed(2)}</span>
//               </div>

//               <div className={styles.summaryRow}>
//                 <span>Shipping:</span>
//                 <span>Free</span>
//               </div>

//               <div className={styles.summaryRow}>
//                 <span>Tax:</span>
//                 <span>${(total * 0.1).toFixed(2)}</span>
//               </div>

//               <div className={styles.summaryDivider}></div>

//               <div className={styles.summaryTotal}>
//                 <span>Total:</span>
//                 <span>${(total * 1.1).toFixed(2)}</span>
//               </div>

//               <button
//                 onClick={() => navigate("/checkout")}
//                 className={styles.checkoutBtn}
//               >
//                 Proceed to Checkout
//               </button>

//               <button
//                 onClick={() => navigate("/")}
//                 className={styles.continueBtn}
//               >
//                 Continue Shopping
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartPage;
