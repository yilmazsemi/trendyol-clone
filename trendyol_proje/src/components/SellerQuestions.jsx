import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import './SellerQuestions.css';

const SellerQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
  const fetchQuestions = async () => {
    try {
      const productSnapshot = await getDocs(
        query(collection(db, 'products'), where('sellerId', '==', auth.currentUser.uid))
      );

      const productMap = {};
      const productIds = [];

      productSnapshot.forEach(doc => {
        productIds.push(doc.id);
        productMap[doc.id] = doc.data().title;
      });

      if (productIds.length === 0) return;

      const questionSnapshot = await getDocs(
        query(collection(db, 'product_questions'), where('productId', 'in', productIds))
      );

      const list = questionSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          productTitle: productMap[data.productId] || data.productId
        };
      });

      setQuestions(list);
    } catch (error) {
      console.error('Sorular alınamadı:', error);
    }
  };

  fetchQuestions();
}, []);


  const handleAnswerChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const submitAnswer = async (id) => {
    const answer = answers[id]?.trim();
    if (!answer) return;

    try {
      await updateDoc(doc(db, 'product_questions', id), {
        answer
      });

      setQuestions(prev =>
        prev.map(q => (q.id === id ? { ...q, answer } : q))
      );

      setAnswers(prev => ({ ...prev, [id]: '' }));
    } catch (error) {
      console.error('Cevap gönderilemedi:', error);
    }
  };

  return (
    <div className="seller-questions-container">
      <h2>Müşteri Soruları</h2>

      {questions.length === 0 ? (
        <p>Henüz bir soru bulunmuyor.</p>
      ) : (
        questions.map((q) => (
          <div key={q.id} className="question-card">
            <p><strong>Ürün:</strong> {q.productTitle}</p>
            <p><strong>Soru:</strong> {q.question}</p>

            {q.answer ? (
              <p><strong>Cevap:</strong> {q.answer}</p>
            ) : (
              <div className="answer-box">
                <textarea
                  placeholder="Cevabınızı yazın..."
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                />
                <button onClick={() => submitAnswer(q.id)}>Yanıtla</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default SellerQuestions;
