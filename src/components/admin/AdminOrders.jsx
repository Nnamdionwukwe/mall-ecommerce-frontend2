import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminOrders.module.css";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_BASE = "https://mall-ecommerce-api-production.up.railway.app/api";

const AdminOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateModal, setUpdateModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [deliveredAt, setDeliveredAt] = useState("");

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "vendor")) {
      navigate("/");
      return;
    }
    loadOrders();
  }, [user, navigate, filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token") || user?.token;

      let url = `${API_BASE}/orders/admin/all`;
      if (filter !== "all") {
        url += `?status=${filter}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success && response.data.data) {
        const sortedOrders = response.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
        console.log(`✅ Loaded ${sortedOrders.length} orders`);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("❌ Error loading orders:", err);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (order) => {
    setSelectedOrder(order);
    setViewModal(true);
  };

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || "");
    setEstimatedDelivery(order.estimatedDelivery || "");
    setDeliveredAt(order.deliveredAt || "");
    setUpdateModal(true);
  };

  const closeModal = () => {
    setUpdateModal(false);
    setViewModal(false);
    setSelectedOrder(null);
    setNewStatus("");
    setTrackingNumber("");
    setEstimatedDelivery("");
    setDeliveredAt("");
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder) return;

    try {
      const token = localStorage.getItem("token") || user?.token;

      const response = await axios.patch(
        `${API_BASE}/orders/admin/${selectedOrder._id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        console.log("✅ Order status updated successfully");
        setOrders(
          orders.map((o) =>
            o._id === selectedOrder._id ? response.data.data : o
          )
        );
        closeModal();
        await loadOrders();
      }
    } catch (err) {
      console.error("❌ Error updating order status:", err);
      alert(err.response?.data?.message || "Failed to update order status");
    }
  };

  const updateDeliveryInfo = async () => {
    if (!selectedOrder) return;

    try {
      const token = localStorage.getItem("token") || user?.token;

      const response = await axios.patch(
        `${API_BASE}/orders/admin/${selectedOrder._id}/delivery`,
        {
          trackingNumber,
          estimatedDelivery: estimatedDelivery || null,
          deliveredAt: deliveredAt || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        console.log("✅ Delivery information updated successfully");
        setOrders(
          orders.map((o) =>
            o._id === selectedOrder._id ? response.data.data : o
          )
        );
        closeModal();
        await loadOrders();
      }
    } catch (err) {
      console.error("❌ Error updating delivery info:", err);
      alert(err.response?.data?.message || "Failed to update delivery info");
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <h2>Loading orders...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>🔧 Orders Management</h1>
          <p className={styles.subtitle}>View and manage all customer orders</p>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <p>❌ {error}</p>
            <button onClick={loadOrders}>Retry</button>
          </div>
        )}

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
            Processing
          </button>
          <button
            className={`${styles.filterBtn} ${
              filter === "shipped" ? styles.active : ""
            }`}
            onClick={() => setFilter("shipped")}
          >
            Shipped
          </button>
          <button
            className={`${styles.filterBtn} ${
              filter === "delivered" ? styles.active : ""
            }`}
            onClick={() => setFilter("delivered")}
          >
            Delivered
          </button>
        </div>

        <div className={styles.ordersTable}>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.emptyRow}>
                    No orders found for filter: {filter}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td className={styles.orderId}>{order.orderId}</td>
                    <td className={styles.customer}>
                      <div>
                        <p className={styles.customerName}>
                          {order.shippingInfo?.fullName || "N/A"}
                        </p>
                        <p className={styles.customerEmail}>
                          {order.shippingInfo?.email || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className={styles.items}>
                      {order.items?.length || 0} item(s)
                    </td>
                    <td className={styles.total}>
                      ${order.pricing?.total?.toFixed(2) || "0.00"}
                    </td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ background: getStatusColor(order.status) }}
                      >
                        {getStatusIcon(order.status)}{" "}
                        {order.status?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </td>
                    <td className={styles.date}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button
                          onClick={() => openViewModal(order)}
                          className={styles.viewBtn}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => openUpdateModal(order)}
                          className={styles.editBtn}
                          title="Update Order"
                        >
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Order Details Modal */}
      {viewModal && selectedOrder && (
        <div className={styles.modal} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeModal} className={styles.modalClose}>
              ✕
            </button>

            <h2>📦 Order Details</h2>

            <div className={styles.orderDetails}>
              {/* Order Info */}
              <div className={styles.detailSection}>
                <h3>📋 Order Information</h3>
                <div className={styles.detailGrid}>
                  <div>
                    <strong>Order ID:</strong>
                    <p>{selectedOrder.orderId}</p>
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <p>
                      <span
                        className={styles.statusBadge}
                        style={{
                          background: getStatusColor(selectedOrder.status),
                        }}
                      >
                        {getStatusIcon(selectedOrder.status)}{" "}
                        {selectedOrder.status?.toUpperCase()}
                      </span>
                    </p>
                  </div>
                  <div>
                    <strong>Order Date:</strong>
                    <p>{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <strong>Last Updated:</strong>
                    <p>{formatDate(selectedOrder.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className={styles.detailSection}>
                <h3>👤 Customer Information</h3>
                <div className={styles.detailGrid}>
                  <div>
                    <strong>Name:</strong>
                    <p>{selectedOrder.shippingInfo?.fullName}</p>
                  </div>
                  <div>
                    <strong>Email:</strong>
                    <p>{selectedOrder.shippingInfo?.email}</p>
                  </div>
                  <div>
                    <strong>Phone:</strong>
                    <p>{selectedOrder.shippingInfo?.phone}</p>
                  </div>
                  <div>
                    <strong>User ID:</strong>
                    <p style={{ fontSize: "0.85em", color: "#666" }}>
                      {selectedOrder.userId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className={styles.detailSection}>
                <h3>📍 Shipping Address</h3>
                <p>{selectedOrder.shippingInfo?.address}</p>
                <p>
                  {selectedOrder.shippingInfo?.city},{" "}
                  {selectedOrder.shippingInfo?.state}{" "}
                  {selectedOrder.shippingInfo?.zipCode}
                </p>
              </div>

              {/* Order Items */}
              <div className={styles.detailSection}>
                <h3>🛍️ Order Items</h3>
                <div className={styles.itemsList}>
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className={styles.itemImage}
                        />
                      )}
                      <div className={styles.itemDetails}>
                        <p className={styles.itemName}>{item.name}</p>
                        <p className={styles.itemMeta}>
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className={styles.itemTotal}>
                        ${(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className={styles.detailSection}>
                <h3>💰 Pricing</h3>
                <div className={styles.pricingDetails}>
                  <div className={styles.priceRow}>
                    <span>Subtotal:</span>
                    <span>${selectedOrder.pricing?.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Shipping:</span>
                    <span>${selectedOrder.pricing?.shipping?.toFixed(2)}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Tax:</span>
                    <span>${selectedOrder.pricing?.tax?.toFixed(2)}</span>
                  </div>
                  <div className={styles.priceRowTotal}>
                    <strong>Total:</strong>
                    <strong>${selectedOrder.pricing?.total?.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className={styles.detailSection}>
                <h3>💳 Payment Information</h3>
                <div className={styles.detailGrid}>
                  <div>
                    <strong>Method:</strong>
                    <p>{selectedOrder.paymentInfo?.method?.toUpperCase()}</p>
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <p>
                      <span
                        style={{
                          color:
                            selectedOrder.paymentInfo?.status === "paid"
                              ? "#10b981"
                              : "#ef4444",
                          fontWeight: "bold",
                        }}
                      >
                        {selectedOrder.paymentInfo?.status?.toUpperCase()}
                      </span>
                    </p>
                  </div>
                  <div>
                    <strong>Reference:</strong>
                    <p style={{ fontSize: "0.85em" }}>
                      {selectedOrder.paymentInfo?.reference}
                    </p>
                  </div>
                  <div>
                    <strong>Transaction ID:</strong>
                    <p style={{ fontSize: "0.85em" }}>
                      {selectedOrder.paymentInfo?.transactionId}
                    </p>
                  </div>
                  <div>
                    <strong>Paid At:</strong>
                    <p>{formatDate(selectedOrder.paymentInfo?.paidAt)}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className={styles.detailSection}>
                <h3>🚚 Delivery Information</h3>
                <div className={styles.detailGrid}>
                  <div>
                    <strong>Tracking Number:</strong>
                    <p>
                      {selectedOrder.trackingNumber || (
                        <em style={{ color: "#999" }}>Not assigned yet</em>
                      )}
                    </p>
                  </div>
                  <div>
                    <strong>Estimated Delivery:</strong>
                    <p>
                      {selectedOrder.estimatedDelivery ? (
                        formatDate(selectedOrder.estimatedDelivery)
                      ) : (
                        <em style={{ color: "#999" }}>Not set</em>
                      )}
                    </p>
                  </div>
                  <div>
                    <strong>Delivered At:</strong>
                    <p>
                      {selectedOrder.deliveredAt ? (
                        formatDate(selectedOrder.deliveredAt)
                      ) : (
                        <em style={{ color: "#999" }}>Not delivered yet</em>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Note */}
              {selectedOrder.orderNote && (
                <div className={styles.detailSection}>
                  <h3>📝 Order Note</h3>
                  <p>{selectedOrder.orderNote}</p>
                </div>
              )}

              {/* Cancellation Reason */}
              {selectedOrder.cancellationReason && (
                <div className={styles.detailSection}>
                  <h3>❌ Cancellation Reason</h3>
                  <p>{selectedOrder.cancellationReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {updateModal && selectedOrder && (
        <div className={styles.modal} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeModal} className={styles.modalClose}>
              ✕
            </button>

            <h2>📦 Update Order: {selectedOrder.orderId}</h2>

            <div className={styles.modalSection}>
              <label>Order Status *</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className={styles.select}
              >
                <option value="processing">⏳ Processing</option>
                <option value="shipped">🚚 Shipped</option>
                <option value="delivered">✅ Delivered</option>
                <option value="cancelled">❌ Cancelled</option>
                <option value="returned">↩️ Returned</option>
              </select>
              <button onClick={updateOrderStatus} className={styles.updateBtn}>
                Update Status
              </button>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.modalSection}>
              <label>Tracking Number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g., TRK123456789"
                className={styles.input}
              />
            </div>

            <div className={styles.modalSection}>
              <label>Estimated Delivery Date</label>
              <input
                type="date"
                value={estimatedDelivery.split("T")[0] || ""}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.modalSection}>
              <label>Delivered At (if delivered)</label>
              <input
                type="date"
                value={deliveredAt.split("T")[0] || ""}
                onChange={(e) => setDeliveredAt(e.target.value)}
                className={styles.input}
              />
            </div>

            <button onClick={updateDeliveryInfo} className={styles.updateBtn}>
              Update Delivery Info
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
