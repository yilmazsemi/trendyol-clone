import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/products');
    } catch (error) {
      console.error('Login error:', error.message);
      setMessage('❌ Giriş yapılamadı. Bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className="login-container">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleLogin} className="login-form">
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

        {message && <p className="login-message">{message}</p>}
      </form>

      {!user && (
        <div className="seller-login-link">
          <p>Satıcı mısınız?</p>
          <button onClick={() => navigate('/seller/login')}>
            Satıcı Girişi Yap
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
