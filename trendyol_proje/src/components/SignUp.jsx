import React, { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import './SignUp.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        createdAt: new Date()
      });
      setMessage('✔️ Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın.');
    } catch (error) {
      console.error('Signup error:', error.message);
      setMessage('❌ Kayıt yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className="signup-container">
      <h2>Kayıt Ol</h2>
      <form onSubmit={handleSignUp} className="signup-form">
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

        <button type="submit">Kayıt Ol</button>

        {message && <p className="signup-message">{message}</p>}
      </form>

      {!user && (
        <div className="seller-register-link">
          <p>Satıcı olmak ister misiniz?</p>
          <button onClick={() => navigate('/seller/register')}>
            Satıcı Olmak İstiyorum
          </button>
        </div>
      )}
    </div>
  );
};

export default SignUp;
