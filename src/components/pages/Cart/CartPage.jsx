import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./CartPage.module.css";

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cart.map((item) =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter((item) => item._id !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      alert("Please login to checkout");
      return;
    }
    alert("Checkout feature coming soon!");
  };

  if (cart.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <button onClick={() => navigate("/")} className={styles.shopBtn}>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Shopping Cart</h1>
          <button onClick={clearCart} className={styles.clearBtn}>
            Clear Cart
          </button>
        </div>

        <div className={styles.cartLayout}>
          <div className={styles.itemsSection}>
            {cart.map((item) => (
              <div key={item._id} className={styles.cartItem}>
                <img
                  src={item.images?.[0] || "https://via.placeholder.com/100"}
                  alt={item.name}
                  className={styles.itemImage}
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/100")
                  }
                />

                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemVendor}>{item.vendorName}</p>
                  <p className={styles.itemPrice}>${item.price.toFixed(2)}</p>
                </div>

                <div className={styles.quantityControl}>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className={styles.quantityBtn}
                  >
                    −
                  </button>
                  <span className={styles.quantity}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className={styles.quantityBtn}
                  >
                    +
                  </button>
                </div>

                <div className={styles.itemTotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                <button
                  onClick={() => removeItem(item._id)}
                  className={styles.removeBtn}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div className={styles.summarySection}>
            <div className={styles.summary}>
              <h2>Order Summary</h2>

              <div className={styles.summaryRow}>
                <span>Items ({itemCount}):</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Shipping:</span>
                <span>Free</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Tax:</span>
                <span>${(total * 0.1).toFixed(2)}</span>
              </div>

              <div className={styles.summaryDivider}></div>

              <div className={styles.summaryTotal}>
                <span>Total:</span>
                <span>${(total * 1.1).toFixed(2)}</span>
              </div>

              <button onClick={handleCheckout} className={styles.checkoutBtn}>
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate("/")}
                className={styles.continueBtn}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
