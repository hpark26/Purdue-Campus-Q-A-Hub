import React from "react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>&copy; {currentYear} Purdue Q&A Hub | All Rights Reserved</p>
        </div>
        <div className="footer-right">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="social-icon">
            <FaGithub />
          </a>
          <a href="https://www.linkedin.com/in/hyungun-park-498bbb290/" target="_blank" rel="noreferrer" className="social-icon">
            <FaLinkedin />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon">
            <FaInstagram />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 