import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchFromFirestore = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const productList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProducts(productList);

        // Get unique categories
        const categoryList = [...new Set(productList.map(p => p.category))];
        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchFromFirestore();
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesMin = minPrice ? p.price >= parseFloat(minPrice) : true;
    const matchesMax = maxPrice ? p.price <= parseFloat(maxPrice) : true;
    const matchesDiscount = onlyDiscounted ? p.discountPercentage : true;
    return matchesSearch && matchesCategory && matchesMin && matchesMax && matchesDiscount;
  });

  return (
    <div className="products-container">
      <h2>Popüler Ürünler</h2>

      {/* Filter UI */}
      <div className="filter-bar">
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
            onChange={() => setOnlyDiscounted(prev => !prev)}
          />
          Sadece İndirimliler
        </label>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <Link to={`/products/${product.id}`} key={product.id} className="product-card">
            <img src={product.image} alt={product.title} />
            <h3>{product.title}</h3>

            {product.discountPercentage ? (
              <>
                <p className="original-price">{product.price.toFixed(2)}₺</p>
                <p className="discounted-price">
                  {(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}₺
                </p>
              </>
            ) : (
              <p className="price">{product.price.toFixed(2)}₺</p>
            )}

            <p className="category">{product.category}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Products;
