import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { productAPI } from "../../services/api";
import styles from "./VendorDashboard.module.css";
import ProductForm from "../../ProductForm/ProductForm";
import ProductCard from "../../ProductCard/ProductCard";
import Modal from "../../Modal/Modal";
// import Modal from "../../components/Modal/Modal";

const VendorDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
    showCancel: false,
    confirmText: "OK",
    cancelText: "Cancel",
  });

  useEffect(() => {
    console.log("🔍 VendorDashboard mounted");
    console.log("User:", user);
    console.log("Token exists:", !!token);
    console.log("User role:", user?.role);

    if (!user || (user.role !== "vendor" && user.role !== "admin")) {
      console.warn("❌ User not authorized, redirecting to home");
      navigate("/");
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("📦 Fetching products...");
      console.log("User vendorId:", user?.vendorId);

      const response = await productAPI.getAll({ vendorId: user?.vendorId });
      console.log("✅ Products fetched:", response.data);

      setProducts(response.data.data || []);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      showModal({
        type: "error",
        title: "Error",
        message: "Failed to fetch products. Please refresh the page.",
        confirmText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const showModal = (config) => {
    setModal({
      isOpen: true,
      type: config.type || "info",
      title: config.title || "",
      message: config.message || "",
      onConfirm: config.onConfirm || null,
      showCancel: config.showCancel || false,
      confirmText: config.confirmText || "OK",
      cancelText: config.cancelText || "Cancel",
    });
  };

  const closeModal = () => {
    setModal({
      ...modal,
      isOpen: false,
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (product) => {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║     DELETE HANDLER CALLED              ║");
    console.log("╚════════════════════════════════════════╝\n");

    // Step 1: Product Info
    console.log("📦 PRODUCT INFORMATION:");
    console.log("   Product ID:", product._id);
    console.log("   Product Name:", product.name);
    console.log("   Product Vendor ID:", product.vendorId);
    console.log("");

    // Step 2: User Info
    console.log("👤 USER INFORMATION:");
    console.log("   User ID:", user?.id || user?._id);
    console.log("   User Name:", user?.name);
    console.log("   User Email:", user?.email);
    console.log("   User Role:", user?.role);
    console.log("   User Vendor ID:", user?.vendorId);
    console.log("");

    // Step 3: Token Info
    console.log("🔑 TOKEN INFORMATION:");
    console.log("   Token from context:", !!token);
    console.log("   Token from localStorage:", !!localStorage.getItem("token"));
    console.log("   Tokens match:", token === localStorage.getItem("token"));
    if (token) {
      console.log("   Token preview:", token.substring(0, 50) + "...");
    }
    console.log("");

    // Step 4: Permission Check
    console.log("🔒 PERMISSION CHECK:");
    const canDelete = user?.role === "admin" || user?.role === "vendor";
    console.log("   Can delete (admin or vendor):", canDelete);
    console.log("   Is admin:", user?.role === "admin");
    console.log("   Is vendor:", user?.role === "vendor");
    console.log("");

    if (!canDelete) {
      console.log("❌ PERMISSION DENIED - User does not have required role");
      showModal({
        type: "error",
        title: "Permission Denied",
        message: `You do not have permission to delete products.\n\nYour role: ${user?.role}\nRequired: admin or vendor`,
        confirmText: "OK",
      });
      return;
    }

    // Show confirmation modal
    showModal({
      type: "confirm",
      title: "Delete Product",
      message: `Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone.`,
      showCancel: true,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          console.log("╔════════════════════════════════════════╗");
          console.log("║     EXECUTING DELETE REQUEST           ║");
          console.log("╚════════════════════════════════════════╝");
          console.log("");
          console.log("🔄 Making DELETE API call...");
          console.log("   Product ID:", product._id);
          console.log("   Endpoint:", `/products/${product._id}`);
          console.log("");

          const response = await productAPI.delete(product._id);

          console.log("✅ DELETE API RESPONSE:");
          console.log("   Status:", response.status);
          console.log("   Success:", response.data?.success);
          console.log("   Message:", response.data?.message);
          console.log("   Data:", response.data);
          console.log("");

          // Refresh products list
          console.log("🔄 Refreshing products list...");
          await fetchProducts();
          console.log("✅ Products list refreshed");
          console.log("");

          // Show success modal
          showModal({
            type: "success",
            title: "Success",
            message: `"${product.name}" has been deleted successfully!`,
            confirmText: "OK",
          });

          console.log("╔════════════════════════════════════════╗");
          console.log("║     DELETE COMPLETED SUCCESSFULLY      ║");
          console.log("╚════════════════════════════════════════╝\n");
        } catch (error) {
          console.log("\n╔════════════════════════════════════════╗");
          console.log("║     DELETE FAILED - ERROR DETAILS      ║");
          console.log("╚════════════════════════════════════════╝\n");

          console.error("❌ ERROR OBJECT:");
          console.error("   Error:", error);
          console.error("   Error name:", error.name);
          console.error("   Error message:", error.message);
          console.error("");

          if (error.response) {
            console.error("📡 SERVER RESPONSE:");
            console.error("   Status:", error.response.status);
            console.error("   Status Text:", error.response.statusText);
            console.error("   Response Data:", error.response.data);
            console.error("   Response Headers:", error.response.headers);
            console.error("");
          } else if (error.request) {
            console.error("📡 NO SERVER RESPONSE:");
            console.error("   Request was made but no response received");
            console.error("   Request:", error.request);
            console.error("");
          } else {
            console.error("⚙️ REQUEST SETUP ERROR:");
            console.error("   Error setting up request");
            console.error("");
          }

          console.error("🔧 REQUEST CONFIG:");
          console.error("   URL:", error.config?.url);
          console.error("   Method:", error.config?.method);
          console.error("   Base URL:", error.config?.baseURL);
          console.error("   Headers:", error.config?.headers);
          console.error("");

          // Determine error message
          let errorMessage = "Failed to delete product";
          let errorDetails = "";

          if (error.response) {
            const status = error.response.status;
            const data = error.response.data;

            errorMessage = data?.error || data?.message || errorMessage;

            if (status === 401) {
              errorDetails =
                "\n\n🔒 Authentication Error: You are not logged in or your session has expired.\n\nPlease log in again.";
              setTimeout(() => {
                localStorage.removeItem("token");
                navigate("/");
              }, 2000);
            } else if (status === 403) {
              errorDetails = `\n\n🚫 Permission Denied: You do not have permission to delete this product.\n\nYour role: ${user?.role}\nRequired: admin or vendor`;
            } else if (status === 404) {
              errorDetails =
                "\n\n❓ Not Found: The product may have already been deleted.";
              await fetchProducts();
            } else if (status >= 500) {
              errorDetails =
                "\n\n⚠️ Server Error: There was a problem on the server. Please try again later.";
            }
          } else if (error.request) {
            errorMessage = "No response from server";
            errorDetails =
              "\n\n📡 Network Error: Could not connect to the server.\n\nPlease check your internet connection.";
          } else {
            errorMessage = error.message;
            errorDetails = "\n\n⚙️ An unexpected error occurred.";
          }

          showModal({
            type: "error",
            title: "Delete Failed",
            message: `${errorMessage}${errorDetails}\n\nStatus: ${
              error.response?.status || "Network Error"
            }`,
            confirmText: "OK",
          });

          console.log("╔════════════════════════════════════════╗");
          console.log("║     DELETE ERROR HANDLING COMPLETE     ║");
          console.log("╚════════════════════════════════════════╝\n");
        }
      },
    });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.stock > 0).length,
    lowStock: products.filter((p) => p.stock < 20 && p.stock > 0).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Debug Info Panel - Remove in production */}
      {import.meta.env.DEV && (
        <button
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px 15px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            zIndex: 9998,
          }}
        >
          {showDebugInfo ? "❌ Hide" : "🔍 Debug"} Info
        </button>
      )}

      {showDebugInfo && (
        <div
          style={{
            position: "fixed",
            bottom: "70px",
            right: "20px",
            backgroundColor: "#1a1a1a",
            color: "#00ff00",
            padding: "15px",
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "12px",
            maxWidth: "400px",
            maxHeight: "400px",
            overflowY: "auto",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "10px",
              fontSize: "14px",
            }}
          >
            🔍 Debug Information
          </div>
          <div>
            <strong>User Role:</strong> {user?.role || "N/A"}
          </div>
          <div>
            <strong>User ID:</strong> {user?.id || user?._id || "N/A"}
          </div>
          <div>
            <strong>Token:</strong> {token ? "✅ Present" : "❌ Missing"}
          </div>
          <div>
            <strong>Can Delete:</strong>{" "}
            {user?.role === "admin" || user?.role === "vendor"
              ? "✅ Yes"
              : "❌ No"}
          </div>
          <div>
            <strong>Products Count:</strong> {products.length}
          </div>
          <div
            style={{
              marginTop: "10px",
              paddingTop: "10px",
              borderTop: "1px solid #00ff00",
            }}
          >
            <div>
              <strong>localStorage token:</strong>{" "}
              {localStorage.getItem("token") ? "✅" : "❌"}
            </div>
          </div>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1>Vendor Dashboard</h1>
            <p className={styles.welcome}>Welcome, {user?.name}!</p>
          </div>
          <div className={styles.headerActions}>
            {(user?.role === "admin" || user?.role === "vendor") && (
              <Link to="/admin/user-cart" className={styles.cartLink}>
                🛒 Cart Management
              </Link>
            )}

            {(user?.role === "admin" || user?.role === "vendor") && (
              <Link to="/admin/orders" className={styles.adminLink}>
                🔧 Manage Orders
              </Link>
            )}

            <button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
              className={styles.addBtn}
            >
              ➕ Add New Product
            </button>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📦</div>
            <div className={styles.statContent}>
              <h3>Total Products</h3>
              <p className={styles.statValue}>{stats.total}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <h3>In Stock</h3>
              <p className={styles.statValue}>{stats.inStock}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⚠️</div>
            <div className={styles.statContent}>
              <h3>Low Stock</h3>
              <p className={styles.statValue}>{stats.lowStock}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>❌</div>
            <div className={styles.statContent}>
              <h3>Out of Stock</h3>
              <p className={styles.statValue}>{stats.outOfStock}</p>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className={styles.empty}>
            <h2>No products yet</h2>
            <p>Add your first product to get started!</p>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                showActions={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className={styles.modal}>
          <ProductForm
            product={editingProduct}
            token={token}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        </div>
      )}

      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        showCancel={modal.showCancel}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
      />
    </div>
  );
};

export default VendorDashboard;
