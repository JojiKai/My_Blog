// src/pages/PostDetail.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const articleRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`http://localhost:3000/api/posts/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("找不到這篇文章");
          }
          throw new Error("API 錯誤：" + res.status);
        }

        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "載入失敗");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const headings = useMemo(() => {
    if (!post?.content) return [];
    const results = [];
    const regex = /^#{1,3}\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(post.content)) !== null) {
      const raw = match[1].trim();
      const id = raw
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5- ]+/g, "")
        .replace(/\s+/g, "-");
      results.push({ id, text: raw });
    }
    return results;
  }, [post?.content]);

  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight;
      const current = Math.min(Math.max(window.scrollY - el.offsetTop, 0), total);
      const pct = total > 0 ? (current / total) * 100 : 0;
      setProgress(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const components = {
    h1: ({ node, ...props }) => {
      const text = String(props.children);
      const id =
        text
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fa5- ]+/g, "")
          .replace(/\s+/g, "-") || undefined;
      return (
        <h1 id={id} {...props}>
          {props.children}
        </h1>
      );
    },
    h2: ({ node, ...props }) => {
      const text = String(props.children);
      const id =
        text
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fa5- ]+/g, "")
          .replace(/\s+/g, "-") || undefined;
      return (
        <h2 id={id} {...props}>
          {props.children}
        </h2>
      );
    },
    h3: ({ node, ...props }) => {
      const text = String(props.children);
      const id =
        text
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fa5- ]+/g, "")
          .replace(/\s+/g, "-") || undefined;
      return (
        <h3 id={id} {...props}>
          {props.children}
        </h3>
      );
    },
    p: ({ node, ...props }) => (
      <p style={{ whiteSpace: "pre-line" }} {...props}>
        {props.children}
      </p>
    ),
  };

  const handleTocClick = (evt, id) => {
    evt.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
        <p style={{ marginBottom: 16 }}>載入失敗：{error}</p>
        <Link to="/blog" className="link-back">
          返回文章列表
        </Link>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="container page">
        <p>找不到這篇文章。</p>
        <Link to="/blog" className="link-back">
          返回文章列表
        </Link>
      </main>
    );
  }

  return (
    <main className="container page fade-in-up reveal">
      <div className="reading-progress">
        <div className="reading-progress__bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="post-detail-meta">
        <span>{post.createdAt}</span>
        <span>· {post.category || "未分類"}</span>
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <span className="post-detail-tags">
            · {post.tags.join(" / ")}
          </span>
        )}
      </div>
      <h1 className="page-title page-title--detail">{post.title}</h1>

      <div className="detail-layout">
        {headings.length > 0 && (
          <aside className="card toc-card reveal">
            <h3 className="toc-title">目錄</h3>
            <ul className="toc-list">
              {headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} onClick={(e) => handleTocClick(e, h.id)}>
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <article ref={articleRef} className="post-body markdown-body card reveal">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={components}
          >
            {post.content || ""}
          </ReactMarkdown>
        </article>
      </div>

      <div style={{ marginTop: 24 }}>
        <Link to="/blog" className="link-back">
          返回文章列表
        </Link>
      </div>
    </main>
  );
};

export default PostDetail;
