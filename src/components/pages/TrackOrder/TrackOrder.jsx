import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./TrackOrder.module.css";

const TrackOrder = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    loadOrder();
  }, [orderId, user, navigate]);

  const loadOrder = () => {
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const foundOrder = allOrders.find(
      (o) => o.orderId === orderId && o.userId === user._id
    );

    if (!foundOrder) {
      navigate("/orders");
      return;
    }

    setOrder(foundOrder);
    setLoading(false);
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
        date:
          status === "shipped" || status === "delivered" ? new Date() : null,
      },
      {
        id: "delivered",
        label: "Delivered",
        icon: "✅",
        completed: status === "delivered",
        date: status === "delivered" ? new Date() : null,
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

  if (!order) {
    return null;
  }

  const trackingSteps = getTrackingSteps(order.status);
  const currentStep = trackingSteps.findIndex((step) => !step.completed);

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
                {" "}
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
                  {order.items.map((item, index) => (
                    <div key={index} className={styles.item}>
                      <img
                        src={
                          item.images?.[0] || "https://via.placeholder.com/50"
                        }
                        alt={item.name}
                        className={styles.itemImage}
                      />
                      <div className={styles.itemInfo}>
                        <h5>{item.name}</h5>
                        <p>Qty: {item.quantity}</p>
                      </div>
                      <span className={styles.itemPrice}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.detailSection}>
                <h4>Shipping Address</h4>
                <p>{order.shippingInfo.fullName}</p>
                <p>{order.shippingInfo.address}</p>
                <p>
                  {order.shippingInfo.city}, {order.shippingInfo.state}{" "}
                  {order.shippingInfo.zipCode}
                </p>
                <p>{order.shippingInfo.phone}</p>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.detailSection}>
                <h4>Payment Information</h4>
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
                      {order.paymentInfo.transactionId}
                    </span>
                  </div>
                  <div className={styles.paymentRow}>
                    <span>Status:</span>
                    <span className={styles.paidBadge}>✓ PAID</span>
                  </div>
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.orderSummary}>
                <div className={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping:</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Tax:</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className={styles.summaryTotal}>
                  <span>Total:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
