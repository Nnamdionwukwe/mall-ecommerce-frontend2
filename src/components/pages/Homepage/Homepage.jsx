import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productAPI } from "../../services/api";
import styles from "./Homepage.module.css";
import ProductCard from "../../ProductCard/ProductCard";
import Footer from "../Footer/Footer";

const Homepage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const banners = [
    {
      id: 1,
      title: "Fresh Groceries Delivered",
      subtitle: "Get fresh produce, dairy & more at your doorstep",
      discount: "50% OFF",
      image: "🛒",
      bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: 2,
      title: "Best Quality Products",
      subtitle: "Premium selection from top vendors",
      discount: "UP TO 70% OFF",
      image: "🏪",
      bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      id: 3,
      title: "Electronics Sale",
      subtitle: "Latest gadgets at unbeatable prices",
      discount: "MEGA DEALS",
      image: "📱",
      bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      id: 4,
      title: "Fashion Week Special",
      subtitle: "Trending styles for everyone",
      discount: "40% OFF",
      image: "👗",
      bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Regular Customer",
      image: "👩",
      rating: 5,
      comment:
        "Amazing service! Fresh products delivered right on time. The quality is outstanding and prices are competitive.",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Premium Member",
      image: "👨",
      rating: 5,
      comment:
        "Best online shopping experience! Wide variety of products and excellent customer support. Highly recommended!",
    },
    {
      id: 3,
      name: "Emma Williams",
      role: "Verified Buyer",
      image: "👩‍🦰",
      rating: 5,
      comment:
        "Love the convenience and quality! The app is easy to use and delivery is always fast. Will definitely shop again!",
    },
  ];

  useEffect(() => {
    fetchBestSellers();

    // Auto-slide banner
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchBestSellers = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      const products = response.data.data || [];
      // Get top 4 products as best sellers
      setBestSellers(products.slice(0, 4));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    alert(`${product.name} added to cart!`);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className={styles.homepage}>
      {/* Banner Slider */}
      <section className={styles.sliderSection}>
        <div className={styles.slider}>
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`${styles.slide} ${
                index === currentSlide ? styles.active : ""
              }`}
              style={{ background: banner.bg }}
            >
              <div className={styles.slideContent}>
                <div className={styles.slideText}>
                  <span className={styles.discount}>{banner.discount}</span>
                  <h1 className={styles.slideTitle}>{banner.title}</h1>
                  <p className={styles.slideSubtitle}>{banner.subtitle}</p>
                  <button
                    onClick={() => navigate("/shop")}
                    className={styles.shopNowBtn}
                  >
                    Shop Now →
                  </button>
                </div>
                <div className={styles.slideImage}>
                  <span className={styles.imageIcon}>{banner.image}</span>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={prevSlide}
            className={styles.sliderBtn}
            style={{ left: "20px" }}
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className={styles.sliderBtn}
            style={{ right: "20px" }}
          >
            ›
          </button>

          <div className={styles.sliderDots}>
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`${styles.dot} ${
                  index === currentSlide ? styles.activeDot : ""
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className={styles.bestSellers}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>🔥 Best Selling Products</h2>
            <p>Top picks from our customers</p>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading products...</p>
            </div>
          ) : (
            <>
              <div className={styles.productsGrid}>
                {bestSellers.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>

              <div className={styles.viewAllContainer}>
                <button
                  onClick={() => navigate("/shop")}
                  className={styles.viewAllBtn}
                >
                  View All Products →
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🚚</div>
              <h3>Free Delivery</h3>
              <p>On orders over $100</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💳</div>
              <h3>Secure Payment</h3>
              <p>100% protected transactions</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎁</div>
              <h3>Special Offers</h3>
              <p>Regular deals & discounts</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⭐</div>
              <h3>Top Quality</h3>
              <p>Premium products guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>💬 What Our Customers Say</h2>
            <p>Real reviews from real people</p>
          </div>

          <div className={styles.testimonialGrid}>
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className={styles.testimonialCard}>
                <div className={styles.rating}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
                <p className={styles.testimonialComment}>
                  "{testimonial.comment}"
                </p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorImage}>{testimonial.image}</div>
                  <div className={styles.authorInfo}>
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Start Shopping Today!</h2>
          <p>Join thousands of satisfied customers</p>
          <button onClick={() => navigate("/shop")} className={styles.ctaBtn}>
            Explore Products →
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Homepage;
