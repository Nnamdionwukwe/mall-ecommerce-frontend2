import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";
import styles from "./Orders.module.css";
import axios from "axios";

const API_BASE = "https://mall-ecommerce-api-production.up.railway.app/api";

const Orders = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-update states
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [autoUpdateInterval, setAutoUpdateInterval] = useState(30); // seconds
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [showAutoUpdateControls, setShowAutoUpdateControls] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    loadOrders();

    // Set up auto-update
    let interval;
    if (autoUpdateEnabled && autoUpdateInterval > 0) {
      interval = setInterval(() => {
        console.log("🔄 Auto-updating orders...");
        loadOrders();
      }, autoUpdateInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, navigate, autoUpdateEnabled, autoUpdateInterval]);

  // ✅ FIXED: Fetch orders from API instead of localStorage
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token") || user?.token;

      console.log("🔄 Fetching orders from API...");
      console.log("Token:", token ? "✅ Present" : "❌ Missing");

      const response = await axios.get(`${API_BASE}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Orders fetched successfully!");
      console.log("Response:", response.data);

      if (response.data.success && response.data.data) {
        // ✅ Sort orders by creation date (newest first)
        const sortedOrders = response.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
        setLastUpdateTime(new Date());
        console.log(`📋 Loaded ${sortedOrders.length} orders`);
      } else {
        console.warn("⚠️ No orders data in response");
        setOrders([]);
      }
    } catch (err) {
      console.error("❌ Error loading orders:", err);

      // Better error messages
      if (err.response?.status === 401) {
        setError("Unauthorized. Please log in again.");
        navigate("/login");
      } else if (err.response?.status === 404) {
        setError("Orders not found.");
        setOrders([]);
      } else {
        setError(
          err.response?.data?.message || err.message || "Failed to load orders"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      processing: "#f59e0b",
      shipped: "#3b82f6",
      delivered: "#10b981",
      cancelled: "#ef4444",
      returned: "#8b5cf6",
      pending_payment: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  const getStatusIcon = (status) => {
    const icons = {
      processing: "⏳",
      shipped: "🚚",
      delivered: "✅",
      cancelled: "❌",
      returned: "↩️",
      pending_payment: "💳",
    };
    return icons[status] || "📦";
  };

  const getStatusLabel = (status) => {
    const labels = {
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      returned: "Returned",
      pending_payment: "Pending Payment",
    };
    return labels[status] || status;
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  // ✅ Show loading state
  if (loading && orders.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <h2>Loading orders...</h2>
            <p>Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Show error state
  if (error && orders.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.errorState}>
            <h2>❌ Error</h2>
            <p>{error}</p>
            <button onClick={loadOrders} className={styles.retryBtn}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1>My Orders</h1>
            <p className={styles.subtitle}>Track and manage your orders</p>
          </div>

          {/* Auto-Update Toggle */}
          <button
            className={styles.autoUpdateToggle}
            onClick={() => setShowAutoUpdateControls(!showAutoUpdateControls)}
            title="Toggle auto-update settings"
          >
            🔄 Auto-Update {autoUpdateEnabled ? "On" : "Off"}
          </button>
        </div>

        {/* Auto-Update Controls */}
        {showAutoUpdateControls && (
          <div className={styles.autoUpdatePanel}>
            <div className={styles.autoUpdateContent}>
              <div className={styles.autoUpdateStatus}>
                {autoUpdateEnabled && (
                  <>
                    <span className={styles.updateIndicator}>🔄</span>
                    <div className={styles.updateInfo}>
                      <p className={styles.updateText}>
                        Auto-refresh every {autoUpdateInterval}s
                      </p>
                      {lastUpdateTime && (
                        <p className={styles.lastUpdateTime}>
                          Last updated: {lastUpdateTime.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className={styles.autoUpdateControls}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={autoUpdateEnabled}
                    onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                  />
                  <span>Enable Auto-Refresh</span>
                </label>

                {autoUpdateEnabled && (
                  <select
                    value={autoUpdateInterval}
                    onChange={(e) =>
                      setAutoUpdateInterval(parseInt(e.target.value))
                    }
                    className={styles.intervalSelect}
                  >
                    <option value={10}>Every 10 seconds</option>
                    <option value={20}>Every 20 seconds</option>
                    <option value={30}>Every 30 seconds</option>
                    <option value={60}>Every 1 minute</option>
                    <option value={120}>Every 2 minutes</option>
                    <option value={300}>Every 5 minutes</option>
                  </select>
                )}

                <button
                  onClick={loadOrders}
                  className={styles.refreshNowBtn}
                  title="Refresh orders immediately"
                >
                  🔄 Refresh Now
                </button>
              </div>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📦</div>
            <h2>No orders yet</h2>
            <p>Start shopping to see your orders here</p>
            <button
              onClick={() => navigate("/shop")}
              className={styles.shopBtn}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className={styles.filters}>
              <button
                className={`${styles.filterBtn} ${
                  filter === "all" ? styles.active : ""
                }`}
                onClick={() => setFilter("all")}
              >
                All Orders ({orders.length})
              </button>
              <button
                className={`${styles.filterBtn} ${
                  filter === "processing" ? styles.active : ""
                }`}
                onClick={() => setFilter("processing")}
              >
                Processing (
                {orders.filter((o) => o.status === "processing").length})
              </button>
              <button
                className={`${styles.filterBtn} ${
                  filter === "shipped" ? styles.active : ""
                }`}
                onClick={() => setFilter("shipped")}
              >
                Shipped ({orders.filter((o) => o.status === "shipped").length})
              </button>
              <button
                className={`${styles.filterBtn} ${
                  filter === "delivered" ? styles.active : ""
                }`}
                onClick={() => setFilter("delivered")}
              >
                Delivered (
                {orders.filter((o) => o.status === "delivered").length})
              </button>
              <button
                className={`${styles.filterBtn} ${
                  filter === "pending_payment" ? styles.active : ""
                }`}
                onClick={() => setFilter("pending_payment")}
              >
                Pending Payment (
                {orders.filter((o) => o.status === "pending_payment").length})
              </button>
            </div>

            <div className={styles.ordersList}>
              {filteredOrders.map((order) => (
                <div key={order._id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <h3>Order #{order.orderId}</h3>
                      <p className={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {order.paymentInfo?.method && (
                        <p className={styles.paymentMethod}>
                          💳 Payment:{" "}
                          {order.paymentInfo.method === "bank_transfer"
                            ? "Bank Transfer"
                            : "Paystack"}
                        </p>
                      )}
                    </div>
                    <div className={styles.statusSection}>
                      <span
                        className={styles.statusBadge}
                        style={{ background: getStatusColor(order.status) }}
                      >
                        {getStatusIcon(order.status)}{" "}
                        {getStatusLabel(order.status)}
                      </span>
                      {order.paymentInfo?.status && (
                        <span
                          className={styles.paymentBadge}
                          style={{
                            background:
                              order.paymentInfo.status === "paid"
                                ? "#10b981"
                                : "#f59e0b",
                          }}
                        >
                          {order.paymentInfo.status === "paid" ? "✅" : "⏳"}{" "}
                          Payment {order.paymentInfo.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.orderItems}>
                    {order.items &&
                      order.items.map((item, index) => (
                        <div key={index} className={styles.orderItem}>
                          <img
                            src={item.image || "https://via.placeholder.com/60"}
                            alt={item.name}
                            className={styles.itemImage}
                            onError={(e) =>
                              (e.target.src = "https://via.placeholder.com/60")
                            }
                          />
                          <div className={styles.itemDetails}>
                            <h4>{item.name}</h4>
                            <p>Quantity: {item.quantity}</p>
                            <p className={styles.itemPrice}>
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className={styles.orderFooter}>
                    <div className={styles.orderTotal}>
                      <span>Total:</span>
                      <span className={styles.totalAmount}>
                        {formatPrice(order.pricing?.total || 0)}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/track-order/${order._id}`)}
                      className={styles.trackBtn}
                    >
                      📍 Track Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
