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

// Simulated SQL injection vulnerability - Test
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

/**
 * Additional Vulnerable Routes
 */

// Command Injection (UNSAFE: passes user input to shell)
const { exec } = require('child_process');
app.get('/ping', (req, res) => {
  const host = req.query.host;
  if (!host) return res.send("Missing 'host' parameter");
  exec(`ping -c 1 ${host}`, (err, stdout, stderr) => {
    if (err) return res.send("Error running ping.");
    res.send(`<pre>${stdout}</pre><a href="/">Back</a>`);
  });
});

// Path Traversal (UNSAFE: reads arbitrary files)
app.get('/readfile', (req, res) => {
  const file = req.query.file;
  if (!file) return res.send("Missing 'file' parameter");
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) return res.send("Error reading file.");
    res.send(`<h2>File Content</h2><pre>${data}</pre><a href="/">Back</a>`);
  });
});

// Open Redirect (UNSAFE: redirects to user-supplied URL)
app.get('/redirect', (req, res) => {
  const target = req.query.target;
  if (!target) return res.send("Missing 'target' parameter");
  res.redirect(target);
});

// Sensitive Data Exposure (UNSAFE: leaks env variables)
app.get('/env', (req, res) => {
  res.send(`<h2>Environment Variables</h2><pre>${JSON.stringify(process.env, null, 2)}</pre><a href="/">Back</a>`);
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
    <br />
    <form method="GET" action="/ping">
      <input name="host" placeholder="Host for ping (Command Injection)" />
      <button type="submit">Ping Host</button>
    </form>
    <br />
    <form method="GET" action="/readfile">
      <input name="file" placeholder="File path (Path Traversal)" />
      <button type="submit">Read File</button>
    </form>
    <br />
    <form method="GET" action="/redirect">
      <input name="target" placeholder="Redirect target URL" />
      <button type="submit">Redirect</button>
    </form>
    <br />
    <form method="GET" action="/env">
      <button type="submit">Show Environment Variables</button>
    </form>
  `);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
