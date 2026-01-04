import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";
import styles from "./Checkout.module.css";
import { useCart } from "../../context/CartContext";
import axios from "axios";

const API_BASE = "https://mall-ecommerce-api-production.up.railway.app/api";

// Health check
fetch("https://mall-ecommerce-api-production.up.railway.app/api/health")
  .then((r) => r.json())
  .then((data) => console.log("✅ Server health:", data))
  .catch((err) => console.error("❌ Server health check failed:", err));

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

  // Load Paystack script
  const loadPaystackScript = () => {
    if (window.PaystackPop) {
      setPaystackLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      console.log("✅ Paystack script loaded");
      setPaystackLoaded(true);
    };
    script.onerror = () => {
      console.error("❌ Failed to load Paystack script");
      alert("Failed to load payment system. Please refresh the page.");
    };
    document.body.appendChild(script);
  };

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  // Generate unique order ID (for internal use)
  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD-${timestamp}-${random}`;
  };

  // ✅ FIXED: Verify payment with Paystack reference + Better error logging
  const verifyPaymentAndCreateOrder = async (paystackReference, orderId) => {
    try {
      const token = localStorage.getItem("token") || user?.token;

      console.log("🔄 Verifying payment with backend...");
      console.log("Paystack Reference:", paystackReference);
      console.log("Order ID:", orderId);
      console.log("Cart items:", cart);
      console.log("Form data:", formData);

      const payload = {
        reference: paystackReference,
        orderId,
        shippingInfo: formData,
        items: cart,
        subtotal,
        shipping,
        tax,
        total,
        orderNote,
      };

      console.log("📤 Sending payload to backend:", payload);

      const response = await axios.post(
        `${API_BASE}/orders/verify-payment`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Backend response:", response.data);

      if (response.data.success) {
        console.log("✅ Order created successfully!");

        if (clearCart) {
          clearCart();
        } else {
          localStorage.removeItem("cart");
        }

        navigate(`/order-success/${orderId}`, {
          state: {
            orderData: response.data.data,
          },
        });
      } else {
        throw new Error(response.data.message || "Order creation failed");
      }
    } catch (error) {
      console.error("❌ Order verification error:");
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Full error object:", error);

      // ✅ Log the backend response details
      if (error.response) {
        console.error("Backend status:", error.response.status);
        console.error("Backend data:", error.response.data);
        console.error("Backend message:", error.response.data?.message);
        console.error("Backend errors:", error.response.data?.errors);
      }

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create order";

      const errorDetails = error.response?.data?.errors
        ? "\n\nDetails: " + JSON.stringify(error.response.data.errors, null, 2)
        : "";

      alert(
        `Order creation failed: ${errorMessage}${errorDetails}\n\nPlease contact support with reference: ${paystackReference}`
      );

      navigate("/orders");
    }
  };

  // ✅ FIXED: Handle payment success with Paystack reference
  const handlePaymentSuccess = async (paystackResponse, orderId) => {
    setLoading(true);

    try {
      console.log("💳 Payment successful from Paystack");
      console.log("Paystack Response:", paystackResponse);
      console.log("Paystack Reference:", paystackResponse.reference);

      // ✅ IMPORTANT: Extract reference from Paystack response
      const paystackReference = paystackResponse.reference;

      await verifyPaymentAndCreateOrder(paystackReference, orderId);
    } catch (error) {
      console.error("Error processing payment:", error);
      alert(
        "Payment successful but order creation failed. Please contact support with reference: " +
          paystackResponse.reference
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Handle payment initiation
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
    console.log("🛒 Starting payment for order:", orderId);

    const handler = window.PaystackPop.setup({
      key:
        import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
        "pk_test_e9a3e6c5eee911c858998b544fa088369033ab65",
      email: formData.email,
      amount: Math.round(total * 100), // Amount in kobo
      currency: "NGN",
      ref: orderId, // Your internal order ID for reference
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
        // ✅ IMPORTANT: response.reference is Paystack's transaction reference
        console.log("✅ Payment callback triggered");
        console.log("Response from Paystack:", response);
        console.log("Paystack Transaction Reference:", response.reference);

        handlePaymentSuccess(response, orderId);
      },
      onClose: function () {
        console.log("Payment modal closed by user");
        alert("Payment cancelled. Your cart is still saved.");
      },
    });

    handler.openIframe();
  };

  // Validate form
  const isFormValid = () => {
    return (
      formData.fullName &&
      formData.email &&
      formData.phone &&
      formData.address &&
      formData.city &&
      formData.state &&
      cardDetails.cardNumber &&
      cardDetails.cardName &&
      cardDetails.expiryDate &&
      cardDetails.cvv &&
      cart.length > 0
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Checkout</h1>

        <div className={styles.grid}>
          {/* Left Section: Forms */}
          <div className={styles.section}>
            {/* Shipping Information */}
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
                      placeholder="Lagos State"
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
                      placeholder="Lagos State"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Zip Code *</label>
                    <input
                      type="tel"
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
                    placeholder="Any special instructions for your order?"
                    rows="3"
                  />
                </div>
              </form>
            </div>

            {/* Payment Details */}
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
                    type="tel"
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

                <p className={styles.cardNote}>
                  💳 Your card information is securely processed by Paystack
                </p>
              </form>
            </div>
          </div>

          {/* Right Section: Order Summary */}
          <div className={styles.section}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>🛒 Order Summary</h2>

              {/* Order Items */}
              <div className={styles.orderItems}>
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item._id} className={styles.orderItem}>
                      <img
                        src={
                          item.images?.[0] || "https://via.placeholder.com/60"
                        }
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
                  ))
                ) : (
                  <p className={styles.emptyCart}>Your cart is empty</p>
                )}
              </div>

              <div className={styles.divider}></div>

              {/* Pricing Breakdown */}
              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping:</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Vat (10%):</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <div className={styles.divider}></div>

              {/* Total */}
              <div className={styles.summaryTotal}>
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>

              {/* Payment Button */}
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
                  ? "⏳ Processing..."
                  : !paystackLoaded
                  ? "⏳ Loading payment..."
                  : "💳 Pay with Paystack"}
              </button>

              {/* Payment Info */}
              <div className={styles.paymentInfo}>
                <p>🔒 Secure payment with Paystack</p>
                <p>💳 We accept all major cards (Visa, Mastercard, etc.)</p>
                <p>✅ Your payment is encrypted and secure</p>
              </div>

              {/* Form Validation Message */}
              {!isFormValid() && cart.length > 0 && (
                <div className={styles.validationMessage}>
                  ⚠️ Please fill in all required fields to proceed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
