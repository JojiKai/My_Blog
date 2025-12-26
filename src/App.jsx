// src/App.jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Admin from "./pages/Admin";
import PostDetail from "./pages/PostDetail";
import Works from "./pages/Works";
import TradingLog from "./pages/TradingLog";

const isDev = import.meta.env.DEV;

const App = () => {
  return (
    <BrowserRouter>
      <header>
        <nav className="container header-nav">
          <Link to="/" className="header-nav__brand">
            <span className="header-nav__brand-mark" />
            <span>我的部落格</span>
          </Link>
          <div className="header-nav__links">
            <Link to="/">首頁</Link>
            <Link to="/blog">文章</Link>
            <Link to="/works">作品</Link>
            <Link to="/trading">交易紀錄</Link>
            {isDev && <Link to="/admin">管理</Link>}
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
