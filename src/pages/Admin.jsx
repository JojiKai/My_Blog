// src/pages/Admin.jsx
import { useState, useEffect, useMemo } from "react";

const API_BASE = "http://localhost:3000/api";
const PAGE_SIZE = 10;

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

  // 篩選/搜尋/排序 state (分為 UI 輸入與已套用條件)
  const [searchInput, setSearchInput] = useState("");
  const [sortInput, setSortInput] = useState("desc");
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

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

  // 已套用條件變動時回到第一頁
  useEffect(() => {
    setPage(1);
  }, [searchTerm, sortOrder, startDate, endDate, posts.length]);

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

  const appendSummaryImageTemplate = () => {
    setSummary((prev) => `${prev}\n![圖片描述](/your-image.jpg)`);
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

  const parseDate = (value) => {
    const t = Date.parse(value);
    return Number.isNaN(t) ? 0 : t;
  };

  const filteredPosts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const startTs = startDate ? Date.parse(startDate) : null;
    const endTs = endDate ? Date.parse(endDate) + 24 * 60 * 60 * 1000 : null;

    return posts
      .filter((p) => {
        const hay = `${p.title || ""} ${p.summary || ""}`.toLowerCase();
        const matchSearch = term ? hay.includes(term) : true;

        const ts = parseDate(p.createdAt || "");
        const matchStart = startTs ? ts >= startTs : true;
        const matchEnd = endTs ? ts < endTs : true;

        return matchSearch && matchStart && matchEnd;
      })
      .sort((a, b) => {
        const ta = parseDate(a.createdAt || "");
        const tb = parseDate(b.createdAt || "");
        return sortOrder === "desc" ? tb - ta : ta - tb;
      });
  }, [posts, searchTerm, startDate, endDate, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filteredPosts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const grouped = useMemo(() => {
    const map = new Map();
    paginated.forEach((post) => {
      const ts = parseDate(post.createdAt || "");
      const d = ts ? new Date(ts) : null;
      const key = d
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        : "未分類時間";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(post);
    });
    return map;
  }, [paginated]);

  const handleApplyFilters = () => {
    setSearchTerm(searchInput);
    setSortOrder(sortInput);
    setStartDate(startInput);
    setEndDate(endInput);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSortInput("desc");
    setStartInput("");
    setEndInput("");
    setSearchTerm("");
    setSortOrder("desc");
    setStartDate("");
    setEndDate("");
    setPage(1);
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
          <div className="admin-actions" style={{ marginTop: 6 }}>
            <button
              type="button"
              className="btn-ghost small"
              onClick={appendSummaryImageTemplate}
            >
              插入圖片模板（摘要）
            </button>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              例：/profile.jpg 或 /images/xxx.png
            </span>
          </div>
        </label>

        <div className="field-grid">
          <label className="field">
            <span className="field__label">文章歸類</span>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
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
# 大標題  ## 小標題
段落文字，支援 **粗體**、_斜體_、~~刪除線~~。
插入圖片：![描述文字](https://example.com/image.jpg)
輸入程式碼：
\`\`\`js
console.log("hello");
\`\`\`
`}
            required
            style={{ minHeight: 320 }}
            className="content-textarea"
          />
          <div className="admin-actions" style={{ marginTop: 6 }}>
            <button
              type="button"
              className="btn-ghost small"
              onClick={appendImageTemplate}
            >
              插入圖片模板（public 路徑）
            </button>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              例：/profile.jpg 或 /images/xxx.png
            </span>
          </div>
        </label>

        <div className="admin-actions admin-actions--center">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-primary--submit"
          >
            {loading ? "處理中…" : isEditing ? "儲存更新" : "新增文章"}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} className="btn-ghost">
              取消編輯
            </button>
          )}
        </div>
      </form>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="admin-filters">
          <div className="admin-filters__row">
            <label className="filter-field">
              <span>搜尋（標題/摘要）</span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="輸入關鍵字"
              />
            </label>
            <label className="filter-field">
              <span>排序</span>
              <select
                value={sortInput}
                onChange={(e) => setSortInput(e.target.value)}
              >
                <option value="desc">最新在前</option>
                <option value="asc">最舊在前</option>
              </select>
            </label>
          </div>

          <div className="admin-filters__row">
            <label className="filter-field">
              <span>起始日期</span>
              <input
                type="date"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
              />
            </label>
            <label className="filter-field">
              <span>結束日期</span>
              <input
                type="date"
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
              />
            </label>
          </div>

          <div className="admin-actions" style={{ marginTop: 2 }}>
            <button
              type="button"
              className="btn-primary btn-primary--apply"
              onClick={handleApplyFilters}
            >
              套用篩選
            </button>
            <button
              type="button"
              className="btn-ghost btn-ghost--clear"
              onClick={handleClearFilters}
            >
              清除條件
            </button>
          </div>
        </div>

        <h2 className="section-title" style={{ marginTop: 4 }}>
          文章清單
        </h2>
        <p className="section-subtitle">
          總計 {filteredPosts.length} 篇。頁面顯示 {paginated.length} 篇。
        </p>

        {filteredPosts.length === 0 ? (
          <p>沒有符合條件的文章。</p>
        ) : (
          <>
            {[...grouped.entries()].map(([ym, list]) => (
              <div key={ym} style={{ marginBottom: 16 }}>
                <div className="section-title" style={{ margin: "8px 0" }}>
                  {ym}
                </div>
                <div className="card admin-table" style={{ marginTop: 8 }}>
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
                      {list.map((post) => (
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
              </div>
            ))}

            <div className="pagination">
              <button
                type="button"
                className="btn-ghost small"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                上一頁
              </button>
              <span className="pagination__info">
                第 {currentPage} / {totalPages} 頁
              </span>
              <button
                type="button"
                className="btn-ghost small"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                下一頁
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default Admin;
