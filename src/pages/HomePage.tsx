import { useState, useEffect, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../App.css";

function HomePage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const handleSearch = () => {
    if (search.trim() !== "") {
      navigate(`/recommendations?query=${encodeURIComponent(search)}`);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    } else {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="pageWrapper">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="themeToggleButton"
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <div className="container">
        <img src={logo} className="logo" alt="Popcorn & Paperbacks Logo" />
        <div className="searchWrapper">
          <span className="searchIcon">🔍</span>
          <input
            type="text"
            placeholder="Type the vibe you're feeling..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="searchInput"
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <button className="searchButton" onClick={handleSearch}>
            Generate
          </button>
        </div>
      </div>

      <p className="read-the-docs">@ Popcorn & Paperback Enterprise</p>
    </div>
  );
}

export default HomePage;