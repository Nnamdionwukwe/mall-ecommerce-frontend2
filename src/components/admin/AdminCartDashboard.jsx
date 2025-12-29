import React, { useState, useEffect } from "react";
import { Trash2, Eye, BarChart3, Loader } from "lucide-react";
import styles from "./AdminCartDashboard.module.css";

export default function AdminCartDashboard() {
  const [activeTab, setActiveTab] = useState("all-carts");
  const [allCarts, setAllCarts] = useState([]);
  const [selectedUserCart, setSelectedUserCart] = useState(null);
  const [cartSummary, setCartSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE = "https://mall-ecommerce-api-production.up.railway.app/api";
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch all carts
  const fetchAllCarts = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE}/carts/admin/all-carts?page=${page}&limit=10`,
        { headers }
      );
      const data = await response.json();

      if (data.success) {
        setAllCarts(data.data);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.pages);
      } else {
        setError(data.message || "Failed to fetch carts");
      }
    } catch (err) {
      setError("Error fetching carts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart summary
  const fetchCartSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/carts/admin/carts-summary`, {
        headers,
      });
      const data = await response.json();

      if (data.success) {
        setCartSummary(data.data);
      } else {
        setError(data.message || "Failed to fetch summary");
      }
    } catch (err) {
      setError("Error fetching summary: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific user's cart
  const fetchUserCart = async (userId) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/carts/admin/cart/${userId}`, {
        headers,
      });
      const data = await response.json();

      if (data.success) {
        setSelectedUserCart(data.data);
        setActiveTab("user-cart");
      } else {
        setError(data.message || "Failed to fetch user cart");
      }
    } catch (err) {
      setError("Error fetching user cart: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear user's cart
  const clearUserCart = async (userId) => {
    if (!window.confirm("Are you sure you want to clear this user's cart?")) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/carts/admin/cart/${userId}`, {
        method: "DELETE",
        headers,
      });
      const data = await response.json();

      if (data.success) {
        fetchAllCarts(currentPage);
        setError("");
      } else {
        setError(data.message || "Failed to clear cart");
      }
    } catch (err) {
      setError("Error clearing cart: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (activeTab === "all-carts") {
      fetchAllCarts();
    } else if (activeTab === "summary") {
      fetchCartSummary();
    }
  }, [activeTab]);

  return (
    <div className={styles.container}>
      <div className={styles.maxWidth}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Shopping Cart Management</h1>
          <p className={styles.subtitle}>View and manage all customer carts</p>
        </div>

        {/* Error Message */}
        {error && <div className={styles.errorBox}>{error}</div>}

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <button
            onClick={() => setActiveTab("all-carts")}
            className={`${styles.tabButton} ${
              activeTab === "all-carts" ? styles.tabButtonActive : ""
            }`}
          >
            All Carts
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`${styles.tabButton} ${
              activeTab === "summary" ? styles.tabButtonActive : ""
            }`}
          >
            <BarChart3 size={18} /> Summary
          </button>
          {selectedUserCart && (
            <button
              onClick={() => setActiveTab("user-cart")}
              className={`${styles.tabButton} ${
                activeTab === "user-cart" ? styles.tabButtonActive : ""
              }`}
            >
              User Details
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.loadingContainer}>
            <Loader className={styles.spinner} size={40} />
          </div>
        )}

        {/* All Carts Tab */}
        {activeTab === "all-carts" && !loading && (
          <div>
            <div className={styles.cartsGrid}>
              {allCarts.length > 0 ? (
                allCarts.map((cart) => (
                  <div key={cart.cartId} className={styles.cartCard}>
                    <div className={styles.cartCardHeader}>
                      <div className={styles.cartCardInfo}>
                        <h3 className={styles.cartCardName}>{cart.userName}</h3>
                        <p className={styles.cartCardEmail}>{cart.userEmail}</p>
                        <p className={styles.cartCardPhone}>
                          📱 {cart.userPhone || "No phone"}
                        </p>
                      </div>
                      <div className={styles.cartCardTotal}>
                        <div className={styles.totalAmount}>
                          ₦{cart.cartSummary.total.toLocaleString()}
                        </div>
                        <div className={styles.itemCount}>
                          {cart.itemCount} items
                        </div>
                      </div>
                    </div>

                    {/* Cart Items Preview */}
                    <div className={styles.cartSummaryBox}>
                      <div className={styles.summaryGrid}>
                        <div>Subtotal: ₦{cart.cartSummary.subtotal}</div>
                        <div>Shipping: ₦{cart.cartSummary.shipping || "0"}</div>
                        <div>Vat: ₦{cart.cartSummary.tax || "0"}</div>
                        <div>Total: ₦{cart.cartSummary.total}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => fetchUserCart(cart.userId)}
                        className={styles.viewButton}
                      >
                        <Eye size={16} /> View Details
                      </button>
                      <button
                        onClick={() => clearUserCart(cart.userId)}
                        className={styles.deleteButton}
                      >
                        <Trash2 size={16} /> Clear Cart
                      </button>
                    </div>

                    <p className={styles.lastUpdated}>
                      Last updated:{" "}
                      {new Date(cart.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No carts found</div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.paginationContainer}>
                <button
                  onClick={() => fetchAllCarts(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  Previous
                </button>
                <span className={styles.paginationInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchAllCarts(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === "summary" && !loading && cartSummary && (
          <div className={styles.summaryGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Users</div>
              <div className={styles.statValue} style={{ color: "#60a5fa" }}>
                {cartSummary.totalUsers}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Users with Items</div>
              <div className={styles.statValue} style={{ color: "#4ade80" }}>
                {cartSummary.usersWithItems}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Empty Carts</div>
              <div className={styles.statValue} style={{ color: "#facc15" }}>
                {cartSummary.usersWithoutItems}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Cart Value</div>
              <div className={styles.statValue} style={{ color: "#d946ef" }}>
                ₦{cartSummary.estimatedCartValue.toLocaleString()}
              </div>
            </div>
            <div className={`${styles.statCard} ${styles.fullWidth}`}>
              <div className={styles.statLabel}>Total Items</div>
              <div className={styles.statValue} style={{ color: "#fb923c" }}>
                {cartSummary.totalItemsInCarts}
              </div>
            </div>
          </div>
        )}

        {/* User Cart Details Tab */}
        {activeTab === "user-cart" && selectedUserCart && !loading && (
          <div className={styles.userCartContainer}>
            {/* User Info */}
            <div className={styles.userInfoSection}>
              <h2 className={styles.userName}>{selectedUserCart.user.name}</h2>
              <div className={styles.userDetailsGrid}>
                <div>
                  <span className={styles.detailLabel}>Email:</span>
                  <p className={styles.detailValue}>
                    {selectedUserCart.user.email}
                  </p>
                </div>
                <div>
                  <span className={styles.detailLabel}>Phone:</span>
                  <p className={styles.detailValue}>
                    {selectedUserCart.user.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <span className={styles.detailLabel}>Role:</span>
                  <p className={styles.detailValue}>
                    {selectedUserCart.user.role}
                  </p>
                </div>
                <div>
                  <span className={styles.detailLabel}>Status:</span>
                  <p
                    className={styles.detailValue}
                    style={{
                      color: selectedUserCart.user.isActive
                        ? "#4ade80"
                        : "#ef4444",
                    }}
                  >
                    {selectedUserCart.user.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div>
                  <span className={styles.detailLabel}>Address:</span>
                  <p className={styles.detailValue}>
                    {selectedUserCart.user.address || "N/A"}
                  </p>
                </div>
                <div>
                  <span className={styles.detailLabel}>Joined:</span>
                  <p className={styles.detailValue}>
                    {new Date(
                      selectedUserCart.user.joinedDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            {selectedUserCart.items.length > 0 ? (
              <div className={styles.itemsSection}>
                <h3 className={styles.itemsTitle}>
                  Cart Items ({selectedUserCart.items.length})
                </h3>
                <div className={styles.itemsList}>
                  {selectedUserCart.items.map((item, index) => (
                    <div key={index} className={styles.itemCard}>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className={styles.itemImage}
                        />
                      )}
                      <div className={styles.itemDetails}>
                        <p className={styles.itemName}>{item.name}</p>
                        <p className={styles.itemPrice}>
                          ₦{item.price.toLocaleString()} × {item.quantity}
                        </p>
                        {item.vendor && (
                          <p className={styles.itemVendor}>
                            Vendor: {item.vendor}
                          </p>
                        )}
                      </div>
                      <div className={styles.itemTotal}>
                        ₦{item.itemTotal.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className={styles.cartTotalSection}>
                  <div className={styles.totalRow}>
                    <span>Subtotal:</span>
                    <span>
                      ₦{selectedUserCart.cartSummary.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Shipping:</span>
                    <span>
                      ₦{selectedUserCart.cartSummary.shipping.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Vat:</span>
                    <span>
                      ₦{selectedUserCart.cartSummary.tax.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.totalRowFinal}>
                    <span>Total:</span>
                    <span>
                      ₦{selectedUserCart.cartSummary.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Clear Button */}
                <button
                  onClick={() => clearUserCart(selectedUserCart.userId)}
                  className={styles.clearCartButton}
                >
                  <Trash2 size={18} /> Clear This Cart
                </button>
              </div>
            ) : (
              <div className={styles.emptyCartMessage}>
                This user has no items in their cart
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
