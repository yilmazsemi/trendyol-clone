import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [questionText, setQuestionText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState('');

  // Report product state
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const ref = doc(db, 'products', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
        }
      } catch (error) {
        console.error('Ürün detayları alınamadı:', error);
      }
    };

    const fetchQuestions = async () => {
      try {
        const q = query(
          collection(db, 'product_questions'),
          where('productId', '==', id),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQuestions(list);
      } catch (error) {
        console.error('Sorular alınamadı:', error);
      }
    };

    fetchProduct();
    fetchQuestions();
  }, [id]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: product.id, title: product.title, price: product.price, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleAskQuestion = async () => {
    if (!auth.currentUser) {
      setMessage('Lütfen giriş yapın.');
      return;
    }

    if (!questionText.trim()) {
      setMessage('Soru boş olamaz.');
      return;
    }

    try {
      await addDoc(collection(db, 'product_questions'), {
        productId: id,
        userId: auth.currentUser.uid,
        question: questionText.trim(),
        createdAt: Timestamp.now(),
        answer: null
      });

      setQuestionText('');
      setMessage('✔️ Sorunuz gönderildi.');

      const q = query(
        collection(db, 'product_questions'),
        where('productId', '==', id),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(list);
    } catch (error) {
      console.error('Soru gönderilemedi:', error);
      setMessage('❌ Soru gönderilemedi.');
    }
  };

  const handleReportProduct = async () => {
    if (!auth.currentUser || !reportReason.trim()) return;

    try {
      await addDoc(collection(db, 'product_reports'), {
        productId: product.id,
        userId: auth.currentUser.uid,
        reason: reportReason.trim(),
        createdAt: Timestamp.now(),
        status: 'pending'
      });

      setShowReportForm(false);
      setReportReason('');
      setReportMessage('✔️ Şikayetiniz başarıyla gönderildi.');
    } catch (error) {
      console.error('Şikayet gönderilemedi:', error);
      setReportMessage('❌ Şikayet gönderilemedi.');
    }
  };

  if (!product) return <p>Ürün bulunamadı.</p>;

  const discountedPrice = product.discountPercentage
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    : null;

  return (
    <div className="product-detail-container">
      <img src={product.image} alt={product.title} className="detail-image" />

      <div className="detail-info">
        <h2>{product.title}</h2>

        {discountedPrice ? (
          <>
            <p className="original-price">{product.price.toFixed(2)}₺</p>
            <p className="discounted-price">{discountedPrice}₺</p>
          </>
        ) : (
          <p className="price">{product.price.toFixed(2)}₺</p>
        )}

        <p>{product.description}</p>

        <div className="quantity-controls">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)}>+</button>
        </div>

        {auth.currentUser && (
          <>
            <button className="add-button" onClick={addToCart}>
              Sepete Ekle
            </button>

            <button
              className="report-button"
              onClick={() => setShowReportForm(prev => !prev)}
            >
              Ürünü Şikayet Et
            </button>
          </>
        )}

        {showReportForm && (
          <div className="report-box">
            <textarea
              placeholder="Şikayet nedeninizi yazın..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <button onClick={handleReportProduct}>Gönder</button>
            {reportMessage && <p className="message">{reportMessage}</p>}
          </div>
        )}

        <hr />

        <h3>Ürün Hakkında Sorular</h3>

        {auth.currentUser && (
          <div className="question-box">
            <textarea
              placeholder="Bir soru sorun..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
            <button onClick={handleAskQuestion}>Sor</button>
            {message && <p className="message">{message}</p>}
          </div>
        )}

        <ul className="question-list">
          {questions.map(q => (
            <li key={q.id}>
              <strong>Soru:</strong> {q.question} <br />
              {q.answer ? (
                <span><strong>Cevap:</strong> {q.answer}</span>
              ) : (
                <em>Henüz yanıtlanmadı.</em>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductDetail;
