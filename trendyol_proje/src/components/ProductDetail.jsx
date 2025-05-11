import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Ürün yüklenemedi:', error);
      }
    };

    const loadCartQuantity = () => {
      const stored = localStorage.getItem('cart');
      if (stored) {
        const cart = JSON.parse(stored);
        const found = cart.find(item => item.id === id);
        setQuantity(found ? found.quantity : 0);
      }
    };

    fetchProduct();
    loadCartQuantity();
    window.addEventListener('cartUpdated', loadCartQuantity);
    return () => window.removeEventListener('cartUpdated', loadCartQuantity);
  }, [id]);

  const updateCart = (change) => {
    const stored = localStorage.getItem('cart');
    let cart = stored ? JSON.parse(stored) : [];
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

  if (!product) {
    return <div className="product-detail-container">Yükleniyor...</div>;
  }

  return (
    <div className="product-detail-container">
      <img src={product.image} alt={product.title} className="product-detail-image" />
      <div className="product-detail-info">
        <h2>{product.title}</h2>
        <p className="price">{product.price.toFixed(2)}₺</p>
        <p className="category">{product.category}</p>
        <p className="description">{product.description}</p>

        {user && (
          <div className="detail-controls">
            <button onClick={() => updateCart(-1)}>-</button>
            <span>{quantity}</span>
            <button onClick={() => updateCart(1)}>+</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
