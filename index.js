const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const port = process.env.PORT || 3000;
const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
//const creds = require('./jacket-scanner-a9e87365b5d8.json');
const SHEET_ID = '1bx3X2jxB-4rf4GxfUUB6lFlLQvonSbiYzJVDqgS5xsU';

// ✅ Google Sheets Auth setup
const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);

async function accessSheet() {
  await doc.loadInfo();
  console.log(`Loaded sheet: ${doc.title}`);
  return doc.sheetsByIndex[0];
}

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ✅ Route to handle form submission
app.post('/submit', async (req, res) => {
  const inputValue = req.body.myInput;
  console.log('Received input:', inputValue);

  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'jacketData.json')));
  const match = data.find((item) => item.publicKey === inputValue);

  if (match) {
    const sheet = await accessSheet();

    // Check if already exists in Google Sheet
    const rows = await sheet.getRows();
    const exists = rows.some((r) => r.publicKey === match.publicKey);

    if (!exists) {
      await sheet.addRow({
        serial: match.serial,
        type: match.type,
        publicKey: match.publicKey,
      });
      console.log(`Added ${match.publicKey} to Google Sheet`);
    }

    res.json({
      found: true,
      serial: match.serial,
      type: match.type,
      pk: match.publicKey,
    });
  } else {
    res.json({ found: false });
  }
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