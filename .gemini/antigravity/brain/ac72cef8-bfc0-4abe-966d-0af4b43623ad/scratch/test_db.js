const mysql = require('mysql2/promise');

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'rose_beau_salon',
  port: 3306,
};

async function main() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL!');
    const [rows] = await connection.query('SELECT * FROM `stocks`');
    console.log('Current stocks count:', rows.length);
    console.log('Current stocks:', JSON.stringify(rows.slice(0, 10), null, 2));
    await connection.end();
  } catch (error) {
    console.error('Error connecting or querying:', error);
  }
}

main();
