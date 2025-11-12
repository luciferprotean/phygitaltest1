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

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to serve HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle AJAX submission
app.post('/submit', (req, res) => {
  const inputValue = req.body.myInput;
  console.log('Received input:', inputValue);

  //const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'jacketData.json')));
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'chipData.json')));
  const match = data.find(item => item.chip_pk === inputValue);

  if (match) {
    res.json({
      found: true,
      serial: match.serial_number,
      type: match.tier_code,
      pk: match.chip_pk
    });
  } else {
    res.json({ found: false });
  }
});

(async () => {
  try {
    const auth = new JWT({
      email: creds.client_email,
      key: creds.private_key.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, auth);
    await doc.loadInfo();

    console.log(`✅ Connected to sheet: ${doc.title}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();

app.listen(port, () => console.log(`Server running on port ${port}`));