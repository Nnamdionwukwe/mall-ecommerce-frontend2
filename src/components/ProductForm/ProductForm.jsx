import { useState, useEffect } from "react";
import styles from "./ProductForm.module.css";
import { productAPI } from "../services/api";
import { PRODUCT_CATEGORIES } from "../constants/categories";

const ProductForm = ({ product, token, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    vendorId: "",
    vendorName: "",
    images: [""],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use shared categories constant
  const categories = PRODUCT_CATEGORIES;

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        stock: product.stock,
        category: product.category,
        vendorId: product.vendorId,
        vendorName: product.vendorName,
        images: product.images?.length > 0 ? product.images : [""],
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cleanedData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: formData.images.filter((img) => img.trim()),
      };

      if (product) {
        await productAPI.update(product._id, cleanedData);
      } else {
        await productAPI.create(cleanedData);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages.length > 0 ? newImages : [""],
    });
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>
        {product ? "✏️ Edit Product" : "➕ Add New Product"}
      </h2>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Product Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Wireless Mouse"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Product description..."
            rows="4"
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Price (₦) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="29.99"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Stock *</label>
            <input
              type="number"
              min="0"
              required
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              placeholder="100"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Category *</label>
          <select
            required
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Vendor ID *</label>
            <input
              type="text"
              required
              value={formData.vendorId}
              onChange={(e) =>
                setFormData({ ...formData, vendorId: e.target.value })
              }
              placeholder="vendor_001"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Vendor Name *</label>
            <input
              type="text"
              required
              value={formData.vendorName}
              onChange={(e) =>
                setFormData({ ...formData, vendorName: e.target.value })
              }
              placeholder="Tech Store"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Product Images (URLs)</label>
          {formData.images.map((img, index) => (
            <div key={index} className={styles.imageInputGroup}>
              <input
                type="url"
                value={img}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className={styles.removeImageBtn}
                >
                  −
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            className={styles.addImageBtn}
          >
            + Add Image URL
          </button>
        </div>

        <div className={styles.actions}>
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Saving..." : product ? "Update Product" : "Add Product"}
          </button>
          <button type="button" onClick={onCancel} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
