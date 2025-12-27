import { useState, useEffect } from "react";
import styles from "./CookiesPolicy.module.css";

const CookiesPolicy = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Load saved preferences from localStorage
    const saved = localStorage.getItem("cookiePreferences");
    if (saved) {
      setCookiePreferences(JSON.parse(saved));
    }
  }, []);

  const sections = [
    {
      id: 1,
      title: "1. What Are Cookies?",
      content:
        "Cookies are small text files that are placed on your device when you visit our website. They store information about your browsing activity and preferences. Cookies help us recognize you when you return and enhance your user experience.",
    },
    {
      id: 2,
      title: "2. Types of Cookies We Use",
      content:
        "Essential Cookies: Required for basic website functionality. Functional Cookies: Remember your preferences and settings. Analytics Cookies: Help us understand how visitors use our site. Marketing Cookies: Used for targeted advertising and tracking campaign effectiveness.",
    },
    {
      id: 3,
      title: "3. Essential Cookies",
      content:
        "These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and order processing. Essential cookies cannot be disabled without affecting website functionality.",
    },
    {
      id: 4,
      title: "4. Functional Cookies",
      content:
        "These cookies remember your choices, such as language preferences, currency selection, and cart items. They improve your experience by personalizing content and remembering your preferences across visits.",
    },
    {
      id: 5,
      title: "5. Analytics Cookies",
      content:
        "We use analytics cookies to collect information about how you use our website. This helps us understand visitor behavior, identify popular pages, and improve our services. This data is aggregated and does not identify you personally.",
    },
    {
      id: 6,
      title: "6. Marketing Cookies",
      content:
        "Marketing cookies are used to deliver targeted advertisements based on your interests. They track your activity across websites to help us understand your preferences and deliver relevant promotions.",
    },
    {
      id: 7,
      title: "7. Third-Party Cookies",
      content:
        "Some cookies are set by third-party service providers for analytics, advertising, and performance monitoring. These include Google Analytics, Facebook Pixel, and payment processors. We do not have control over these cookies.",
    },
    {
      id: 8,
      title: "8. Cookie Duration",
      content:
        "Session cookies are deleted when you close your browser. Persistent cookies remain on your device for a specified period or until you delete them. Most of our cookies are session-based for security purposes.",
    },
    {
      id: 9,
      title: "9. Managing Your Cookies",
      content:
        "You can control cookie settings through your browser preferences. Most browsers allow you to refuse cookies or alert you when cookies are being sent. Note that disabling essential cookies may affect website functionality.",
    },
    {
      id: 10,
      title: "10. Do Not Track",
      content:
        "If your browser includes a 'Do Not Track' feature, we respect this preference. However, third-party services may not honor this request. You can contact us for more information about how we handle 'Do Not Track' signals.",
    },
  ];

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handlePreferenceChange = (type) => {
    const updated = {
      ...cookiePreferences,
      [type]: !cookiePreferences[type],
    };
    setCookiePreferences(updated);
    localStorage.setItem("cookiePreferences", JSON.stringify(updated));
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setCookiePreferences(allAccepted);
    localStorage.setItem("cookiePreferences", JSON.stringify(allAccepted));
  };

  const rejectAll = () => {
    const onlyEssential = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setCookiePreferences(onlyEssential);
    localStorage.setItem("cookiePreferences", JSON.stringify(onlyEssential));
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Cookies Policy</h1>
          <p className={styles.subtitle}>
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className={styles.content}>
          <p className={styles.intro}>
            Our website uses cookies to enhance your browsing experience and
            provide personalized services. This Cookies Policy explains what
            cookies are, how we use them, and how you can manage your cookie
            preferences.
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

          <div className={styles.preferencesSection}>
            <h2>Manage Your Cookie Preferences</h2>
            <p className={styles.preferencesText}>
              Customize which cookies you allow us to use. Essential cookies
              cannot be disabled as they are required for the website to
              function.
            </p>

            <div className={styles.preferencesGrid}>
              <div className={styles.preferenceItem}>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    id="essential"
                    checked={cookiePreferences.essential}
                    disabled
                    className={styles.checkbox}
                  />
                  <label htmlFor="essential" className={styles.label}>
                    <strong>Essential Cookies</strong>
                    <span className={styles.badge}>Required</span>
                  </label>
                </div>
                <p className={styles.description}>
                  Required for website security and functionality
                </p>
              </div>

              <div className={styles.preferenceItem}>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    id="functional"
                    checked={cookiePreferences.functional}
                    onChange={() => handlePreferenceChange("functional")}
                    className={styles.checkbox}
                  />
                  <label htmlFor="functional" className={styles.label}>
                    <strong>Functional Cookies</strong>
                  </label>
                </div>
                <p className={styles.description}>
                  Remember your preferences and settings
                </p>
              </div>

              <div className={styles.preferenceItem}>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    id="analytics"
                    checked={cookiePreferences.analytics}
                    onChange={() => handlePreferenceChange("analytics")}
                    className={styles.checkbox}
                  />
                  <label htmlFor="analytics" className={styles.label}>
                    <strong>Analytics Cookies</strong>
                  </label>
                </div>
                <p className={styles.description}>
                  Help us understand how you use our website
                </p>
              </div>

              <div className={styles.preferenceItem}>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={cookiePreferences.marketing}
                    onChange={() => handlePreferenceChange("marketing")}
                    className={styles.checkbox}
                  />
                  <label htmlFor="marketing" className={styles.label}>
                    <strong>Marketing Cookies</strong>
                  </label>
                </div>
                <p className={styles.description}>
                  Used for targeted advertising and promotions
                </p>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button className={styles.buttonReject} onClick={rejectAll}>
                Reject All
              </button>
              <button className={styles.buttonAccept} onClick={acceptAll}>
                Accept All
              </button>
            </div>
          </div>

          <div className={styles.contactSection}>
            <h2>More Information</h2>
            <p>
              For more information about our cookies or how we handle your data,
              please contact us.
            </p>
            <div className={styles.contactInfo}>
              <p>
                <strong>Email:</strong> ochachopharmacysupermarket@gmail.com
              </p>
              <p>
                <strong>Privacy Policy:</strong> See our Privacy Policy for more
                details on data protection
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPolicy;
