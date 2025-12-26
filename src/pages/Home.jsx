// src/pages/Home.jsx
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <main className="container page fade-in-up reveal">
      <section className="hero">
        <div className="hero-bg-glow" aria-hidden />
        <div className="hero-grid">
          <div className="hero-main reveal">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>KAI · 程式開發 × 交易筆記</span>
            </div>
            <h1 className="hero-title">
              把開發經驗與交易心得
              <br />
              寫成可複用的知識
            </h1>
            <p className="hero-subtitle">
              這裡紀錄我在 <strong>前端/後端開發</strong> 以及{" "}
              <strong>交易策略</strong> 的實作與思考。透過 Blog、作品集與
              Trading Log，留下能被重複檢視與改進的路徑。
            </p>

            <div className="hero-buttons">
              <Link to="/blog" className="btn-primary">
                閱讀最新文章
              </Link>
              <Link to="/works" className="btn-ghost">
                查看作品集
              </Link>
            </div>
          </div>

          <div className="hero-side reveal">
            <div className="card hero-side-card">
              <div className="hero-photo-card">
                <img src="/profile.jpg" alt="個人照片" />
              </div>
              <h2 className="hero-side-title">目前關注</h2>
              <ul className="hero-list">
                <li>以 React + Node.js 打造輕量 Blog/CMS 全端</li>
                <li>用 SQLite/Express 建立可搬遷的小型資料層</li>
                <li>把交易想法寫成紀錄，幫助檢討並跟進績效</li>
              </ul>

              <h3 className="hero-side-subtitle">技術標籤</h3>
              <div className="hero-tags">
                <span className="hero-tag">React</span>
                <span className="hero-tag">Node.js</span>
                <span className="hero-tag">Express</span>
                <span className="hero-tag">SQLite</span>
                <span className="hero-tag">Markdown</span>
                <span className="hero-tag">Trading</span>
              </div>

              <p className="hero-footnote">
                想看更多想法，歡迎前往
                <Link to="/blog" className="hero-link-inline">
                  部落格
                </Link>
                或
                <Link to="/trading" className="hero-link-inline">
                  交易筆記
                </Link>
                交流。
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
