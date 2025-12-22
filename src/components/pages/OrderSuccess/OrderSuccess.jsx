import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "./OrderSuccess.module.css";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.icon}>✅</div>
        <h1>Order Placed Successfully!</h1>
        <p>Order ID: {orderId}</p>
        {orderData && (
          <div className={styles.orderInfo}>
            <p>Status: {orderData.status}</p>
            <p>Total: ₦{orderData.total}</p>
            <p>Payment: {orderData.paymentStatus}</p>
          </div>
        )}
        <button onClick={() => navigate("/orders")}>View My Orders</button>
        <button onClick={() => navigate("/")}>Continue Shopping</button>
      </div>
    </div>
  );
};

export default OrderSuccess;
