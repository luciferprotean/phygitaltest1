const express = require("express");
const app = express();
const bodyParser = require('body-parser'); // To parse form data
const port = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));

  // Route to serve the HTML page
  app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
  });

  // Route to handle form submission
  app.post('/submit', (req, res) => {
      const inputValue = req.body.myInput;
      console.log('Received input:', inputValue);
      res.send(`Data received: ${inputValue}`);
  });
// Route: /testcode
app.get("/testcode", (req, res) => {
  // Your QR URL is like: https://myapp.com/testcode/?=mycode123
  // But this isn't standard query format. Normally it should be ?code=mycode123
  // Still, we can read it using req.query[''] (empty key).
  
  const code = req.query.code; // gets value after "?="
  
  res.send(`
    <h1>QR Code Result</h1>
    <p>Your code is: <strong>${code || "No code provided"}</strong></p>
  `);
});

// Start server
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});