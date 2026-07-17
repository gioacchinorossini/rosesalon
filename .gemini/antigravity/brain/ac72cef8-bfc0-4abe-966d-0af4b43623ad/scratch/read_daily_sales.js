const fs = require('fs');

const data = JSON.parse(fs.readFileSync('xlsx_data_summary.json', 'utf8'));
const sheetRows = data['ROSEBEAU-DAILY-SALES.xlsx']['2025 NEW DSR'];

if (!sheetRows) {
  console.log("Sheet not found!");
  process.exit(1);
}

sheetRows.forEach((row, i) => {
  // If the row contains elements in columns 15-18, print it
  const slice15 = row.slice(14);
  const cleanSlice = slice15.map((val, idx) => val !== null ? `[Col ${idx+14}]: ${val}` : null).filter(Boolean);
  if (cleanSlice.length > 0) {
    console.log(`Row ${i.toString().padStart(3)}:`, cleanSlice.join(' | '));
  }
});
