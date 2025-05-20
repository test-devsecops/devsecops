const express = require('express');
const app = express();
const port = 3000;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

app.use(express.urlencoded({ extended: true }));

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Simulated SSRF vulnerability
app.get('/fetch', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send("Missing 'url' parameter");
  }

  try {
    const response = await axios.get(targetUrl); // 🛑 Dangerous: no URL validation
    res.send(`
      <h2>Fetched Content</h2>
      <pre>${response.data}</pre>
      <a href="/">Back</a>
    `);
  } catch (err) {
    res.status(500).send("Error fetching URL.");
  }
});

// Simulated SQL injection vulnerability
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  console.log("Running query:", query); // Simulate DB query
  res.send("Logged in (simulated).");
});

// Simulated reflected XSS vulnerability
app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`
    <h1>Search Results</h1>
    <p>You searched for: ${query}</p>
    <a href="/">Back</a>
  `);
});

// Simulated insecure file upload vulnerability
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.send("No file uploaded.");
  }

  const tempPath = file.path;
  const targetPath = path.join(__dirname, 'uploads', file.originalname); // 🛑 Unsafe: uses original filename directly

  // Move file (no validation)
  fs.rename(tempPath, targetPath, err => {
    if (err) return res.send("Upload failed.");
    res.send(`File uploaded to ${targetPath}`);
  });
});

// Home page
app.get('/', (req, res) => {
  res.send(`
    <form method="POST" action="/login">
      <input name="username" />
      <input name="password" type="password" />
      <button type="submit">Login</button>
    </form>
    <br />
    <form method="GET" action="/search">
      <input name="q" placeholder="Search..." />
      <button type="submit">Search</button>
    </form>
    <br />
    <form method="POST" action="/upload" enctype="multipart/form-data">
      <input type="file" name="file" />
      <button type="submit">Upload File</button>
    </form>
    <br />
    <form method="GET" action="/fetch">
      <input name="url" placeholder="Enter URL to fetch (SSRF)" />
      <button type="submit">Fetch URL</button>
    </form>
  `);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
