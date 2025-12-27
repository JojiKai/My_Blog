// src/pages/Works.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const Works = () => {
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

  const categories = [
    "全部",
    ...Array.from(new Set(workPosts.map((p) => p.category || "未分類"))),
  ];

  const tagsFromPosts = workPosts.flatMap((p) =>
    Array.isArray(p.tags) ? p.tags : []
  );
  const tags = ["全部", ...Array.from(new Set(tagsFromPosts))];

  const filteredPosts = workPosts.filter((post) => {
    const category = post.category || "未分類";
    const postTags = Array.isArray(post.tags) ? post.tags : [];

    const categoryMatch =
      activeCategory === "全部" ? true : category === activeCategory;
    const tagMatch = activeTag === "全部" ? true : postTags.includes(activeTag);

    return categoryMatch && tagMatch;
  });

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

      {categories.length > 1 && (
        <section className="filter-section">
          <h2 className="filter-label">分類</h2>
          <div className="chip-row">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={"chip" + (activeCategory === cat ? " chip--active" : "")}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      )}

      {tags.length > 1 && (
        <section className="filter-section">
          <h2 className="filter-label">標籤</h2>
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

      {filteredPosts.length === 0 ? (
        <p>目前沒有作品文章，請在後台新增並設定分類為「作品 / 專案」。</p>
      ) : (
        <section className="post-grid">
          {filteredPosts.map((p) => (
            <article key={p.id} className="card post-card reveal">
              <div className="post-card__meta">
                <span>{p.createdAt}</span>
                <span>· {p.category || "未分類"}</span>
              </div>
              <h2 className="post-card__title">{p.title}</h2>
              <div className="post-card__excerpt markdown-excerpt">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {p.summary || "（建議填寫摘要以利閱讀）"}
                </ReactMarkdown>
              </div>
              {Array.isArray(p.tags) && p.tags.length > 0 && (
                <div className="post-card__tags">
                  {p.tags.map((t) => (
                    <span key={t} className="pill">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <Link to={`/works/${p.id}`} className="btn-outline">
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
