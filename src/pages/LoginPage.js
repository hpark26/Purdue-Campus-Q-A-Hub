// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // 업데이트: 닉네임 설정
        await updateProfile(auth.currentUser, {
          displayName: nickname
        });
        alert("Sign up successful!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
      }
      navigate("/");
    } catch (error) {
      console.error("Auth error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="login-page">
      <h2>{isSignUp ? "Sign Up" : "Login"}</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {isSignUp && (
          <>
            <label>Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </>
        )}

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="auth-btn">
          {isSignUp ? "Sign Up" : "Login"}
        </button>
      </form>

      <div className="toggle-section">
        {isSignUp ? (
          <p>
            Already have an account?{" "}
            <button onClick={toggleMode}>Login here</button>
          </p>
        ) : (
          <p>
            Don't have an account?{" "}
            <button onClick={toggleMode}>Sign Up</button>
          </p>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
