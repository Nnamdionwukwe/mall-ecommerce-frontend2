import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import styles from "./LiveChatWindow.module.css";
import { useAuth } from "../context/AuthContext";

const LiveChatWindow = ({ onClose, onNewMessage }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [status, setStatus] = useState("connecting");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ✅ FIXED: Correct API URL without double /api
  const API_BASE =
    import.meta.env.VITE_API_URL ||
    "https://mall-ecommerce-api-production.up.railway.app/api";
  const SOCKET_URL = API_BASE.replace("/api", ""); // Remove /api for socket connection

  useEffect(() => {
    if (!user || !token) return;

    console.log("🔌 Initializing chat...");
    console.log("API Base:", API_BASE);
    console.log("Socket URL:", SOCKET_URL);

    // Initialize chat
    initializeChat();

    // Connect to Socket.IO
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected");
      setStatus("connected");
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setStatus("disconnected");
    });

    socketRef.current.on("new-message", (data) => {
      console.log("📨 New message received:", data);
      setMessages((prev) => [...prev, data.message]);
      if (data.message.senderId !== user.id) {
        onNewMessage?.();
      }
      scrollToBottom();
    });

    socketRef.current.on("typing", (data) => {
      if (data.userId !== user.id) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    });

    socketRef.current.on("stop-typing", () => {
      setIsTyping(false);
    });

    socketRef.current.on("error", (error) => {
      console.error("❌ Socket error:", error);
      setStatus("error");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      clearTimeout(typingTimeoutRef.current);
    };
  }, [user, token, SOCKET_URL]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    try {
      console.log("📞 Fetching chat from:", `${API_BASE}/chat/my-chat`);

      const response = await fetch(`${API_BASE}/chat/my-chat`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Chat data:", data);

      if (data.success) {
        setChatId(data.data._id);
        setMessages(data.data.messages || []);
        setStatus("active");
      }
    } catch (error) {
      console.error("❌ Failed to initialize chat:", error);
      setStatus("error");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    try {
      const response = await fetch(`${API_BASE}/chat/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId,
          message: newMessage.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Emit to socket
        socketRef.current?.emit("send-message", {
          chatId,
          message: newMessage.trim(),
        });

        setNewMessage("");
        socketRef.current?.emit("stop-typing", { chatId });
      }
    } catch (error) {
      console.error("❌ Failed to send message:", error);
    }
  };

  const handleTyping = () => {
    if (chatId && socketRef.current) {
      socketRef.current.emit("typing", { chatId, userId: user.id });
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCloseChat = async () => {
    if (chatId) {
      try {
        await fetch(`${API_BASE}/chat/${chatId}/close`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("❌ Failed to close chat:", error);
      }
    }
    onClose();
  };

  return (
    <div className={styles.chatWindow}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.avatarGroup}>
            <span className={styles.avatar}>👨‍💼</span>
            {status === "connected" && (
              <span className={styles.statusDot}></span>
            )}
          </div>
          <div>
            <h3 className={styles.title}>Live Support</h3>
            <p className={styles.subtitle}>
              {status === "active"
                ? "We're here to help!"
                : status === "connecting"
                ? "Connecting..."
                : status === "error"
                ? "Connection error"
                : "Offline"}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={handleCloseChat}
            className={styles.closeBtn}
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {status === "error" ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>⚠️</span>
            <p>Unable to connect to chat</p>
            <p className={styles.emptySubtext}>
              Please try again later or contact support
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>💬</span>
            <p>Start a conversation with our support team!</p>
            <p className={styles.emptySubtext}>
              We typically reply within a few minutes
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.message} ${
                  msg.senderId === user?.id
                    ? styles.messageSent
                    : styles.messageReceived
                }`}
              >
                <div className={styles.messageContent}>
                  {msg.senderId !== user?.id && (
                    <div className={styles.senderName}>
                      {msg.senderName || "Support"}
                      <span className={styles.senderRole}>
                        {msg.senderRole === "admin" ? "Admin" : "Support"}
                      </span>
                    </div>
                  )}
                  <div className={styles.messageText}>{msg.message}</div>
                  <div className={styles.messageTime}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className={`${styles.message} ${styles.messageReceived}`}>
                <div className={styles.messageContent}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className={styles.inputArea}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleTyping}
          placeholder={
            status === "active" ? "Type your message..." : "Connecting..."
          }
          className={styles.input}
          disabled={status !== "active"}
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!newMessage.trim() || status !== "active"}
        >
          <span>➤</span>
        </button>
      </form>

      {/* Footer */}
      <div className={styles.footer}>
        <span>🔒 Secure conversation</span>
      </div>
    </div>
  );
};

export default LiveChatWindow;
