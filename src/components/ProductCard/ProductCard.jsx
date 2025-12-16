import { Link } from "react-router-dom";
import { useState } from "react";
import styles from "./ProductCard.module.css";

const ProductCard = ({
  product,
  onAddToCart,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  const [imageError, setImageError] = useState(false);

  const hasImage =
    product.images && product.images.length > 0 && product.images[0];

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

  return (
    <div className={styles.card}>
      <Link to={`/product/${product._id}`} className={styles.imageLink}>
        <div className={styles.imageContainer}>
          {hasImage && !imageError ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className={styles.image}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={styles.emojiPlaceholder}>
              {getEmoji(product.category)}
            </div>
          )}
        </div>
      </Link>

      <div className={styles.content}>
        <Link to={`/product/${product._id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{product.name}</h3>
        </Link>
        <p className={styles.description}>
          {product.description || "No description"}
        </p>

        <div className={styles.meta}>
          <span className={styles.price}>${product.price.toFixed(2)}</span>
          <span
            className={`${styles.stock} ${
              product.stock < 20 ? styles.lowStock : ""
            }`}
          >
            {product.stock} in stock
          </span>
        </div>

        <div className={styles.footer}>
          <span className={styles.category}>{product.category}</span>
          <span className={styles.vendor}>{product.vendorName}</span>
        </div>

        {showActions ? (
          <div className={styles.actions}>
            <button onClick={() => onEdit(product)} className={styles.editBtn}>
              Edit
            </button>
            <button
              onClick={() => onDelete(product)}
              className={styles.deleteBtn}
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAddToCart(product)}
            className={styles.addToCartBtn}
          >
            🛒 Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
