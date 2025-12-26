// src/pages/Works.jsx
import { useEffect, useState } from "react";

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
        setError(err.message || "發生錯誤");
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
        <p>載入中...</p>
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
    <main className="container page fade-in-up">
      <h1 className="page-title">作品</h1>
      <p className="page-subtitle">
        這裡顯示在後台被標記為「作品 / 專案」的文章。
      </p>

      {workPosts.length === 0 ? (
        <p>
          目前還沒有任何作品文章，可以到後台新增，並將文章類型設為「作品 /
          專案」。
        </p>
      ) : (
        workPosts.map((p) => (
          <article
            key={p.id}
            className="card card--clickable"
            style={{ marginBottom: 16 }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#9ca3af",
                marginBottom: 4,
              }}
            >
              {p.createdAt} ・ {p.category || "未分類"}
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>{p.title}</h2>
            <p style={{ margin: "0 0 8px", fontSize: 14 }}>
              {p.summary || "（尚未填寫摘要）"}
            </p>
            {Array.isArray(p.tags) && p.tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  fontSize: 12,
                }}
              >
                {p.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "3px 8px",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.6)",
                      backgroundColor: "rgba(248,250,252,0.9)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))
      )}
    </main>
  );
};

export default Works;
