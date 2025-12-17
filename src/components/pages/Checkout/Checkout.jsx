import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Checkout.module.css";
import { useCart } from "../../context/CartContext";

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const { totalPrice, cart } = useCart();

  const [orderNote, setOrderNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    // loadCart();
    loadPaystackScript();
  }, [user, navigate]);

  const loadPaystackScript = () => {
    if (window.PaystackPop) {
      setPaystackLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    document.body.appendChild(script);
  };

  // const loadCart = () => {
  //   const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
  //   if (savedCart.length === 0) {
  //     navigate("/cart");
  //     return;
  //   }
  //   setCart(savedCart);
  // };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  // Generate unique order ID
  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD-${timestamp}-${random}`;
  };

  const handlePayment = () => {
    if (!paystackLoaded) {
      alert("Payment system is loading. Please try again.");
      return;
    }

    if (!isFormValid()) {
      alert("Please fill in all required fields");
      return;
    }

    const orderId = generateOrderId();

    const handler = window.PaystackPop.setup({
      key: "pk_test_xxxxxxxxxxxxxxxxxxxx", // Replace with your Paystack public key
      email: formData.email,
      amount: Math.round(total * 100), // Amount in kobo (smallest currency unit)
      currency: "NGN", // Change to your currency
      ref: orderId,
      metadata: {
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: formData.fullName,
          },
          {
            display_name: "Phone",
            variable_name: "phone",
            value: formData.phone,
          },
        ],
      },
      callback: function (response) {
        handlePaymentSuccess(response);
      },
      onClose: function () {
        alert("Payment cancelled");
      },
    });

    handler.openIframe();
  };

  const handlePaymentSuccess = async (response) => {
    setLoading(true);
    try {
      // Create order
      const orderData = {
        orderId: response.reference,
        userId: user._id,
        items: cart,
        shippingInfo: formData,
        orderNote,
        paymentInfo: {
          method: "paystack",
          transactionId: response.transaction,
          status: "paid",
          reference: response.reference,
        },
        subtotal,
        shipping,
        tax,
        total,
        status: "processing",
        createdAt: new Date(),
      };

      // Save order to localStorage (In production, save to backend)
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      existingOrders.push(orderData);
      localStorage.setItem("orders", JSON.stringify(existingOrders));

      // Clear cart
      localStorage.removeItem("cart");

      // Navigate to success page
      navigate(`/order-success/${response.reference}`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert(
        "Order failed. Please contact support with reference: " +
          response.reference
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.fullName &&
      formData.email &&
      formData.phone &&
      formData.address &&
      formData.city &&
      formData.state &&
      formData.zipCode
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Checkout</h1>

        <div className={styles.grid}>
          {/* Shipping Form */}
          <div className={styles.section}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📦 Shipping Information</h2>

              <form
                className={styles.form}
                onSubmit={(e) => e.preventDefault()}
              >
                <div className={styles.formGroup}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="123 Main Street"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="Lagos"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>State *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      placeholder="Lagos"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Zip Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData({ ...formData, zipCode: e.target.value })
                      }
                      placeholder="100001"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Order Note (Optional)</label>
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Any special instructions?"
                    rows="3"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.section}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>🛒 Order Summary</h2>

              <div className={styles.orderItems}>
                {cart.map((item) => (
                  <div key={item._id} className={styles.orderItem}>
                    <img
                      src={item.images?.[0] || "https://via.placeholder.com/60"}
                      alt={item.name}
                      className={styles.itemImage}
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/60")
                      }
                    />
                    <div className={styles.itemInfo}>
                      <h4>{item.name}</h4>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <div className={styles.itemPrice}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.divider}></div>

              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping:</span>
                <span>
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>Tax (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.summaryTotal}>
                <span>Total:</span>
                {/* <span>${totalPrice.toFixed(2)}</span>
                 */}
                ${(totalPrice + totalPrice * 0.1).toFixed(2)}
              </div>

              <button
                onClick={handlePayment}
                disabled={!isFormValid() || loading || !paystackLoaded}
                className={
                  isFormValid() && paystackLoaded
                    ? styles.paystackBtn
                    : styles.paystackBtnDisabled
                }
              >
                {loading
                  ? "Processing..."
                  : paystackLoaded
                  ? "💳 Pay with Paystack"
                  : "Loading payment..."}
              </button>

              <div className={styles.paymentInfo}>
                <p>🔒 Secure payment with Paystack</p>
                <p>💳 We accept all major cards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
