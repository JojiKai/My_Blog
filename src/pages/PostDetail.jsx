// src/pages/PostDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <main className="container page fade-in-up">
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

      <article className="post-body markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {post.content || ""}
        </ReactMarkdown>
      </article>

      <div style={{ marginTop: 24 }}>
        <Link to="/blog" className="link-back">
          返回文章列表
        </Link>
      </div>
    </main>
  );
};

export default PostDetail;
