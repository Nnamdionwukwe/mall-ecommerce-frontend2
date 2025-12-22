import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useCurrency } from "../../context/CurrencyContext"; // Import currency context
import styles from "./CartPage.module.css";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import LoginRequiredModal from "../../LoginRequiredModal/LoginRequiredModal";
import AuthModal from "../../AuthModal/AuthModal";

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
  const { formatPrice } = useCurrency(); // Use currency context hook

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }
    navigate("/checkout");
  };

  const handleLoginRedirect = () => {
    setLoginModalOpen(false);
    // navigate("/login");
    setShowAuth(true);
  };

  const tax = totalPrice * 0.1;
  const total = totalPrice + tax;

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
                    <p className={styles.itemPrice}>
                      {formatPrice(item.price)}
                    </p>
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
                        Subtotal: {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
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
                  <span>{formatPrice(totalPrice)}</span>
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
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#4338ca")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#4f46e5")
                }
                onClick={handleCheckout}
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
