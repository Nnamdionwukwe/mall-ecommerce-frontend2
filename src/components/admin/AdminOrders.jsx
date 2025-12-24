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
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [deliveredAt, setDeliveredAt] = useState("");

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
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

      console.log("🔄 Fetching all orders for admin...");
      console.log("🔑 Token exists:", !!token);
      console.log("👤 User role:", user?.role);
      console.log("🔍 Filter:", filter);

      let url = `${API_BASE}/orders`;

      // If filter is not 'all', fetch orders by status
      if (filter !== "all") {
        url = `${API_BASE}/orders/filter/status/${filter}`;
      }

      console.log("📡 Fetching from URL:", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📦 Raw Response:", response.data);

      if (response.data.success && response.data.data) {
        const sortedOrders = response.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
        console.log(`✅ Loaded ${sortedOrders.length} orders`);
        console.log("📋 Orders:", sortedOrders);
      } else {
        console.warn("⚠️ No orders in response data");
        setOrders([]);
      }
    } catch (err) {
      console.error("❌ Error loading orders:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
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

      console.log("🔄 Updating order status...");
      console.log("Order ID:", selectedOrder._id);
      console.log("New Status:", newStatus);

      const response = await axios.patch(
        `${API_BASE}/orders/${selectedOrder._id}/status`,
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
        // Update local state
        setOrders(
          orders.map((o) =>
            o._id === selectedOrder._id ? { ...o, status: newStatus } : o
          )
        );
        closeModal();
        // Reload orders to get fresh data
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

      console.log("🔄 Updating delivery information...");

      const response = await axios.patch(
        `${API_BASE}/orders/${selectedOrder._id}/delivery`,
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
        // Update local state
        setOrders(
          orders.map((o) =>
            o._id === selectedOrder._id ? response.data.data : o
          )
        );
        closeModal();
        // Reload orders to get fresh data
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
          <h1>🔧 Admin - Orders Management</h1>
          <p className={styles.subtitle}>
            Update order status and delivery information
          </p>
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

        {/* Debug Info */}
        <div
          style={{
            padding: "10px",
            background: "#f0f0f0",
            margin: "10px 0",
            borderRadius: "5px",
          }}
        >
          <strong>Debug Info:</strong> Loading: {loading.toString()}, Orders:{" "}
          {orders.length}, Filter: {filter}
        </div>

        <div className={styles.ordersTable}>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className={styles.emptyRow}>
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
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-US")
                        : "N/A"}
                    </td>
                    <td>
                      <button
                        onClick={() => openUpdateModal(order)}
                        className={styles.editBtn}
                      >
                        ✏️ Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Modal */}
      {updateModal && selectedOrder && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
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

// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import styles from "./AdminOrders.module.css";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// const API_BASE = "https://mall-ecommerce-api-production.up.railway.app/api";

// const AdminOrders = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState("all");
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [updateModal, setUpdateModal] = useState(false);
//   const [newStatus, setNewStatus] = useState("");
//   const [trackingNumber, setTrackingNumber] = useState("");
//   const [estimatedDelivery, setEstimatedDelivery] = useState("");
//   const [deliveredAt, setDeliveredAt] = useState("");

//   useEffect(() => {
//     // Check if user is admin
//     if (!user || user.role !== "admin") {
//       navigate("/");
//       return;
//     }
//     loadOrders();
//   }, [user, navigate, filter]);

//   const loadOrders = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const token = localStorage.getItem("token") || user?.token;

//       console.log("🔄 Fetching all orders for admin...");

//       let url = `${API_BASE}/orders`;

//       // If filter is not 'all', fetch orders by status
//       if (filter !== "all") {
//         url = `${API_BASE}/orders/filter/status/${filter}`;
//       }

//       const response = await axios.get(url, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.data.success && response.data.data) {
//         const sortedOrders = response.data.data.sort(
//           (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//         );
//         setOrders(sortedOrders);
//         console.log(`✅ Loaded ${sortedOrders.length} orders`);
//       }
//     } catch (err) {
//       console.error("❌ Error loading orders:", err);
//       setError(err.response?.data?.message || "Failed to load orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openUpdateModal = (order) => {
//     setSelectedOrder(order);
//     setNewStatus(order.status);
//     setTrackingNumber(order.trackingNumber || "");
//     setEstimatedDelivery(order.estimatedDelivery || "");
//     setDeliveredAt(order.deliveredAt || "");
//     setUpdateModal(true);
//   };

//   const closeModal = () => {
//     setUpdateModal(false);
//     setSelectedOrder(null);
//     setNewStatus("");
//     setTrackingNumber("");
//     setEstimatedDelivery("");
//     setDeliveredAt("");
//   };

//   const updateOrderStatus = async () => {
//     if (!selectedOrder) return;

//     try {
//       const token = localStorage.getItem("token") || user?.token;

//       console.log("🔄 Updating order status...");
//       console.log("Order ID:", selectedOrder._id);
//       console.log("New Status:", newStatus);

//       const response = await axios.patch(
//         `${API_BASE}/orders/${selectedOrder._id}/status`,
//         { status: newStatus },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.data.success) {
//         console.log("✅ Order status updated successfully");
//         // Update local state
//         setOrders(
//           orders.map((o) =>
//             o._id === selectedOrder._id ? { ...o, status: newStatus } : o
//           )
//         );
//         closeModal();
//       }
//     } catch (err) {
//       console.error("❌ Error updating order status:", err);
//       alert(err.response?.data?.message || "Failed to update order status");
//     }
//   };

//   const updateDeliveryInfo = async () => {
//     if (!selectedOrder) return;

//     try {
//       const token = localStorage.getItem("token") || user?.token;

//       console.log("🔄 Updating delivery information...");

//       const response = await axios.patch(
//         `${API_BASE}/orders/${selectedOrder._id}/delivery`,
//         {
//           trackingNumber,
//           estimatedDelivery: estimatedDelivery || null,
//           deliveredAt: deliveredAt || null,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.data.success) {
//         console.log("✅ Delivery information updated successfully");
//         // Update local state
//         setOrders(
//           orders.map((o) =>
//             o._id === selectedOrder._id ? response.data.data : o
//           )
//         );
//         closeModal();
//       }
//     } catch (err) {
//       console.error("❌ Error updating delivery info:", err);
//       alert(err.response?.data?.message || "Failed to update delivery info");
//     }
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       processing: "#f59e0b",
//       shipped: "#3b82f6",
//       delivered: "#10b981",
//       cancelled: "#ef4444",
//       returned: "#8b5cf6",
//     };
//     return colors[status] || "#6b7280";
//   };

//   const getStatusIcon = (status) => {
//     const icons = {
//       processing: "⏳",
//       shipped: "🚚",
//       delivered: "✅",
//       cancelled: "❌",
//       returned: "↩️",
//     };
//     return icons[status] || "📦";
//   };

//   if (loading) {
//     return (
//       <div className={styles.container}>
//         <div className={styles.loadingState}>
//           <h2>Loading orders...</h2>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.container}>
//       <div className={styles.content}>
//         <div className={styles.header}>
//           <h1>🔧 Admin - Orders Management</h1>
//           <p className={styles.subtitle}>
//             Update order status and delivery information
//           </p>
//         </div>

//         {error && (
//           <div className={styles.errorBanner}>
//             <p>❌ {error}</p>
//             <button onClick={loadOrders}>Retry</button>
//           </div>
//         )}

//         <div className={styles.filters}>
//           <button
//             className={`${styles.filterBtn} ${
//               filter === "all" ? styles.active : ""
//             }`}
//             onClick={() => setFilter("all")}
//           >
//             All Orders ({orders.length})
//           </button>
//           <button
//             className={`${styles.filterBtn} ${
//               filter === "processing" ? styles.active : ""
//             }`}
//             onClick={() => setFilter("processing")}
//           >
//             Processing
//           </button>
//           <button
//             className={`${styles.filterBtn} ${
//               filter === "shipped" ? styles.active : ""
//             }`}
//             onClick={() => setFilter("shipped")}
//           >
//             Shipped
//           </button>
//           <button
//             className={`${styles.filterBtn} ${
//               filter === "delivered" ? styles.active : ""
//             }`}
//             onClick={() => setFilter("delivered")}
//           >
//             Delivered
//           </button>
//         </div>

//         <div className={styles.ordersTable}>
//           <table>
//             <thead>
//               <tr>
//                 <th>Order ID</th>
//                 <th>Customer</th>
//                 <th>Total</th>
//                 <th>Status</th>
//                 <th>Date</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className={styles.emptyRow}>
//                     No orders found
//                   </td>
//                 </tr>
//               ) : (
//                 orders.map((order) => (
//                   <tr key={order._id}>
//                     <td className={styles.orderId}>{order.orderId}</td>
//                     <td className={styles.customer}>
//                       <div>
//                         <p className={styles.customerName}>
//                           {order.shippingInfo.fullName}
//                         </p>
//                         <p className={styles.customerEmail}>
//                           {order.shippingInfo.email}
//                         </p>
//                       </div>
//                     </td>
//                     <td className={styles.total}>
//                       ${order.pricing.total.toFixed(2)}
//                     </td>
//                     <td>
//                       <span
//                         className={styles.statusBadge}
//                         style={{ background: getStatusColor(order.status) }}
//                       >
//                         {getStatusIcon(order.status)}{" "}
//                         {order.status.toUpperCase()}
//                       </span>
//                     </td>
//                     <td className={styles.date}>
//                       {new Date(order.createdAt).toLocaleDateString("en-US")}
//                     </td>
//                     <td>
//                       <button
//                         onClick={() => openUpdateModal(order)}
//                         className={styles.editBtn}
//                       >
//                         ✏️ Update
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Update Modal */}
//       {updateModal && selectedOrder && (
//         <div className={styles.modal}>
//           <div className={styles.modalContent}>
//             <button onClick={closeModal} className={styles.modalClose}>
//               ✕
//             </button>

//             <h2>📦 Update Order: {selectedOrder.orderId}</h2>

//             <div className={styles.modalSection}>
//               <label>Order Status *</label>
//               <select
//                 value={newStatus}
//                 onChange={(e) => setNewStatus(e.target.value)}
//                 className={styles.select}
//               >
//                 <option value="processing">⏳ Processing</option>
//                 <option value="shipped">🚚 Shipped</option>
//                 <option value="delivered">✅ Delivered</option>
//                 <option value="cancelled">❌ Cancelled</option>
//                 <option value="returned">↩️ Returned</option>
//               </select>
//               <button onClick={updateOrderStatus} className={styles.updateBtn}>
//                 Update Status
//               </button>
//             </div>

//             <div className={styles.divider}></div>

//             <div className={styles.modalSection}>
//               <label>Tracking Number</label>
//               <input
//                 type="text"
//                 value={trackingNumber}
//                 onChange={(e) => setTrackingNumber(e.target.value)}
//                 placeholder="e.g., TRK123456789"
//                 className={styles.input}
//               />
//             </div>

//             <div className={styles.modalSection}>
//               <label>Estimated Delivery Date</label>
//               <input
//                 type="date"
//                 value={estimatedDelivery.split("T")[0] || ""}
//                 onChange={(e) => setEstimatedDelivery(e.target.value)}
//                 className={styles.input}
//               />
//             </div>

//             <div className={styles.modalSection}>
//               <label>Delivered At (if delivered)</label>
//               <input
//                 type="date"
//                 value={deliveredAt.split("T")[0] || ""}
//                 onChange={(e) => setDeliveredAt(e.target.value)}
//                 className={styles.input}
//               />
//             </div>

//             <button onClick={updateDeliveryInfo} className={styles.updateBtn}>
//               Update Delivery Info
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminOrders;
