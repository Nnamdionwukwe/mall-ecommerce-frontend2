import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Orders.module.css";

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = () => {
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const userOrders = allOrders.filter((order) => order.userId === user._id);
    setOrders(
      userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      processing: "#f59e0b",
      shipped: "#3b82f6",
      delivered: "#10b981",
      cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  const getStatusIcon = (status) => {
    const icons = {
      processing: "⏳",
      shipped: "🚚",
      delivered: "✅",
      cancelled: "❌",
    };
    return icons[status] || "📦";
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

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
                <div key={order.orderId} className={styles.orderCard}>
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
                    {order.items.map((item, index) => (
                      <div key={index} className={styles.orderItem}>
                        <img
                          src={
                            item.images?.[0] || "https://via.placeholder.com/60"
                          }
                          alt={item.name}
                          className={styles.itemImage}
                        />
                        <div className={styles.itemDetails}>
                          <h4>{item.name}</h4>
                          <p>Quantity: {item.quantity}</p>
                          <p className={styles.itemPrice}>
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.orderFooter}>
                    <div className={styles.orderTotal}>
                      <span>Total:</span>
                      <span className={styles.totalAmount}>
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/track-order/${order.orderId}`)}
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
