const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const creds = require('./jacket-scanner-a9e87365b5d8.json');

const SHEET_ID = '1bx3X2jxB-4rf4GxfUUB6lFlLQvonSbiYzJVDqgS5xsU';

(async () => {
  try {
    const auth = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, auth);
    await doc.loadInfo();

    console.log(`✅ Connected to sheet: ${doc.title}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();