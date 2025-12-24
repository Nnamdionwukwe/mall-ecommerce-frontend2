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
