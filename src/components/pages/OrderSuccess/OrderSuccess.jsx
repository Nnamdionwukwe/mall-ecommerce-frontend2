import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./OrderSuccess.module.css";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Confetti or celebration animation can be added here
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.successCard}>
          <div className={styles.iconContainer}>
            <div className={styles.checkmark}>✓</div>
          </div>

          <h1 className={styles.title}>Payment Successful!</h1>
          <p className={styles.subtitle}>
            Thank you for your order. Your payment has been processed
            successfully.
          </p>

          <div className={styles.orderInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Order ID:</span>
              <span className={styles.value}>{orderId}</span>
            </div>
          </div>

          <p className={styles.message}>
            We've sent a confirmation email with your order details. You can
            track your order status anytime.
          </p>

          <div className={styles.actions}>
            <button
              onClick={() => navigate(`/track-order/${orderId}`)}
              className={styles.trackBtn}
            >
              📍 Track Order
            </button>
            <button
              onClick={() => navigate("/orders")}
              className={styles.ordersBtn}
            >
              📦 View All Orders
            </button>
            <button onClick={() => navigate("/")} className={styles.homeBtn}>
              🏠 Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
