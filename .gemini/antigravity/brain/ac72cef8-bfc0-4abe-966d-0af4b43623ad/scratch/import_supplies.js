const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'rose_beau_salon',
  port: 3306,
};

async function main() {
  const csvPath = 'c:\\Users\\longn\\rosesalon\\supplies.csv';
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found at:', csvPath);
    return;
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const items = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    // Split by comma
    const cells = line.split(',');
    const name = cells[0].trim();
    if (!name) continue;

    // Generate a SKU
    let sku = 'SUP-' + name.toUpperCase()
      .replace(/[^A-Z0-9\s-]/g, '') // remove special characters
      .replace(/\s+/g, '-')         // replace spaces with dashes
      .replace(/-+/g, '-');         // remove duplicate dashes
    
    // Trim dashes at ends
    sku = sku.replace(/^-+|-+$/g, '');

    if (!sku || sku === 'SUP-') {
      sku = 'SUP-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    }

    items.push({ name, sku });
  }

  console.log(`Parsed ${items.length} items from CSV.`);

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database.');

    // Fetch existing SKUs to avoid duplicates
    const [existingRows] = await connection.query('SELECT sku FROM `stocks`');
    const existingSkus = new Set(existingRows.map(r => r.sku.toUpperCase()));

    let insertedCount = 0;
    const timestamp = Date.now();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let finalSku = item.sku;
      
      // Ensure SKU is unique
      let suffix = 1;
      while (existingSkus.has(finalSku)) {
        finalSku = `${item.sku}-${suffix}`;
        suffix++;
      }

      const id = `st-${timestamp}-${i}`;
      const category = 'Consumable';
      const onHand = 10; // Start with 10 units so it shows as in-stock
      const minThreshold = 3;
      const costPrice = 0.00;
      const salesPrice = null;
      const supplier = 'CSV Import';

      await connection.query(
        'INSERT INTO `stocks` (`id`, `sku`, `name`, `category`, `onHand`, `minThreshold`, `costPrice`, `salesPrice`, `supplier`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, finalSku, item.name, category, onHand, minThreshold, costPrice, salesPrice, supplier]
      );

      existingSkus.add(finalSku);
      insertedCount++;
    }

    console.log(`Successfully inserted ${insertedCount} new supplies into the stocks table.`);
    await connection.end();
  } catch (error) {
    console.error('Error during database import:', error);
  }
}

main();
