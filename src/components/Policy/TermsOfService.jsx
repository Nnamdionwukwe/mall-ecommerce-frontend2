import { useState } from "react";
import styles from "./TermsOfService.module.css";

const TermsOfService = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const sections = [
    {
      id: 1,
      title: "1. Acceptance of Terms",
      content:
        "By accessing and using this ecommerce platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
    },
    {
      id: 2,
      title: "2. Use License",
      content:
        "Permission is granted to temporarily download one copy of the materials (information or software) on our platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to decompile or reverse engineer any software on the platform; remove any copyright or other proprietary notations from the materials.",
    },
    {
      id: 3,
      title: "3. Disclaimer",
      content:
        "The materials on our platform are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
    },
    {
      id: 4,
      title: "4. Limitations",
      content:
        "In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our platform.",
    },
    {
      id: 5,
      title: "5. Accuracy of Materials",
      content:
        "The materials appearing on our platform could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our platform are accurate, complete, or current. We may make changes to the materials contained on our platform at any time without notice.",
    },
    {
      id: 6,
      title: "6. Links",
      content:
        "We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk.",
    },
    {
      id: 7,
      title: "7. Modifications",
      content:
        "We may revise these terms of service for our website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.",
    },
    {
      id: 8,
      title: "8. Governing Law",
      content:
        "These terms and conditions are governed by and construed in accordance with the laws of [Your Country/State] and you irrevocably submit to the exclusive jurisdiction of the courts located in that location.",
    },
    {
      id: 9,
      title: "9. User Accounts",
      content:
        "When you create an account, you are responsible for maintaining the confidentiality of your password and for all activities that occur under your account. You agree to accept responsibility for all activities that occur under your account and agree to maintain the accuracy and completeness of your account information.",
    },
    {
      id: 10,
      title: "10. Prohibited Activities",
      content:
        "You agree not to use our platform for any unlawful purpose or in any way that could damage, disable, or impair our services. Prohibited activities include harassment, obscene content, disrupting normal flow, unauthorized access, and any violation of intellectual property rights.",
    },
  ];

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.subtitle}>
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className={styles.content}>
          <p className={styles.intro}>
            Welcome to our ecommerce platform. These Terms of Service govern
            your use of our website and services. By accessing and using our
            platform, you agree to be bound by these terms. If you do not agree
            with any part of these terms, please do not use our services.
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
            <h2>Questions About Our Terms?</h2>
            <p>
              If you have questions or concerns about these Terms of Service,
              please contact us at the information provided below.
            </p>
            <div className={styles.contactInfo}>
              <p>
                <strong>Email:</strong> legal@ecommerce.com
              </p>
              <p>
                <strong>Phone:</strong> +1-800-123-4567
              </p>
              <p>
                <strong>Support Hours:</strong> Monday - Friday, 9 AM - 5 PM EST
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
