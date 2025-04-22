// src/components/Topbar.js
import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./Topbar.css";

function Topbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  // 검색 처리 함수
  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchText.trim()) {
      console.log("Searching for:", searchText);
      try {
        // 세션 스토리지에 검색어 저장
        sessionStorage.setItem('searchQuery', searchText);
        // 홈 페이지로 이동
        navigate('/');
      } catch (error) {
        console.error("Search error:", error);
        alert("Search failed. Please try again.");
      }
    }
  };

  return (
    <header className="top-header">
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="logo-text">Purdue Q&A Hub</div>
      </Link>

      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Search and press Enter" 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={handleSearch}
        />
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
