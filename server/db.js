// server/db.js
const Database = require("better-sqlite3");
const path = require("path");

// DB 檔案放在 server 目錄下
const dbPath = path.join(__dirname, "blog.db");
const db = new Database(dbPath);

// 初始化資料表（加入 section 欄位）
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT,
    section TEXT NOT NULL DEFAULT 'blog',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// 如果是舊的 DB 沒有 section 欄位，補上一個
const columns = db.prepare(`PRAGMA table_info(posts)`).all();
const hasSection = columns.some((c) => c.name === "section");
if (!hasSection) {
  db.exec(`ALTER TABLE posts ADD COLUMN section TEXT NOT NULL DEFAULT 'blog';`);
}

// 小工具：把 DB 的 row 轉成前端用的物件格式
function rowToPost(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    summary: row.summary || "",
    content: row.content,
    category: row.category || "未分類",
    tags: row.tags ? JSON.parse(row.tags) : [],
    section: row.section || "blog",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// 取得全部文章（按日期新→舊）
function getAllPosts() {
  const rows = db
    .prepare("SELECT * FROM posts ORDER BY created_at DESC, id DESC")
    .all();
  return rows.map(rowToPost);
}

// 取得單一文章
function getPostById(id) {
  const row = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
  return rowToPost(row);
}

// 新增文章
function createPost({ title, summary, content, category, tags, section }) {
  const id = Date.now().toString();
  const now = new Date().toISOString().slice(0, 10);
  const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
  const sectionValue = section || "blog";

  const stmt = db.prepare(`
    INSERT INTO posts (id, title, summary, content, category, tags, section, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    title,
    summary || "",
    content,
    category || "未分類",
    tagsJson,
    sectionValue,
    now,
    now
  );

  return getPostById(id);
}

// 更新文章
function updatePost(id, { title, summary, content, category, tags, section }) {
  const existing = getPostById(id);
  if (!existing) return null;

  const now = new Date().toISOString().slice(0, 10);

  const newTitle = title ?? existing.title;
  const newSummary = summary ?? existing.summary;
  const newContent = content ?? existing.content;
  const newCategory = category ?? existing.category;
  const newTags = Array.isArray(tags) ? tags : existing.tags;
  const newSection = section || existing.section || "blog";

  const tagsJson = JSON.stringify(newTags);

  const stmt = db.prepare(`
    UPDATE posts
    SET title = ?, summary = ?, content = ?, category = ?, tags = ?, section = ?, updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    newTitle,
    newSummary,
    newContent,
    newCategory,
    tagsJson,
    newSection,
    now,
    id
  );

  return getPostById(id);
}

// 刪除文章
function deletePost(id) {
  const stmt = db.prepare("DELETE FROM posts WHERE id = ?");
  const info = stmt.run(id);
  return info.changes > 0; // 有刪掉至少一列就回傳 true
}

// 若資料表是空的，幫你塞幾篇預設文章
function seedIfEmpty() {
  const row = db.prepare("SELECT COUNT(*) AS count FROM posts").get();
  if (row.count > 0) return;

  const now = new Date().toISOString().slice(0, 10);

  const samplePosts = [
    {
      id: "1",
      title: "我的第一篇文章（來自 SQLite）",
      summary: "這篇是預設種子文章，用來測試資料庫是否正常。",
      content:
        "# 歡迎使用 SQLite 儲存文章\n\n這篇文章來自資料庫，而不是記憶體陣列。",
      category: "學習紀錄",
      tags: ["React", "Node.js"],
      section: "blog",
      created_at: now,
      updated_at: now,
    },
    {
      id: "2",
      title: "交易與程式開發",
      summary: "把交易邏輯轉成程式與量化策略的起點。",
      content: "這裡可以寫你如何從專職交易走向程式交易與開發的故事。",
      category: "交易心得",
      tags: ["交易", "程式交易"],
      section: "trading",
      created_at: now,
      updated_at: now,
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO posts (id, title, summary, content, category, tags, created_at, updated_at)
    VALUES (@id, @title, @summary, @content, @category, @tags, @created_at, @updated_at)
  `);

  const insertMany = db.transaction((rows) => {
    for (const p of rows) {
      stmt.run({
        ...p,
        tags: JSON.stringify(p.tags || []),
      });
    }
  });

  insertMany(samplePosts);
}

// 啟動時檢查是否要塞預設資料
seedIfEmpty();

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
