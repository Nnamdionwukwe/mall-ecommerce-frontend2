import { useState, useEffect } from "react";
import styles from "./SupportTickets.module.css";
import { useAuth } from "../context/AuthContext";
import { supportAPI } from "../services/api";

const SupportTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseFiles, setResponseFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? { status: filter } : {};
      const response = await supportAPI.getAllTickets(params);
      setTickets(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
    setResponseMessage("");
    setResponseFiles([]);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
    setResponseMessage("");
    setResponseFiles([]);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await supportAPI.updateTicketStatus(ticketId, { status: newStatus });
      await fetchTickets();
      if (selectedTicket?._id === ticketId) {
        const updated = tickets.find((t) => t._id === ticketId);
        setSelectedTicket({ ...updated, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handlePriorityChange = async (ticketId, newPriority) => {
    try {
      await supportAPI.updateTicketStatus(ticketId, { priority: newPriority });
      await fetchTickets();
    } catch (error) {
      console.error("Error updating priority:", error);
      alert("Failed to update priority");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + responseFiles.length > 5) {
      alert("Maximum 5 files allowed");
      return;
    }
    setResponseFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setResponseFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!responseMessage.trim()) {
      alert("Please enter a response message");
      return;
    }

    try {
      setSubmitting(true);
      await supportAPI.addResponse(
        selectedTicket._id,
        responseMessage,
        responseFiles
      );

      alert("Response sent successfully!");
      await fetchTickets();
      closeModal();
    } catch (error) {
      console.error("Error sending response:", error);
      alert("Failed to send response");
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🎫 Support Tickets</h1>
        <p className={styles.subtitle}>Manage customer support requests</p>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${
            filter === "all" ? styles.active : ""
          }`}
          onClick={() => setFilter("all")}
        >
          All ({tickets.length})
        </button>
        <button
          className={`${styles.filterBtn} ${
            filter === "open" ? styles.active : ""
          }`}
          onClick={() => setFilter("open")}
        >
          Open
        </button>
        <button
          className={`${styles.filterBtn} ${
            filter === "in-progress" ? styles.active : ""
          }`}
          onClick={() => setFilter("in-progress")}
        >
          In Progress
        </button>
        <button
          className={`${styles.filterBtn} ${
            filter === "resolved" ? styles.active : ""
          }`}
          onClick={() => setFilter("resolved")}
        >
          Resolved
        </button>
        <button
          className={`${styles.filterBtn} ${
            filter === "closed" ? styles.active : ""
          }`}
          onClick={() => setFilter("closed")}
        >
          Closed
        </button>
      </div>

      <div className={styles.ticketsList}>
        {tickets.length === 0 ? (
          <div className={styles.empty}>
            <p>No tickets found</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket._id}
              className={styles.ticketCard}
              onClick={() => openTicketModal(ticket)}
            >
              <div className={styles.ticketHeader}>
                <div className={styles.ticketInfo}>
                  <h3>{ticket.subject}</h3>
                  <p className={styles.ticketMeta}>
                    {ticket.name} • {ticket.email} • {ticket.category}
                  </p>
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
                {ticket.message.substring(0, 150)}
                {ticket.message.length > 150 ? "..." : ""}
              </p>
              <div className={styles.ticketFooter}>
                <span className={styles.ticketDate}>
                  {formatDate(ticket.createdAt)}
                </span>
                {ticket.attachments?.length > 0 && (
                  <span className={styles.attachmentCount}>
                    📎 {ticket.attachments.length} attachment(s)
                  </span>
                )}
                {ticket.responses?.length > 0 && (
                  <span className={styles.responseCount}>
                    💬 {ticket.responses.length} response(s)
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

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
              <h2>{selectedTicket.subject}</h2>
              <div className={styles.modalActions}>
                <select
                  value={selectedTicket.status}
                  onChange={(e) =>
                    handleStatusChange(selectedTicket._id, e.target.value)
                  }
                  className={styles.select}
                  style={{
                    background: getStatusColor(selectedTicket.status),
                    color: "white",
                  }}
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={selectedTicket.priority}
                  onChange={(e) =>
                    handlePriorityChange(selectedTicket._id, e.target.value)
                  }
                  className={styles.select}
                  style={{
                    background: getPriorityColor(selectedTicket.priority),
                    color: "white",
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className={styles.modalBody}>
              {/* Customer Details */}
              <div className={styles.section}>
                <h3>Customer Details</h3>
                <p>
                  <strong>Name:</strong> {selectedTicket.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedTicket.email}
                </p>
                <p>
                  <strong>Category:</strong> {selectedTicket.category}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {formatDate(selectedTicket.createdAt)}
                </p>
              </div>

              {/* Original Message */}
              <div className={styles.section}>
                <h3>Original Message</h3>
                <p className={styles.messageText}>{selectedTicket.message}</p>
              </div>

              {/* Attachments */}
              {selectedTicket.attachments?.length > 0 && (
                <div className={styles.section}>
                  <h3>Attachments ({selectedTicket.attachments.length})</h3>
                  <div className={styles.attachments}>
                    {selectedTicket.attachments.map((file, index) => (
                      <div key={index} className={styles.attachment}>
                        {file.type === "image" ? (
                          <img
                            src={file.url}
                            alt={file.filename}
                            className={styles.attachmentImage}
                          />
                        ) : (
                          <video
                            src={file.url}
                            controls
                            className={styles.attachmentVideo}
                          />
                        )}
                        <p className={styles.attachmentName}>{file.filename}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Previous Responses */}
              {selectedTicket.responses?.length > 0 && (
                <div className={styles.section}>
                  <h3>Responses ({selectedTicket.responses.length})</h3>
                  {selectedTicket.responses.map((response, index) => (
                    <div key={index} className={styles.response}>
                      <div className={styles.responseHeader}>
                        <strong>Admin Response</strong>
                        <span className={styles.responseDate}>
                          {formatDate(response.createdAt)}
                        </span>
                      </div>
                      <p className={styles.responseMessage}>
                        {response.message}
                      </p>
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
                              📎 {file.filename}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Response Form */}
              <div className={styles.section}>
                <h3>Add Response</h3>
                <form onSubmit={handleSubmitResponse}>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Type your response..."
                    className={styles.textarea}
                    rows="5"
                    required
                  />

                  <div className={styles.fileUpload}>
                    <input
                      type="file"
                      id="responseFiles"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className={styles.fileInput}
                    />
                    <label htmlFor="responseFiles" className={styles.fileLabel}>
                      📎 Attach Files (Max 5)
                    </label>
                  </div>

                  {responseFiles.length > 0 && (
                    <div className={styles.selectedFiles}>
                      {responseFiles.map((file, index) => (
                        <div key={index} className={styles.selectedFile}>
                          <span>{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className={styles.removeFile}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className={styles.submitBtn}
                  >
                    {submitting ? "Sending..." : "Send Response"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
