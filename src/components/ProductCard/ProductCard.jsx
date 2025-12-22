import { Link, useNavigate } from "react-router-dom";
import { useState } from "react"; // Import the hook
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
  const { formatPrice } = useCurrency(); // Use the currency context
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

  const handleAddToCart = () => {
    // Call the parent's onAddToCart function
    onAddToCart(product);
    // Show the ProductAddedModal
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
            {/* Display formatted price with Naira symbol */}
            <span className={styles.price}>{formatPrice(product.price)}</span>
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
              <button
                onClick={() => onEdit(product)}
                className={styles.editBtn}
              >
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
              disabled={product.stock === 0}
              onClick={handleAddToCart}
              className={styles.addToCartBtn}
            >
              🛒 Add to Cart
            </button>
          )}
        </div>
      </div>
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
