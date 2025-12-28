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

  useEffect(() => {
    if (!user) {
      navigate("/orders");
      return;
    }
    loadOrders();
  }, [user, navigate]);

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
    };
    return icons[status] || "📦";
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  // ✅ Show loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loadingState}>
            <h2>Loading orders...</h2>
            <p>Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Show error state
  if (error) {
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
          <h1>My Orders</h1>
          <p className={styles.subtitle}>Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📦</div>
            <h2>No orders yet</h2>
            <p>Start shopping to see your orders here</p>
            <button onClick={() => navigate("/")} className={styles.shopBtn}>
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
                    </div>
                    <span
                      className={styles.statusBadge}
                      style={{ background: getStatusColor(order.status) }}
                    >
                      {getStatusIcon(order.status)} {order.status.toUpperCase()}
                    </span>
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
