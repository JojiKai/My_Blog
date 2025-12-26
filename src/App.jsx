// src/App.jsx
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Admin from "./pages/Admin";
import PostDetail from "./pages/PostDetail";
import Works from "./pages/Works";
import TradingLog from "./pages/TradingLog";

const isDev = import.meta.env.DEV;

const AppShell = () => {
  const [theme, setTheme] = useState("dark");
  const location = useLocation();

  // 初始化主題與 JS 標記
  useEffect(() => {
    document.documentElement.classList.add("js-enabled");
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      return;
    }
    const prefersLight = window.matchMedia(
      "(prefers-color-scheme: light)"
    ).matches;
    setTheme(prefersLight ? "light" : "dark");
  }, []);

  // 套用主題 class 與儲存
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("theme-light");
    } else {
      root.classList.remove("theme-light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // reveal 動畫啟用
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const navClass = ({ isActive }) =>
    "header-link" + (isActive ? " header-link--active" : "");

  return (
    <>
      <header>
        <nav className="container header-nav">
          <NavLink to="/" className="header-nav__brand">
            <span className="header-nav__brand-mark" />
            <span>孟愷KAI - 程式開發 × 交易筆記</span>
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
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
            >
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
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;
