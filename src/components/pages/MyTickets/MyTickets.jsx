import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supportAPI } from "../../services/api";
// import styles from "./MyTickets.module.css";

const MyTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchTickets();
  }, [user, navigate]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await supportAPI.getMyTickets();
      setTickets(response.data.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "#3b82f6",
      "in-progress": "#f59e0b",
      resolved: "#10b981",
      closed: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>My Support Tickets</h1>

        {tickets.length === 0 ? (
          <div className={styles.empty}>
            <p>No support tickets yet</p>
            <button onClick={() => navigate("/support")}>Create Ticket</button>
          </div>
        ) : (
          <div className={styles.ticketsList}>
            {tickets.map((ticket) => (
              <div key={ticket._id} className={styles.ticketCard}>
                <div className={styles.ticketHeader}>
                  <h3>{ticket.subject}</h3>
                  <span
                    className={styles.status}
                    style={{ background: getStatusColor(ticket.status) }}
                  >
                    {ticket.status}
                  </span>
                </div>
                <p className={styles.category}>Category: {ticket.category}</p>
                <p className={styles.message}>{ticket.message}</p>
                <div className={styles.ticketFooter}>
                  <span className={styles.date}>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                  {ticket.responses?.length > 0 && (
                    <span className={styles.responses}>
                      {ticket.responses.length} response(s)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
