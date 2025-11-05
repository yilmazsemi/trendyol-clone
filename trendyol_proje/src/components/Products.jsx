import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [categories, setCategories] = useState([]);

  // 🔹 Firestore'dan ürünleri çek
  useEffect(() => {
    const fetchFromFirestore = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productList);

        // 🔹 Kategorileri normalize et, tekrarı kaldır
        const categoryList = [
          ...new Set(
            productList
              .map((p) => p.category?.trim().toLowerCase())
              .filter(Boolean)
          ),
        ];

        // 🔹 Yaygın yazım hatalarını düzelt
        const correctionMap = {
          accesories: "Accessories",
          accesory: "Accessories",
          cloths: "Clothes",
          technlogy: "Technology",
        };

        const corrected = categoryList.map((c) => correctionMap[c] || c);

        // 🔹 İlk harfi büyük yap
        const formattedCategories = corrected.map(
          (c) => c.charAt(0).toUpperCase() + c.slice(1)
        );

        setCategories(formattedCategories);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchFromFirestore();
  }, []);

  // 🔹 Filtreleme işlemleri
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? p.category?.toLowerCase().trim() ===
        selectedCategory.toLowerCase().trim()
      : true;
    const matchesMin = minPrice ? p.price >= parseFloat(minPrice) : true;
    const matchesMax = maxPrice ? p.price <= parseFloat(maxPrice) : true;
    const matchesDiscount = onlyDiscounted ? p.discountPercentage : true;
    return (
      matchesSearch &&
      matchesCategory &&
      matchesMin &&
      matchesMax &&
      matchesDiscount
    );
  });

  return (
    <div className="products-page">
      <h2>Popüler Ürünler</h2>

      <div className="products-layout">
        {/* 🔹 Sol filtre paneli */}
        <aside className="filters">
          <h3>Filtrele</h3>

          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min ₺"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max ₺"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <label className="discount-toggle">
            <input
              type="checkbox"
              checked={onlyDiscounted}
              onChange={() => setOnlyDiscounted((prev) => !prev)}
            />
            Sadece İndirimliler
          </label>
        </aside>

        {/* 🔹 Ürün Grid */}
        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link
                to={`/products/${product.id}`}
                key={product.id}
                className="product-card"
              >
                <img src={product.image} alt={product.title} />
                <h3>{product.title}</h3>

                {product.discountPercentage ? (
                  <>
                    <p className="original-price">
                      {product.price.toFixed(2)}₺
                    </p>
                    <p className="discounted-price">
                      {(
                        product.price *
                        (1 - product.discountPercentage / 100)
                      ).toFixed(2)}
                      ₺
                    </p>
                  </>
                ) : (
                  <p className="price">{product.price.toFixed(2)}₺</p>
                )}

                <p className="category">{product.category}</p>
              </Link>
            ))
          ) : (
            <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
              Ürün bulunamadı.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
