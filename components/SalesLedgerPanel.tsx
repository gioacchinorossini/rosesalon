import React, { useState } from "react";
import { Icons } from "./Icons";
import { DailySalesSummaryRecord, MonthlySalesSummary, StaffMember } from "../app/data/initialData";

interface SalesLedgerPanelProps {
  salesSummary: { [monthKey: string]: MonthlySalesSummary };
  setSalesSummary: React.Dispatch<React.SetStateAction<{ [monthKey: string]: MonthlySalesSummary }>>;
  activeMonthKey: string;
  setActiveMonthKey: (key: string) => void;
  orderedStaffKeys: string[];
  saveState: (key: string, val: any) => void;
  staffs: StaffMember[];
}

export const SalesLedgerPanel: React.FC<SalesLedgerPanelProps> = ({
  salesSummary,
  setSalesSummary,
  activeMonthKey,
  setActiveMonthKey,
  orderedStaffKeys,
  saveState,
  staffs,
}) => {
  // Modal states
  const [showAddDailyRecordModal, setShowAddDailyRecordModal] = useState(false);
  const [showEditLedgerModal, setShowEditLedgerModal] = useState(false);

  // View mode and expanded states
  const [viewMode, setViewMode] = useState<"staff" | "date">("staff");
  const [expandedStaffCode, setExpandedStaffCode] = useState<string | null>(null);

  // Edit ledger state
  const [activeLedgerRecord, setActiveLedgerRecord] = useState<DailySalesSummaryRecord | null>(null);
  const [editedLedgerGross, setEditedLedgerGross] = useState(0);
  const [editedLedgerExp, setEditedLedgerExp] = useState(0);
  const [editedLedgerDaily, setEditedLedgerDaily] = useState(0);
  const [editedLedgerStaffSales, setEditedLedgerStaffSales] = useState<{ [name: string]: number }>({});

  // Add ledger state
  const [newDailyDate, setNewDailyDate] = useState("");
  const [newDailyExp, setNewDailyExp] = useState<number>(0);
  const [newDailyRateVal, setNewDailyRateVal] = useState<number>(200);

  const handleOpenEditLedger = (record: DailySalesSummaryRecord) => {
    setActiveLedgerRecord(record);
    setEditedLedgerGross(record.gross);
    setEditedLedgerExp(record.exp);
    setEditedLedgerDaily(record.daily);
    setEditedLedgerStaffSales({ ...record.staffSales });
    setShowEditLedgerModal(true);
  };

  const handleSaveLedgerEdit = (monthKey: string) => {
    if (!activeLedgerRecord) return;
    const date = activeLedgerRecord.date;
    const monthData = salesSummary[monthKey];
    if (!monthData) return;

    const recordsCopy = [...monthData.records];
    const recIndex = recordsCopy.findIndex(r => r.date === date);

    if (recIndex >= 0) {
      const rec = recordsCopy[recIndex];
      rec.exp = Number(editedLedgerExp) || 0;
      rec.daily = Number(editedLedgerDaily) || 0;
      rec.staffSales = { ...editedLedgerStaffSales };

      const totalStaff = Object.values(rec.staffSales).reduce((sum, v) => sum + v, 0);
      rec.gross = totalStaff || Number(editedLedgerGross) || 0;
      rec.comi = Object.entries(rec.staffSales).reduce((sum, [name, val]) => sum + (val * 0.27), 0);

      rec.netSales = rec.gross - rec.exp - rec.daily - rec.comi;
      rec.roseShare = rec.netSales;

      const updated = {
        ...salesSummary,
        [monthKey]: {
          ...monthData,
          records: recordsCopy
        }
      };
      setSalesSummary(updated);
      saveState("rose_salesSummary", updated);
    }
    setShowEditLedgerModal(false);
    setActiveLedgerRecord(null);
  };

  const handleAddDailyRecord = (monthKey: string) => {
    const monthData = salesSummary[monthKey];
    if (!monthData) return;

    if (!newDailyDate) {
      alert("Please select a date.");
      return;
    }

    const recordsCopy = [...monthData.records];
    if (recordsCopy.some(r => r.date === newDailyDate)) {
      alert("A record already exists for this date.");
      return;
    }

    const newRec: DailySalesSummaryRecord = {
      date: newDailyDate,
      staffSales: {},
      gross: 0,
      exp: Number(newDailyExp),
      daily: Number(newDailyRateVal),
      comi: 0,
      netSales: 0,
      roseShare: 0
    };

    orderedStaffKeys.forEach(s => {
      newRec.staffSales[s] = 0;
    });

    recordsCopy.push(newRec);
    recordsCopy.sort((a, b) => a.date.localeCompare(b.date));

    const updated = {
      ...salesSummary,
      [monthKey]: {
        ...monthData,
        records: recordsCopy
      }
    };

    setSalesSummary(updated);
    saveState("rose_salesSummary", updated);
    setShowAddDailyRecordModal(false);
    setNewDailyDate("");
    setNewDailyExp(0);
  };

  const handleDeleteDailyRecord = (monthKey: string, date: string) => {
    if (confirm(`Are you sure you want to delete the daily record row for date ${date}?`)) {
      const monthData = salesSummary[monthKey];
      if (!monthData) return;
      const recordsCopy = monthData.records.filter(r => r.date !== date);
      const updated = {
        ...salesSummary,
        [monthKey]: {
          ...monthData,
          records: recordsCopy
        }
      };
      setSalesSummary(updated);
      saveState("rose_salesSummary", updated);
    }
  };

  const activeMonthData = salesSummary[activeMonthKey];
  const records = activeMonthData?.records || [];

  // Compute staff summaries for the month
  const staffSummaries = orderedStaffKeys.map(s => {
    const staffObj = staffs.find(st => st.code.toUpperCase() === s.toUpperCase());
    const displayName = staffObj ? staffObj.name : s;
    const displayRole = staffObj ? staffObj.role : "Stylist";
    const dailyRateVal = activeMonthData?.rates?.[s] ?? staffObj?.dailyRate ?? 200;
    const commissionRateVal = staffObj?.commissionRate ?? 0.27;

    const totalGross = records.reduce((sum, r) => sum + (r.staffSales[s] || 0), 0);
    const daysWorked = records.filter(r => (r.staffSales[s] || 0) > 0).length;
    const totalComi = records.reduce((sum, r) => sum + ((r.staffSales[s] || 0) * commissionRateVal), 0);
    const totalDaily = daysWorked * dailyRateVal;
    const totalPayout = totalComi + totalDaily;
    const netShare = totalGross - totalPayout;

    // Daily records detail for this staff
    const dailyLogs = records
      .filter(r => (r.staffSales[s] || 0) > 0)
      .map(r => {
        const sales = r.staffSales[s] || 0;
        const comi = sales * commissionRateVal;
        const dailyRate = dailyRateVal;
        const payout = comi + dailyRate;
        const share = sales - payout;
        return {
          date: r.date,
          sales,
          comi,
          dailyRate,
          payout,
          share,
          originalRecord: r
        };
      });

    return {
      code: s,
      name: displayName,
      role: displayRole,
      dailyRate: dailyRateVal,
      commissionRate: commissionRateVal,
      totalGross,
      daysWorked,
      totalComi,
      totalDaily,
      totalPayout,
      netShare,
      dailyLogs
    };
  });

  const totalLedgerGross = records.reduce((sum, r) => sum + (r.gross || 0), 0);
  const totalStaffGross = staffSummaries.reduce((sum, st) => sum + st.totalGross, 0);
  const unallocatedSales = Math.max(0, totalLedgerGross - totalStaffGross);

  // Totals for staff view
  const staffTotalGross = totalStaffGross + unallocatedSales;
  const staffTotalComi = staffSummaries.reduce((sum, st) => sum + st.totalComi, 0);
  const staffTotalDaily = staffSummaries.reduce((sum, st) => sum + st.totalDaily, 0);
  const staffTotalPayout = staffTotalComi + staffTotalDaily;
  const staffTotalShare = staffSummaries.reduce((sum, st) => sum + st.netShare, 0) + unallocatedSales;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">2026 Sales Ledgers</h2>
          <p className="text-xs text-on-surface-variant">Aggregated stylist performance logs and date-based ledger records</p>
        </div>
        <button
          onClick={() => setShowAddDailyRecordModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg self-start cursor-pointer"
        >
          <Icons.add className="w-4.5 h-4.5" />
          Add Daily Ledger
        </button>
      </div>

      {/* Month Tabs Bar */}
      <div className="flex flex-wrap gap-1 border-b border-outline/35 pb-1 overflow-x-auto">
        {Object.keys(salesSummary).map((mKey) => {
          const isActive = activeMonthKey === mKey;
          return (
            <button
              key={mKey}
              onClick={() => setActiveMonthKey(mKey)}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition duration-155 cursor-pointer ${isActive
                  ? 'border-primary text-primary bg-primary-container/20'
                  : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
            >
              {salesSummary[mKey]?.monthName || mKey}
            </button>
          );
        })}
      </div>

      {/* View Toggle Bar */}
      <div className="flex bg-surface-container-low border border-outline p-1 rounded-xl self-start gap-1">
        <button
          onClick={() => setViewMode("staff")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            viewMode === "staff"
              ? "bg-primary text-white shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container/40 hover:text-on-surface"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
          <span>Staff Performance View</span>
        </button>
        <button
          onClick={() => setViewMode("date")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            viewMode === "date"
              ? "bg-primary text-white shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container/40 hover:text-on-surface"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
          <span>Daily Salon Ledger</span>
        </button>
      </div>

      {/* Main Ledger Table Card */}
      <div className="bg-surface border border-outline rounded-2xl overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 bg-surface-container-low border-b border-outline flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            Active Month: {activeMonthData?.monthName} 2026 ({viewMode === "staff" ? "By Staff Row" : "By Date Row"})
          </span>
          <span className="text-[10px] text-primary font-bold bg-primary-container/30 px-3 py-1.5 rounded-lg border border-primary/10 self-start flex items-center gap-1">
            {viewMode === "staff" 
              ? "Click on any stylist's row to expand and view their individual daily contributions." 
              : "Tip: Click the Edit button on any row to update financials securely."}
          </span>
        </div>

        {viewMode === "staff" ? (
          /* STAFF-BASED LEDGER TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline font-bold">
                  <th className="p-3 w-8"></th>
                  <th className="p-3">STYLIST / STAFF</th>
                  <th className="p-3 text-center">DAYS WORKED</th>
                  <th className="p-3 text-right">TOTAL GROSS SALES</th>
                  <th className="p-3 text-right">COMMISSION RATE</th>
                  <th className="p-3 text-right">TOTAL COMMISSIONS</th>
                  <th className="p-3 text-right">DAILY WAGES</th>
                  <th className="p-3 text-right">TOTAL PAYOUT</th>
                  <th className="p-3 text-right text-emerald-800 font-extrabold">NET SALON SHARE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10 font-medium">
                {staffSummaries.map((st) => {
                  const isExpanded = expandedStaffCode === st.code;
                  return (
                    <React.Fragment key={st.code}>
                      <tr 
                        onClick={() => setExpandedStaffCode(isExpanded ? null : st.code)}
                        className="hover:bg-surface-container-low/20 transition cursor-pointer font-medium"
                      >
                        <td className="p-3 text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className={`w-4 h-4 text-on-surface-variant transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                          >
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                          </svg>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-on-surface">{st.name}</div>
                          <div className="text-[10px] text-on-surface-variant font-semibold uppercase">{st.code} • {st.role}</div>
                        </td>
                        <td className="p-3 text-center font-bold text-on-surface font-mono">{st.daysWorked}</td>
                        <td className="p-3 text-right font-bold text-on-surface font-mono">
                          ₱{st.totalGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right text-on-surface-variant font-mono">{(st.commissionRate * 100).toFixed(0)}%</td>
                        <td className="p-3 text-right text-on-surface-variant font-mono">
                          ₱{st.totalComi.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right text-on-surface-variant font-mono">
                          ₱{st.totalDaily.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right font-bold text-primary font-mono">
                          ₱{st.totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-800 font-mono">
                          ₱{st.netShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>

                      {/* Expanded Sub-table */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="bg-surface-container-low/40 p-4 border-t border-b border-outline/25">
                            <div className="rounded-xl border border-outline bg-white overflow-hidden shadow-inner max-w-4xl mx-auto my-1">
                              <div className="p-3 bg-surface-container-low border-b border-outline flex justify-between items-center">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                  <span>Daily Performance Breakdown for {st.name} ({st.code})</span>
                                </span>
                              </div>
                              {st.dailyLogs.length === 0 ? (
                                <div className="p-4 text-center text-on-surface-variant text-[11px] font-medium">
                                  No daily log entries found for this stylist in {activeMonthData?.monthName}.
                                </div>
                              ) : (
                                <table className="w-full text-left border-collapse text-[11px]">
                                  <thead>
                                    <tr className="bg-surface-container-low/60 text-on-surface-variant border-b border-outline font-bold">
                                      <th className="p-2.5">DATE</th>
                                      <th className="p-2.5 text-right">GROSS SALES</th>
                                      <th className="p-2.5 text-right">BASE DAILY WAGE</th>
                                      <th className="p-2.5 text-right font-semibold">COMMISSION ({(st.commissionRate * 100).toFixed(0)}%)</th>
                                      <th className="p-2.5 text-right text-primary font-bold">STYLIST PAYOUT</th>
                                      <th className="p-2.5 text-right text-emerald-800 font-extrabold">SALON SHARE</th>
                                      <th className="p-2.5 text-center">ACTION</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-outline/10 font-mono">
                                    {st.dailyLogs.map((log) => (
                                      <tr key={log.date} className="hover:bg-surface-container-low/20 transition">
                                        <td className="p-2.5 font-bold text-on-surface font-sans">{log.date}</td>
                                        <td className="p-2.5 text-right text-on-surface font-bold">
                                          ₱{log.sales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-2.5 text-right text-on-surface-variant">
                                          ₱{log.dailyRate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-2.5 text-right text-on-surface-variant">
                                          ₱{log.comi.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-2.5 text-right text-primary font-bold">
                                          ₱{log.payout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-2.5 text-right text-emerald-800 font-bold">
                                          ₱{log.share.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-2.5 text-center">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenEditLedger(log.originalRecord);
                                            }}
                                            className="text-primary hover:underline font-bold text-[10px] cursor-pointer font-sans"
                                          >
                                            Edit
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Shop / Unallocated Sales Row */}
                {unallocatedSales > 0 && (
                  <tr className="bg-surface-container-low/25 text-on-surface font-medium border-t border-outline">
                    <td className="p-3"></td>
                    <td className="p-3">
                      <div className="font-bold text-on-surface flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg><span>Other / Shop Sales</span></div>
                      <div className="text-[10px] text-on-surface-variant font-semibold uppercase">Product or Non-Stylist Revenue</div>
                    </td>
                    <td className="p-3 text-center font-mono">-</td>
                    <td className="p-3 text-right font-bold font-mono">
                      ₱{unallocatedSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono">0%</td>
                    <td className="p-3 text-right font-mono">₱0.00</td>
                    <td className="p-3 text-right font-mono">₱0.00</td>
                    <td className="p-3 text-right font-bold text-primary font-mono">₱0.00</td>
                    <td className="p-3 text-right text-emerald-800 font-bold font-mono">
                      ₱{unallocatedSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-surface-container-low/40 text-on-surface font-bold border-t-2 border-outline">
                  <td className="p-3"></td>
                  <td className="p-3 uppercase font-extrabold">TOTALS</td>
                  <td className="p-3 font-mono"></td>
                  <td className="p-3 text-right font-mono font-black text-on-surface">
                    ₱{staffTotalGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right"></td>
                  <td className="p-3 text-right font-mono">
                    ₱{staffTotalComi.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono">
                    ₱{staffTotalDaily.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-primary">
                    ₱{staffTotalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right text-emerald-800 font-black font-mono">
                    ₱{staffTotalShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          /* DATE-BASED LEDGER TABLE (CLEAN, NO EXTRA HORIZONTAL SCROLL) */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline font-bold">
                  <th className="p-3 bg-surface-container-low">DATE</th>
                  <th className="p-3 text-right">GROSS SALES</th>
                  <th className="p-3 text-right">SALON EXPENSES</th>
                  <th className="p-3 text-right">DAILY STAFF RATE</th>
                  <th className="p-3 text-right">TOTAL COMMISSIONS</th>
                  <th className="p-3 text-right text-emerald-800 font-extrabold">NET SALES (ROSE)</th>
                  <th className="p-3 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10">
                {records.map((r) => (
                  <tr key={r.date} className="hover:bg-surface-container-low/20 transition">
                    <td className="p-3 font-bold text-on-surface whitespace-nowrap">{r.date}</td>
                    <td className="p-3 text-right font-bold text-on-surface font-mono">
                      ₱{(r.gross || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {r.exp > 0 ? `₱${r.exp.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                    </td>
                    <td className="p-3 text-right text-on-surface-variant font-mono">
                      ₱{(r.daily || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right text-on-surface-variant font-mono">
                      ₱{(r.comi || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-800 font-mono">
                      ₱{(r.netSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleOpenEditLedger(r)}
                        className="text-primary hover:underline font-bold text-[11px] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDailyRecord(activeMonthKey, r.date)}
                        className="text-red-500 hover:text-red-750 transition cursor-pointer"
                        title="Delete daily row"
                      >
                        <Icons.delete className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-container-low/40 text-on-surface font-bold border-t-2 border-outline">
                  <td className="p-3 uppercase font-extrabold">TOTALS</td>
                  <td className="p-3 text-right font-mono font-black text-on-surface">
                    ₱{totalLedgerGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono">
                    ₱{records.reduce((s, r) => s + (r.exp || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono">
                    ₱{records.reduce((s, r) => s + (r.daily || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono">
                    ₱{records.reduce((s, r) => s + (r.comi || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right text-emerald-800 font-black font-mono">
                    ₱{records.reduce((s, r) => s + (r.netSales || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: ADD DAILY LEDGER ROW */}
      {showAddDailyRecordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface border border-outline rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-on-surface">Add Daily Ledger Entry</h3>
              <p className="text-xs text-on-surface-variant">Create a blank daily record for the ledger</p>
            </div>
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-on-surface-variant">Date</label>
                <input
                  type="date"
                  value={newDailyDate}
                  onChange={(e) => setNewDailyDate(e.target.value)}
                  className="bg-white border border-outline px-3 py-2.5 rounded-lg text-sm font-semibold outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-on-surface-variant">Expenses (₱)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newDailyExp || ""}
                  onChange={(e) => setNewDailyExp(Number(e.target.value))}
                  className="bg-white border border-outline px-3 py-2.5 rounded-lg text-sm font-semibold outline-none font-mono font-bold"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-on-surface-variant">Default Daily Staff Rate (₱)</label>
                <input
                  type="number"
                  value={newDailyRateVal}
                  onChange={(e) => setNewDailyRateVal(Number(e.target.value))}
                  className="bg-white border border-outline px-3 py-2.5 rounded-lg text-sm font-semibold outline-none font-mono font-bold"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-outline/25">
              <button
                onClick={() => setShowAddDailyRecordModal(false)}
                className="px-4 py-2.5 border border-outline hover:bg-surface-container-low rounded-xl font-bold text-on-surface transition cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddDailyRecord(activeMonthKey)}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition cursor-pointer text-xs"
              >
                Add Row
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT LEDGER ROW SECURELY */}
      {showEditLedgerModal && activeLedgerRecord && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface border border-outline rounded-2xl p-6 w-full max-w-lg flex flex-col gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-on-surface">Update Daily Ledger Record</h3>
              <p className="text-xs text-on-surface-variant font-mono">Date: {activeLedgerRecord.date}</p>
            </div>

            <div className="flex flex-col gap-4 text-xs max-h-[460px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Daily Expenses (₱)</label>
                  <input
                    type="number"
                    value={editedLedgerExp || ""}
                    onChange={(e) => setEditedLedgerExp(Number(e.target.value))}
                    className="bg-white border border-outline px-3 py-2 rounded-lg text-sm font-semibold outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Daily Staff Rate (₱)</label>
                  <input
                    type="number"
                    value={editedLedgerDaily || ""}
                    onChange={(e) => setEditedLedgerDaily(Number(e.target.value))}
                    className="bg-white border border-outline px-3 py-2 rounded-lg text-sm font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-outline/25 pt-3">
                <h4 className="font-bold text-xs text-on-surface-variant uppercase tracking-wider mb-2">Stylist Sales Allocations</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {orderedStaffKeys.map(name => (
                    <div key={name} className="flex flex-col gap-1 bg-surface-container-low p-2.5 rounded-xl border border-outline">
                      <label className="font-bold uppercase tracking-wider text-[9px] text-primary">{name}</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={editedLedgerStaffSales[name] || ""}
                        onChange={(e) => setEditedLedgerStaffSales({
                          ...editedLedgerStaffSales,
                          [name]: Number(e.target.value) || 0
                        })}
                        className="bg-white border border-outline px-2.5 py-1.5 rounded-lg text-xs font-mono text-right outline-none font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-outline/25">
                <button
                  type="button"
                  onClick={() => { setShowEditLedgerModal(false); setActiveLedgerRecord(null); }}
                  className="px-4 py-2.5 border border-outline hover:bg-surface-container-low rounded-xl font-bold text-on-surface transition cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveLedgerEdit(activeMonthKey)}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
