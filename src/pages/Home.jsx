// src/pages/Home.jsx
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <main className="container page fade-in-up">
      <section className="hero">
        <div className="hero-grid">
          {/* 左側：主介紹 */}
          <div className="hero-main">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>個人網站 · 程式開發 × 交易紀錄</span>
            </div>
            <h1 className="hero-title">
              把程式開發與交易經驗
              <br />
              整理成可以持續進化的作品與紀錄。
            </h1>
            <p className="hero-subtitle">
              這裡是我的個人網站，紀錄
              <strong> 前端開發 / 後端 API / 量化交易思考 </strong>
              ，同時也是一個實作中的 Blog &amp; CMS 專案。透過持續寫作與迭代，
              把每一次學習與實驗都留下痕跡。
            </p>

            <div className="hero-buttons">
              <Link to="/blog" className="btn-primary">
                前往文章
              </Link>
              <Link to="/works" className="btn-ghost">
                查看作品
              </Link>
            </div>
          </div>

          {/* 右側：簡易 summary 卡片 */}
          <div className="hero-side">
            <div className="card hero-side-card">
              {/* // 個人照片 */}
              <div className="hero-photo-card">
                <img src="/profile.jpg" alt="個人照片" />
              </div>
              <h2 className="hero-side-title">目前主要關注</h2>
              <ul className="hero-list">
                <li>• 使用 React + Node.js 實作部落格與後台管理</li>
                <li>• 以 SQLite 建立簡單但實用的資料庫層</li>
                <li>• 把交易想法轉成可以回測與記錄的結構化資料</li>
              </ul>

              <h3 className="hero-side-subtitle">技術關鍵字</h3>
              <div className="hero-tags">
                <span className="hero-tag">React</span>
                <span className="hero-tag">Node.js</span>
                <span className="hero-tag">Express</span>
                <span className="hero-tag">SQLite</span>
                <span className="hero-tag">Markdown</span>
                <span className="hero-tag">Trading</span>
              </div>

              <p className="hero-footnote">
                想了解實際的實作與思路，可以從
                <Link to="/blog" className="hero-link-inline">
                  文章
                </Link>
                或
                <Link to="/trading" className="hero-link-inline">
                  交易紀錄
                </Link>
                開始看起。
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
