// src/pages/Admin.jsx
import { useState, useEffect } from "react";

const API_BASE = "http://localhost:3000/api";

const Admin = () => {
  const [posts, setPosts] = useState([]);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("學習筆記");
  const [tagsInput, setTagsInput] = useState("");
  const [content, setContent] = useState("");
  const [section, setSection] = useState("blog");

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/posts`);
      if (!res.ok) {
        throw new Error("載入文章失敗：" + res.status);
      }
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
      setStatus(err.message || "載入文章失敗");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setCategory("學習筆記");
    setTagsInput("");
    setContent("");
    setSection("blog");
    setEditingId(null);
  };

  const appendImageTemplate = () => {
    setContent((prev) => `${prev}\n![圖片描述](/your-image.jpg)\n`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setStatus("標題與內容為必填");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      setLoading(true);
      setStatus(null);

      const payload = {
        title,
        summary,
        content,
        category,
        tags,
        section,
      };

      let res;
      let message;

      if (editingId) {
        res = await fetch(`${API_BASE}/posts/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        message = "文章已更新";
      } else {
        res = await fetch(`${API_BASE}/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        message = "文章已新增";
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `API 錯誤：${res.status}`);
      }

      await res.json();
      setStatus(message);
      fetchPosts();
      resetForm();
    } catch (err) {
      console.error(err);
      setStatus(`操作失敗：${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (post) => {
    setEditingId(post.id);
    setTitle(post.title || "");
    setSummary(post.summary || "");
    setCategory(post.category || "未分類");
    setTagsInput(Array.isArray(post.tags) ? post.tags.join(", ") : "");
    setContent(post.content || "");
    setSection(post.section || "blog");
    setStatus(`正在編輯：${post.title}`);
  };

  const handleDeleteClick = async (id) => {
    const ok = window.confirm("確定要刪除這篇文章嗎？刪除後無法復原。");
    if (!ok) return;

    try {
      setLoading(true);
      setStatus(null);

      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `刪除失敗：${res.status}`);
      }

      setStatus("文章已刪除");
      if (editingId === id) {
        resetForm();
      }
      fetchPosts();
    } catch (err) {
      console.error(err);
      setStatus(`刪除失敗：${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(editingId);

  return (
    <main className="container page admin-page">
      <h1 className="page-title">後台：文章管理</h1>
      <p className="page-subtitle">
        建立 / 編輯文章，並指定分類（部落格 / 作品 / 交易筆記）。
      </p>

      {status && <p className="notice">{status}</p>}

      <div className="admin-form__mode">
        當前模式：<strong>{isEditing ? "編輯既有文章" : "新增文章"}</strong>
        {isEditing && (
          <button type="button" onClick={resetForm} className="btn-ghost small">
            取消編輯
          </button>
        )}
      </div>

      <form className="admin-form card" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">
            標題（必填）
            <small>清楚描述文章主軸</small>
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：用 React + Node.js 做一個個人部落格"
            required
          />
        </label>

        <label className="field">
          <span className="field__label">
            摘要（summary）
            <small>列表預覽文字</small>
          </span>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="簡短描述這篇文章的內容或收穫…"
            style={{ minHeight: 90 }}
          />
        </label>

        <div className="field-grid">
          <label className="field">
            <span className="field__label">文章歸類</span>
            <select value={section} onChange={(e) => setSection(e.target.value)}>
              <option value="blog">部落格</option>
              <option value="work">作品 / 專案</option>
              <option value="trading">交易筆記</option>
            </select>
          </label>

          <label className="field">
            <span className="field__label">分類（category）</span>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="例：學習紀錄 / 交易心法 / 生活"
            />
          </label>
        </div>

        <label className="field">
          <span className="field__label">標籤（tags，以逗號分隔）</span>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="例：React, JavaScript, 交易"
          />
        </label>

        <label className="field">
          <span className="field__label">
            內容（content，必填）
            <small>支援 Markdown 與少量 HTML</small>
          </span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`可撰寫 Markdown 或內嵌 HTML，例如：
# 大標題
## 小標題
段落文字，支援 **粗體**、_斜體_、~~刪除線~~。

插入圖片：
![描述文字](https://example.com/image.jpg)

輸入程式碼：
\`\`\`js
console.log("hello");
\`\`\`
`}
            required
            style={{ minHeight: 320 }}
          />
          <div className="admin-actions" style={{ marginTop: 6 }}>
            <button type="button" className="btn-ghost small" onClick={appendImageTemplate}>
              插入圖片模板（public 路徑）
            </button>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              例：/profile.jpg 或 /images/xxx.png
            </span>
          </div>
        </label>

        <div className="admin-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "處理中…" : isEditing ? "儲存更新" : "新增文章"}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} className="btn-ghost">
              取消編輯
            </button>
          )}
        </div>
      </form>

      <section>
        <h2 className="section-title">文章清單</h2>
        <p className="section-subtitle">
          總計 {posts.length} 篇。可點「編輯」載入表單，或直接刪除。
        </p>

        {posts.length === 0 ? (
          <p>尚無文章。</p>
        ) : (
          <div className="card admin-table">
            <table>
              <thead>
                <tr>
                  <th>標題</th>
                  <th>分類</th>
                  <th>建立時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td title={post.title}>{post.title}</td>
                    <td>{post.category || "未分類"}</td>
                    <td>{post.createdAt || "-"}</td>
                    <td className="admin-table__actions">
                      <button
                        type="button"
                        onClick={() => handleEditClick(post)}
                        className="btn-ghost small"
                      >
                        編輯
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(post.id)}
                        className="btn-danger small"
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default Admin;
