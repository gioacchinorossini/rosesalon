import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';

export async function GET() {
  try {
    const pool = await getPool();
    const conn = await pool.getConnection();

    try {
      // 1. Fetch customer_pamper
      const [custRows]: any = await conn.query('SELECT * FROM `customer_pamper`');
      const customerPamper = custRows.map((r: any) => ({
        id: r.id,
        name: r.name,
        mobile: r.mobile,
        pamperChoose: r.pamperChoose,
        date: r.date
      }));

      // 2. Fetch services_log
      const [logRows]: any = await conn.query('SELECT * FROM `services_log`');
      const servicesLog = logRows.map((r: any) => ({
        id: r.id,
        customerName: r.customerName,
        serviceName: r.serviceName,
        staffName: r.staffName,
        price: Number(r.price),
        date: r.date
      }));

      // 3. Fetch payment_transactions
      const [payRows]: any = await conn.query('SELECT * FROM `payment_transactions`');
      const paymentTransactions = payRows.map((r: any) => ({
        id: r.id,
        date: r.date,
        refNo: r.refNo,
        gcash: Number(r.gcash),
        bank: Number(r.bank),
        verifiedBy: r.verifiedBy,
        cash: Number(r.cash),
        totalGross: Number(r.totalGross),
        remarks: r.remarks || ''
      }));

      // 4. Fetch supplies_monitoring
      const [suppMonRows]: any = await conn.query('SELECT * FROM `supplies_monitoring`');
      const suppliesMonitoring = suppMonRows.map((r: any) => ({
        id: r.id,
        date: r.date,
        stocksIn: r.stocksIn || '',
        pcsIn: Number(r.pcsIn),
        stocksOut: r.stocksOut || '',
        pcsOut: Number(r.pcsOut),
        remarks: r.remarks || '',
        staff: r.staff
      }));

      // 5. Fetch supplies_request
      const [suppReqRows]: any = await conn.query('SELECT * FROM `supplies_request`');
      const suppliesRequest = suppReqRows.map((r: any) => ({
        id: r.id,
        department: r.department,
        date: r.date,
        description: r.description,
        brand: r.brand,
        po: r.po,
        onHand: Number(r.onHand),
        reqBy: r.reqBy,
        status: r.status
      }));

      // 6. Fetch services
      const [serviceRows]: any = await conn.query('SELECT * FROM `services`');
      const services = serviceRows.map((r: any) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        price: Number(r.price),
        commissionRate: Number(r.commissionRate)
      }));

      // 7. Fetch staffs
      const [staffRows]: any = await conn.query('SELECT * FROM `staffs`');
      const staffs = staffRows.map((r: any) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        role: r.role,
        mobile: r.mobile,
        dailyRate: Number(r.dailyRate),
        commissionRate: Number(r.commissionRate),
        status: r.status,
        hireDate: r.hireDate,
        notes: r.notes || ''
      }));

      // 8. Fetch sales_summary and build monthKey mapping
      const [salesRows]: any = await conn.query('SELECT * FROM `sales_summary`');
      const salesSummary: { [monthKey: string]: any } = {};
      salesRows.forEach((r: any) => {
        salesSummary[r.monthKey] = {
          monthName: r.monthName,
          records: JSON.parse(r.records),
          rates: JSON.parse(r.rates)
        };
      });

      // 10. Fetch staff_payslips and group by staffName
      const [payslipRows]: any = await conn.query('SELECT * FROM `staff_payslips`');
      const staffPayslips: { [staffName: string]: any[] } = {};
      
      // Initialize keys for all staff to keep it consistent
      staffs.forEach((s: any) => {
        staffPayslips[s.code] = [];
      });

      payslipRows.forEach((r: any) => {
        if (!staffPayslips[r.staffName]) {
          staffPayslips[r.staffName] = [];
        }
        staffPayslips[r.staffName].push({
          date: r.date,
          service1Val: Number(r.service1Val),
          service1Comi: Number(r.service1Comi),
          service2Val: Number(r.service2Val),
          service2Comi: Number(r.service2Comi),
          dailyRate: Number(r.dailyRate),
          netTotal: Number(r.netTotal),
          ca: Number(r.ca)
        });
      });

      // 11. Fetch stocks
      const [stockRows]: any = await conn.query('SELECT * FROM `stocks`');
      const stocks = stockRows.map((r: any) => ({
        id: r.id,
        sku: r.sku,
        name: r.name,
        category: r.category,
        onHand: Number(r.onHand),
        minThreshold: Number(r.minThreshold),
        costPrice: Number(r.costPrice),
        salesPrice: r.salesPrice !== null ? Number(r.salesPrice) : undefined,
        supplier: r.supplier
      }));

      // 12. Fetch stock_logs
      const [stockLogRows]: any = await conn.query('SELECT * FROM `stock_logs`');
      const stockLogs = stockLogRows.map((r: any) => ({
        id: r.id,
        date: r.date,
        itemId: r.itemId,
        itemName: r.itemName,
        type: r.type,
        qty: Number(r.qty),
        remarks: r.remarks || '',
        staff: r.staff
      }));

      return NextResponse.json({
        success: true,
        data: {
          customerPamper,
          servicesLog,
          paymentTransactions,
          suppliesMonitoring,
          suppliesRequest,
          services,
          staffs,
          salesSummary,
          staffPayslips,
          stocks,
          stockLogs
        }
      });
    } finally {
      conn.release();
    }
  } catch (error: any) {
    console.error('Load API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
