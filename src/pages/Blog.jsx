// src/pages/Blog.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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
        setError(err.message || "載入失敗");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 只取 section === "blog" 的文章
  const blogPosts = posts.filter((p) => (p.section || "blog") === "blog");

  const categories = [
    "全部",
    ...Array.from(new Set(blogPosts.map((p) => p.category || "未分類"))),
  ];

  const tagsFromPosts = blogPosts.flatMap((p) =>
    Array.isArray(p.tags) ? p.tags : []
  );
  const tags = ["全部", ...Array.from(new Set(tagsFromPosts))];

  const filteredPosts = blogPosts.filter((post) => {
    const category = post.category || "未分類";
    const postTags = Array.isArray(post.tags) ? post.tags : [];

    const categoryMatch =
      activeCategory === "全部" ? true : category === activeCategory;
    const tagMatch = activeTag === "全部" ? true : postTags.includes(activeTag);

    return categoryMatch && tagMatch;
  });

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
      <h1 className="page-title">部落格文章</h1>
      <p className="page-subtitle">
        這裡會顯示後台標記為「部落格」的文章，支援類別與標籤篩選。
      </p>

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
        <p>沒有符合條件的文章。</p>
      ) : (
        <section className="post-grid">
          {filteredPosts.map((post) => (
            <article key={post.id} className="card post-card reveal">
              <div className="post-card__meta">
                <span>{post.createdAt}</span>
                <span>· {post.category || "未分類"}</span>
              </div>
              <h2 className="post-card__title">
                <Link to={`/blog/${post.id}`}>{post.title}</Link>
              </h2>
              <div className="post-card__excerpt markdown-excerpt">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {post.summary || post.content || ""}
                </ReactMarkdown>
              </div>

              {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="post-card__tags">
                  {post.tags.map((tag) => (
                    <span key={tag} className="pill">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <Link to={`/blog/${post.id}`} className="btn-outline">
                閱讀全文
              </Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default Blog;
