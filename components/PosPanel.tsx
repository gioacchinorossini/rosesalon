import React, { useState, useMemo } from "react";
import { Icons } from "./Icons";
import { ServiceItem, StaffMember, PaymentTransaction, MonthlySalesSummary, DailySalesSummaryRecord } from "../app/data/initialData";

interface PosPanelProps {
  services: ServiceItem[];
  staffs: StaffMember[];
  salesSummary: { [monthKey: string]: MonthlySalesSummary };
  setSalesSummary: React.Dispatch<React.SetStateAction<{ [monthKey: string]: MonthlySalesSummary }>>;
  paymentTransactions: PaymentTransaction[];
  setPaymentTransactions: React.Dispatch<React.SetStateAction<PaymentTransaction[]>>;
  saveState: (key: string, val: any) => void;
}

export const PosPanel: React.FC<PosPanelProps> = ({
  services,
  staffs,
  salesSummary,
  setSalesSummary,
  paymentTransactions,
  setPaymentTransactions,
  saveState,
}) => {
  // Category filters
  const [posCategory, setPosCategory] = useState<'ALL' | 'Hair' | 'Nails' | 'Aesthetic' | 'Other'>('ALL');
  const [posSearch, setPosSearch] = useState("");

  // Cart & checkout states
  const [dsrServices, setDsrServices] = useState<Array<{ id: string; service: string; price: number; commissionRate?: number }>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rose_dsrServices");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [dsrBills, setDsrBills] = useState<{ [bill: number]: number }>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rose_dsrBills");
      return saved ? JSON.parse(saved) : { 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 1: 0 };
    }
    return { 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 1: 0 };
  });

  const [dsrDate, setDsrDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dsrStaff, setDsrStaff] = useState(() => staffs.find(s => s.status === 'Active')?.code || "");

  // Update states with local storage sync
  const updateDsrServices = (newVal: typeof dsrServices) => {
    setDsrServices(newVal);
    saveState("rose_dsrServices", newVal);
  };

  const updateDsrBills = (newVal: typeof dsrBills) => {
    setDsrBills(newVal);
    saveState("rose_dsrBills", newVal);
  };

  // Calculations
  const posServicesCatalog = useMemo(() => {
    return services.filter(s => {
      const matchCat = posCategory === 'ALL' || s.category === posCategory;
      const matchSearch = s.name.toLowerCase().includes(posSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, posCategory, posSearch]);

  const dsrTotalServices = useMemo(() => {
    return dsrServices.reduce((sum, s) => sum + s.price, 0);
  }, [dsrServices]);

  const dsrTotalCashCalculated = useMemo(() => {
    return Object.entries(dsrBills).reduce((sum, [bill, count]) => sum + (Number(bill) * count), 0);
  }, [dsrBills]);

  const dsrOverShort = useMemo(() => {
    return dsrTotalCashCalculated - dsrTotalServices;
  }, [dsrTotalCashCalculated, dsrTotalServices]);

  // Handlers
  const handleAddServiceToCart = (item: ServiceItem) => {
    const newRow = {
      id: (dsrServices.length + 1).toString() + "-" + Math.floor(Math.random() * 1000),
      service: item.name,
      price: item.price,
      commissionRate: item.commissionRate
    };
    updateDsrServices([...dsrServices, newRow]);
  };

  const handleDeleteDsrService = (id: string) => {
    updateDsrServices(dsrServices.filter(s => s.id !== id));
  };

  const handleAdjustDenom = (bill: number, amount: number) => {
    const newVal = {
      ...dsrBills,
      [bill]: Math.max(0, (dsrBills[bill] || 0) + amount)
    };
    updateDsrBills(newVal);
  };

  const handleSaveDsrToLedger = () => {
    const dateStr = dsrDate;
    const monthIndex = new Date(dateStr).getMonth();
    const monthsCodes = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthKey = monthsCodes[monthIndex];

    const currentMonthData = salesSummary[monthKey];
    if (!currentMonthData) {
      alert(`Month ${monthKey} is not in the 2026 ledger.`);
      return;
    }

    let recordsCopy = [...currentMonthData.records];
    let recordIndex = recordsCopy.findIndex(r => r.date === dateStr);

    let computedComi = 0;
    dsrServices.forEach(s => {
      const rate = s.commissionRate !== undefined ? s.commissionRate : 0.27;
      computedComi += s.price * rate;
    });

    const staffUpperName = dsrStaff.toUpperCase();

    if (recordIndex >= 0) {
      const oldVal = recordsCopy[recordIndex].staffSales[staffUpperName] || 0;
      recordsCopy[recordIndex].staffSales[staffUpperName] = dsrTotalServices;
      const sumStaff = Object.values(recordsCopy[recordIndex].staffSales).reduce((sum, v) => sum + v, 0);
      recordsCopy[recordIndex].gross = sumStaff;
      recordsCopy[recordIndex].comi = (recordsCopy[recordIndex].comi - (oldVal * 0.27)) + computedComi;
      recordsCopy[recordIndex].netSales = recordsCopy[recordIndex].gross - recordsCopy[recordIndex].exp - recordsCopy[recordIndex].daily - recordsCopy[recordIndex].comi;
      recordsCopy[recordIndex].roseShare = recordsCopy[recordIndex].netSales;
    } else {
      const newRec: DailySalesSummaryRecord = {
        date: dateStr,
        staffSales: { [staffUpperName]: dsrTotalServices },
        gross: dsrTotalServices,
        exp: 0,
        daily: 200,
        comi: computedComi,
        netSales: dsrTotalServices - 200 - computedComi,
        roseShare: dsrTotalServices - 200 - computedComi
      };
      recordsCopy.push(newRec);
    }

    recordsCopy.sort((a, b) => a.date.localeCompare(b.date));

    const updatedSummary = {
      ...salesSummary,
      [monthKey]: {
        ...currentMonthData,
        records: recordsCopy
      }
    };

    setSalesSummary(updatedSummary);
    saveState("rose_salesSummary", updatedSummary);

    const newTx: PaymentTransaction = {
      id: (paymentTransactions.length + 1).toString(),
      date: dateStr,
      refNo: `DSR-${staffUpperName}-${dateStr.replace(/-/g, "")}`,
      gcash: 0,
      bank: 0,
      cash: dsrTotalCashCalculated,
      verifiedBy: "MANAGER",
      totalGross: dsrTotalServices,
      remarks: `Sales Logged: ${staffUpperName}. Over/Short: ₱${dsrOverShort}`
    };
    const updatedPay = [newTx, ...paymentTransactions];
    setPaymentTransactions(updatedPay);
    saveState("rose_paymentTransactions", updatedPay);

    alert(`DSR data saved to 2026 Ledger (${monthKey}) & Payments monitoring log!`);
    updateDsrServices([]);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-on-surface">Checkout Counter</h2>
        <p className="text-xs text-on-surface-variant">Add services to the ticket, calculate totals, and record payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Service Selection Board */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Category filters */}
          <div className="flex flex-wrap gap-1.5 bg-surface-container-low p-1.5 rounded-xl border border-outline">
            {(['ALL', 'Hair', 'Nails', 'Aesthetic', 'Other'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setPosCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${posCategory === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-primary hover:bg-white'
                  }`}
              >
                {cat === 'ALL' ? 'All Catalog' : cat}
              </button>
            ))}
          </div>

          {/* Catalog Search & Add Custom */}
          <div className="flex gap-2">
            <div className="flex-1 bg-surface-container-low border border-outline rounded-xl px-4 py-2.5 flex items-center gap-3">
              <Icons.search className="w-4.5 h-4.5 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search service menu..."
                value={posSearch}
                onChange={(e) => setPosSearch(e.target.value)}
                className="bg-transparent w-full text-xs outline-none border-none text-on-surface"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const name = prompt("Enter Custom Service Name:");
                if (!name) return;
                const price = Number(prompt("Enter Service Price (₱):"));
                if (!price || isNaN(price)) return;
                const customItem: ServiceItem = {
                  id: "custom-" + Date.now(),
                  name,
                  price,
                  category: "Other",
                  commissionRate: 0.27
                };
                handleAddServiceToCart(customItem);
              }}
              className="bg-secondary text-white hover:bg-secondary/90 px-4 rounded-xl text-xs font-bold shadow-sm transition"
            >
              + Custom Item
            </button>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {posServicesCatalog.map(service => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleAddServiceToCart(service)}
                className="bg-white border border-outline hover:border-primary/50 hover:bg-primary-container/10 p-4 rounded-xl flex flex-col justify-between text-left transition h-28 group relative shadow-sm hover:shadow"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant self-start">
                    {service.category}
                  </span>
                  <h4 className="font-bold text-xs text-on-surface mt-1 group-hover:text-primary transition">{service.name}</h4>
                </div>
                <div className="flex items-end justify-between w-full border-t border-outline/10 pt-2 mt-2">
                  <span className="text-sm font-black text-on-surface">₱{service.price.toLocaleString()}</span>
                  <span className="text-[9px] font-bold text-on-surface-variant font-mono">{Math.round(service.commissionRate * 100)}% Stylist</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Checkout Ticket & Bills */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Checkout Cart Card */}
          <div className="bg-surface border border-outline rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-outline/20 pb-3">
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <Icons.cart className="w-4.5 h-4.5 text-primary" /> Active Client Ticket
              </h3>
              <button
                type="button"
                onClick={() => updateDsrServices([])}
                className="text-xs text-red-500 hover:text-red-700 font-bold"
              >
                Clear All
              </button>
            </div>

            {/* Date / Stylist */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Report Date</label>
                <input
                  type="date"
                  value={dsrDate}
                  onChange={(e) => setDsrDate(e.target.value)}
                  className="bg-white border border-outline px-3 py-2 rounded-lg text-xs font-semibold outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Assigned Stylist</label>
                <select
                  value={dsrStaff}
                  onChange={(e) => setDsrStaff(e.target.value)}
                  className="bg-white border border-outline px-3 py-2 rounded-lg text-xs font-bold outline-none cursor-pointer"
                >
                  {staffs.filter(s => s.status === 'Active').map(s => (
                    <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cart List */}
            <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5 border border-outline/20 p-2 rounded-xl bg-surface-container-low min-h-24">
              {dsrServices.map((s, idx) => (
                <div key={s.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-outline/25 text-xs">
                  <div className="flex-1 pr-2">
                    <span className="font-semibold text-on-surface">{s.service}</span>
                    <span className="text-[9px] text-on-surface-variant block mt-0.5 font-mono">Commission: {Math.round((s.commissionRate ?? 0.27) * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-on-surface">₱{s.price.toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteDsrService(s.id)}
                      className="text-red-500 hover:text-red-750 font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              {dsrServices.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-xs text-on-surface-variant opacity-60 h-20 text-center">
                  Cart is empty.<br />Click catalog services on the left to build ticket.
                </div>
              )}
            </div>

            {/* Payout sum */}
            <div className="border-t border-outline/25 pt-3 flex justify-between items-center font-bold text-xs">
              <span className="text-on-surface-variant">Ticket Subtotal:</span>
              <span className="text-base font-black text-primary">₱{dsrTotalServices.toLocaleString()}</span>
            </div>

            {/* Denomination Counter Drawer */}
            <div className="border-t border-outline/25 pt-4">
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Drawer Cash Count</h4>
              <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {[1000, 500, 200, 100, 50, 20, 10, 5, 1].map(bill => (
                  <div key={bill} className="flex flex-col items-center justify-between bg-surface border border-outline p-1.5 rounded-lg text-center gap-1 shadow-sm">
                    <span className="text-[10px] font-black text-on-surface">₱{bill}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustDenom(bill, -1)}
                        className="w-5 h-5 rounded-md bg-surface-container hover:bg-surface-container-high text-xs font-bold flex items-center justify-center transition"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold font-mono min-w-4">{dsrBills[bill] || 0}</span>
                      <button
                        type="button"
                        onClick={() => handleAdjustDenom(bill, 1)}
                        className="w-5 h-5 rounded-md bg-surface-container hover:bg-surface-container-high text-xs font-bold flex items-center justify-center transition"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[9px] text-on-surface-variant font-mono mt-0.5">₱{(bill * (dsrBills[bill] || 0)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drawer Tally Status */}
            <div className="border-t border-outline/20 pt-4 flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-on-surface-variant">Tally Cash Sum:</span>
                <span className="font-mono">₱{dsrTotalCashCalculated.toLocaleString()}</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between ${dsrOverShort === 0
                  ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
                  : dsrOverShort > 0
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-red-50 border-red-200 text-red-850'
                }`}>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider block">Drawer Tally Status</span>
                  <span className="text-xs font-bold mt-0.5 block">
                    {dsrOverShort === 0
                      ? "Drawer is perfectly balanced"
                      : dsrOverShort > 0
                        ? `Cash over by ₱${dsrOverShort.toLocaleString()}`
                        : `Cash short by ₱${Math.abs(dsrOverShort).toLocaleString()}`
                    }
                  </span>
                </div>
                <div className="text-base font-black font-mono">
                  {dsrOverShort >= 0 ? "+" : ""}{dsrOverShort.toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveDsrToLedger}
                disabled={dsrServices.length === 0}
                className="w-full bg-primary disabled:bg-zinc-300 disabled:cursor-not-allowed hover:bg-primary-hover text-white py-3.5 rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg mt-2 cursor-pointer"
              >
                Process Ticket & Save to Ledger
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
