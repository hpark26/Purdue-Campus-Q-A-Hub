// src/pages/QuestionDetail.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  increment, 
  collection, 
  addDoc, 
  Timestamp, 
  getDocs,
  where,
  query 
} from "firebase/firestore";
import { db, auth } from "../firebase";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import UserAvatar from "../components/UserAvatar";
import { FaThumbsUp, FaThumbsDown, FaReply, FaClock, FaTag } from "react-icons/fa";
import "./QuestionDetail.css";

// LoadingSpinner 컴포넌트 추가
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading question details...</p>
  </div>
);

// EmptyReplies 컴포넌트 추가
const EmptyReplies = () => (
  <div className="empty-state">
    <div className="empty-state-text">
      <p>No replies yet. Be the first to reply!</p>
    </div>
  </div>
);

function QuestionDetail() {
  const { id } = useParams(); // question ID
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 질문과 답글 데이터를 가져오는 함수
  const fetchQuestionAndReplies = async () => {
    setLoading(true);
    try {
      console.log("Fetching question with ID:", id);
      // 1. 질문 데이터 가져오기
      const questionRef = doc(db, "questions", id);
      const questionSnap = await getDoc(questionRef);

      if (!questionSnap.exists()) {
        console.error("Question document does not exist");
        setError("Question not found");
        setLoading(false);
        return;
      }

      const questionData = {
        id: questionSnap.id,
        ...questionSnap.data()
      };
      setQuestion(questionData);
      console.log("Question data loaded:", questionData);

      // 2. 해당 질문의 답글들 가져오기
      try {
        const repliesRef = collection(db, "replies");
        const repliesSnapshot = await getDocs(repliesRef);
        const allReplies = repliesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // 현재 질문에 대한 답글만 필터링
        const filteredReplies = allReplies.filter(reply => reply.questionId === id);
        console.log("Filtered replies for question", id, ":", filteredReplies.length, "out of", allReplies.length);
        
        setReplies(filteredReplies);
      } catch (replyErr) {
        console.error("Error loading replies:", replyErr);
        // 답글 로드 실패해도 질문은 표시
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionAndReplies();
  }, [id]);

  // 사이드바 태그 클릭 핸들러
  const handleTagClick = (tag) => {
    navigate('/');
    // 홈 페이지로 이동한 후 태그를 선택하도록 상태를 저장
    sessionStorage.setItem('selectedTag', tag);
  };

  // 따봉
  const handleLike = async () => {
    if (!auth.currentUser) {
      alert("Please log in to like posts.");
      return;
    }
    
    try {
      const docRef = doc(db, "questions", id);
      await updateDoc(docRef, {
        likeCount: increment(1)
      });
      
      // UI 업데이트
      setQuestion(prev => ({
        ...prev,
        likeCount: (prev.likeCount || 0) + 1
      }));
    } catch (err) {
      console.error("Error updating like count:", err);
      alert("Failed to like the post. Please try again.");
    }
  };

  // downvote
  const handleDislike = async () => {
    if (!auth.currentUser) {
      alert("Please log in to dislike posts.");
      return;
    }
    
    try {
      const docRef = doc(db, "questions", id);
      await updateDoc(docRef, {
        dislikeCount: increment(1)
      });
      
      // UI 업데이트
      setQuestion(prev => ({
        ...prev,
        dislikeCount: (prev.dislikeCount || 0) + 1
      }));
    } catch (err) {
      console.error("Error updating dislike count:", err);
      alert("Failed to dislike the post. Please try again.");
    }
  };

  // 답글 달기
  const handleReply = async () => {
    if (!auth.currentUser) {
      alert("Please log in to reply.");
      return;
    }
    if (!replyText.trim()) return;

    try {
      console.log("Adding reply to question:", id);
      
      // 현재 로그인한 사용자 정보 가져오기
      const user = auth.currentUser;
      const userNickname = user.displayName || user.email || "Anonymous";
      
      // 먼저 질문 문서의 replyCount 증가
      const questionRef = doc(db, "questions", id);
      await updateDoc(questionRef, {
        replyCount: increment(1)
      });
      
      // replies 컬렉션에 답글 추가 - questionId 포함
      const replyRef = await addDoc(collection(db, "replies"), {
        text: replyText,
        questionId: id,
        userId: user.uid,
        userNickname: userNickname,
        timestamp: Date.now()
      });
      console.log("Reply added with ID:", replyRef.id);

      // UI 업데이트
      setReplyText("");
      alert("Reply added successfully!");
      
      // 답글 목록 새로고침
      fetchQuestionAndReplies();
    } catch (err) {
      console.error("Error adding reply:", err);
      alert(`Failed to add reply. Error: ${err.message}\n\nPlease contact admin to check Firestore rules.`);
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    try {
      // Firestore Timestamp 객체인 경우
      if (timestamp.toDate) {
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      }
      // 일반 숫자 타임스탬프인 경우
      else if (typeof timestamp === 'number') {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      }
      return "Invalid date format";
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Invalid date";
    }
  };

  if (loading) return (
    <div className="detail-wrapper">
      <Topbar />
      <div className="detail-layout">
        <Sidebar onTagClick={handleTagClick} />
        <main className="detail-content loading">
          <LoadingSpinner />
        </main>
      </div>
      <Footer />
    </div>
  );

  if (error) return (
    <div className="detail-wrapper">
      <Topbar />
      <div className="detail-layout">
        <Sidebar onTagClick={handleTagClick} />
        <main className="detail-content error">
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="return-home-btn">
            Return to Home
          </button>
        </main>
      </div>
      <Footer />
    </div>
  );

  if (!question) return (
    <div className="detail-wrapper">
      <Topbar />
      <div className="detail-layout">
        <Sidebar onTagClick={handleTagClick} />
        <main className="detail-content">
          <p>Question not found.</p>
        </main>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="detail-wrapper">
      <Topbar />
      <div className="detail-layout">
        <Sidebar onTagClick={handleTagClick} />

        <main className="detail-content">
          <div className="question-header">
            <h1 className="question-title">{question.title || "Untitled Question"}</h1>
            
            <div className="question-meta">
              <div className="meta-tag" onClick={() => handleTagClick(question.tag)}>
                <FaTag /> {question.tag || "General"}
              </div>
              <div className="meta-author">
                By: {question.userNickname || "Anonymous"}
              </div>
              <div className="meta-date">
                <FaClock /> {formatDate(question.createdAt)}
              </div>
            </div>
            
            <div className="question-body">
              {question.body}
            </div>
          </div>

          <div className="action-buttons">
            <button className="action-btn like-btn" onClick={handleLike}>
              <FaThumbsUp /> {question.likeCount || 0}
            </button>
            <button className="action-btn dislike-btn" onClick={handleDislike}>
              <FaThumbsDown /> {question.dislikeCount || 0}
            </button>
          </div>

          <div className="replies-section">
            <h2 className="replies-title">
              Replies <span className="replies-count">({question.replyCount || replies.length || 0})</span>
            </h2>
            
            {replies.length === 0 ? (
              <EmptyReplies />
            ) : (
              <div className="replies-list">
                {replies.map((reply) => (
                  <div key={reply.id} className="reply-item">
                    <div className="reply-header">
                      <div className="reply-header-with-avatar">
                        <UserAvatar name={reply.userNickname || "Anonymous"} />
                        <div className="reply-user-info">
                          <span className="reply-author">{reply.userNickname || "Anonymous"}</span>
                          <span className="reply-date">{reply.timestamp ? formatDate(reply.timestamp) : reply.createdAt ? formatDate(reply.createdAt) : "Unknown date"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="reply-text">{reply.text}</div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="reply-form">
              <textarea
                className="reply-textarea"
                placeholder="Write your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button 
                className="reply-btn"
                onClick={handleReply}
                disabled={!auth.currentUser || !replyText.trim()}
              >
                <FaReply /> Reply
              </button>
              {!auth.currentUser && (
                <p className="login-prompt">Please log in to reply</p>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default QuestionDetail;
