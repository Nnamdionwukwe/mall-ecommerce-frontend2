import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";
import styles from "./TrackOrder.module.css";
import axios from "axios";

const API_BASE = "https://mall-ecommerce-api-production.up.railway.app/api";

const TrackOrder = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    loadOrder();
  }, [orderId, user, navigate]);

  // ✅ FIXED: Fetch order from API instead of localStorage
  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token") || user?.token;

      console.log("🔄 Fetching order details...");
      console.log("Order ID:", orderId);

      const response = await axios.get(`${API_BASE}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Order fetched successfully!");
      console.log("Order data:", response.data.data);

      if (response.data.success && response.data.data) {
        setOrder(response.data.data);
      } else {
        setError("Order not found");
        navigate("/orders");
      }
    } catch (err) {
      console.error("❌ Error loading order:", err);

      if (err.response?.status === 401) {
        setError("Unauthorized. Please log in again.");
        navigate("/login");
      } else if (err.response?.status === 404) {
        setError("Order not found");
        navigate("/orders");
      } else {
        setError(err.response?.data?.message || "Failed to load order");
      }
    } finally {
      setLoading(false);
    }
  };

  const getTrackingSteps = (status) => {
    const allSteps = [
      {
        id: "placed",
        label: "Order Placed",
        icon: "📝",
        completed: true,
        date: order?.createdAt,
      },
      {
        id: "processing",
        label: "Processing",
        icon: "⏳",
        completed: ["processing", "shipped", "delivered"].includes(status),
        date: order?.createdAt,
      },
      {
        id: "shipped",
        label: "Shipped",
        icon: "🚚",
        completed: ["shipped", "delivered"].includes(status),
        date: order?.createdAt,
      },
      {
        id: "delivered",
        label: "Delivered",
        icon: "✅",
        completed: status === "delivered",
        date: order?.deliveredAt || null,
      },
    ];

    return allSteps;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/orders")}
            className={styles.backBtn}
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const trackingSteps = getTrackingSteps(order.status);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <button onClick={() => navigate("/orders")} className={styles.backBtn}>
          ← Back to Orders
        </button>

        <div className={styles.header}>
          <h1>Track Order</h1>
          <p className={styles.orderId}>Order #{order.orderId}</p>
        </div>

        <div className={styles.grid}>
          {/* Tracking Timeline */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>📍 Order Status</h2>

            <div className={styles.timeline}>
              {trackingSteps.map((step, index) => (
                <div key={step.id} className={styles.timelineItem}>
                  <div className={styles.timelineContent}>
                    <div
                      className={`${styles.timelineIcon} ${
                        step.completed ? styles.completed : styles.pending
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div className={styles.timelineDetails}>
                      <h3
                        className={step.completed ? styles.completedText : ""}
                      >
                        {step.label}
                      </h3>
                      {step.date && (
                        <p className={styles.timelineDate}>
                          {new Date(step.date).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  {index < trackingSteps.length - 1 && (
                    <div
                      className={`${styles.timelineLine} ${
                        trackingSteps[index + 1].completed
                          ? styles.completedLine
                          : ""
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>

            {order.status === "delivered" && (
              <div className={styles.deliveredBanner}>
                <span className={styles.deliveredIcon}>🎉</span>
                <div>
                  <h4>Order Delivered!</h4>
                  <p>Thank you for shopping with us</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className={styles.sidebar}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📦 Order Details</h2>

              <div className={styles.detailSection}>
                <h4>Items Ordered</h4>
                <div className={styles.itemsList}>
                  {order.items &&
                    order.items.map((item, index) => (
                      <div key={index} className={styles.item}>
                        <img
                          src={item.image || "https://via.placeholder.com/50"}
                          alt={item.name}
                          className={styles.itemImage}
                          onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/50")
                          }
                        />
                        <div className={styles.itemInfo}>
                          <h5>{item.name}</h5>
                          <p>Qty: {item.quantity}</p>
                        </div>
                        <span className={styles.itemPrice}>
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.detailSection}>
                <h4>Shipping Address</h4>
                {order.shippingInfo && (
                  <>
                    <p>{order.shippingInfo.fullName}</p>
                    <p>{order.shippingInfo.address}</p>
                    <p>
                      {order.shippingInfo.city}, {order.shippingInfo.state}{" "}
                      {order.shippingInfo.zipCode}
                    </p>
                    <p>{order.shippingInfo.phone}</p>
                  </>
                )}
              </div>

              <div className={styles.divider}></div>

              <div className={styles.detailSection}>
                <h4>Payment Information</h4>
                {order.paymentInfo && (
                  <div className={styles.paymentInfo}>
                    <div className={styles.paymentRow}>
                      <span>Method:</span>
                      <span className={styles.paymentMethod}>
                        💳 {order.paymentInfo.method.toUpperCase()}
                      </span>
                    </div>
                    <div className={styles.paymentRow}>
                      <span>Transaction ID:</span>
                      <span className={styles.transactionId}>
                        {order.paymentInfo.transactionId ||
                          order.paymentInfo.reference}
                      </span>
                    </div>
                    <div className={styles.paymentRow}>
                      <span>Status:</span>
                      <span className={styles.paidBadge}>
                        ✓ {order.paymentInfo.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.divider}></div>

              <div className={styles.orderSummary}>
                {order.pricing && (
                  <>
                    <div className={styles.summaryRow}>
                      <span>Subtotal:</span>
                      <span>{formatPrice(order.pricing.subtotal)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Shipping:</span>
                      <span>{formatPrice(order.pricing.shipping)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Vat:</span>
                      <span>{formatPrice(order.pricing.tax)}</span>
                    </div>
                    <div className={styles.summaryTotal}>
                      <span>Total:</span>
                      <span>{formatPrice(order.pricing.total)}</span>
                    </div>
                  </>
                )}
              </div>

              {order.trackingNumber && (
                <>
                  <div className={styles.divider}></div>
                  <div className={styles.detailSection}>
                    <h4>Tracking Number</h4>
                    <p className={styles.trackingNumber}>
                      {order.trackingNumber}
                    </p>
                  </div>
                </>
              )}

              {order.estimatedDelivery && (
                <>
                  <div className={styles.divider}></div>
                  <div className={styles.detailSection}>
                    <h4>Estimated Delivery</h4>
                    <p>
                      {new Date(order.estimatedDelivery).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
