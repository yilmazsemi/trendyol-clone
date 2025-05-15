import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./Navbar.css";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(auth.currentUser);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setUserRole(data.role || null);
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateCount = () => {
      const stored = localStorage.getItem("cart");
      if (stored) {
        const cart = JSON.parse(stored);
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    };

    updateCount();
    window.addEventListener("cartUpdated", updateCount);
    return () => window.removeEventListener("cartUpdated", updateCount);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarLetter = user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <nav className="top-nav">
      <div className="nav-left" onClick={() => navigate("/products")}>
        TrendyolClone
      </div>

      <div className="nav-actions">
        {user && userRole !== "seller" && (
          <div className="cart-icon" onClick={() => navigate("/cart")}>
            🛒 <span className="cart-badge">{cartCount}</span>
          </div>
        )}

        <div className="nav-right dropdown" ref={dropdownRef}>
          <button
            className={user ? "dropdown-avatar" : "dropdown-login"}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            {user ? avatarLetter : "Giriş Yap"}
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              {user ? (
                <>
                  <button onClick={() => navigate("/profile")}>Profile</button>

                  {userRole === "seller" ? (
                    <button onClick={() => navigate("/seller/dashboard")}>
                      Satıcı Paneli
                    </button>
                  ) : (
                    <>
                      <button onClick={() => navigate("/orders")}>
                        Orders
                      </button>
                      <button onClick={() => navigate("/cart")}>Cart</button>
                    </>
                  )}

                  {userRole === "admin" && (
                    <button onClick={() => navigate("/admin/dashboard")}>
                      Admin Panel
                    </button>
                  )}

                  {userRole === "admin" && (
                    <button onClick={() => navigate("/admin/sellers")}>
                      Satıcı Yönetimi
                    </button>
                  )}

                  {userRole === "admin" && (
                    <button onClick={() => navigate("/admin/reports")}>
                      Şikayetleri İncele
                    </button>
                  )}

                  <button
                    onClick={async () => {
                      await signOut(auth);
                      navigate("/login");
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate("/login")}>Login</button>
                  <button onClick={() => navigate("/signup")}>Sign Up</button>
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
