import { Link } from "react-router-dom";
import "./Navbar.css";  

function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/ask">Ask a Question</Link>
      <Link to="/profile">My Profile</Link>
    </nav>
  );
}

export default Navbar;
