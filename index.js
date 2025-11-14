const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;

// --------------------------------------------------
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const creds = require('./jacket-scanner-25015107dc9a.json');

const SHEET_ID = '1bx3X2jxB-4rf4GxfUUB6lFlLQvonSbiYzJVDqgS5xsU';
// --------------------------------------------------

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

// Route to serve HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/submit', async (req, res) => {
  const inputValue = req.body.myInput;
  console.log('Received input:', inputValue);

  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'chipData.json')));
  const match = data.find((item) => item.chip_pk === inputValue);

  if (match) {
    const sheet = await accessSheet();

    // Check if already exists in Google Sheet
    const rows = await sheet.getRows();
    const exists = rows.some((r) => r.publicKey === match.chip_pk);

    const now = new Date();
    const timestamp =
      now.getDate().toString().padStart(2, "0") + "/" +
      (now.getMonth() + 1).toString().padStart(2, "0") + "/" +
      now.getFullYear() + " " +
      now.getHours().toString().padStart(2, "0") + ":" +
      now.getMinutes().toString().padStart(2, "0") + ":" +
      now.getSeconds().toString().padStart(2, "0");

    if (!exists) {
      await sheet.addRow({
        serial: match.serial_number,
        type: match.tier_code,
        publicKey: match.chip_pk,
        timestamp: timestamp
      });
      console.log(`Added ${match.chip_pk} to Google Sheet`);
    }

    res.json({
      found: true,
      serial: match.serial_number,
      type: match.tier_code,
      pk: match.chip_pk,
    });
  } else {
    res.json({ found: false });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));