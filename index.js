const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
//const creds = require('./jacket-scanner-a9e87365b5d8.json'); // path to downloaded key
const SHEET_ID = '1bx3X2jxB-4rf4GxfUUB6lFlLQvonSbiYzJVDqgS5xsU';

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const doc = new GoogleSpreadsheet(SHEET_ID);

async function accessSheet() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  return doc.sheetsByIndex[0]; // first sheet
}

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle input check
app.post('/submit', async (req, res) => {
  const inputValue = req.body.myInput;
  console.log('Received input:', inputValue);

  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'jacketData.json')));
  const match = data.find(item => item.publicKey === inputValue);

  if (!match) return res.json({ found: false });

  const sheet = await accessSheet();
  const rows = await sheet.getRows();

  // Check if key already exists
  const exists = rows.some(row => row.publicKey === match.publicKey);

  if (!exists) {
    await sheet.addRow({
      serial: match.serial,
      type: match.type,
      publicKey: match.publicKey
    });
    console.log(`✅ Added ${match.publicKey} to Google Sheet`);
  } else {
    console.log(`⚠️ ${match.publicKey} already exists in Google Sheet`);
  }

  res.json({
    found: true,
    serial: match.serial,
    type: match.type,
    pk: match.publicKey
  });
});

// 1bx3X2jxB-4rf4GxfUUB6lFlLQvonSbiYzJVDqgS5xsU - Sheet id
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