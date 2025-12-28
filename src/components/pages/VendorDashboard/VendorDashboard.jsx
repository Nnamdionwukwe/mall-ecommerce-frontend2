import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { productAPI } from "../../services/api";
import styles from "./VendorDashboard.module.css";
import ProductForm from "../../ProductForm/ProductForm";
import ProductCard from "../../ProductCard/ProductCard";

const VendorDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if (!user || (user.role !== "vendor" && user.role !== "admin")) {
      navigate("/");
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll({ vendorId: user?.vendorId });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (product) => {
    console.log("\n========================================");
    console.log("🗑️ DELETE HANDLER CALLED");
    console.log("========================================");
    console.log("Product:", product);
    console.log("Product ID:", product._id);
    console.log("User:", user);
    console.log("User Role:", user?.role);
    console.log("Token exists:", !!token);
    console.log("========================================\n");

    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      console.log("❌ Delete cancelled by user");
      return;
    }

    try {
      console.log("🔄 Calling productAPI.delete...");
      await productAPI.delete(product._id);

      console.log("✅ Delete successful, refreshing products...");
      await fetchProducts();

      alert(`"${product.name}" has been deleted successfully!`);
    } catch (error) {
      console.error("\n========================================");
      console.error("❌ DELETE FAILED IN HANDLER");
      console.error("========================================");
      console.error("Error:", error);
      console.error("Response:", error.response);
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.error("========================================\n");

      // Show detailed error to user
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to delete product";

      alert(
        `Failed to delete product:\n${errorMessage}\n\nStatus: ${
          error.response?.status || "Unknown"
        }`
      );
    }
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
    </div>
  );
};

export default VendorDashboard;
