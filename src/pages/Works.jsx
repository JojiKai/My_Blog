// src/pages/Works.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Works = () => {
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

  const workPosts = posts.filter((p) => (p.section || "blog") === "work");

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
      <h1 className="page-title">作品集</h1>
      <p className="page-subtitle">
        顯示後台標為「作品 / 專案」的文章，可附摘要、標籤與日期。
      </p>

      {workPosts.length === 0 ? (
        <p>目前沒有作品文章，請在後台新增並設定分類為「作品 / 專案」。</p>
      ) : (
        <section className="post-grid">
          {workPosts.map((p) => (
            <article key={p.id} className="card post-card reveal">
              <div className="post-card__meta">
                <span>{p.createdAt}</span>
                <span>· {p.category || "未分類"}</span>
              </div>
              <h2 className="post-card__title">{p.title}</h2>
              <p className="post-card__excerpt">
                {p.summary || "（建議填寫摘要以利閱讀）"}
              </p>
              {Array.isArray(p.tags) && p.tags.length > 0 && (
                <div className="post-card__tags">
                  {p.tags.map((t) => (
                    <span key={t} className="pill">
                      {t}
                    </span>
                  ))}
                </div>
              )}
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

export default Works;
