import mysql from 'mysql2/promise';
import {
  customerPamperSeed,
  paymentMonitoringSeed,
  suppliesMonitoringSeed,
  suppliesRequestSeed,
  staffPayslipsSeed,
  salesSummarySeed,
  staffSeed,
  servicesLogSeed,
  defaultServices
} from '../data/initialData';

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
    // 1. Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(50) UNIQUE NOT NULL,
        \`password\` VARCHAR(255) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Create services table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`services\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`category\` VARCHAR(100) NOT NULL,
        \`price\` DECIMAL(10, 2) NOT NULL,
        \`commissionRate\` DECIMAL(5, 4) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Create staffs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`staffs\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`code\` VARCHAR(50) UNIQUE NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(255) NOT NULL,
        \`mobile\` VARCHAR(50) NOT NULL,
        \`dailyRate\` DECIMAL(10, 2) NOT NULL,
        \`commissionRate\` DECIMAL(5, 4) NOT NULL,
        \`status\` VARCHAR(50) NOT NULL,
        \`hireDate\` VARCHAR(50) NOT NULL,
        \`notes\` TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Create services_log table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`services_log\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`customerName\` VARCHAR(255) NOT NULL,
        \`serviceName\` VARCHAR(255) NOT NULL,
        \`staffName\` VARCHAR(50) NOT NULL,
        \`price\` DECIMAL(10, 2) NOT NULL,
        \`date\` VARCHAR(50) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Create customer_pamper table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`customer_pamper\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`mobile\` VARCHAR(50) NOT NULL,
        \`pamperChoose\` VARCHAR(255) NOT NULL,
        \`date\` VARCHAR(100) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Create payment_transactions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`payment_transactions\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`date\` VARCHAR(50) NOT NULL,
        \`refNo\` VARCHAR(100) NOT NULL,
        \`gcash\` DECIMAL(10, 2) NOT NULL,
        \`bank\` DECIMAL(10, 2) NOT NULL,
        \`verifiedBy\` VARCHAR(50) NOT NULL,
        \`cash\` DECIMAL(10, 2) NOT NULL,
        \`totalGross\` DECIMAL(10, 2) NOT NULL,
        \`remarks\` TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Create supplies_monitoring table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`supplies_monitoring\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`date\` VARCHAR(50) NOT NULL,
        \`stocksIn\` VARCHAR(255) NOT NULL,
        \`pcsIn\` INT NOT NULL,
        \`stocksOut\` VARCHAR(255) NOT NULL,
        \`pcsOut\` INT NOT NULL,
        \`remarks\` TEXT,
        \`staff\` VARCHAR(50) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Create supplies_request table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`supplies_request\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`department\` VARCHAR(255) NOT NULL,
        \`date\` VARCHAR(50) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`brand\` VARCHAR(255) NOT NULL,
        \`po\` VARCHAR(100) NOT NULL,
        \`onHand\` INT NOT NULL,
        \`reqBy\` VARCHAR(50) NOT NULL,
        \`status\` VARCHAR(50) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. Create sales_summary table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`sales_summary\` (
        \`monthKey\` VARCHAR(10) PRIMARY KEY,
        \`monthName\` VARCHAR(50) NOT NULL,
        \`records\` LONGTEXT NOT NULL,
        \`rates\` LONGTEXT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 10. Create staff_payslips table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`staff_payslips\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`staffName\` VARCHAR(50) NOT NULL,
        \`date\` VARCHAR(50) NOT NULL,
        \`service1Val\` DECIMAL(10, 2) NOT NULL,
        \`service1Comi\` DECIMAL(10, 2) NOT NULL,
        \`service2Val\` DECIMAL(10, 2) NOT NULL,
        \`service2Comi\` DECIMAL(10, 2) NOT NULL,
        \`dailyRate\` DECIMAL(10, 2) NOT NULL,
        \`netTotal\` DECIMAL(10, 2) NOT NULL,
        \`ca\` DECIMAL(10, 2) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 11. Create stocks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`stocks\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`sku\` VARCHAR(50) UNIQUE NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`category\` VARCHAR(100) NOT NULL,
        \`onHand\` INT NOT NULL,
        \`minThreshold\` INT NOT NULL,
        \`costPrice\` DECIMAL(10, 2) NOT NULL,
        \`salesPrice\` DECIMAL(10, 2),
        \`supplier\` VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 12. Create stock_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`stock_logs\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`date\` VARCHAR(50) NOT NULL,
        \`itemId\` VARCHAR(50) NOT NULL,
        \`itemName\` VARCHAR(255) NOT NULL,
        \`type\` VARCHAR(50) NOT NULL,
        \`qty\` INT NOT NULL,
        \`remarks\` TEXT,
        \`staff\` VARCHAR(50) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed admin
    const [userRows]: any = await connection.query('SELECT COUNT(*) as count FROM `users`');
    if (userRows[0].count === 0) {
      console.log('Seeding default admin user...');
      await connection.query(
        'INSERT INTO `users` (`username`, `password`) VALUES (?, ?)',
        ['admin', 'adminadmin']
      );
    }

    // Seed services
    const [serviceRows]: any = await connection.query('SELECT COUNT(*) as count FROM `services`');
    if (serviceRows[0].count === 0) {
      console.log('Seeding default services...');
      for (const s of defaultServices) {
        await connection.query(
          'INSERT INTO `services` (`id`, `name`, `category`, `price`, `commissionRate`) VALUES (?, ?, ?, ?, ?)',
          [s.id, s.name, s.category, s.price, s.commissionRate]
        );
      }
    }

    // Seed staffs
    const [staffRows]: any = await connection.query('SELECT COUNT(*) as count FROM `staffs`');
    if (staffRows[0].count === 0) {
      console.log('Seeding default staffs...');
      for (const s of staffSeed) {
        await connection.query(
          'INSERT INTO `staffs` (`id`, `code`, `name`, `role`, `mobile`, `dailyRate`, `commissionRate`, `status`, `hireDate`, `notes`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [s.id, s.code, s.name, s.role, s.mobile, s.dailyRate, s.commissionRate, s.status, s.hireDate, s.notes || '']
        );
      }
    }

    // Seed services_log
    const [logRows]: any = await connection.query('SELECT COUNT(*) as count FROM `services_log`');
    if (logRows[0].count === 0) {
      console.log('Seeding default services_log...');
      for (const s of servicesLogSeed) {
        await connection.query(
          'INSERT INTO `services_log` (`id`, `customerName`, `serviceName`, `staffName`, `price`, `date`) VALUES (?, ?, ?, ?, ?, ?)',
          [s.id, s.customerName, s.serviceName, s.staffName, s.price, s.date]
        );
      }
    }

    // Seed customer_pamper
    const [custRows]: any = await connection.query('SELECT COUNT(*) as count FROM `customer_pamper`');
    if (custRows[0].count === 0) {
      console.log('Seeding default customer_pamper...');
      for (const c of customerPamperSeed) {
        await connection.query(
          'INSERT INTO `customer_pamper` (`id`, `name`, `mobile`, `pamperChoose`, `date`) VALUES (?, ?, ?, ?, ?)',
          [c.id, c.name, c.mobile, c.pamperChoose, c.date]
        );
      }
    }

    // Seed payment_transactions
    const [payRows]: any = await connection.query('SELECT COUNT(*) as count FROM `payment_transactions`');
    if (payRows[0].count === 0) {
      console.log('Seeding default payment_transactions...');
      for (const p of paymentMonitoringSeed) {
        await connection.query(
          'INSERT INTO `payment_transactions` (`id`, `date`, `refNo`, `gcash`, `bank`, `verifiedBy`, `cash`, `totalGross`, `remarks`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [p.id, p.date, p.refNo, p.gcash, p.bank, p.verifiedBy, p.cash, p.totalGross, p.remarks || '']
        );
      }
    }

    // Seed supplies_monitoring
    const [suppMonRows]: any = await connection.query('SELECT COUNT(*) as count FROM `supplies_monitoring`');
    if (suppMonRows[0].count === 0) {
      console.log('Seeding default supplies_monitoring...');
      for (const sm of suppliesMonitoringSeed) {
        await connection.query(
          'INSERT INTO `supplies_monitoring` (`id`, `date`, `stocksIn`, `pcsIn`, `stocksOut`, `pcsOut`, `remarks`, `staff`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [sm.id, sm.date, sm.stocksIn || '', sm.pcsIn, sm.stocksOut || '', sm.pcsOut, sm.remarks || '', sm.staff]
        );
      }
    }

    // Seed supplies_request
    const [suppReqRows]: any = await connection.query('SELECT COUNT(*) as count FROM `supplies_request`');
    if (suppReqRows[0].count === 0) {
      console.log('Seeding default supplies_request...');
      for (const sr of suppliesRequestSeed) {
        await connection.query(
          'INSERT INTO `supplies_request` (`id`, `department`, `date`, `description`, `brand`, `po`, `onHand`, `reqBy`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [sr.id, sr.department, sr.date, sr.description, sr.brand, sr.po, sr.onHand, sr.reqBy, sr.status]
        );
      }
    }

    // Seed sales_summary
    const [salesRows]: any = await connection.query('SELECT COUNT(*) as count FROM `sales_summary`');
    if (salesRows[0].count === 0) {
      console.log('Seeding default sales_summary...');
      for (const [monthKey, data] of Object.entries(salesSummarySeed)) {
        await connection.query(
          'INSERT INTO `sales_summary` (`monthKey`, `monthName`, `records`, `rates`) VALUES (?, ?, ?, ?)',
          [monthKey, data.monthName, JSON.stringify(data.records), JSON.stringify(data.rates)]
        );
      }
    }

    // Seed staff_payslips
    const [payslipRows]: any = await connection.query('SELECT COUNT(*) as count FROM `staff_payslips`');
    if (payslipRows[0].count === 0) {
      console.log('Seeding default staff_payslips...');
      for (const [staffName, records] of Object.entries(staffPayslipsSeed)) {
        for (const r of records) {
          await connection.query(
            'INSERT INTO `staff_payslips` (`staffName`, `date`, `service1Val`, `service1Comi`, `service2Val`, `service2Comi`, `dailyRate`, `netTotal`, `ca`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [staffName, r.date, r.service1Val, r.service1Comi, r.service2Val, r.service2Comi, r.dailyRate, r.netTotal, r.ca]
          );
        }
      }

      // Seed stocks
      const [stocksCountRows]: any = await connection.query('SELECT COUNT(*) as count FROM `stocks`');
      if (stocksCountRows[0].count === 0) {
        console.log('Seeding default stocks...');
        const defaultStockItems = [
          { id: "st-1", name: "Premium Keratin Shampoo 500ml", sku: "SH-KER-500", category: "Retail Product", onHand: 15, minThreshold: 5, costPrice: 450.00, salesPrice: 850.00, supplier: "L'Oreal Corp" },
          { id: "st-2", name: "Moroccan Argan Oil 100ml", sku: "OIL-ARG-100", category: "Retail Product", onHand: 8, minThreshold: 3, costPrice: 600.00, salesPrice: 1200.00, supplier: "Argan Co" },
          { id: "st-3", name: "Gel Top Coat Extra Shine", sku: "NLT-GEL-TS", category: "Consumable", onHand: 6, minThreshold: 2, costPrice: 180.00, salesPrice: null, supplier: "NailArt Supply" },
          { id: "st-4", name: "Developer 20 Volume 1L", sku: "DEV-20V-1L", category: "Consumable", onHand: 12, minThreshold: 4, costPrice: 250.00, salesPrice: null, supplier: "L'Oreal Corp" },
          { id: "st-5", name: "Bleaching Powder Violet 500g", sku: "BL-POW-VIO", category: "Consumable", onHand: 4, minThreshold: 3, costPrice: 380.00, salesPrice: null, supplier: "L'Oreal Corp" },
          { id: "st-6", name: "Ultra Lash Glue 5ml", sku: "AES-LSH-GL", category: "Consumable", onHand: 2, minThreshold: 3, costPrice: 320.00, salesPrice: null, supplier: "Aesthetic Hub" }
        ];
        for (const s of defaultStockItems) {
          await connection.query(
            'INSERT INTO `stocks` (`id`, `sku`, `name`, `category`, `onHand`, `minThreshold`, `costPrice`, `salesPrice`, `supplier`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [s.id, s.sku, s.name, s.category, s.onHand, s.minThreshold, s.costPrice, s.salesPrice, s.supplier]
          );
        }
      }

      // Seed stock_logs
      const [stockLogsCountRows]: any = await connection.query('SELECT COUNT(*) as count FROM `stock_logs`');
      if (stockLogsCountRows[0].count === 0) {
        console.log('Seeding default stock_logs...');
        const defaultStockLogs = [
          { id: "sl-1", date: "2026-07-12", itemId: "st-1", itemName: "Premium Keratin Shampoo 500ml", type: "IN", qty: 10, remarks: "Restock delivery", staff: "MANAGER" },
          { id: "sl-2", date: "2026-07-13", itemId: "st-3", itemName: "Gel Top Coat Extra Shine", type: "OUT", qty: 1, remarks: "Station replenishment", staff: "SHA" },
          { id: "sl-3", date: "2026-07-14", itemId: "st-2", itemName: "Moroccan Argan Oil 100ml", type: "OUT", qty: 2, remarks: "Customer retail purchase", staff: "VIC" }
        ];
        for (const sl of defaultStockLogs) {
          await connection.query(
            'INSERT INTO `stock_logs` (`id`, `date`, `itemId`, `itemName`, `type`, `qty`, `remarks`, `staff`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [sl.id, sl.date, sl.itemId, sl.itemName, sl.type, sl.qty, sl.remarks, sl.staff]
          );
        }
      }
    }

  } catch (error) {
    console.error('Error initializing database schema:', error);
  } finally {
    connection.release();
  }
}
