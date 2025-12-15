import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./Support.module.css";
import { supportAPI } from "../../services/api";

const Support = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    category: "general",
    message: "",
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await supportAPI.createTicket(formData);

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
      }, 5000);
    } catch (error) {
      setMessage({
        text:
          error.response?.data?.error ||
          "Failed to submit ticket. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   // In production, send to backend
  //   console.log("Support ticket:", formData);
  //   setSubmitted(true);
  //   setTimeout(() => {
  //     setSubmitted(false);
  //     setFormData({
  //       name: user?.name || "",
  //       email: user?.email || "",
  //       subject: "",
  //       category: "general",
  //       message: "",
  //     });
  //   }, 3000);
  // };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Support Center</h1>
          <p className={styles.subtitle}>How can we help you today?</p>
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

                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.submitBtn}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>

                  {/* <button type="submit" className={styles.submitBtn}>
                    Send Message
                  </button> */}
                </form>
              )}
            </div>

            {/* Quick Contact */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📞 Quick Contact</h2>

              <div className={styles.contactMethods}>
                <a
                  href="mailto:support@mallstore.com"
                  className={styles.contactMethod}
                >
                  <span className={styles.contactIcon}>📧</span>
                  <div>
                    <h4>Email</h4>
                    <p>support@mallstore.com</p>
                  </div>
                </a>

                <a href="tel:+2348000000000" className={styles.contactMethod}>
                  <span className={styles.contactIcon}>📱</span>
                  <div>
                    <h4>Phone</h4>
                    <p>+234 800 000 0000</p>
                  </div>
                </a>

                <div className={styles.contactMethod}>
                  <span className={styles.contactIcon}>💬</span>
                  <div>
                    <h4>Live Chat</h4>
                    <p>Mon-Fri, 9am-5pm</p>
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
                <div className={styles.helpTopic}>
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

                <div className={styles.helpTopic}>
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
