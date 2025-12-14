import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI } from "../../services/api";
import styles from "./ProductDetails.module.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await productAPI.getById(id);
      setProduct(response.data.data);
    } catch (err) {
      setError("Product not found");
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += quantity;
      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      cart.push({ ...product, quantity });
      localStorage.setItem("cart", JSON.stringify(cart));
    }

    alert(`Added ${quantity} ${product.name} to cart!`);
    navigate("/cart");
  };

  const getEmoji = (category) => {
    const map = {
      Electronics: "📱",
      Sports: "⚽",
      "Home & Kitchen": "🏠",
      Clothing: "👕",
      Books: "📚",
      Toys: "🎮",
      Beauty: "💄",
      Food: "🍔",
    };
    return map[category] || "🛍️";
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>⚠️ {error || "Product not found"}</h2>
          <button onClick={() => navigate("/")} className={styles.backBtn}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const hasImages = product.images && product.images.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          ← Back
        </button>

        <div className={styles.productContainer}>
          {/* Image Gallery */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              {hasImages ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className={styles.image}
                />
              ) : (
                <div className={styles.emojiPlaceholder}>
                  {getEmoji(product.category)}
                </div>
              )}
            </div>

            {hasImages && product.images.length > 1 && (
              <div className={styles.thumbnails}>
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className={`${styles.thumbnail} ${
                      selectedImage === index ? styles.activeThumbnail : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={styles.infoSection}>
            <span className={styles.category}>{product.category}</span>
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.vendor}>by {product.vendorName}</p>

            <div className={styles.price}>${product.price.toFixed(2)}</div>

            <div className={styles.stockInfo}>
              <span
                className={`${styles.stock} ${
                  product.stock < 20 ? styles.lowStock : ""
                }`}
              >
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </span>
            </div>

            <p className={styles.description}>
              {product.description || "No description available"}
            </p>

            <div className={styles.actions}>
              <div className={styles.quantitySelector}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={styles.quantityBtn}
                >
                  −
                </button>
                <span className={styles.quantity}>{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className={styles.quantityBtn}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <button
                onClick={addToCart}
                className={styles.addToCartBtn}
                disabled={product.stock === 0}
              >
                🛒 Add to Cart
              </button>
            </div>

            <div className={styles.details}>
              <h3>Product Details</h3>
              <div className={styles.detailItem}>
                <span>Category:</span>
                <span>{product.category}</span>
              </div>
              <div className={styles.detailItem}>
                <span>Vendor:</span>
                <span>{product.vendorName}</span>
              </div>
              <div className={styles.detailItem}>
                <span>Stock:</span>
                <span>{product.stock} units</span>
              </div>
              <div className={styles.detailItem}>
                <span>Product ID:</span>
                <span className={styles.productId}>{product._id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
