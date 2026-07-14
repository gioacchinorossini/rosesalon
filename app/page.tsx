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
  CustomerPamper,
  PaymentTransaction,
  SuppliesMonitoringLog,
  SuppliesRequest,
  StaffDailyPayslipRecord,
  MonthlySalesSummary,
  StaffMember,
  ServiceItem,
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

const defaultServices: ServiceItem[] = [
  { id: "1", name: "Balayage Hair Color", category: "Hair", price: 3500, commissionRate: 0.27 },
  { id: "2", name: "Keratin Treatment", category: "Hair", price: 1200, commissionRate: 0.27 },
  { id: "3", name: "Haircut", category: "Hair", price: 500, commissionRate: 0.36 },
  { id: "4", name: "Gel Manicure", category: "Nails", price: 600, commissionRate: 0.27 },
  { id: "5", name: "Eyelash Extension", category: "Aesthetic", price: 1500, commissionRate: 0.16 },
  { id: "6", name: "Facial Care & Treatment", category: "Aesthetic", price: 1000, commissionRate: 0.16 }
];

type ActivePanel = 'dashboard' | 'salesLedger' | 'pos' | 'services' | 'payslips' | 'payments' | 'bookings' | 'supplies' | 'staffs';

export default function Home() {
  const [activePanel, setActivePanel] = useState<ActivePanel>('dashboard');

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // App State - Seeding from initialData
  const [customerPamper, setCustomerPamper] = useState<CustomerPamper[]>([]);
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([]);
  const [suppliesMonitoring, setSuppliesMonitoring] = useState<SuppliesMonitoringLog[]>([]);
  const [suppliesRequest, setSuppliesRequest] = useState<SuppliesRequest[]>([]);
  const [staffPayslips, setStaffPayslips] = useState<{ [staffName: string]: StaffDailyPayslipRecord[] }>({});
  const [salesSummary, setSalesSummary] = useState<{ [monthKey: string]: MonthlySalesSummary }>({});
  const [staffs, setStaffs] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

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

    try {
      const storedCust = localStorage.getItem("rose_customerPamper");
      const storedPay = localStorage.getItem("rose_paymentTransactions");
      const storedSuppMon = localStorage.getItem("rose_suppliesMonitoring");
      const storedSuppReq = localStorage.getItem("rose_suppliesRequest");
      const storedPayslips = localStorage.getItem("rose_staffPayslips");
      const storedSales = localStorage.getItem("rose_salesSummary");
      const storedServices = localStorage.getItem("rose_services");
      const storedStaffs = localStorage.getItem("rose_staffs");

      if (storedCust) setCustomerPamper(JSON.parse(storedCust));
      else setCustomerPamper(customerPamperSeed);

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

      if (storedStaffs) {
        const parsed = JSON.parse(storedStaffs);
        setStaffs(parsed);
        if (parsed.length > 0 && !parsed.some((s: any) => s.code === activeStaffName)) {
          setActiveStaffName(parsed[0].code);
        }
      } else {
        setStaffs(staffSeed);
        localStorage.setItem("rose_staffs", JSON.stringify(staffSeed));
      }
    } catch (e) {
      console.error("Failed to load local storage", e);
      setCustomerPamper(customerPamperSeed);
      setPaymentTransactions(paymentMonitoringSeed);
      setSuppliesMonitoring(suppliesMonitoringSeed);
      setSuppliesRequest(suppliesRequestSeed);
      setStaffPayslips(staffPayslipsSeed);
      setSalesSummary(salesSummarySeed);
      setServices(defaultServices);
      setStaffs(staffSeed);
    }
  }, []);

  // Save changes to localStorage helper
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to restore the database to the spreadsheet seeds? All edits will be overwritten.")) {
      localStorage.clear();
      setCustomerPamper(customerPamperSeed);
      setPaymentTransactions(paymentMonitoringSeed);
      setSuppliesMonitoring(suppliesMonitoringSeed);
      setSuppliesRequest(suppliesRequestSeed);
      setStaffPayslips(staffPayslipsSeed);
      setSalesSummary(salesSummarySeed);
      setServices(defaultServices);
      setStaffs(staffSeed);
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
      </main>
    </div>
  );
}
