// server/index.js
const express = require("express");
const cors = require("cors");
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// 取得全部文章
app.get("/api/posts", (req, res) => {
  try {
    const posts = getAllPosts();
    res.json(posts);
  } catch (err) {
    console.error("GET /api/posts error:", err);
    res.status(500).json({ message: "取得文章列表失敗" });
  }
});

// 取得單一文章
app.get("/api/posts/:id", (req, res) => {
  try {
    const post = getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error("GET /api/posts/:id error:", err);
    res.status(500).json({ message: "取得文章失敗" });
  }
});

// 新增文章
app.post("/api/posts", (req, res) => {
  try {
    const { title, summary, content, category, tags, section } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "title 和 content 為必填" });
    }

    const newPost = createPost({
      title,
      summary,
      content,
      category,
      tags,
      section,
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error("POST /api/posts error:", err);
    res.status(500).json({ message: "新增文章失敗" });
  }
});

// 更新文章
app.put("/api/posts/:id", (req, res) => {
  try {
    const { title, summary, content, category, tags, section } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "title 和 content 為必填" });
    }

    const updated = updatePost(req.params.id, {
      title,
      summary,
      content,
      category,
      tags,
      section,
    });

    if (!updated) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("PUT /api/posts/:id error:", err);
    res.status(500).json({ message: "更新文章失敗" });
  }
});

// 刪除文章
app.delete("/api/posts/:id", (req, res) => {
  try {
    const ok = deletePost(req.params.id);
    if (!ok) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /api/posts/:id error:", err);
    res.status(500).json({ message: "刪除文章失敗" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
