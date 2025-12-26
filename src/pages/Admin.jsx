// src/pages/Admin.jsx
import { useState, useEffect } from "react";

const API_BASE = "http://localhost:3000/api";

const Admin = () => {
  const [posts, setPosts] = useState([]);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("學習紀錄");
  const [tagsInput, setTagsInput] = useState("");
  const [content, setContent] = useState("");

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null); // null = 新增模式

  const [section, setSection] = useState("blog");

  // 共用：抓全部文章
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
      setStatus(err.message || "載入文章清單失敗");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 重設表單
  const resetForm = () => {
    setTitle("");
    setSummary("");
    setCategory("學習紀錄");
    setTagsInput("");
    setContent("");
    setSection("blog"); // 新增
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setStatus("標題和內容為必填");
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
        // 編輯模式 → PUT /api/posts/:id
        res = await fetch(`${API_BASE}/posts/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        message = "文章已更新";
      } else {
        // 新增模式 → POST /api/posts
        res = await fetch(`${API_BASE}/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        message = "文章新增成功";
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `API 錯誤：${res.status}`);
      }

      await res.json(); // 我們實際不用內容，只要成功即可
      setStatus(message);

      // 重新載入列表
      fetchPosts();

      // 若是新增，清空表單；若是編輯，看你要不要清空
      resetForm();
    } catch (err) {
      console.error(err);
      setStatus(`操作失敗：${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 點「編輯」按鈕
  const handleEditClick = (post) => {
    setEditingId(post.id);
    setTitle(post.title || "");
    setSummary(post.summary || "");
    setCategory(post.category || "未分類");
    setTagsInput(Array.isArray(post.tags) ? post.tags.join(", ") : "");
    setContent(post.content || "");
    setSection(post.section || "blog"); // 新增
    setStatus(`正在編輯：「${post.title}」`);
  };

  // 點「刪除」按鈕
  const handleDeleteClick = async (id) => {
    const ok = window.confirm(
      "確定要刪除這篇文章嗎？刪除後無法復原（目前記憶體版）。"
    );
    if (!ok) return;

    try {
      setLoading(true);
      setStatus(null);

      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        // 204 沒 body，表示成功
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `刪除失敗：${res.status}`);
      }

      setStatus("文章已刪除");

      // 如果正在編輯這篇，被刪除時就重置表單
      if (editingId === id) {
        resetForm();
      }

      // 重新載入列表
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
    <main className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <h1 className="page-title">後台：文章管理</h1>
      <p className="page-subtitle">
        上方為新增 /
        編輯表單，下方為目前所有文章清單（記憶體版，尚未接資料庫）。
      </p>

      {/* 狀態訊息 */}
      {status && (
        <p
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            backgroundColor: "#f3f4f6",
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          {status}
        </p>
      )}

      {/* 模式提示 + 取消編輯 */}
      <div style={{ marginBottom: 8, fontSize: 14 }}>
        目前模式：{" "}
        <span style={{ fontWeight: 600 }}>
          {isEditing ? "編輯現有文章" : "新增新文章"}
        </span>
        {isEditing && (
          <button
            type="button"
            onClick={resetForm}
            style={{
              marginLeft: 12,
              padding: "4px 8px",
              fontSize: 12,
              borderRadius: 6,
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              cursor: "pointer",
            }}
          >
            取消編輯
          </button>
        )}
      </div>

      {/* 表單 */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 32,
        }}
      >
        <div>
          <label style={{ fontSize: 14, fontWeight: 600 }}>
            標題（必填）
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
                borderRadius: 6,
                border: "1px solid #d1d5db",
              }}
              placeholder="例如：用 React + Node.js 打造個人部落格"
              required
            />
          </label>
        </div>

        <div>
          <label style={{ fontSize: 14, fontWeight: 600 }}>
            摘要（summary）
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
                minHeight: 60,
                borderRadius: 6,
                border: "1px solid #d1d5db",
              }}
              placeholder="簡短描述這篇文章在講什麼..."
            />
          </label>
        </div>

        <div>
          <label style={{ fontSize: 14, fontWeight: 600 }}>
            文章類型
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
                borderRadius: 6,
                border: "1px solid #d1d5db",
              }}
            >
              <option value="blog">一般文章</option>
              <option value="work">作品 / 專案</option>
              <option value="trading">交易紀錄</option>
            </select>
          </label>
        </div>

        <div>
          <label style={{ fontSize: 14, fontWeight: 600 }}>
            分類（category）
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
                borderRadius: 6,
                border: "1px solid #d1d5db",
              }}
              placeholder="例如：學習紀錄 / 交易心得 / 生活"
            />
          </label>
        </div>

        <div>
          <label style={{ fontSize: 14, fontWeight: 600 }}>
            標籤（tags，用逗號分隔）
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
                borderRadius: 6,
                border: "1px solid #d1d5db",
              }}
              placeholder="例如：React, JavaScript, 交易"
            />
          </label>
        </div>

        <div>
          <label style={{ fontSize: 14, fontWeight: 600 }}>
            內容（content，必填）
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
                minHeight: 200,
                borderRadius: 6,
                border: "1px solid #d1d5db",
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
              placeholder={`支援 Markdown 與少量 HTML，例如：
                # 大標題（字較大）
                ## 小標題
                一般段落，可以使用 **粗體**、_斜體_、~~刪除線~~。

                插入圖片：
                ![說明文字](https://example.com/image.jpg)

                底線可用 HTML：
                <u>這段文字會有底線</u>
                `}
              required
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            backgroundColor: loading ? "#6b7280" : "#111827",
            color: "#fff",
            fontSize: 15,
            cursor: loading ? "not-allowed" : "pointer",
            alignSelf: "flex-start",
          }}
        >
          {loading ? "送出中…" : isEditing ? "儲存變更" : "新增文章"}
        </button>
      </form>

      {/* 文章清單區塊 */}
      <section>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>現有文章</h2>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
          總共 {posts.length}{" "}
          篇。點「編輯」可載入到上方表單；點「刪除」會直接移除。
        </p>

        {posts.length === 0 ? (
          <p>目前沒有任何文章。</p>
        ) : (
          <div
            style={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead style={{ backgroundColor: "#f9fafb" }}>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 8,
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    標題
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 8,
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    分類
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 8,
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    建立日期
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 8,
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #e5e7eb",
                        maxWidth: 260,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {post.title}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {post.category || "未分類"}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {post.createdAt || "-"}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleEditClick(post)}
                        style={{
                          padding: "4px 8px",
                          marginRight: 8,
                          borderRadius: 6,
                          border: "1px solid #d1d5db",
                          backgroundColor: "#ffffff",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        編輯
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(post.id)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: "1px solid #f87171",
                          backgroundColor: "#fee2e2",
                          color: "#b91c1c",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
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
