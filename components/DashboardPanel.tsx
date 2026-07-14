import React from "react";

type ActivePanel = 'dashboard' | 'salesLedger' | 'pos' | 'services' | 'payslips' | 'payments' | 'bookings' | 'supplies' | 'staffs';

interface DashboardPanelProps {
  dashboardStats: { gross: number; expenses: number; commissions: number; net: number; roseShare: number };
  monthlyChartData: Array<{ key: string; monthName: string; gross: number; net: number }>;
  staffChartData: Array<{ name: string; total: number }>;
  activeMonthKey: string;
  setActiveMonthKey: (key: string) => void;
  salesSummary: { [monthKey: string]: any };
  customerPamper: Array<{ name: string; pamperChoose: string; date: string }>;
  suppliesRequest: Array<{ description: string; po: string; reqBy: string; status: string }>;
  setActivePanel: (panel: ActivePanel) => void;
}

export const DashboardPanel: React.FC<DashboardPanelProps> = ({
  dashboardStats,
  monthlyChartData,
  staffChartData,
  activeMonthKey,
  setActiveMonthKey,
  salesSummary,
  customerPamper,
  suppliesRequest,
  setActivePanel,
}) => {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface leading-tight">Salon Dashboard</h2>
          <p className="text-xs text-on-surface-variant">Real-time summary of sales, expenses, and staff performance</p>
        </div>
        <div className="text-[11px] bg-primary-container/30 border border-primary/20 px-3.5 py-1.5 rounded-full text-primary font-bold self-start">
          System Date: July 11, 2026
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Gross Revenue", val: `₱${dashboardStats.gross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, desc: "Cumulative gross sales", color: "bg-primary-container/20 border-primary/20 text-primary" },
          { label: "Total Salon Expenses", val: `₱${dashboardStats.expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, desc: "Rent, utilities & supplies", color: "bg-orange-50 border-orange-200 text-orange-850" },
          { label: "Stylist Commissions", val: `₱${dashboardStats.commissions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, desc: "Paid stylist tier shares", color: "bg-secondary-container/20 border-secondary/20 text-secondary" },
          { label: "Net Salon Profit", val: `₱${dashboardStats.net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, desc: "Owner net return share", color: "bg-emerald-50 border-emerald-250 text-emerald-800" }
        ].map((card, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${card.color} flex flex-col justify-between h-32`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">{card.label}</span>
              <h3 className="text-2xl font-black mt-1.5">{card.val}</h3>
            </div>
            <span className="text-[10px] opacity-75 font-medium">{card.desc}</span>
          </div>
        ))}
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Trends chart */}
        <div className="lg:col-span-2 p-5 bg-surface border border-outline rounded-2xl flex flex-col gap-4">
          <div>
            <h4 className="font-bold text-sm text-on-surface">Monthly Financial Trend (2026)</h4>
            <p className="text-xs text-on-surface-variant">Gross revenue comparison against net salon profits</p>
          </div>

          <div className="h-60 w-full relative pt-4 flex items-end">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-on-surface-variant/70 border-b border-outline/30 pb-6">
              <div>₱50,000</div>
              <div>₱25,000</div>
              <div>₱0</div>
            </div>

            <div className="flex-1 flex justify-around items-end h-full z-10 px-2 pb-6 border-b border-outline">
              {monthlyChartData.map((item, i) => {
                const scale = 50000;
                const grossHeight = Math.min((item.gross / scale) * 100, 100);
                const netHeight = Math.max(Math.min((item.net / scale) * 100, 100), 0);
                return (
                  <div key={i} className="flex flex-col items-center gap-2 group relative">
                    <div className="flex items-end gap-1">
                      <div
                        style={{ height: `${Math.max(grossHeight, 4)}%` }}
                        className="w-3 bg-primary/40 hover:bg-primary rounded-t-sm transition-all duration-200"
                      />
                      <div
                        style={{ height: `${Math.max(netHeight, 4)}%` }}
                        className="w-3 bg-secondary/50 hover:bg-secondary rounded-t-sm transition-all duration-200"
                      />
                    </div>
                    <span className="text-[9px] font-bold text-on-surface-variant">{item.key}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 text-xs font-bold justify-center mt-1">
            <div className="flex items-center gap-1.5 text-primary">
              <div className="w-2.5 h-2.5 bg-primary/45 rounded-sm" /> Gross Revenue
            </div>
            <div className="flex items-center gap-1.5 text-secondary">
              <div className="w-2.5 h-2.5 bg-secondary/55 rounded-sm" /> Net Profit
            </div>
          </div>
        </div>

        {/* Monthly staff share */}
        <div className="p-5 bg-surface border border-outline rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-on-surface">Stylist Share</h4>
              <p className="text-xs text-on-surface-variant">Active monthly billing shares</p>
            </div>
            <select
              value={activeMonthKey}
              onChange={(e) => setActiveMonthKey(e.target.value)}
              className="text-xs bg-white border border-outline px-2.5 py-1.5 rounded-lg outline-none cursor-pointer font-bold"
            >
              {Object.keys(salesSummary).map(k => (
                <option key={k} value={k}>{k.trim()}</option>
              ))}
            </select>
          </div>

          {staffChartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-on-surface-variant py-12">
              No sales recorded for this month.
            </div>
          ) : (
            <div className="flex flex-col gap-3 justify-center flex-1 py-1">
              {staffChartData.map((staff, idx) => {
                const maxVal = Math.max(...staffChartData.map(s => s.total)) || 1;
                const percentage = (staff.total / maxVal) * 100;
                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-on-surface">{staff.name}</span>
                      <span className="text-primary font-mono">₱{staff.total.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="h-full bg-primary rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick overview lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Active reservations */}
        <div className="p-5 bg-surface border border-outline rounded-2xl flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm text-on-surface">Active Client Bookings</h4>
            <button
              onClick={() => setActivePanel('bookings')}
              className="text-xs text-primary font-bold hover:underline"
            >
              Manage Slots
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {customerPamper.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline/30 text-xs">
                <div>
                  <div className="font-bold text-on-surface">{c.name}</div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">{c.pamperChoose}</div>
                </div>
                <div className="text-[10px] text-on-surface-variant font-mono font-bold bg-white px-2 py-1 rounded-md border border-outline/20">{c.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending purchases */}
        <div className="p-5 bg-surface border border-outline rounded-2xl flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm text-on-surface">Supply Purchase Forms</h4>
            <button
              onClick={() => setActivePanel('supplies')}
              className="text-xs text-primary font-bold hover:underline"
            >
              Inventory Board
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {suppliesRequest.filter(r => r.status === 'Pending').slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline/30 text-xs">
                <div>
                  <div className="font-bold text-on-surface">{r.description}</div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">PO: {r.po} • Requester: {r.reqBy}</div>
                </div>
                <span className="px-2.5 py-1 bg-primary-container text-primary text-[9px] rounded-full font-bold uppercase tracking-wider">
                  Pending
                </span>
              </div>
            ))}
            {suppliesRequest.filter(r => r.status === 'Pending').length === 0 && (
              <div className="text-xs text-on-surface-variant text-center py-6">
                No pending supplies requests.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
