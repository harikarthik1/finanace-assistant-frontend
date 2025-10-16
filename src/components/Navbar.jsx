import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../index.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNavbar, setShowNavbar] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/signup") {
      setShowNavbar(false);
    } else {
      setShowNavbar(true);
    }
  }, [location.pathname]);

  // Add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!showNavbar) return null;

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          Finance Assistant
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <Link
            to="/dashboard"
            className={location.pathname === "/dashboard" ? "active" : ""}
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/expenses"
            className={location.pathname === "/expenses" ? "active" : ""}
            onClick={() => setMenuOpen(false)}
          >
            Expenses
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
