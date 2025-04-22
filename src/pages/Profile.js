import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FaUser, FaThumbsUp, FaThumbsDown, FaComment, FaEnvelope, FaClock } from "react-icons/fa";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userQuestions, setUserQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        // Redirect to login if not authenticated
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch user's questions
  useEffect(() => {
    async function fetchUserQuestions() {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const q = query(
          collection(db, "questions"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const questions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUserQuestions(questions);
      } catch (error) {
        console.error("Error fetching user questions:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserQuestions();
  }, [currentUser]);

  // Format date function
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Navigate to question detail
  const handleQuestionClick = (questionId) => {
    navigate(`/question/${questionId}`);
  };

  if (!currentUser) {
    return (
      <div className="profile-wrapper">
        <Topbar />
        <div className="profile-loading">
          <p>Please login to view your profile</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <Topbar />
      
      <div className="profile-layout">
        <Sidebar />
        
        <main className="profile-content">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaUser size={60} />
            </div>
            <div className="profile-info">
              <h1>{currentUser.displayName || "Anonymous User"}</h1>
              <div className="profile-details">
                <p><FaEnvelope /> {currentUser.email}</p>
                <p><FaClock /> Joined: {currentUser.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : "Unknown"}</p>
              </div>
            </div>
          </div>
          
          <div className="profile-section">
            <h2>My Questions</h2>
            
            {loading ? (
              <div className="profile-loading">
                <p>Loading your questions...</p>
              </div>
            ) : userQuestions.length === 0 ? (
              <div className="profile-empty">
                <p>You haven't asked any questions yet.</p>
                <button 
                  className="ask-btn" 
                  onClick={() => navigate("/ask")}
                >
                  Ask Your First Question
                </button>
              </div>
            ) : (
              <div className="profile-questions">
                {userQuestions.map(question => (
                  <div 
                    key={question.id} 
                    className="question-card"
                    onClick={() => handleQuestionClick(question.id)}
                  >
                    <h3>{question.title}</h3>
                    <div className="question-meta">
                      <span className="question-tag">{question.tag}</span>
                      <span className="question-date">{formatDate(question.createdAt)}</span>
                    </div>
                    <p className="question-body">
                      {question.body.length > 150 
                        ? question.body.substring(0, 150) + "..." 
                        : question.body}
                    </p>
                    <div className="question-stats">
                      <span><FaThumbsUp /> {question.likeCount || 0}</span>
                      <span><FaThumbsDown /> {question.dislikeCount || 0}</span>
                      <span><FaComment /> {question.replyCount || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}

export default Profile;
  