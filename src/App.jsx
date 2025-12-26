// src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Admin from "./pages/Admin";
import PostDetail from "./pages/PostDetail";
import Works from "./pages/Works";
import TradingLog from "./pages/TradingLog";

const isDev = import.meta.env.DEV;

const App = () => {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      return;
    }
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)")
      .matches;
    setTheme(prefersLight ? "light" : "dark");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("theme-light");
    } else {
      root.classList.remove("theme-light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const navClass = ({ isActive }) =>
    "header-link" + (isActive ? " header-link--active" : "");

  return (
    <BrowserRouter>
      <header>
        <nav className="container header-nav">
          <NavLink to="/" className="header-nav__brand">
            <span className="header-nav__brand-mark" />
            <span>個人網誌 · 程式開發 × 交易筆記</span>
          </NavLink>
          <div className="header-nav__links">
            <NavLink to="/" end className={navClass}>
              首頁
            </NavLink>
            <NavLink to="/blog" className={navClass}>
              部落格
            </NavLink>
            <NavLink to="/works" className={navClass}>
              作品集
            </NavLink>
            <NavLink to="/trading" className={navClass}>
              交易筆記
            </NavLink>
            {isDev && (
              <NavLink to="/admin" className={navClass}>
                後台
              </NavLink>
            )}
            <button type="button" className="theme-toggle" onClick={toggleTheme}>
              {theme === "light" ? "夜間模式" : "日間模式"}
              <span className="theme-toggle__dot" aria-hidden />
            </button>
          </div>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<PostDetail />} />
        <Route path="/works" element={<Works />} />
        <Route path="/trading" element={<TradingLog />} />
        {isDev && <Route path="/admin" element={<Admin />} />}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
