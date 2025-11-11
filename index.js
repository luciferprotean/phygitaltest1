const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle input check
app.post('/submit', (req, res) => {
  const inputValue = req.body.myInput;
  console.log('Received input:', inputValue);

  // Read main JSON data
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'jacketData.json')));
  const match = data.find(item => item.publicKey === inputValue);

  if (!match) {
    return res.json({ found: false });
  }

  // Prepare result object
  const result = {
    found: true,
    serial: match.serial,
    type: match.type,
    pk: match.publicKey
  };

  const scanFile = path.join(__dirname, 'scanResults.json');

  // Ensure scanResults.json exists
  if (!fs.existsSync(scanFile)) {
    fs.writeFileSync(scanFile, JSON.stringify([], null, 2));
  }

  // Read existing scan results
  const scanData = JSON.parse(fs.readFileSync(scanFile));

  // Check if pk already exists
  const exists = scanData.some(item => item.pk === match.publicKey);

  if (!exists) {
    scanData.push(result);
    fs.writeFileSync(scanFile, JSON.stringify(scanData, null, 2));
    console.log(`✅ Added ${match.publicKey} to scanResults.json`);
  } else {
    console.log(`⚠️ ${match.publicKey} already exists in scanResults.json`);
  }

  res.json(result);
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