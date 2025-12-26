// src/pages/Blog.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("全部");
  const [activeTag, setActiveTag] = useState("全部");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:3000/api/posts");
        if (!res.ok) {
          throw new Error("API 錯誤：" + res.status);
        }

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

  // 只取「一般文章」區塊的文章（section === 'blog'）
  const blogPosts = posts.filter((p) => (p.section || "blog") === "blog");

  // 文章頁的分類只看 blogPosts，不看其他 section
  const categories = [
    "全部",
    ...Array.from(new Set(blogPosts.map((p) => p.category || "未分類"))),
  ];

  // 文章頁的標籤只看 blogPosts，不看其他 section
  const tagsFromPosts = blogPosts.flatMap((p) =>
    Array.isArray(p.tags) ? p.tags : []
  );
  const tags = ["全部", ...Array.from(new Set(tagsFromPosts))];

  // 在「已經限定 blogPosts」的前提下再做分類 / 標籤過濾
  const filteredPosts = blogPosts.filter((post) => {
    const category = post.category || "未分類";
    const postTags = Array.isArray(post.tags) ? post.tags : [];

    const categoryMatch =
      activeCategory === "全部" ? true : category === activeCategory;

    const tagMatch = activeTag === "全部" ? true : postTags.includes(activeTag);

    return categoryMatch && tagMatch;
  });

  // 卡片簡略內容：優先用 summary，沒有就用 content 前幾十個字
  const getPreviewText = (post) => {
    const text =
      (post.summary && post.summary.trim()) ||
      (post.content && post.content.trim()) ||
      "";

    const maxLength = 80;

    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "…";
  };

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
      <h1 className="page-title">部落格文章</h1>
      <p className="page-subtitle">
        這裡只顯示在後台被標記為「一般文章」的內容；分類與標籤也僅統計這些文章。
      </p>

      {/* 分類篩選列 */}
      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, marginBottom: 8, color: "#9ca3af" }}>
          分類
        </h2>
        <div className="chip-row">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={
                "chip" + (activeCategory === cat ? " chip--active" : "")
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 標籤篩選列 */}
      {tags.length > 1 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, marginBottom: 8, color: "#9ca3af" }}>
            標籤
          </h2>
          <div className="chip-row">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={"chip" + (activeTag === tag ? " chip--active" : "")}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 文章卡片（簡略） */}
      {filteredPosts.length === 0 ? (
        <p>目前符合條件的文章為空。</p>
      ) : (
        filteredPosts.map((post) => (
          <article
            key={post.id}
            className="card card--clickable"
            style={{ marginBottom: 16 }}
          >
            <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>
              <Link to={`/blog/${post.id}`}>{post.title}</Link>
            </h2>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "#9ca3af" }}>
              {post.createdAt} ・ {post.category || "未分類"}
              {Array.isArray(post.tags) && post.tags.length > 0
                ? " ・ " + post.tags.join(" / ")
                : ""}
            </p>
            <p style={{ margin: "0 0 12px", fontSize: 14 }}>
              {getPreviewText(post)}
            </p>

            <Link to={`/blog/${post.id}`} className="btn-outline">
              完整閱讀 →
            </Link>
          </article>
        ))
      )}
    </main>
  );
};

export default Blog;
