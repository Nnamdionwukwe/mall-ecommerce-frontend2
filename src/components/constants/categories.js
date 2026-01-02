// constants/categories.js
export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Body Spray",
  "Sports",
  "Home & Kitchen",
  "Clothing",
  "Books",
  "Toys",
  "Beauty",
  "Food",
  "Pharmacy",
  "Bread",
  "Drinks",
];

export const getCategoriesWithProducts = (products) => {
  // Get only categories that have products in the database
  return [...new Set(products.map((p) => p.category))].filter(
    (cat) => cat && products.some((p) => p.category === cat)
  );
};
