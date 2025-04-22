// src/components/Sidebar.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaQuestionCircle, 
  FaGraduationCap, 
  FaLaptopCode, 
  FaBriefcase, 
  FaUsers, 
  FaUtensils, 
  FaBook, 
  FaRunning, 
  FaBuilding, 
  FaUniversity,
  FaSchool,
  FaSubway
} from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({ onTagClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTag, setActiveTag] = useState("HOME");

  const handleHomeClick = () => {
    navigate("/");
    setActiveTag("HOME");
    onTagClick?.("HOME");
  };

  const handleAskClick = () => {
    navigate("/ask");
    setActiveTag("");
  };

  const handleTagSelect = (tag) => {
    setActiveTag(tag);
    onTagClick?.(tag);
  };

  // 카테고리와 아이콘 매핑
  const categories = [
    { name: "General", icon: <FaGraduationCap /> },
    { name: "Campus Life", icon: <FaUsers /> },
    { name: "Academic", icon: <FaUniversity /> },
    { name: "Technical Support", icon: <FaLaptopCode /> },
    { name: "Career", icon: <FaBriefcase /> },
    { name: "Dining", icon: <FaUtensils /> },
    { name: "Housing", icon: <FaBuilding /> },
    { name: "Books & Resources", icon: <FaBook /> },
    { name: "Sports & Recreation", icon: <FaRunning /> },
    { name: "Transportation", icon: <FaSubway /> },
    { name: "Freshman Advice", icon: <FaSchool /> }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-heading">Main Menu</div>
      <ul>
        <li 
          className={activeTag === "HOME" ? "active" : ""} 
          onClick={handleHomeClick}
        >
          <FaHome style={{ marginRight: '10px' }} /> Home
        </li>
        <li onClick={handleAskClick}>
          <FaQuestionCircle style={{ marginRight: '10px' }} /> Ask a Question
        </li>
      </ul>

      <div className="sidebar-heading">Categories</div>
      <ul>
        {categories.map(category => (
          <li
            key={category.name}
            className={activeTag === category.name ? "active" : ""}
            onClick={() => handleTagSelect(category.name)}
          >
            <span className="category-icon" style={{ marginRight: '10px' }}>
              {category.icon}
            </span>
            {category.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
