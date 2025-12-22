import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";
import styles from "./Checkout.module.css";
import { useCart } from "../../context/CartContext";
import axios from "axios";

const API_BASE = "https://mall-ecommerce-api-production.up.railway.app/api";

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const { totalPrice, cart, clearCart } = useCart();

  const [orderNote, setOrderNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
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
    script.onerror = () => {
      console.error("Failed to load Paystack script");
      alert("Failed to load payment system. Please refresh the page.");
    };
    document.body.appendChild(script);
  };

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

  const verifyPaymentAndCreateOrder = async (reference, orderId) => {
    try {
      const token = localStorage.getItem("token") || user?.token;

      const response = await axios.post(
        `${API_BASE}/checkout/verify-payment`,
        {
          reference,
          orderId,
          shippingInfo: formData,
          items: cart,
          subtotal,
          shipping,
          tax,
          total,
          orderNote,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Clear cart after successful order
        if (clearCart) {
          clearCart();
        } else {
          localStorage.removeItem("cart");
        }

        // Navigate to success page
        navigate(`/order-success/${orderId}`, {
          state: {
            orderData: response.data.data,
          },
        });
      } else {
        throw new Error(response.data.message || "Order creation failed");
      }
    } catch (error) {
      console.error("Order verification error:", error);

      // Show detailed error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create order";

      alert(
        `Order creation failed: ${errorMessage}\n\nPlease contact support with reference: ${reference}`
      );

      // Navigate to orders page or home
      navigate("/orders");
    }
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
      key:
        process.env.REACT_APP_PAYSTACK_PUBLIC_KEY ||
        "pk_test_xxxxxxxxxxxxxxxxxxxx", // Replace with your public key
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
          {
            display_name: "Address",
            variable_name: "address",
            value: `${formData.address}, ${formData.city}, ${formData.state}`,
          },
        ],
      },
      callback: function (response) {
        handlePaymentSuccess(response, orderId);
      },
      onClose: function () {
        console.log("Payment cancelled");
        alert("Payment cancelled. Your cart is still saved.");
      },
    });

    handler.openIframe();
  };

  const handlePaymentSuccess = async (response, orderId) => {
    setLoading(true);

    try {
      console.log("Payment successful:", response);

      // Verify payment with backend and create order
      await verifyPaymentAndCreateOrder(response.reference, orderId);
    } catch (error) {
      console.error("Error processing payment:", error);
      alert(
        "Payment successful but order creation failed. Please contact support with reference: " +
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
      formData.zipCode &&
      cardDetails.cardNumber &&
      cardDetails.cardName &&
      cardDetails.expiryDate &&
      cardDetails.cvv
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

            {/* Card Details Section */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>💳 Payment Details</h2>

              <form
                className={styles.form}
                onSubmit={(e) => e.preventDefault()}
              >
                <div className={styles.formGroup}>
                  <label>Cardholder Name *</label>
                  <input
                    type="text"
                    required
                    value={cardDetails.cardName}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cardName: e.target.value,
                      })
                    }
                    placeholder="John Doe"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Card Number *</label>
                  <input
                    type="text"
                    required
                    value={cardDetails.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, "");
                      const formatted = value.replace(/(\d{4})/g, "$1 ").trim();
                      setCardDetails({
                        ...cardDetails,
                        cardNumber: formatted.slice(0, 19),
                      });
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Expiry Date (MM/YY) *</label>
                    <input
                      type="text"
                      required
                      value={cardDetails.expiryDate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 4) {
                          const formatted =
                            value.length > 2
                              ? `${value.slice(0, 2)}/${value.slice(2)}`
                              : value;
                          setCardDetails({
                            ...cardDetails,
                            expiryDate: formatted,
                          });
                        }
                      }}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>CVV *</label>
                    <input
                      type="password"
                      required
                      value={cardDetails.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setCardDetails({
                          ...cardDetails,
                          cvv: value.slice(0, 3),
                        });
                      }}
                      placeholder="123"
                      maxLength="3"
                    />
                  </div>
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
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.divider}></div>

              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping:</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Tax (10%):</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.summaryTotal}>
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={!isFormValid() || loading || !paystackLoaded}
                className={
                  isFormValid() && paystackLoaded && !loading
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
