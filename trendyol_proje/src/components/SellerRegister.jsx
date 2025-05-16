import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const SellerRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Create user document with pending status
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        role: 'seller',
        status: 'pending'  // Set status pending until approved
      });

      // Create seller application document
      await addDoc(collection(db, 'seller_applications'), {
        userId: result.user.uid,
        email,
        companyName: '', // Add input fields later to get real data if needed
        phone: '',
        description: '',
        status: 'pending'
      });

      setMessage('✔️ Satıcı kaydı başarılı! Onay bekleniyor.');
      setTimeout(() => navigate('/seller/login'), 2000);  // Redirect to login, no direct dashboard access
    } catch (error) {
      console.error('Seller signup error:', error.message);
      setMessage('❌ Kayıt başarısız.');
    }
  };

  return (
    <div className="signup-container">
      <h2>Satıcı Kaydı</h2>
      <form onSubmit={handleSignup}>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />

        <label>Şifre</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />

        <button type="submit">Kayıt Ol</button>

        {message && <p className="signup-message">{message}</p>}
      </form>

      <p className="switch-link">
        Kullanıcı olarak mı kayıt olmak istiyorsunuz?{' '}
        <button onClick={() => navigate('/signup')}>Kullanıcı Kaydı</button>
      </p>
    </div>
  );
};

export default SellerRegister;
