import React from 'react';

const UserAvatar = ({ name }) => {
  // 사용자 이름 이니셜로 아바타 생성
  const initials = name ? name.substring(0, 2).toUpperCase() : "AN";
  
  // 이름의 첫 글자를 기준으로 일관된 색상 생성
  const colors = [
    "#1abc9c", "#3498db", "#9b59b6", "#f1c40f", "#e74c3c", 
    "#34495e", "#16a085", "#2980b9", "#8e44ad", "#f39c12"
  ];
  
  const getColorIndex = (name) => {
    if (!name) return 0;
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return sum % colors.length;
  };
  
  const colorIndex = getColorIndex(name);
  
  return (
    <div 
      className="user-avatar" 
      style={{ backgroundColor: colors[colorIndex] }}
    >
      {initials}
    </div>
  );
};

export default UserAvatar; 