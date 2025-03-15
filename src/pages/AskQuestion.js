// src/pages/AskQuestion.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { db, auth } from "../firebase"; 
import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./AskQuestion.css";

function AskQuestion() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedTag, setSelectedTag] = useState("General");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false); // 게시물 목록 표시 여부
  const [currentUser, setCurrentUser] = useState(null);

  const tags = ["General", "Campus Life", "Technical Support", "Career", "Community"];

  // 로그인 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 태그 클릭 시 Firestore에서 해당 태그의 게시물을 가져와 표시
  const handleTagClick = async (tag) => {
    setSelectedTag(tag);
    setShowQuestions(true); 

    try {
      const q = query(collection(db, "questions"), where("tag", "==", tag));
      const querySnapshot = await getDocs(q);
      const fetchedPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFilteredPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // 게시물 클릭 시 상세 페이지로 이동하는 핸들러
  const handlePostClick = (postId) => {
    if (currentUser) {
      navigate(`/question/${postId}`);
    } else {
      alert("Please log in to view post details.");
    }
  };

  // 질문을 Firestore에 추가하고 선택한 태그의 질문 목록을 다시 표시
  const handlePost = async () => {
    if (!auth.currentUser) {
      alert("Please log in to post a question.");
      navigate("/login");
      return;
    }
    if (!title.trim() || !body.trim()) {
      alert("Please fill in both title and body.");
      return;
    }

    try {
      await addDoc(collection(db, "questions"), {
        title: title,
        body: body,
        tag: selectedTag,
        createdAt: Timestamp.now(),
        userId: auth.currentUser.uid,
        userNickname: auth.currentUser.displayName || "Anonymous",
        likeCount: 0,
        dislikeCount: 0,
        replyCount: 0
      });

      alert("Question posted successfully!");
      setTitle("");
      setBody("");
      setShowQuestions(true); // 질문 목록 보기 활성화
      handleTagClick(selectedTag); // 해당 태그의 질문 목록 다시 불러오기
    } catch (error) {
      console.error("Error adding document:", error);
      alert("Failed to post. Check console for details.");
    }
  };

  return (
    <div className="ask-wrapper">
      <Topbar />

      <div className="ask-layout">
        <Sidebar onTagClick={handleTagClick} /> {/* 사이드바 태그 클릭 기능 추가 */}

        <main className="ask-content">
          {!showQuestions ? (
            <>
              <h2 className="ask-page-title">Create a post</h2>

              <div className="ask-form">
                <div className="community-select">
                  <label className="form-label">Select a Tag:</label>
                  <select
                    className="select-tag"
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                  >
                    {tags.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-section">
                  <label className="form-label">Title</label>
                  <input
                    className="form-input"
                    type="text"
                    value={title}
                    placeholder="Enter your question title"
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="input-section">
                  <label className="form-label">Body</label>
                  <textarea
                    className="form-textarea"
                    value={body}
                    placeholder="Explain your question in detail"
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>

                <button onClick={handlePost} className="post-btn">
                  Post
                </button>
              </div>
            </>
          ) : (
            <div className="tag-posts">
              <h2 className="tag-title">Tag: {selectedTag}</h2>
              {filteredPosts.length === 0 ? (
                <p>No posts for this tag yet.</p>
              ) : (
                filteredPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="post-card"
                    onClick={() => handlePostClick(post.id)}
                  >
                    <h3 className="post-title">
                      {post.userNickname || "Anonymous"}: {post.title}
                    </h3>
                    <p className="post-body">{post.body}</p>
                    <div className="post-stats">
                      <span>👍 {post.likeCount || 0}</span>
                      <span>👎 {post.dislikeCount || 0}</span>
                      <span>💬 {post.replyCount || 0}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default AskQuestion;