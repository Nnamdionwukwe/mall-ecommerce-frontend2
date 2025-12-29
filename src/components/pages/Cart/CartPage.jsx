import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useCurrency } from "../../context/CurrencyContext";
import styles from "./CartPage.module.css";
import { Trash2, Plus, Minus, ShoppingCart, Loader } from "lucide-react";
import LoginRequiredModal from "../../LoginRequiredModal/LoginRequiredModal";
import AuthModal from "../../AuthModal/AuthModal";
import ClearCartModal from "../../ClearCartModal/ClearCartModal";

const CartPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { formatPrice } = useCurrency();
  const { cart, isLoading, error, removeFromCart, updateQuantity, clearCart } =
    useCart();

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [localError, setLocalError] = useState("");
  const [clearCartModalOpen, setClearCartModalOpen] = useState(false);

  // Update local error when cart context error changes
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  // Calculate totals
  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const tax = totalPrice * 0.1;
  const total = totalPrice + tax;

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

  const handleRemoveItem = async (productId) => {
    try {
      setLocalError("");
      // Ensure productId is a string, not an object
      const id = typeof productId === "object" ? productId._id : productId;
      await removeFromCart(id);
    } catch (err) {
      setLocalError("Failed to remove item");
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      setLocalError("");
      // Ensure productId is a string, not an object
      const id = typeof productId === "object" ? productId._id : productId;
      await updateQuantity(id, newQuantity);
    } catch (err) {
      setLocalError("Failed to update quantity");
    }
  };

  const handleClearCartClick = () => {
    setClearCartModalOpen(true);
  };

  const handleConfirmClearCart = async () => {
    try {
      setLocalError("");
      await clearCart();
      setClearCartModalOpen(false);
    } catch (err) {
      setLocalError("Failed to clear cart");
    }
  };

  const handleCancelClearCart = () => {
    setClearCartModalOpen(false);
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

        {localError && (
          <div className={styles.errorMessage}>
            {localError}
            <button onClick={() => setLocalError("")}>✕</button>
          </div>
        )}

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
              {cart.map((item) => {
                // Extract proper IDs from item
                const productId =
                  typeof item.productId === "object"
                    ? item.productId._id
                    : item.productId;

                return (
                  <div key={productId || item._id} className={styles.cartItem}>
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
                            handleUpdateQuantity(productId, item.quantity - 1)
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
                            handleUpdateQuantity(productId, newQuantity);
                          }}
                          className={styles.quantityInput}
                          min="1"
                        />
                        <button
                          onClick={() =>
                            handleUpdateQuantity(productId, item.quantity + 1)
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
                      onClick={() => handleRemoveItem(productId)}
                      className={styles.removeBtn}
                      title="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
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
                  <span>Vat (10%):</span>
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
                <button
                  className={styles.clearBtn}
                  onClick={handleClearCartClick}
                >
                  Clear Cart
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Clear Cart Modal */}
      <ClearCartModal
        isOpen={clearCartModalOpen}
        onConfirm={handleConfirmClearCart}
        onCancel={handleCancelClearCart}
        itemCount={totalItems}
      />

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
