const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;

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

app.listen(port, () => console.log(`Server running on port ${port}`));