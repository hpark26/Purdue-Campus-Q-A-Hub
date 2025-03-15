// src/pages/Home.js
import React, { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase"; // Firestore import
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedTag, setSelectedTag] = useState("HOME");
  const [currentUser, setCurrentUser] = useState(null);

  // 로그인 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Firestore에서 게시물 불러오기
  useEffect(() => {
    async function fetchPosts() {
      try {
        const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(fetched);
        setFilteredPosts(fetched);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }
    fetchPosts();
  }, []);

  // 사이드바 태그 클릭 핸들러
  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    if (tag === "HOME") {
      setFilteredPosts(posts);
    } else {
      const result = posts.filter((p) => p.tag === tag);
      setFilteredPosts(result);
    }
  };

  // Ask a Question 페이지 이동
  const goToAskPage = () => {
    navigate("/ask");
  };

  // 게시물 클릭 핸들러: 로그인한 사용자만 상세 페이지로 이동
  const handlePostClick = (postId) => {
    if (currentUser) {
      navigate(`/question/${postId}`);
    } else {
      alert("Please log in to view post details.");
    }
  };

  return (
    <div className="home-wrapper">
      <Topbar />

      <div className="layout">
        <Sidebar onTagClick={handleTagClick} />

        <main className="main-content">
          {selectedTag === "HOME" ? (
            <div className="home-default">
              <h1 className="ask-title">Ask whatever you want to know!</h1>
              <button className="ask-btn" onClick={goToAskPage}>
                Ask a Question
              </button>
            </div>
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

export default Home;
