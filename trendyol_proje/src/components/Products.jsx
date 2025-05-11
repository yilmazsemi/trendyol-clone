import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchFromFirestore();
  }, []);

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="products-container">
      <h2>Popüler Ürünler</h2>

      <input
        type="text"
        placeholder="Ürün ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      <div className="product-grid">
        {filteredProducts.map(product => (
          <Link to={`/products/${product.id}`} key={product.id} className="product-card">
            <img src={product.image} alt={product.title} />
            <h3>{product.title}</h3>

            {product.discountPercentage ? (
              <>
                <p className="original-price">
                  {product.price.toFixed(2)}₺
                </p>
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
