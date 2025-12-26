// src/pages/TradingLog.jsx
import { useEffect, useState } from "react";

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
        setError(err.message || "發生錯誤");
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
      <h1 className="page-title">交易紀錄</h1>
      <p className="page-subtitle">
        這裡顯示在後台被標記為「交易紀錄」的文章，可以用來紀錄策略、實際操作與檢討。
      </p>

      {tradingPosts.length === 0 ? (
        <p>
          目前還沒有任何交易紀錄文章，可以到後台新增，並將文章類型設為「交易紀錄」。
        </p>
      ) : (
        tradingPosts.map((p) => (
          <article key={p.id} className="card" style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
                fontSize: 13,
                color: "#9ca3af",
              }}
            >
              <span>{p.createdAt}</span>
              <span>{p.category || "交易紀錄"}</span>
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>{p.title}</h2>
            <p style={{ margin: "0 0 8px", fontSize: 14 }}>
              {p.summary ||
                "（建議在摘要欄位簡短寫今天的重點與策略概念，內文再展開）"}
            </p>
          </article>
        ))
      )}
    </main>
  );
};

export default TradingLog;
