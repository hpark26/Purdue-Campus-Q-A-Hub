import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged } from "firebase/auth";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Toggle between login and signup forms
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  // Validate Purdue email
  const isPurdueEmail = (email) => {
    return email.toLowerCase().endsWith("@purdue.edu");
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password || !displayName) {
      setError("Please fill in all fields");
      return;
    }
    
    // Validate Purdue email
    if (!isPurdueEmail(email)) {
      setError("Registration is only allowed with a Purdue email (@purdue.edu)");
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });
      navigate("/");
    } catch (error) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in instead.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <Topbar />
      
      <div className="auth-container">
        <div className="auth-box">
          <h2>{isLogin ? "Login" : "Sign Up"}</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={isLogin ? handleLogin : handleSignup}>
            {!isLogin && (
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
            )}
            
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isLogin ? "Enter your email" : "Enter your Purdue email"}
              />
              {!isLogin && <p className="helper-text">Must be a @purdue.edu email address</p>}
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
            </button>
          </form>
          
          <div className="toggle-form">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={toggleForm}>
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default LoginPage; 