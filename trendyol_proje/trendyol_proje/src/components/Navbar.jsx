import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import './Navbar.css';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateCount = () => {
      const stored = localStorage.getItem('cart');
      if (stored) {
        const cart = JSON.parse(stored);
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    };

    updateCount();
    window.addEventListener('cartUpdated', updateCount);
    return () => window.removeEventListener('cartUpdated', updateCount);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarLetter = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <nav className="top-nav">
      <div className="nav-left" onClick={() => navigate('/products')}>
        TrendyolClone
      </div>

      <div className="nav-actions">
        {user && (
          <div className="cart-icon" onClick={() => navigate('/cart')}>
            🛒 <span className="cart-badge">{cartCount}</span>
          </div>
        )}

        <div className="nav-right dropdown" ref={dropdownRef}>
          <button
            className={user ? 'dropdown-avatar' : 'dropdown-login'}
            onClick={() => setDropdownOpen(prev => !prev)}
          >
            {user ? avatarLetter : 'Giriş Yap'}
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              {user ? (
                <>
                  <button onClick={() => navigate('/profile')}>Profile</button>
                  <button onClick={() => navigate('/orders')}>Orders</button>
                  <button onClick={() => navigate('/cart')}>Cart</button>
                  <button
                    onClick={async () => {
                      await signOut(auth);
                      navigate('/login');
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/login')}>Login</button>
                  <button onClick={() => navigate('/signup')}>Sign Up</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
