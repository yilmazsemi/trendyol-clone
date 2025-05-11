import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { auth } from '../services/firebase';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cartMap, setCartMap] = useState({});
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

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

    const fetchCart = () => {
      const stored = localStorage.getItem('cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        const map = {};
        parsed.forEach(item => {
          map[item.id] = item.quantity;
        });
        setCartMap(map);
      }
    };

    fetchFromFirestore();
    fetchCart();
    window.addEventListener('cartUpdated', fetchCart);
    return () => window.removeEventListener('cartUpdated', fetchCart);
  }, []);

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const updateCart = (product, change) => {
    const stored = localStorage.getItem('cart');
    const cart = stored ? JSON.parse(stored) : [];
    const index = cart.findIndex(item => item.id === product.id);

    if (index !== -1) {
      cart[index].quantity += change;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
    } else if (change > 0) {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="products-container">
      <h2>Popüler Ürünler</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Ürün ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-dropdown"
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => {
            const quantity = cartMap[product.id] || 0;
            return (
              <div key={product.id} className="product-card">
                <Link to={`/products/${product.id}`} className="product-clickable">
                  <img src={product.image} alt={product.title} />
                  <h3>{product.title}</h3>
                  <p className="price">{product.price.toFixed(2)}₺</p>
                  <p className="category">{product.category}</p>
                </Link>

                {user && (
                  <div className="hover-counter">
                    <button onClick={() => updateCart(product, -1)}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => updateCart(product, 1)}>+</button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>Aramanızla eşleşen ürün bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

export default Products;
