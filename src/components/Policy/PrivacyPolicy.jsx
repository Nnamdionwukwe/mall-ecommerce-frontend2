import { useState } from "react";
import styles from "./PrivacyPolicy.module.css";

const PrivacyPolicy = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const sections = [
    {
      id: 1,
      title: "1. Introduction",
      content:
        "Welcome to our ecommerce platform. We are committed to protecting your privacy and ensuring you have a positive experience on our website. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.",
    },
    {
      id: 2,
      title: "2. Information We Collect",
      content:
        "We collect information that you voluntarily provide to us such as your name, email address, phone number, shipping address, and payment information when you create an account, place an order, or contact us. We also automatically collect information about your device, browsing actions, and usage patterns through cookies and similar technologies.",
    },
    {
      id: 3,
      title: "3. How We Use Your Information",
      content:
        "Your information is used to process your orders, send you product updates, respond to your inquiries, improve our services, prevent fraud, and comply with legal obligations. We may also use your information to send you marketing communications if you have opted in to receive them.",
    },
    {
      id: 4,
      title: "4. Data Security",
      content:
        "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.",
    },
    {
      id: 5,
      title: "5. Sharing of Information",
      content:
        "We do not sell your personal information. We may share your information with payment processors, shipping partners, and service providers who assist us in operating our website and conducting our business. We require these third parties to maintain the confidentiality of your information.",
    },
    {
      id: 6,
      title: "6. Your Rights",
      content:
        "Depending on your location, you may have the right to access, correct, or delete your personal information. You may also have the right to opt-out of marketing communications. To exercise these rights, please contact us using the information provided below.",
    },
    {
      id: 7,
      title: "7. Cookies and Tracking",
      content:
        "Our website uses cookies to enhance your experience. Cookies are small files stored on your device that help us remember your preferences and track your activity. You can control cookie settings through your browser.",
    },
    {
      id: 8,
      title: "8. Children's Privacy",
      content:
        "Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child under 13, we will take steps to delete such information.",
    },
    {
      id: 9,
      title: "9. Changes to This Policy",
      content:
        "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on our website. Your continued use of our services constitutes your acceptance of the updated policy.",
    },
    {
      id: 10,
      title: "10. Contact Us",
      content:
        "If you have any questions about this Privacy Policy or our privacy practices, please contact us at privacy@ecommerce.com or call +1-800-123-4567. Our data protection officer is available to assist you Monday through Friday, 9 AM to 5 PM EST.",
    },
  ];

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className={styles.content}>
          <p className={styles.intro}>
            At our ecommerce platform, your privacy is our top priority. We are
            transparent about how we collect, use, and protect your personal
            information. Please read this policy carefully to understand our
            practices.
          </p>

          <div className={styles.sectionsContainer}>
            {sections.map((section) => (
              <div key={section.id} className={styles.section}>
                <button
                  className={`${styles.sectionHeader} ${
                    expandedSection === section.id ? styles.active : ""
                  }`}
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={expandedSection === section.id}
                >
                  <span className={styles.title}>{section.title}</span>
                  <span className={styles.icon}>
                    {expandedSection === section.id ? "−" : "+"}
                  </span>
                </button>

                {expandedSection === section.id && (
                  <div className={styles.sectionContent}>
                    <p>{section.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.contactSection}>
            <h2>Have Questions?</h2>
            <p>
              If you have any concerns about your privacy or would like to
              exercise your rights, please don't hesitate to contact us.
            </p>
            <div className={styles.contactInfo}>
              <p>
                <strong>Email:</strong> ochachopharmacysupermarket<br></br>
                @gmail.com
              </p>
              <p>
                <strong>Phone:</strong> +234-903-382-2884, +234-701-697-9474
              </p>
              <p>
                <strong>Address:</strong> Ochacho Real Home 1, Idu, Gate 2 &
                Ochacho Real Home, Life Camp
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
