import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyTickets.module.css";
import { useAuth } from "../context/AuthContext";
import { supportAPI } from "../services/api";

const MyTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/my-tickets");
      return;
    }
    fetchMyTickets();
  }, [user, navigate]);

  // Auto-refresh every 10 seconds for real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchMyTickets(true); // Silent refresh
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchMyTickets = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await supportAPI.getMyTickets();
      setTickets(response.data.data || []);

      // Update selected ticket if modal is open
      if (selectedTicket && showModal) {
        const updatedTicket = response.data.data.find(
          (t) => t._id === selectedTicket._id
        );
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
        }
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "#f59e0b",
      "in-progress": "#3b82f6",
      resolved: "#10b981",
      closed: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: "🔓",
      "in-progress": "⏳",
      resolved: "✅",
      closed: "🔒",
    };
    return icons[status] || "📋";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "#10b981",
      medium: "#f59e0b",
      high: "#ef4444",
      urgent: "#dc2626",
    };
    return colors[priority] || "#6b7280";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
      }
    }
    return "just now";
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>My Support Tickets</h1>
          <p className={styles.subtitle}>
            Track and manage your support requests
          </p>
        </div>
        <div className={styles.headerActions}>
          <label className={styles.autoRefreshToggle}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh</span>
          </label>
          <button
            onClick={() => navigate("/support")}
            className={styles.newTicketBtn}
          >
            ➕ New Ticket
          </button>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📭</div>
          <h2>No tickets yet</h2>
          <p>You haven't submitted any support requests.</p>
          <button
            onClick={() => navigate("/support")}
            className={styles.emptyBtn}
          >
            Create Your First Ticket
          </button>
        </div>
      ) : (
        <div className={styles.ticketsList}>
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className={styles.ticketCard}
              onClick={() => openTicketModal(ticket)}
            >
              <div className={styles.ticketHeader}>
                <div className={styles.ticketTitle}>
                  <span className={styles.ticketIcon}>
                    {getStatusIcon(ticket.status)}
                  </span>
                  <h3>{ticket.subject}</h3>
                </div>
                <div className={styles.ticketBadges}>
                  <span
                    className={styles.statusBadge}
                    style={{ background: getStatusColor(ticket.status) }}
                  >
                    {ticket.status}
                  </span>
                  <span
                    className={styles.priorityBadge}
                    style={{ background: getPriorityColor(ticket.priority) }}
                  >
                    {ticket.priority}
                  </span>
                </div>
              </div>

              <p className={styles.ticketMessage}>
                {ticket.message.substring(0, 120)}
                {ticket.message.length > 120 ? "..." : ""}
              </p>

              <div className={styles.ticketFooter}>
                <span className={styles.ticketCategory}>
                  📁 {ticket.category}
                </span>
                <span className={styles.ticketDate}>
                  {formatTimeAgo(ticket.createdAt)}
                </span>
                {ticket.responses?.length > 0 && (
                  <span className={styles.responseIndicator}>
                    💬 {ticket.responses.length} response(s)
                    {ticket.responses.some(
                      (r) => new Date(r.createdAt) > new Date(ticket.updatedAt)
                    ) && <span className={styles.newBadge}>NEW</span>}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showModal && selectedTicket && (
        <div className={styles.modal} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeModal} className={styles.modalClose}>
              ✕
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <span className={styles.modalIcon}>
                  {getStatusIcon(selectedTicket.status)}
                </span>
                <div>
                  <h2>{selectedTicket.subject}</h2>
                  <p className={styles.ticketId}>
                    Ticket #{selectedTicket._id.slice(-8)}
                  </p>
                </div>
              </div>
              <div className={styles.modalBadges}>
                <span
                  className={styles.statusBadge}
                  style={{ background: getStatusColor(selectedTicket.status) }}
                >
                  {selectedTicket.status}
                </span>
                <span
                  className={styles.priorityBadge}
                  style={{
                    background: getPriorityColor(selectedTicket.priority),
                  }}
                >
                  {selectedTicket.priority}
                </span>
              </div>
            </div>

            <div className={styles.modalBody}>
              {/* Ticket Info */}
              <div className={styles.section}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Category</span>
                    <span className={styles.infoValue}>
                      {selectedTicket.category}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Created</span>
                    <span className={styles.infoValue}>
                      {formatDate(selectedTicket.createdAt)}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Last Updated</span>
                    <span className={styles.infoValue}>
                      {formatDate(selectedTicket.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Original Message */}
              <div className={styles.section}>
                <h3>Your Message</h3>
                <div className={styles.originalMessage}>
                  <p>{selectedTicket.message}</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedTicket.attachments?.length > 0 && (
                <div className={styles.section}>
                  <h3>
                    Your Attachments ({selectedTicket.attachments.length})
                  </h3>
                  <div className={styles.attachments}>
                    {selectedTicket.attachments.map((file, index) => (
                      <div key={index} className={styles.attachment}>
                        {file.type === "image" ? (
                          <img src={file.url} alt={file.filename} />
                        ) : (
                          <video src={file.url} controls />
                        )}
                        <p className={styles.attachmentName}>{file.filename}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Responses Timeline */}
              {selectedTicket.responses?.length > 0 ? (
                <div className={styles.section}>
                  <h3>
                    Support Responses ({selectedTicket.responses.length})
                    {autoRefresh && (
                      <span className={styles.liveIndicator}>🟢 Live</span>
                    )}
                  </h3>
                  <div className={styles.timeline}>
                    {selectedTicket.responses.map((response, index) => (
                      <div key={index} className={styles.responseItem}>
                        <div className={styles.responseHeader}>
                          <div className={styles.responseAvatar}>👨‍💼</div>
                          <div className={styles.responseInfo}>
                            <strong>Support Team</strong>
                            <span className={styles.responseTime}>
                              {formatDate(response.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className={styles.responseContent}>
                          <p>{response.message}</p>
                          {response.attachments?.length > 0 && (
                            <div className={styles.responseAttachments}>
                              {response.attachments.map((file, i) => (
                                <a
                                  key={i}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.responseAttachment}
                                >
                                  {file.type === "image" ? "🖼️" : "🎥"}{" "}
                                  {file.filename}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.section}>
                  <div className={styles.noResponses}>
                    <span className={styles.noResponsesIcon}>⏳</span>
                    <h4>Waiting for Response</h4>
                    <p>Our support team will respond to your ticket soon.</p>
                    {autoRefresh && (
                      <p className={styles.autoRefreshNote}>
                        🟢 This page will update automatically when you receive
                        a response.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Notes (if any) */}
              {selectedTicket.adminNotes && (
                <div className={styles.section}>
                  <div className={styles.adminNote}>
                    <strong>📝 Support Note:</strong>
                    <p>{selectedTicket.adminNotes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
