// src/pages/QuestionDetail.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, increment, collection, addDoc, Timestamp, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "./QuestionDetail.css";

function QuestionDetail() {
  const { id } = useParams(); // question ID
  const [question, setQuestion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    // 1) 질문 데이터 가져오기
    const docRef = doc(db, "questions", id);
    getDoc(docRef).then((snapshot) => {
      if (snapshot.exists()) {
        setQuestion({ id: snapshot.id, ...snapshot.data() });
      }
    });

    // 2) 실시간으로 replies subcollection 가져오기 
    const repliesRef = collection(db, "questions", id, "replies");
    const unsub = onSnapshot(repliesRef, (snapshot) => {
      const arr = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReplies(arr);
    });

    return () => unsub();
  }, [id]);

  // 따봉
  const handleLike = async () => {
    const docRef = doc(db, "questions", id);
    await updateDoc(docRef, {
      likeCount: increment(1)
    });
  };

  // downvote
  const handleDislike = async () => {
    const docRef = doc(db, "questions", id);
    await updateDoc(docRef, {
      dislikeCount: increment(1)
    });
  };

  // 답글 달기
  const handleReply = async () => {
    if (!auth.currentUser) {
      alert("Please log in to reply.");
      return;
    }
    if (!replyText.trim()) return;

    const repliesRef = collection(db, "questions", id, "replies");
    await addDoc(repliesRef, {
      userNickname: auth.currentUser.displayName || "Anonymous",
      text: replyText,
      createdAt: Timestamp.now()
    });

    // replyCount +1
    const questionRef = doc(db, "questions", id);
    await updateDoc(questionRef, {
      replyCount: increment(1)
    });

    setReplyText("");
  };

  if (!question) return <div>Loading...</div>;

  return (
    <div className="detail-wrapper">
      <Topbar />
      <div className="detail-layout">
        <Sidebar onTagClick={() => { }} />

        <main className="detail-content">
          <h2>{question.userNickname || "Anonymous"}: {question.title}</h2>
          <p>{question.body}</p>

          <div className="like-dislike-section">
            <button onClick={handleLike}>👍 {question.likeCount || 0}</button>
            <button onClick={handleDislike}>👎 {question.dislikeCount || 0}</button>
          </div>

          <div className="replies-section">
            <h3>Replies ({question.replyCount || 0})</h3>
            {replies.map((rep) => (
              <div key={rep.id} className="reply-item">
                <strong>{rep.userNickname}:</strong> {rep.text}
              </div>
            ))}
          </div>

          <div className="reply-form">
            <textarea
              placeholder="Add a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button onClick={handleReply}>Reply</button>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default QuestionDetail;
