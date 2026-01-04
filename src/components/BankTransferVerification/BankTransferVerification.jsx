import { useState, useEffect } from "react";
import styles from "./BankTransferVerification.module.css";
import axios from "axios";
import AlertModal from "../AlertModal/AlertModal";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";

const API_BASE = "https://mall-ecommerce-api-production.up.railway.app/api";

const BankTransferVerification = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(30); // seconds
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);

  // Verification form
  const [amountReceived, setAmountReceived] = useState("");
  const [bankStatementProof, setBankStatementProof] = useState("");
  const [verificationNote, setVerificationNote] = useState("");

  // Alert Modal
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    primaryBtnText: "OK",
    onPrimaryClick: null,
  });

  // Filter and search
  const [filter, setFilter] = useState("all"); // all, verified, pending
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "vendor")) {
      showAlert(
        "Access Denied",
        "You do not have permission to access this page.",
        "error"
      );
      return;
    }
    loadPendingBankTransfers();

    // Set up auto-refresh
    let interval;
    if (autoRefreshEnabled && autoRefreshInterval > 0) {
      interval = setInterval(() => {
        console.log("🔄 Auto-refreshing bank transfers...");
        loadPendingBankTransfers();
      }, autoRefreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, autoRefreshEnabled, autoRefreshInterval]);

  const loadPendingBankTransfers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || user?.token;

      const response = await axios.get(
        `${API_BASE}/orders/pending-bank-transfers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setPendingOrders(response.data.data || []);
        setLastRefreshTime(new Date());
        console.log(`✅ Loaded ${response.data.count} pending bank transfers`);
      } else {
        setPendingOrders([]);
      }
    } catch (error) {
      console.error("❌ Error loading pending transfers:", error);
      showAlert(
        "Error",
        error.response?.data?.message ||
          "Failed to load pending bank transfers",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (title, message, type = "info", onConfirm = null) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
      primaryBtnText: "OK",
      onPrimaryClick: () => {
        setAlertModal((prev) => ({ ...prev, isOpen: false }));
        if (onConfirm) onConfirm();
      },
    });
  };

  const openVerificationModal = (order) => {
    setSelectedOrder(order);
    setAmountReceived(order.pricing?.total || "");
    setBankStatementProof("");
    setVerificationNote("");
    setShowVerificationModal(true);
  };

  const closeVerificationModal = () => {
    setShowVerificationModal(false);
    setSelectedOrder(null);
    setAmountReceived("");
    setBankStatementProof("");
    setVerificationNote("");
  };

  const verifyBankTransfer = async () => {
    if (!selectedOrder) return;

    // Validate
    if (
      !amountReceived ||
      isNaN(amountReceived) ||
      parseFloat(amountReceived) <= 0
    ) {
      showAlert(
        "Validation Error",
        "Please enter a valid amount received",
        "error"
      );
      return;
    }

    if (parseFloat(amountReceived) < selectedOrder.pricing?.total) {
      showAlert(
        "Amount Mismatch",
        `Amount received (₦${amountReceived}) is less than required (₦${selectedOrder.pricing?.total})`,
        "error"
      );
      return;
    }

    setVerifying(true);

    try {
      const token = localStorage.getItem("token") || user?.token;

      const response = await axios.post(
        `${API_BASE}/orders/verify-bank-transfer/${selectedOrder.orderId}`,
        {
          transactionId: `TXN-${Date.now()}`,
          amountReceived: parseFloat(amountReceived),
          bankStatementProof: bankStatementProof || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        console.log("✅ Bank transfer verified successfully");

        // Add note to order if note provided
        if (verificationNote) {
          try {
            await axios.post(
              `${API_BASE}/orders/${selectedOrder._id}/notes`,
              { message: `[ADMIN VERIFIED] ${verificationNote}` },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
          } catch (noteError) {
            console.error(
              "Note could not be added, but verification succeeded"
            );
          }
        }

        closeVerificationModal();
        showAlert(
          "Success! ✅",
          `Bank transfer verified for order ${selectedOrder.orderId}.\n\nAmount: ₦${amountReceived}\n\nThe customer's order has been updated to "Processing".`,
          "success",
          () => loadPendingBankTransfers()
        );
      } else {
        throw new Error(response.data.message || "Verification failed");
      }
    } catch (error) {
      console.error("❌ Error verifying bank transfer:", error);
      showAlert(
        "Verification Failed",
        error.response?.data?.message ||
          error.message ||
          "Failed to verify bank transfer",
        "error"
      );
    } finally {
      setVerifying(false);
    }
  };

  const getFilteredOrders = () => {
    let filtered = [...pendingOrders];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shippingInfo?.fullName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.shippingInfo?.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply filter
    if (filter === "verified") {
      filtered = filtered.filter(
        (order) =>
          order.paymentInfo?.status === "paid" &&
          order.paymentInfo?.bankTransfer?.verifiedAt
      );
    } else if (filter === "pending") {
      filtered = filtered.filter(
        (order) => order.paymentInfo?.status === "pending"
      );
    }

    return filtered;
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

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <h2>Loading bank transfers...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1>🏦 Bank Transfer Verification</h1>
            <p className={styles.subtitle}>
              Verify and manage bank transfer payments
            </p>
          </div>

          {/* Auto-Refresh Controls */}
          <div className={styles.autoRefreshControls}>
            <div className={styles.refreshStatus}>
              {autoRefreshEnabled && (
                <>
                  <span className={styles.refreshIndicator}>🔄</span>
                  <span className={styles.refreshText}>
                    Auto-refresh enabled • Every {autoRefreshInterval}s
                  </span>
                  {lastRefreshTime && (
                    <span className={styles.lastRefresh}>
                      Last refresh: {lastRefreshTime.toLocaleTimeString()}
                    </span>
                  )}
                </>
              )}
            </div>

            <div className={styles.refreshControls}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={autoRefreshEnabled}
                  onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                />
                <span>Auto Refresh</span>
              </label>

              {autoRefreshEnabled && (
                <select
                  value={autoRefreshInterval}
                  onChange={(e) =>
                    setAutoRefreshInterval(parseInt(e.target.value))
                  }
                  className={styles.intervalSelect}
                >
                  <option value={10}>Every 10s</option>
                  <option value={20}>Every 20s</option>
                  <option value={30}>Every 30s</option>
                  <option value={60}>Every 1m</option>
                  <option value={120}>Every 2m</option>
                  <option value={300}>Every 5m</option>
                </select>
              )}

              <button
                onClick={loadPendingBankTransfers}
                className={styles.refreshBtn}
                title="Refresh now"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statContent}>
              <h3>Pending Verification</h3>
              <p className={styles.statValue}>
                {
                  pendingOrders.filter(
                    (o) => o.paymentInfo?.status === "pending"
                  ).length
                }
              </p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <h3>Verified</h3>
              <p className={styles.statValue}>
                {
                  pendingOrders.filter((o) => o.paymentInfo?.status === "paid")
                    .length
                }
              </p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statContent}>
              <h3>Total Pending Amount</h3>
              <p className={styles.statValue}>
                ₦
                {pendingOrders
                  .filter((o) => o.paymentInfo?.status === "pending")
                  .reduce((sum, order) => sum + (order.pricing?.total || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.controls}>
          <div className={styles.filters}>
            <button
              className={`${styles.filterBtn} ${
                filter === "all" ? styles.active : ""
              }`}
              onClick={() => setFilter("all")}
            >
              All ({pendingOrders.length})
            </button>
            <button
              className={`${styles.filterBtn} ${
                filter === "pending" ? styles.active : ""
              }`}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>
            <button
              className={`${styles.filterBtn} ${
                filter === "verified" ? styles.active : ""
              }`}
              onClick={() => setFilter("verified")}
            >
              Verified
            </button>
          </div>

          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="🔍 Search by Order ID, Customer name, or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className={styles.ordersTable}>
          {filteredOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No bank transfers found</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className={styles.orderRow}>
                    <td className={styles.orderId}>{order.orderId}</td>
                    <td className={styles.customer}>
                      <div>
                        <p className={styles.customerName}>
                          {order.shippingInfo?.fullName}
                        </p>
                        <p className={styles.customerEmail}>
                          {order.shippingInfo?.email}
                        </p>
                      </div>
                    </td>
                    <td className={styles.amount}>
                      <strong>{formatPrice(order.pricing?.total)}</strong>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          order.paymentInfo?.status === "paid"
                            ? styles.verified
                            : styles.pending
                        }`}
                      >
                        {order.paymentInfo?.status === "paid"
                          ? "✅ Verified"
                          : "⏳ Pending"}
                      </span>
                    </td>
                    <td className={styles.date}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td className={styles.date}>
                      {order.paymentInfo?.bankTransfer?.verifiedAt
                        ? formatDate(order.paymentInfo.bankTransfer.verifiedAt)
                        : "-"}
                    </td>
                    <td>
                      {order.paymentInfo?.status === "pending" ? (
                        <button
                          onClick={() => openVerificationModal(order)}
                          className={styles.verifyBtn}
                          title="Verify payment"
                        >
                          ✅ Verify
                        </button>
                      ) : (
                        <button className={styles.verifiedBtn} disabled>
                          ✓ Verified
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && selectedOrder && (
        <div className={styles.modal} onClick={closeVerificationModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeVerificationModal}
              className={styles.modalClose}
            >
              ✕
            </button>

            <h2>🏦 Verify Bank Transfer</h2>
            <p className={styles.modalSubtitle}>
              Order: {selectedOrder.orderId}
            </p>

            {/* Order Summary */}
            <div className={styles.orderSummary}>
              <div className={styles.summaryItem}>
                <span>Customer:</span>
                <strong>{selectedOrder.shippingInfo?.fullName}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Expected Amount:</span>
                <strong>{formatPrice(selectedOrder.pricing?.total)}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Bank Details:</span>
                <div className={styles.bankDetails}>
                  <p>
                    <strong>Bank:</strong>{" "}
                    {selectedOrder.paymentInfo?.bankTransfer?.bankName}
                  </p>
                  <p>
                    <strong>Account:</strong>{" "}
                    {selectedOrder.paymentInfo?.bankTransfer?.accountName}
                  </p>
                  <p>
                    <strong>Account Number:</strong>{" "}
                    {selectedOrder.paymentInfo?.bankTransfer?.accountNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Form */}
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Amount Received *</label>
                <input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder={selectedOrder.pricing?.total}
                  step="0.01"
                  className={styles.input}
                />
                <small>
                  Expected: ₦{selectedOrder.pricing?.total.toLocaleString()}
                </small>
              </div>

              <div className={styles.formGroup}>
                <label>Bank Statement Proof URL</label>
                <input
                  type="url"
                  value={bankStatementProof}
                  onChange={(e) => setBankStatementProof(e.target.value)}
                  placeholder="https://example.com/proof.jpg"
                  className={styles.input}
                />
                <small>Optional: Link to screenshot or document proof</small>
              </div>

              <div className={styles.formGroup}>
                <label>Verification Note</label>
                <textarea
                  value={verificationNote}
                  onChange={(e) => setVerificationNote(e.target.value)}
                  placeholder="Add any notes about this verification (optional)"
                  rows="3"
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  onClick={verifyBankTransfer}
                  disabled={verifying}
                  className={styles.submitBtn}
                >
                  {verifying ? "⏳ Verifying..." : "✅ Verify Payment"}
                </button>
                <button
                  onClick={closeVerificationModal}
                  className={styles.cancelBtn}
                  disabled={verifying}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        primaryBtnText={alertModal.primaryBtnText}
        onPrimaryClick={alertModal.onPrimaryClick}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default BankTransferVerification;
