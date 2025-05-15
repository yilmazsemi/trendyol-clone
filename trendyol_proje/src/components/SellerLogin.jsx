import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const SellerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('✔️ Giriş başarılı!');
      setTimeout(() => navigate('/seller/dashboard'), 1500);
    } catch (error) {
      console.error('Seller login error:', error.message);
      setMessage('❌ Giriş başarısız.');
    }
  };

  return (
    <div className="login-container">
      <h2>Satıcı Girişi</h2>
      <form onSubmit={handleLogin}>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />

        <label>Şifre</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />

        <button type="submit">Giriş Yap</button>

        {message && <p className="login-message">{message}</p>}
      </form>

      <p className="switch-link">
        Kullanıcı olarak mı giriş yapacaksınız?{' '}
        <button onClick={() => navigate('/login')}>Kullanıcı Girişi</button>
      </p>
    </div>
  );
};

export default SellerLogin;
