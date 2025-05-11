import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import './SellerLogin.css';

const SellerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      // Firebase Auth Login
      await signInWithEmailAndPassword(auth, email, password);

      // Firestore: Check seller status
      const q = query(
        collection(db, 'seller_applications'),
        where('email', '==', email),
        where('status', '==', 'approved')
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setMessage('❌ Satıcı başvurunuz henüz onaylanmadı.');
        return;
      }

      // If approved → Navigate to seller dashboard
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('Seller login error:', error.message);
      setMessage('❌ Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className="seller-login-container">
      <h2>Satıcı Girişi</h2>
      <form onSubmit={handleLogin} className="seller-login-form">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Şifre</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Giriş Yap</button>

        {message && <p className="seller-login-message">{message}</p>}
      </form>
    </div>
  );
};

export default SellerLogin;
