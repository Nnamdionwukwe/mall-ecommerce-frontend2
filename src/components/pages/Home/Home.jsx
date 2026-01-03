import { useState, useEffect } from "react";
import { productAPI } from "../../services/api";
import styles from "./Home.module.css";
import ProductCard from "../../ProductCard/ProductCard";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { getCategoriesWithProducts } from "../../constants/categories";

const Home = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt-desc");

  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, categoryFilter, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await productAPI.getAll();
      setProducts(response.data.data || []);
    } catch (err) {
      setError("Failed to load products. Please check your connection.");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.description &&
            p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    // Sort
    const [sortField, sortOrder] = sortBy.split("-");
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "name") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  };

  // Get only categories that have products
  const categories = getCategoriesWithProducts(products);

  const stats = {
    total: products.length,
    categories: categories.length,
    vendors: [...new Set(products.map((p) => p.vendorName))].length,
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>⚠️ {error}</h2>
          <button onClick={fetchProducts} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      {/* <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Welcome to Ochacho Pharmacy/Supermarket
        </h1>
        <p className={styles.heroSubtitle}>
          Discover your favorite amazing products from our stores
        </p>
      </div> */}

      {/* Modern Search Bar */}
      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {/* <button className={styles.cameraIconBtn} title="Search by image">
            📷
          </button>
          <button className={styles.searchIconBtn} title="Search">
            🔍
          </button> */}
        </div>

        {/* Category Tabs */}
        <div className={styles.categoryTabs}>
          <button
            className={`${styles.categoryTab} ${
              categoryFilter === "" ? styles.active : ""
            }`}
            onClick={() => setCategoryFilter("")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryTab} ${
                categoryFilter === cat ? styles.active : ""
              }`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.hero}>
        <p className={styles.heroSubtitle}>
          Discover your favorite amazing products from our stores
        </p>
      </div>

      {/* Sort Dropdown */}
      <div className={styles.sortContainer}>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.select}
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
        </select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className={styles.noProducts}>
          <h2>No products found</h2>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div className={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
