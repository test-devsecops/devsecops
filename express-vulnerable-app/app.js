const express = require('express');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

// Simulated SQL injection vulnerability
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  console.log("Running query:", query); // Simulate DB query
  res.send("Logged in (simulated).");
});

// Simulated reflected XSS vulnerability - 
app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`
    <h1>Search Results</h1>
    <p>You searched for: ${query}</p>
    <a href="/">Back</a>
  `);
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
  `);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
