// src/components/Sidebar.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ onTagClick }) {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    
    navigate("/");
    
    onTagClick?.("HOME");
  };

  const handleAskClick = () => {
    navigate("/ask");
  };

  return (
    <aside className="sidebar">
      <ul>
        <li onClick={handleHomeClick}>Home</li>
        <li onClick={handleAskClick}>Ask a Question</li>
        <li onClick={() => onTagClick?.("General")}>General</li>
        <li onClick={() => onTagClick?.("Campus Life")}>Campus Life</li>
        <li onClick={() => onTagClick?.("Technical Support")}>Technical Support</li>
        <li onClick={() => onTagClick?.("Career")}>Career</li>
        <li onClick={() => onTagClick?.("Community")}>Community</li>
      </ul>
    </aside>
  );
}

export default Sidebar;
