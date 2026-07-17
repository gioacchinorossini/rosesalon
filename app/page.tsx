"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  customerPamperSeed,
  paymentMonitoringSeed,
  suppliesMonitoringSeed,
  suppliesRequestSeed,
  staffPayslipsSeed,
  salesSummarySeed,
  staffSeed,
  servicesLogSeed,
  defaultServices,
  CustomerPamper,
  PaymentTransaction,
  SuppliesMonitoringLog,
  SuppliesRequest,
  StaffDailyPayslipRecord,
  MonthlySalesSummary,
  StaffMember,
  ServiceItem,
  ServiceLog,
} from "./data/initialData";

import { Sidebar } from "../components/Sidebar";
import { DashboardPanel } from "../components/DashboardPanel";
import { PosPanel } from "../components/PosPanel";
import { BookingsPanel } from "../components/BookingsPanel";
import { SalesLedgerPanel } from "../components/SalesLedgerPanel";
import { StaffsPanel } from "../components/StaffsPanel";
import { PayslipsPanel } from "../components/PayslipsPanel";
import { PaymentsPanel } from "../components/PaymentsPanel";
import { SuppliesPanel } from "../components/SuppliesPanel";
import { ServicesPanel } from "../components/ServicesPanel";
import { ServicesLogPanel } from "../components/ServicesLogPanel";
import { QueuePanel } from "../components/QueuePanel";
import { StocksPanel, StockItem, StockLog } from "../components/StocksPanel";

type ActivePanel = 'dashboard' | 'salesLedger' | 'pos' | 'services' | 'payslips' | 'payments' | 'bookings' | 'supplies' | 'staffs' | 'servicesLog' | 'queue' | 'stocks';

const defaultStockItems: StockItem[] = [
  { id: "st-1", name: "Premium Keratin Shampoo 500ml", sku: "SH-KER-500", category: "Retail Product", onHand: 15, minThreshold: 5, costPrice: 450.00, salesPrice: 850.00, supplier: "L'Oreal Corp" },
  { id: "st-2", name: "Moroccan Argan Oil 100ml", sku: "OIL-ARG-100", category: "Retail Product", onHand: 8, minThreshold: 3, costPrice: 600.00, salesPrice: 1200.00, supplier: "Argan Co" },
  { id: "st-3", name: "Gel Top Coat Extra Shine", sku: "NLT-GEL-TS", category: "Consumable", onHand: 6, minThreshold: 2, costPrice: 180.00, supplier: "NailArt Supply" },
  { id: "st-4", name: "Developer 20 Volume 1L", sku: "DEV-20V-1L", category: "Consumable", onHand: 12, minThreshold: 4, costPrice: 250.00, supplier: "L'Oreal Corp" },
  { id: "st-5", name: "Bleaching Powder Violet 500g", sku: "BL-POW-VIO", category: "Consumable", onHand: 4, minThreshold: 3, costPrice: 380.00, supplier: "L'Oreal Corp" },
  { id: "st-6", name: "Ultra Lash Glue 5ml", sku: "AES-LSH-GL", category: "Consumable", onHand: 2, minThreshold: 3, costPrice: 320.00, supplier: "Aesthetic Hub" }
];

const defaultStockLogs: StockLog[] = [
  { id: "sl-1", date: "2026-07-12", itemId: "st-1", itemName: "Premium Keratin Shampoo 500ml", type: "IN", qty: 10, remarks: "Restock delivery", staff: "MANAGER" },
  { id: "sl-2", date: "2026-07-13", itemId: "st-3", itemName: "Gel Top Coat Extra Shine", type: "OUT", qty: 1, remarks: "Station replenishment", staff: "SHA" },
  { id: "sl-3", date: "2026-07-14", itemId: "st-2", itemName: "Moroccan Argan Oil 100ml", type: "OUT", qty: 2, remarks: "Customer retail purchase", staff: "VIC" }
];

export default function Home() {
  const [activePanel, setActivePanel] = useState<ActivePanel>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rose_sidebarCollapsed");
      return saved === "true";
    }
    return false;
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("rose_sidebarCollapsed", String(next));
      return next;
    });
  };

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // App State - Seeding from initialData
  const [customerPamper, setCustomerPamper] = useState<CustomerPamper[]>([]);
  const [servicesLog, setServicesLog] = useState<ServiceLog[]>([]);
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([]);
  const [suppliesMonitoring, setSuppliesMonitoring] = useState<SuppliesMonitoringLog[]>([]);
  const [suppliesRequest, setSuppliesRequest] = useState<SuppliesRequest[]>([]);
  const [staffPayslips, setStaffPayslips] = useState<{ [staffName: string]: StaffDailyPayslipRecord[] }>({});
  const [salesSummary, setSalesSummary] = useState<{ [monthKey: string]: MonthlySalesSummary }>({});
  const [staffs, setStaffs] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);

  // Ongoing treatments queue (synced with localStorage)
  const [ongoingServices, setOngoingServices] = useState<Array<{
    id: string;
    customerName: string;
    services: Array<{ id: string; service: string; price: number; commissionRate?: number }>;
    staffCode: string;
    startTime: string; // ISO string
    date: string;
  }>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rose_ongoingServices");
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        id: "demo-ongoing-1",
        customerName: "Patricia Lopez",
        services: [
          { id: "s-1", service: "Keratin Treatment & Trim", price: 1200, commissionRate: 0.27 }
        ],
        staffCode: "ETET",
        startTime: new Date(Date.now() - 35 * 60000).toISOString(), // 35m ago
        date: new Date().toISOString().split("T")[0]
      }
    ];
  });

  const [activeOngoingId, setActiveOngoingId] = useState<string | null>(null);

  // Active state indicators
  const [activeMonthKey, setActiveMonthKey] = useState<string>('APR');
  const [activeStaffName, setActiveStaffName] = useState<string>('ETET');

  // Check auth session and Load local data on mount
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(!!data.authenticated);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });

    const loadInitialData = async () => {
      try {
        const response = await fetch('/api/db/load');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const d = result.data;
            setCustomerPamper(d.customerPamper);
            setServicesLog(d.servicesLog);
            setPaymentTransactions(d.paymentTransactions);
            setSuppliesMonitoring(d.suppliesMonitoring);
            setSuppliesRequest(d.suppliesRequest);
             setServices(d.services);
            setStaffs(d.staffs);
            setSalesSummary(d.salesSummary);
            setStaffPayslips(d.staffPayslips);
            if (d.stocks) setStocks(d.stocks);
            if (d.stockLogs) setStockLogs(d.stockLogs);
            if (d.ongoingServices) setOngoingServices(d.ongoingServices);

            // Sync to local storage for caching/fallback
            localStorage.setItem("rose_customerPamper", JSON.stringify(d.customerPamper));
            localStorage.setItem("rose_servicesLog", JSON.stringify(d.servicesLog));
            localStorage.setItem("rose_paymentTransactions", JSON.stringify(d.paymentTransactions));
            localStorage.setItem("rose_suppliesMonitoring", JSON.stringify(d.suppliesMonitoring));
            localStorage.setItem("rose_suppliesRequest", JSON.stringify(d.suppliesRequest));
            localStorage.setItem("rose_services", JSON.stringify(d.services));
            localStorage.setItem("rose_staffs", JSON.stringify(d.staffs));
            localStorage.setItem("rose_salesSummary", JSON.stringify(d.salesSummary));
            localStorage.setItem("rose_staffPayslips", JSON.stringify(d.staffPayslips));
            if (d.stocks) localStorage.setItem("rose_stocks", JSON.stringify(d.stocks));
            if (d.stockLogs) localStorage.setItem("rose_stockLogs", JSON.stringify(d.stockLogs));
            localStorage.setItem("rose_ongoingServices", JSON.stringify(d.ongoingServices || []));

            if (d.staffs.length > 0 && !d.staffs.some((s: any) => s.code === activeStaffName)) {
              setActiveStaffName(d.staffs[0].code);
            }
            return;
          }
        }
      } catch (err) {
        console.warn("Database connection failed, falling back to local storage:", err);
      }

      // Fallback local storage logic
      try {
        const storedCust = localStorage.getItem("rose_customerPamper");
        const storedLog = localStorage.getItem("rose_servicesLog");
        const storedPay = localStorage.getItem("rose_paymentTransactions");
        const storedSuppMon = localStorage.getItem("rose_suppliesMonitoring");
        const storedSuppReq = localStorage.getItem("rose_suppliesRequest");
        const storedPayslips = localStorage.getItem("rose_staffPayslips");
        const storedSales = localStorage.getItem("rose_salesSummary");
        const storedServices = localStorage.getItem("rose_services");
        const storedStaffs = localStorage.getItem("rose_staffs");
        const storedOngoing = localStorage.getItem("rose_ongoingServices");
        const storedStocks = localStorage.getItem("rose_stocks");
        const storedStockLogs = localStorage.getItem("rose_stockLogs");

        if (storedCust) setCustomerPamper(JSON.parse(storedCust));
        else setCustomerPamper(customerPamperSeed);

        if (storedOngoing) setOngoingServices(JSON.parse(storedOngoing));

        if (storedLog) {
          const parsedLog = JSON.parse(storedLog);
          if (parsedLog.length <= 6) {
            setServicesLog(servicesLogSeed);
            localStorage.setItem("rose_servicesLog", JSON.stringify(servicesLogSeed));
          } else {
            setServicesLog(parsedLog);
          }
        } else {
          setServicesLog(servicesLogSeed);
          localStorage.setItem("rose_servicesLog", JSON.stringify(servicesLogSeed));
        }

        if (storedPay) setPaymentTransactions(JSON.parse(storedPay));
        else setPaymentTransactions(paymentMonitoringSeed);

        if (storedSuppMon) setSuppliesMonitoring(JSON.parse(storedSuppMon));
        else setSuppliesMonitoring(suppliesMonitoringSeed);

        if (storedSuppReq) setSuppliesRequest(JSON.parse(storedSuppReq));
        else setSuppliesRequest(suppliesRequestSeed);

        if (storedPayslips) setStaffPayslips(JSON.parse(storedPayslips));
        else setStaffPayslips(staffPayslipsSeed);

        if (storedSales) setSalesSummary(JSON.parse(storedSales));
        else setSalesSummary(salesSummarySeed);

        if (storedServices) setServices(JSON.parse(storedServices));
        else {
          setServices(defaultServices);
          localStorage.setItem("rose_services", JSON.stringify(defaultServices));
        }

        if (storedStocks) setStocks(JSON.parse(storedStocks));
        else {
          setStocks(defaultStockItems);
          localStorage.setItem("rose_stocks", JSON.stringify(defaultStockItems));
        }

        if (storedStockLogs) setStockLogs(JSON.parse(storedStockLogs));
        else {
          setStockLogs(defaultStockLogs);
          localStorage.setItem("rose_stockLogs", JSON.stringify(defaultStockLogs));
        }

        if (storedStaffs) {
          const parsedStaffs = JSON.parse(storedStaffs);
          if (parsedStaffs.length <= 6) {
            setStaffs(staffSeed);
            localStorage.setItem("rose_staffs", JSON.stringify(staffSeed));
            if (staffSeed.length > 0 && !staffSeed.some((s: any) => s.code === activeStaffName)) {
              setActiveStaffName(staffSeed[0].code);
            }
          } else {
            setStaffs(parsedStaffs);
            if (parsedStaffs.length > 0 && !parsedStaffs.some((s: any) => s.code === activeStaffName)) {
              setActiveStaffName(parsedStaffs[0].code);
            }
          }
        } else {
          setStaffs(staffSeed);
          localStorage.setItem("rose_staffs", JSON.stringify(staffSeed));
          if (staffSeed.length > 0 && !staffSeed.some((s: any) => s.code === activeStaffName)) {
            setActiveStaffName(staffSeed[0].code);
          }
        }
      } catch (e) {
        console.error("Failed to load local storage", e);
        setCustomerPamper(customerPamperSeed);
        setServicesLog(servicesLogSeed);
        setPaymentTransactions(paymentMonitoringSeed);
        setSuppliesMonitoring(suppliesMonitoringSeed);
        setSuppliesRequest(suppliesRequestSeed);
        setStaffPayslips(staffPayslipsSeed);
        setSalesSummary(salesSummarySeed);
        setServices(defaultServices);
        setStaffs(staffSeed);
        setStocks(defaultStockItems);
        setStockLogs(defaultStockLogs);
        setOngoingServices([
          {
            id: "demo-ongoing-1",
            customerName: "Patricia Lopez",
            services: [
              { id: "s-1", service: "Keratin Treatment & Trim", price: 1200, commissionRate: 0.27 }
            ],
            staffCode: "ETET",
            startTime: new Date(Date.now() - 35 * 60000).toISOString(),
            date: new Date().toISOString().split("T")[0]
          }
        ]);
      }
    };

    loadInitialData();
  }, []);

  // Save changes to localStorage helper and sync to MySQL database
  const saveState = async (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
    try {
      await fetch('/api/db/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, data })
      });
    } catch (err) {
      console.error("Failed to sync to database:", err);
    }
  };

  const handleResetData = async () => {
    if (confirm("Are you sure you want to restore the database to the spreadsheet seeds? All edits will be overwritten.")) {
      localStorage.clear();
      
      setCustomerPamper(customerPamperSeed);
      await saveState("rose_customerPamper", customerPamperSeed);

      setServicesLog(servicesLogSeed);
      await saveState("rose_servicesLog", servicesLogSeed);

      setPaymentTransactions(paymentMonitoringSeed);
      await saveState("rose_paymentTransactions", paymentMonitoringSeed);

      setSuppliesMonitoring(suppliesMonitoringSeed);
      await saveState("rose_suppliesMonitoring", suppliesMonitoringSeed);

      setSuppliesRequest(suppliesRequestSeed);
      await saveState("rose_suppliesRequest", suppliesRequestSeed);

      setStaffPayslips(staffPayslipsSeed);
      await saveState("rose_staffPayslips", staffPayslipsSeed);

      setSalesSummary(salesSummarySeed);
      await saveState("rose_salesSummary", salesSummarySeed);

      setServices(defaultServices);
      await saveState("rose_services", defaultServices);

      setStaffs(staffSeed);
      await saveState("rose_staffs", staffSeed);

      setStocks(defaultStockItems);
      await saveState("rose_stocks", defaultStockItems);

      setStockLogs(defaultStockLogs);
      await saveState("rose_stockLogs", defaultStockLogs);

      const defaultOngoing = [
        {
          id: "demo-ongoing-1",
          customerName: "Patricia Lopez",
          services: [
            { id: "s-1", service: "Keratin Treatment & Trim", price: 1200, commissionRate: 0.27 }
          ],
          staffCode: "ETET",
          startTime: new Date(Date.now() - 35 * 60000).toISOString(),
          date: new Date().toISOString().split("T")[0]
        }
      ];
      setOngoingServices(defaultOngoing);
      await saveState("rose_ongoingServices", defaultOngoing);

      alert("Database reset to spreadsheet seed data successfully.");
    }
  };

  // Auth Operations
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setLoginUsername("");
        setLoginPassword("");
      } else {
        setLoginError(data.error || "Authentication failed. Try again.");
      }
    } catch (err) {
      setLoginError("Could not connect to authentication server.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        setIsAuthenticated(false);
      } catch (e) {
        console.error("Logout failed", e);
        setIsAuthenticated(false);
      }
    }
  };

  // Dashboard calculations
  const dashboardStats = useMemo(() => {
    let totalGross = 0;
    let totalExpenses = 0;
    let totalComi = 0;
    let totalNet = 0;
    let totalRose = 0;

    Object.values(salesSummary).forEach((m) => {
      m.records.forEach((r) => {
        totalGross += r.gross || 0;
        totalExpenses += r.exp || 0;
        totalComi += r.comi || 0;
        totalNet += r.netSales || 0;
        totalRose += r.roseShare || 0;
      });
    });

    if (totalGross === 0) {
      totalGross = 184500;
      totalExpenses = 34500;
      totalComi = 52300;
      totalNet = 97700;
      totalRose = 42100;
    }

    return {
      gross: totalGross,
      expenses: totalExpenses,
      commissions: totalComi,
      net: totalNet,
      roseShare: totalRose
    };
  }, [salesSummary]);

  const monthlyChartData = useMemo(() => {
    return Object.keys(salesSummary)
      .filter((k) => k !== "2027 ")
      .map((k) => {
        const monthInfo = salesSummary[k];
        let grossSum = 0;
        let netSum = 0;
        monthInfo.records.forEach((r) => {
          grossSum += r.gross || 0;
          netSum += r.netSales || 0;
        });
        return {
          key: k,
          monthName: monthInfo.monthName,
          gross: grossSum,
          net: netSum
        };
      });
  }, [salesSummary]);

  const staffChartData = useMemo(() => {
    const activeMonthData = salesSummary[activeMonthKey];
    if (!activeMonthData) return [];

    const staffTotals: { [name: string]: number } = {};
    activeMonthData.records.forEach((r) => {
      Object.entries(r.staffSales).forEach(([name, amount]) => {
        staffTotals[name] = (staffTotals[name] || 0) + amount;
      });
    });

    return Object.entries(staffTotals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 7);
  }, [salesSummary, activeMonthKey]);

  const orderedStaffKeys = useMemo(() => {
    const directoryCodes = staffs.map(s => s.code.toUpperCase());
    const monthData = salesSummary[activeMonthKey];
    const extraCodesSet = new Set<string>();
    
    if (monthData) {
      if (monthData.rates) {
        Object.keys(monthData.rates).forEach(k => {
          const upperK = k.toUpperCase();
          if (!directoryCodes.includes(upperK)) {
            extraCodesSet.add(upperK);
          }
        });
      }
      monthData.records.forEach(r => {
        if (r.staffSales) {
          Object.keys(r.staffSales).forEach(k => {
            const upperK = k.toUpperCase();
            if (!directoryCodes.includes(upperK)) {
              extraCodesSet.add(upperK);
            }
          });
        }
      });
    }
    
    const extraCodes = Array.from(extraCodesSet).sort();
    return [...directoryCodes, ...extraCodes];
  }, [salesSummary, activeMonthKey, staffs]);

  const activeStaffPayslipInfo = useMemo(() => {
    const staff = staffs.find(s => s.code === activeStaffName);
    const name = staff ? staff.name : activeStaffName;
    const rawRecords = staffPayslips[activeStaffName] || [];

    // Filter out the aggregate row (date is empty) for the ledger table
    const ledger = rawRecords.filter(r => r.date !== "");
    // The aggregate row (date is "") has the precomputed totals
    const aggregateRow = rawRecords.find(r => r.date === "");

    const totalComi = aggregateRow ? (aggregateRow.service1Comi + aggregateRow.service2Comi) : 0;
    const totalDaily = aggregateRow ? aggregateRow.dailyRate : 0;
    const totalCA = aggregateRow ? aggregateRow.ca : 0;
    const utang = 0; // Default other deductions
    const netPay = aggregateRow ? aggregateRow.netTotal : 0;

    return {
      name,
      totalComi,
      totalDaily,
      totalCA,
      utang,
      netPay,
      ledger
    };
  }, [staffPayslips, activeStaffName, staffs]);

  // --- RENDER LOADING STATE ---
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-on-surface-variant animate-pulse">Loading Rose Beau Portal...</span>
      </div>
    );
  }

  // --- RENDER LOGIN VIEW ---
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-4">
        <div className="bg-surface border border-outline rounded-3xl p-8 w-full max-w-md flex flex-col gap-6 shadow-xl animate-fadeIn">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-medium text-2xl shadow-md border border-primary/20">
              RB
            </div>
            <h2 className="text-xl font-bold tracking-tight text-on-surface mt-2">Rose Beau Salon Dashboard</h2>
            <p className="text-xs text-on-surface-variant max-w-[280px]">
              Manage salon checkouts, bookings, staff payslips, and inventory.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-on-surface-variant">Username</label>
              <input
                type="text"
                required
                placeholder="e.g. admin"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="bg-white border border-outline px-4 py-3 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-on-surface-variant">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="bg-white border border-outline px-4 py-3 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium transition"
              />
            </div>

            {loginError && (
              <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl">
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-primary hover:bg-primary-hover disabled:bg-zinc-350 text-white font-bold py-3 rounded-xl transition shadow-md hover:shadow-lg mt-2 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </>
              ) : "Log In"}
            </button>
          </form>

          <div className="mt-2 p-3.5 bg-primary/5 rounded-xl border border-primary/10 text-[11px] text-primary text-center font-medium leading-relaxed">
            🔑 System Default: <span className="font-bold">admin</span> / <span className="font-bold">adminadmin</span>
            <br />
            <span className="text-[10px] text-on-surface-variant mt-0.5 block">Log in to manage the salon</span>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER PORTAL DASHBOARD VIEW ---
  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-background text-on-surface font-sans">

      {/* -------------------- SIDEBAR / NAVIGATION -------------------- */}
      <Sidebar
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        handleResetData={handleResetData}
        handleLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* -------------------- MAIN WORKSPACE -------------------- */}
      <main className="flex-1 flex flex-col p-6 m-4 md:m-5 md:ml-0 bg-white rounded-3xl overflow-x-hidden relative shadow-md border border-outline">
        {activePanel === 'dashboard' && (
          <DashboardPanel
            dashboardStats={dashboardStats}
            monthlyChartData={monthlyChartData}
            staffChartData={staffChartData}
            activeMonthKey={activeMonthKey}
            setActiveMonthKey={setActiveMonthKey}
            salesSummary={salesSummary}
            customerPamper={customerPamper}
            suppliesRequest={suppliesRequest}
            setActivePanel={setActivePanel}
            stocks={stocks}
          />
        )}

        {activePanel === 'pos' && (
          <PosPanel
            services={services}
            staffs={staffs}
            salesSummary={salesSummary}
            setSalesSummary={setSalesSummary}
            paymentTransactions={paymentTransactions}
            setPaymentTransactions={setPaymentTransactions}
            servicesLog={servicesLog}
            setServicesLog={setServicesLog}
            saveState={saveState}
            ongoingServices={ongoingServices}
            setOngoingServices={setOngoingServices}
            activeOngoingId={activeOngoingId}
            setActiveOngoingId={setActiveOngoingId}
            stocks={stocks}
            setStocks={setStocks}
            stockLogs={stockLogs}
            setStockLogs={setStockLogs}
          />
        )}

        {activePanel === 'queue' && (
          <QueuePanel
            services={services}
            staffs={staffs}
            ongoingServices={ongoingServices}
            setOngoingServices={setOngoingServices}
            setActiveOngoingId={setActiveOngoingId}
            setActivePanel={setActivePanel}
            saveState={saveState}
          />
        )}

        {activePanel === 'bookings' && (
          <BookingsPanel
            customerPamper={customerPamper}
            setCustomerPamper={setCustomerPamper}
            saveState={saveState}
          />
        )}

        {activePanel === 'servicesLog' && (
          <ServicesLogPanel
            servicesLog={servicesLog}
            setServicesLog={setServicesLog}
            services={services}
            staffs={staffs}
            saveState={saveState}
          />
        )}

        {activePanel === 'salesLedger' && (
          <SalesLedgerPanel
            salesSummary={salesSummary}
            setSalesSummary={setSalesSummary}
            activeMonthKey={activeMonthKey}
            setActiveMonthKey={setActiveMonthKey}
            orderedStaffKeys={orderedStaffKeys}
            saveState={saveState}
            staffs={staffs}
          />
        )}

        {activePanel === 'staffs' && (
          <StaffsPanel
            staffs={staffs}
            setStaffs={setStaffs}
            activeStaffName={activeStaffName}
            setActiveStaffName={setActiveStaffName}
            saveState={saveState}
          />
        )}

        {activePanel === 'payslips' && (
          <PayslipsPanel
            staffPayslips={staffPayslips}
            activeStaffName={activeStaffName}
            setActiveStaffName={setActiveStaffName}
            staffs={staffs}
            activeStaffPayslipInfo={activeStaffPayslipInfo}
          />
        )}

        {activePanel === 'payments' && (
          <PaymentsPanel
            paymentTransactions={paymentTransactions}
            setPaymentTransactions={setPaymentTransactions}
            saveState={saveState}
          />
        )}

        {activePanel === 'supplies' && (
          <SuppliesPanel
            suppliesMonitoring={suppliesMonitoring}
            setSuppliesMonitoring={setSuppliesMonitoring}
            suppliesRequest={suppliesRequest}
            setSuppliesRequest={setSuppliesRequest}
            staffs={staffs}
            saveState={saveState}
          />
        )}

        {activePanel === 'services' && (
          <ServicesPanel
            services={services}
            setServices={setServices}
            saveState={saveState}
          />
        )}

        {activePanel === 'stocks' && (
          <StocksPanel
            stocks={stocks}
            setStocks={setStocks}
            stockLogs={stockLogs}
            setStockLogs={setStockLogs}
            staffs={staffs}
            saveState={saveState}
          />
        )}
      </main>
    </div>
  );
}
