const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"]
}));
app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* ── ROBLOX PROXY ENDPOINTS ── */

// Resolve username → userId
app.post("/api/roblox/userid", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "username required" });

    const r = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error("Roblox /userId error:", r.status, txt);
      return res.status(502).json({ error: "Roblox API error", status: r.status });
    }

    res.json(await r.json());
  } catch (e) {
    console.error("/userId proxy error:", e.message);
    res.status(500).json({ error: "Proxy /userId failed", detail: e.message });
  }
});

// Get user presence
app.post("/api/roblox/presence", async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!userIds?.length) return res.status(400).json({ error: "userIds required" });

    const r = await fetch("https://presence.roblox.com/v1/presence/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds })
    });

    if (!r.ok) {
      console.error("Roblox /presence error:", r.status);
      return res.status(502).json({ error: "Roblox presence API error", status: r.status });
    }

    res.json(await r.json());
  } catch (e) {
    console.error("/presence proxy error:", e.message);
    res.status(500).json({ error: "Proxy /presence failed", detail: e.message });
  }
});

// Get user profile info
app.get("/api/roblox/user/:id", async (req, res) => {
  try {
    const r = await fetch(`https://users.roblox.com/v1/users/${req.params.id}`);
    if (!r.ok) return res.status(502).json({ error: "Roblox user API error", status: r.status });
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: "Proxy /user failed", detail: e.message });
  }
});

// Avatar (headshot)
app.get("/api/roblox/avatar/:id", async (req, res) => {
  try {
    const r = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${req.params.id}&size=150x150&format=Png&isCircular=false`
    );
    if (!r.ok) return res.status(502).json({ error: "thumbnail error" });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "avatar proxy failed" });
  }
});

// Friends count
app.get("/api/roblox/friends/:id", async (req, res) => {
  try {
    const r = await fetch(`https://friends.roblox.com/v1/users/${req.params.id}/friends/count`);
    if (!r.ok) return res.status(502).json({ error: "Roblox friends API error" });
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: "Proxy /friends failed" });
  }
});

// Followers count
app.get("/api/roblox/followers/:id", async (req, res) => {
  try {
    const r = await fetch(`https://friends.roblox.com/v1/users/${req.params.id}/followers/count`);
    if (!r.ok) return res.status(502).json({ error: "Roblox followers API error" });
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: "Proxy /followers failed" });
  }
});

// Following count
app.get("/api/roblox/following/:id", async (req, res) => {
  try {
    const r = await fetch(`https://friends.roblox.com/v1/users/${req.params.id}/followings/count`);
    if (!r.ok) return res.status(502).json({ error: "Roblox following API error" });
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: "Proxy /following failed" });
  }
});

app.listen(PORT, () => {
  console.log(`\n✨ Server running at http://localhost:${PORT}`);
  console.log(`\n📝 Make sure your HTML file is named "index.html" in this folder`);
  console.log(`🌐 Open: http://localhost:${PORT}\n`);
});