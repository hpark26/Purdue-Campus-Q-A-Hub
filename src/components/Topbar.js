// src/components/Topbar.js
import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./Topbar.css";

function Topbar() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="top-header">
      <div className="logo-text">Purdue Q&A Hub</div>

      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input type="text" placeholder="Search" />
      </div>

      <div className="auth-section">
        {currentUser ? (
          <>
          
            <span className="welcome-text">
              Welcome {currentUser.displayName || "User"}!
            </span>

            
            <Link to="/profile">
              <button className="header-btn">My Profile</button>
            </Link>
            <button className="header-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">
            <button className="header-btn">Login / Sign Up</button>
          </Link>
        )}
      </div>
    </header>
  );
}

export default Topbar;
