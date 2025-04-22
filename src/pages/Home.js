// src/pages/Home.js
import React, { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase"; // Firestore import
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FaThumbsUp, FaThumbsDown, FaComment, FaLightbulb, FaSearch } from "react-icons/fa";
import purdueImage from "../images/purdue.jpg"; // Import the Purdue image
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedTag, setSelectedTag] = useState("HOME");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // User authentication status detection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      console.log("Auth state changed:", user ? `Logged in as ${user.email}` : "Not logged in");
    });
    return () => unsubscribe();
  }, []);

  // Check for selected tag in sessionStorage
  useEffect(() => {
    const savedTag = sessionStorage.getItem('selectedTag');
    if (savedTag) {
      setSelectedTag(savedTag);
      
      // Filter posts if we have any loaded
      if (posts.length > 0) {
        const result = posts.filter((p) => p.tag === savedTag);
        setFilteredPosts(result);
      }
      
      // Clear the saved tag after using it
      sessionStorage.removeItem('selectedTag');
    }
    
    // Check for search query in sessionStorage
    const query = sessionStorage.getItem('searchQuery');
    if (query) {
      setSearchQuery(query);
      
      // Filter posts if we have any loaded
      if (posts.length > 0) {
        handleSearch(query);
      }
      
      // 검색 후 태그를 SEARCH로 변경
      setSelectedTag("SEARCH");
      
      // Clear the search query after using it
      sessionStorage.removeItem('searchQuery');
    }
  }, [posts]);

  // Fetch posts from Firestore
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching posts from Firestore...");
        // 데이터베이스 연결 테스트
        const testQuery = query(collection(db, "questions"), limit(1));
        const testSnapshot = await getDocs(testQuery);
        console.log("Database connection test:", testSnapshot.empty ? "No data found" : "Connection successful");
        
        // 전체 데이터 가져오기
        const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        console.log(`Found ${querySnapshot.docs.length} posts`);
        
        const fetched = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(fetched);
        setFilteredPosts(fetched);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("Failed to load posts. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  // Sidebar tag click handler
  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    if (tag === "HOME") {
      setFilteredPosts(posts);
    } else {
      const result = posts.filter((p) => p.tag === tag);
      setFilteredPosts(result);
    }
  };

  // 검색 처리 함수
  const handleSearch = (query) => {
    if (!query) return;
    
    console.log("Searching for:", query);
    const searchTerm = query.toLowerCase();
    
    // 제목이나 내용에 검색어가 포함된 게시물 필터링
    const result = posts.filter((post) => {
      const title = (post.title || "").toLowerCase();
      const body = (post.body || "").toLowerCase();
      const nickname = (post.userNickname || "").toLowerCase();
      const tag = (post.tag || "").toLowerCase();
      
      return title.includes(searchTerm) || 
             body.includes(searchTerm) || 
             nickname.includes(searchTerm) ||
             tag.includes(searchTerm);
    });
    
    setFilteredPosts(result);
    console.log(`Found ${result.length} results for "${query}"`);
  };

  // Go to Ask a Question page
  const goToAskPage = () => {
    navigate("/ask");
  };

  // Post click handler: only logged in users can navigate to detail page
  const handlePostClick = (postId) => {
    if (currentUser) {
      navigate(`/question/${postId}`);
    } else {
      alert("Please login to view post details.");
      navigate('/login');
    }
  };

  // Function to limit post content length
  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="home-wrapper">
      <Topbar />

      <div className="layout">
        <Sidebar onTagClick={handleTagClick} />

        <main className="main-content">
          {selectedTag === "HOME" ? (
            <div className="home-default" style={{ backgroundImage: `url(${purdueImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="home-content-overlay">
                <h1 className="ask-title">
                  <span>Find Answers, Share Knowledge</span>
                </h1>
                <button className="ask-btn" onClick={goToAskPage}>
                  <FaLightbulb style={{ marginRight: '8px' }} /> Ask a Question
                </button>
              </div>
            </div>
          ) : selectedTag === "SEARCH" ? (
            <div className="search-results">
              <h2 className="search-title">
                <FaSearch style={{ marginRight: '10px' }} />
                Search Results for: "{searchQuery}"
              </h2>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p>Searching...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p>No results found for "{searchQuery}"</p>
                  <button className="ask-btn" onClick={goToAskPage} style={{ marginTop: '16px' }}>
                    Ask a Question
                  </button>
                </div>
              ) : (
                <>
                  <p className="search-count">{filteredPosts.length} results found</p>
                  {filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      className="post-card"
                      onClick={() => handlePostClick(post.id)}
                    >
                      <h3 className="post-title">
                        {post.userNickname || "Anonymous"}: {post.title || "Untitled"}
                      </h3>
                      <p className="post-body">{truncateText(post.body)}</p>
                      <div className="post-stats">
                        <span><FaThumbsUp /> {post.likeCount || 0}</span>
                        <span><FaThumbsDown /> {post.dislikeCount || 0}</span>
                        <span><FaComment /> {post.replyCount || 0}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="tag-posts">
              <h2 className="tag-title">Category: {selectedTag}</h2>
              
              {error ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'red' }}>
                  <p>{error}</p>
                  <button 
                    className="ask-btn" 
                    onClick={() => window.location.reload()} 
                    style={{ marginTop: '16px' }}
                  >
                    Retry
                  </button>
                </div>
              ) : loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p>Loading posts...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p>No posts in this category yet.</p>
                  <button className="ask-btn" onClick={goToAskPage} style={{ marginTop: '16px' }}>
                    Create First Question
                  </button>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="post-card"
                    onClick={() => handlePostClick(post.id)}
                  >
                    <h3 className="post-title">
                      {post.userNickname || "Anonymous"}: {post.title || "Untitled"}
                    </h3>
                    <p className="post-body">{truncateText(post.body)}</p>
                    <div className="post-stats">
                      <span><FaThumbsUp /> {post.likeCount || 0}</span>
                      <span><FaThumbsDown /> {post.dislikeCount || 0}</span>
                      <span><FaComment /> {post.replyCount || 0}</span>
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
