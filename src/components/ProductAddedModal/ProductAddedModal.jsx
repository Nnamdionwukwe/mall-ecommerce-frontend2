// ProductAddedModal.jsx
import React from "react";
import styles from "./ProductAddedModal.module.css";
import { X, CheckCircle } from "lucide-react";

const ProductAddedModal = ({ isOpen, product, onClose, onGoToCart }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <CheckCircle className={styles.icon} size={28} />
            <h2 className={styles.title}>Added to Cart!</h2>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        {product && (
          <div className={styles.productContainer}>
            <div className={styles.productBox}>
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className={styles.productImage}
                />
              )}
              <div className={styles.productInfo}>
                <p className={styles.productName}>{product.name}</p>
                <p className={styles.productQty}>
                  Qty: {product.quantity || 1}
                </p>
                <p className={styles.productPrice}>${product.price}</p>
              </div>
            </div>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={styles.secondaryBtn}>
            Continue Shopping
          </button>
          <button onClick={onGoToCart} className={styles.primaryBtn}>
            Go to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductAddedModal;
