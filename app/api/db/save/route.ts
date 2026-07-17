import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';

export async function POST(request: Request) {
  try {
    const { key, data } = await request.json();
    if (!key || data === undefined) {
      return NextResponse.json({ error: 'Missing key or data' }, { status: 400 });
    }

    const pool = await getPool();
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      if (key === 'rose_customerPamper') {
        await conn.query('DELETE FROM `customer_pamper`');
        for (const c of data) {
          await conn.query(
            'INSERT INTO `customer_pamper` (`id`, `name`, `mobile`, `pamperChoose`, `date`) VALUES (?, ?, ?, ?, ?)',
            [c.id, c.name, c.mobile, c.pamperChoose, c.date]
          );
        }
      } else if (key === 'rose_servicesLog') {
        await conn.query('DELETE FROM `services_log`');
        for (const s of data) {
          await conn.query(
            'INSERT INTO `services_log` (`id`, `customerName`, `serviceName`, `staffName`, `price`, `date`) VALUES (?, ?, ?, ?, ?, ?)',
            [s.id, s.customerName, s.serviceName, s.staffName, s.price, s.date]
          );
        }
      } else if (key === 'rose_paymentTransactions') {
        await conn.query('DELETE FROM `payment_transactions`');
        for (const p of data) {
          await conn.query(
            'INSERT INTO `payment_transactions` (`id`, `date`, `refNo`, `gcash`, `bank`, `verifiedBy`, `cash`, `totalGross`, `remarks`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [p.id, p.date, p.refNo, p.gcash, p.bank, p.verifiedBy, p.cash, p.totalGross, p.remarks || '']
          );
        }
      } else if (key === 'rose_suppliesMonitoring') {
        await conn.query('DELETE FROM `supplies_monitoring`');
        for (const sm of data) {
          await conn.query(
            'INSERT INTO `supplies_monitoring` (`id`, `date`, `stocksIn`, `pcsIn`, `stocksOut`, `pcsOut`, `remarks`, `staff`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [sm.id, sm.date, sm.stocksIn || '', sm.pcsIn, sm.stocksOut || '', sm.pcsOut, sm.remarks || '', sm.staff]
          );
        }
      } else if (key === 'rose_suppliesRequest') {
        await conn.query('DELETE FROM `supplies_request`');
        for (const sr of data) {
          await conn.query(
            'INSERT INTO `supplies_request` (`id`, `department`, `date`, `description`, `brand`, `po`, `onHand`, `reqBy`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [sr.id, sr.department, sr.date, sr.description, sr.brand, sr.po, sr.onHand, sr.reqBy, sr.status]
          );
        }
      } else if (key === 'rose_services') {
        await conn.query('DELETE FROM `services`');
        for (const s of data) {
          await conn.query(
            'INSERT INTO `services` (`id`, `name`, `category`, `price`, `commissionRate`) VALUES (?, ?, ?, ?, ?)',
            [s.id, s.name, s.category, s.price, s.commissionRate]
          );
        }
      } else if (key === 'rose_staffs') {
        await conn.query('DELETE FROM `staffs`');
        for (const s of data) {
          await conn.query(
            'INSERT INTO `staffs` (`id`, `code`, `name`, `role`, `mobile`, `dailyRate`, `commissionRate`, `status`, `hireDate`, `notes`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [s.id, s.code, s.name, s.role, s.mobile, s.dailyRate, s.commissionRate, s.status, s.hireDate, s.notes || '']
          );
        }
      } else if (key === 'rose_salesSummary') {
        await conn.query('DELETE FROM `sales_summary`');
        for (const [monthKey, monthData] of Object.entries(data)) {
          const md = monthData as any;
          await conn.query(
            'INSERT INTO `sales_summary` (`monthKey`, `monthName`, `records`, `rates`) VALUES (?, ?, ?, ?)',
            [monthKey, md.monthName, JSON.stringify(md.records), JSON.stringify(md.rates)]
          );
        }
      } else if (key === 'rose_staffPayslips') {
        await conn.query('DELETE FROM `staff_payslips`');
        for (const [staffName, records] of Object.entries(data)) {
          for (const r of (records as any[])) {
            await conn.query(
              'INSERT INTO `staff_payslips` (`staffName`, `date`, `service1Val`, `service1Comi`, `service2Val`, `service2Comi`, `dailyRate`, `netTotal`, `ca`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [staffName, r.date, r.service1Val, r.service1Comi, r.service2Val, r.service2Comi, r.dailyRate, r.netTotal, r.ca]
            );
          }
        }
      } else if (key === 'rose_stocks') {
        await conn.query('DELETE FROM `stocks`');
        for (const s of data) {
          await conn.query(
            'INSERT INTO `stocks` (`id`, `sku`, `name`, `category`, `onHand`, `minThreshold`, `costPrice`, `salesPrice`, `supplier`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [s.id, s.sku, s.name, s.category, s.onHand, s.minThreshold, s.costPrice, s.salesPrice !== undefined ? s.salesPrice : null, s.supplier]
          );
        }
      } else if (key === 'rose_stockLogs') {
        await conn.query('DELETE FROM `stock_logs`');
        for (const sl of data) {
          await conn.query(
            'INSERT INTO `stock_logs` (`id`, `date`, `itemId`, `itemName`, `type`, `qty`, `remarks`, `staff`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [sl.id, sl.date, sl.itemId, sl.itemName, sl.type, sl.qty, sl.remarks || '', sl.staff]
          );
        }
      } else {
        await conn.rollback();
        return NextResponse.json({ error: `Unsupported key: ${key}` }, { status: 400 });
      }

      await conn.commit();
      return NextResponse.json({ success: true });
    } catch (e: any) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (error: any) {
    console.error('Save API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
