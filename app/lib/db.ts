import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || 3306,
};

let pool: mysql.Pool | null = null;

export async function getPool() {
  if (pool) return pool;

  // First connect without database to ensure it exists
  const connection = await mysql.createConnection(dbConfig);
  await connection.query('CREATE DATABASE IF NOT EXISTS `rose_beau_salon`');
  await connection.end();

  // Create the pool with the database specified
  pool = mysql.createPool({
    ...dbConfig,
    database: 'rose_beau_salon',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Initialize schema
  await initSchema();

  return pool;
}

async function initSchema() {
  if (!pool) return;

  const connection = await pool.getConnection();
  try {
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(50) UNIQUE NOT NULL,
        \`password\` VARCHAR(255) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default admin if table is empty
    const [rows]: any = await connection.query('SELECT COUNT(*) as count FROM `users`');
    if (rows[0].count === 0) {
      console.log('Seeding default admin user...');
      await connection.query(
        'INSERT INTO `users` (`username`, `password`) VALUES (?, ?)',
        ['admin', 'adminadmin']
      );
    }
  } catch (error) {
    console.error('Error initializing database schema:', error);
  } finally {
    connection.release();
  }
}
