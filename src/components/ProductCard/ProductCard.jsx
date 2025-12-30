import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./ProductCard.module.css";
import ProductAddedModal from "../ProductAddedModal/ProductAddedModal";
import { useCurrency } from "../context/CurrencyContext";

const ProductCard = ({
  product,
  onAddToCart,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);

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

  const renderStars = (rating = 5) => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    setAddedProduct({
      name: product.name,
      price: product.price,
      image: product.images[0] || null,
      quantity: 1,
    });
    setModalOpen(true);
  };

  const handleGoToCart = () => {
    setModalOpen(false);
    navigate("/cart");
  };

  return (
    <>
      <div className={styles.card}>
        {/* Badge overlay - show if product has special status */}
        {product.isFeatured && <div className={styles.badge}>⭐ Featured</div>}
        {product.discount && (
          <div className={styles.badge} style={{ background: "#ef4444" }}>
            -₦{product.discount}
          </div>
        )}

        {/* Image section */}
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

        {/* Content section */}
        <div className={styles.content}>
          {/* Rating */}
          {product.rating && (
            <div className={styles.rating}>
              <span className={styles.stars}>
                {renderStars(product.rating)}
              </span>
              {product.reviewCount && (
                <span className={styles.ratingCount}>
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <Link to={`/product/${product._id}`} className={styles.titleLink}>
            <h3 className={styles.title}>{product.name}</h3>
          </Link>

          {/* Description */}
          <p className={styles.description}>
            {product.description || "No description"}
          </p>

          {/* Tags */}
          {(product.isBestSeller || product.isOfficialStore) && (
            <div style={{ marginBottom: "0.375rem" }}>
              {product.isBestSeller && (
                <span className={`${styles.tag} ${styles.bestSellerTag}`}>
                  Best Seller
                </span>
              )}
              {product.isOfficialStore && (
                <span className={`${styles.tag} ${styles.brandTag}`}>
                  Official Store
                </span>
              )}
            </div>
          )}

          {/* Price and Stock */}
          <div className={styles.meta}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            <span
              className={`${styles.stock} ${
                product.stock < 20 ? styles.lowStock : ""
              }`}
            >
              {product.stock === 0
                ? "Out of Stock"
                : product.stock < 20
                ? `Only ${product.stock} left`
                : `${product.stock} in stock`}
            </span>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <span className={styles.category}>{product.category}</span>
            <span className={styles.vendor}>{product.vendorName}</span>
          </div>

          {/* Actions */}
          {showActions ? (
            <div className={styles.actions}>
              <button
                onClick={() => onEdit(product)}
                className={styles.editBtn}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => onDelete(product)}
                className={styles.deleteBtn}
              >
                🗑️ Delete
              </button>
            </div>
          ) : (
            <button
              disabled={product.stock === 0}
              onClick={handleAddToCart}
              className={styles.addToCartBtn}
            >
              🛒 Add to Cart
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      <ProductAddedModal
        isOpen={modalOpen}
        product={addedProduct}
        onClose={() => setModalOpen(false)}
        onGoToCart={handleGoToCart}
      />
    </>
  );
};

export default ProductCard;
