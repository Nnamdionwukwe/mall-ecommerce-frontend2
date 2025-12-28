import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./Support.module.css";
import { supportAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";

const Support = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    category: "general",
    message: "",
  });

  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const faqs = [
    {
      question: "How do I track my order?",
      answer:
        'You can track your order by going to the Orders page and clicking on "Track Order" for any order. You\'ll see real-time updates on your order status.',
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit/debit cards through our secure Paystack payment gateway. We support Visa, Mastercard, and local payment methods.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping takes 3-5 business days. Express shipping (available for orders over $100) takes 1-2 business days.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for most items. Products must be unused and in original packaging. Contact support to initiate a return.",
    },
    {
      question: "How do I become a vendor?",
      answer:
        'To become a vendor, register for an account and select "Vendor" as your account type. Once approved, you can start listing your products.',
    },
    {
      question: "Is my payment information secure?",
      answer:
        "Yes! We use Paystack's secure payment processing. We never store your card details on our servers.",
    },
  ];

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Validate file count (max 5)
    if (files.length + selectedFiles.length > 5) {
      setMessage({
        text: "You can only upload up to 5 files",
        type: "error",
      });
      return;
    }

    // Validate file size (max 10MB per file)
    const invalidFiles = selectedFiles.filter(
      (file) => file.size > 10 * 1024 * 1024
    );
    if (invalidFiles.length > 0) {
      setMessage({
        text: "Each file must be less than 10MB",
        type: "error",
      });
      return;
    }

    // Validate file types
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
    ];

    const invalidTypes = selectedFiles.filter(
      (file) => !validTypes.includes(file.type)
    );
    if (invalidTypes.length > 0) {
      setMessage({
        text: "Only images (JPG, PNG, GIF, WebP) and videos (MP4, MOV) are allowed",
        type: "error",
      });
      return;
    }

    // Add files
    setFiles((prev) => [...prev, ...selectedFiles]);

    // Generate previews
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => [
          ...prev,
          {
            url: reader.result,
            name: file.name,
            type: file.type.startsWith("image/") ? "image" : "video",
            size: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      console.log("📤 Submitting support ticket with media...");
      console.log("Form data:", formData);
      console.log("Files:", files.length);

      // Create FormData for multipart upload
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("category", formData.category);
      submitData.append("subject", formData.subject);
      submitData.append("message", formData.message);

      // Add files
      files.forEach((file) => {
        submitData.append("files", file);
      });

      const response = await supportAPI.createTicketWithMedia(submitData);
      console.log("✅ Response:", response.data);

      setMessage({
        text: `Ticket created! Reference: ${response.data.data.ticketId}`,
        type: "success",
      });
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          subject: "",
          category: "general",
          message: "",
        });
        setFiles([]);
        setFilePreviews([]);
      }, 5000);
    } catch (error) {
      console.error("❌ Full error:", error);
      console.error("❌ Error response:", error.response);

      setMessage({
        text:
          error.response?.data?.error ||
          error.response?.data?.errors?.[0]?.msg ||
          "Failed to submit ticket. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Support Center</h1>
          <p className={styles.subtitle}>How can we help you today?</p>
          {user && (
            <button
              onClick={() => navigate("/my-tickets")}
              className={styles.myTicketsBtn}
            >
              🎫 View My Tickets
            </button>
          )}
        </div>

        <div className={styles.grid}>
          {/* Contact Form */}
          <div className={styles.section}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📧 Contact Us</h2>

              {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                  {message.text}
                </div>
              )}

              {submitted ? (
                <div className={styles.successMessage}>
                  <div className={styles.successIcon}>✓</div>
                  <h3>Message Sent!</h3>
                  <p>We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label>Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Your name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Issue</option>
                      <option value="payment">Payment Problem</option>
                      <option value="product">Product Question</option>
                      <option value="technical">Technical Support</option>
                      <option value="vendor">Vendor Support</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Subject *</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Message *</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Describe your issue in detail..."
                      rows="6"
                    />
                  </div>

                  {/* File Upload Section */}
                  <div className={styles.formGroup}>
                    <label>
                      Attachments (Optional)
                      <span className={styles.fileInfo}>
                        {" "}
                        - Max 5 files, 10MB each
                      </span>
                    </label>

                    <div className={styles.fileUploadArea}>
                      <input
                        type="file"
                        id="fileInput"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className={styles.fileInput}
                        disabled={files.length >= 5}
                      />

                      <label htmlFor="fileInput" className={styles.fileLabel}>
                        <span className={styles.uploadIcon}>📎</span>
                        <span>
                          {files.length === 0
                            ? "Click to upload images or videos"
                            : `${files.length}/5 files selected`}
                        </span>
                      </label>
                    </div>

                    {/* File Previews */}
                    {filePreviews.length > 0 && (
                      <div className={styles.filePreviews}>
                        {filePreviews.map((preview, index) => (
                          <div key={index} className={styles.filePreview}>
                            {preview.type === "image" ? (
                              <img src={preview.url} alt={preview.name} />
                            ) : (
                              <video src={preview.url} />
                            )}
                            <div className={styles.fileInfo}>
                              <span className={styles.fileName}>
                                {preview.name}
                              </span>
                              <span className={styles.fileSize}>
                                {formatFileSize(preview.size)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className={styles.removeFileBtn}
                              title="Remove file"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.submitBtn}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>

            {/* Quick Contact */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📞 Quick Contact</h2>

              <div className={styles.contactMethods}>
                <a
                  href="mailto:ochachopharmacysupermarket@gmail.com"
                  className={styles.contactMethod}
                >
                  <span className={styles.contactIcon}>📧</span>
                  <div>
                    <h4>Email</h4>
                    <p>ochachopharmacysupermarket@gmail.com</p>
                  </div>
                </a>

                <a href="tel:+2347016979474" className={styles.contactMethod}>
                  <span className={styles.contactIcon}>📱</span>
                  <div>
                    <h4>Phone</h4>
                    <p>+234 903 382 2884, +234-701-697-9474</p>
                  </div>
                </a>

                <div className={styles.contactMethod}>
                  <span className={styles.contactIcon}>💬</span>
                  <div>
                    <h4>Live Chat</h4>
                    <p>24/7 Available</p>
                  </div>
                </div>

                <div className={styles.contactMethod}>
                  <span className={styles.contactIcon}>🕐</span>
                  <div>
                    <h4>Support Hours</h4>
                    <p>24/7 Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className={styles.section}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                ❓ Frequently Asked Questions
              </h2>

              <div className={styles.faqList}>
                {faqs.map((faq, index) => (
                  <div key={index} className={styles.faqItem}>
                    <button
                      className={styles.faqQuestion}
                      onClick={() =>
                        setExpandedFaq(expandedFaq === index ? null : index)
                      }
                    >
                      <span>{faq.question}</span>
                      <span className={styles.faqIcon}>
                        {expandedFaq === index ? "−" : "+"}
                      </span>
                    </button>
                    {expandedFaq === index && (
                      <div className={styles.faqAnswer}>{faq.answer}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Help Topics */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📚 Help Topics</h2>

              <div className={styles.helpTopics}>
                <div
                  onClick={() => navigate("/orders")}
                  className={styles.helpTopic}
                >
                  <span className={styles.helpIcon}>📦</span>
                  <h4>Orders & Shipping</h4>
                  <p>Track orders, shipping info, delivery times</p>
                </div>

                <div className={styles.helpTopic}>
                  <span className={styles.helpIcon}>💳</span>
                  <h4>Payments</h4>
                  <p>Payment methods, refunds, billing</p>
                </div>

                <div className={styles.helpTopic}>
                  <span className={styles.helpIcon}>↩️</span>
                  <h4>Returns</h4>
                  <p>Return policy, refund process</p>
                </div>

                <div
                  onClick={() => navigate("/profile")}
                  className={styles.helpTopic}
                >
                  <span className={styles.helpIcon}>👤</span>
                  <h4>Account</h4>
                  <p>Profile, password, settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
