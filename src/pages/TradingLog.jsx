// src/pages/TradingLog.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const TradingLog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:3000/api/posts");
        if (!res.ok) throw new Error("API 錯誤：" + res.status);
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "載入失敗");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const tradingPosts = posts.filter((p) => (p.section || "blog") === "trading");

  if (loading) {
    return (
      <main className="container page">
        <p>載入中…</p>
      </main>
    );
  }
  if (error) {
    return (
      <main className="container page">
        <p>載入失敗：{error}</p>
      </main>
    );
  }

  return (
    <main className="container page fade-in-up reveal">
      <h1 className="page-title">交易筆記</h1>
      <p className="page-subtitle">
        顯示後台標為「交易筆記」的文章，用來檢討策略、紀錄情緒與績效。
      </p>

      {tradingPosts.length === 0 ? (
        <p>目前沒有交易筆記，請在後台新增並設定分類為「交易筆記」。</p>
      ) : (
        <section className="post-grid">
          {tradingPosts.map((p) => (
            <article key={p.id} className="card post-card reveal">
              <div className="post-card__meta">
                <span>{p.createdAt}</span>
                <span>· {p.category || "交易筆記"}</span>
              </div>
              <h2 className="post-card__title">{p.title}</h2>
              <p className="post-card__excerpt">
                {p.summary || "（建議在摘要區描述當日策略、情緒或關鍵調整。）"}
              </p>
              <Link to={`/blog/${p.id}`} className="btn-outline">
                閱讀全文
              </Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default TradingLog;
