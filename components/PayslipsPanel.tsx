import React from "react";
import { Icons } from "./Icons";
import { StaffMember } from "../app/data/initialData";

interface PayslipsPanelProps {
  staffs: StaffMember[];
  activeStaffName: string;
  setActiveStaffName: (name: string) => void;
  staffPayslips: { [name: string]: any[] };
  activeStaffPayslipInfo: any;
}

export const PayslipsPanel: React.FC<PayslipsPanelProps> = ({
  staffs,
  activeStaffName,
  setActiveStaffName,
  staffPayslips,
  activeStaffPayslipInfo,
}) => {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="no-print">
        <h2 className="text-xl font-bold text-on-surface">Staff Payslips Ledger</h2>
        <p className="text-xs text-on-surface-variant">View daily commissions and print professional payout vouchers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stylist directory cards */}
        <div className="no-print lg:col-span-4 p-5 bg-surface border border-outline rounded-2xl flex flex-col gap-3 shadow-sm">
          <h3 className="font-bold text-sm pb-2 border-b border-outline/20 text-on-surface">Stylists Directory</h3>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px]">
            {staffs.map((staff) => {
              const name = staff.code;
              const active = activeStaffName === name;
              const records = staffPayslips[name] || [];
              const aggregateRow = records[records.length - 1];
              const totalIncome = aggregateRow ? (aggregateRow.netTotal || 0) : 0;

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setActiveStaffName(name)}
                  className={`flex items-center justify-between p-3.5 rounded-xl transition duration-150 text-left cursor-pointer border ${active
                      ? 'bg-primary border-primary text-white shadow-sm'
                      : 'bg-white hover:bg-surface-container-low border-outline/40 text-on-surface'
                    }`}
                >
                  <div>
                    <div className="font-bold text-xs">
                      {staff.name} ({staff.code})
                    </div>
                    <div className={`text-[10px] mt-0.5 font-medium ${active ? 'text-white/80' : 'text-on-surface-variant'}`}>
                      {staff.role}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black block">₱{Math.round(totalIncome).toLocaleString()}</span>
                    <span className={`text-[8px] block mt-0.5 font-bold uppercase tracking-wider ${active ? 'text-white/60' : 'text-on-surface-variant'}`}>December</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Stylist details */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {activeStaffPayslipInfo && (
            <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Commission", val: `₱${activeStaffPayslipInfo.totalComi.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                { label: "Daily Rate Sum", val: `₱${activeStaffPayslipInfo.totalDaily.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                { label: "Deductions", val: `₱${(activeStaffPayslipInfo.totalCA + activeStaffPayslipInfo.utang).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "text-red-500" },
                { label: "Net Pay", val: `₱${activeStaffPayslipInfo.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "text-emerald-800 font-extrabold" }
              ].map((card, idx) => (
                <div key={idx} className="bg-surface border border-outline p-4 rounded-xl text-center shadow-sm">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">{card.label}</span>
                  <span className={`text-xs font-black mt-1 block ${card.color || 'text-on-surface'}`}>{card.val}</span>
                </div>
              ))}
            </div>
          )}

          {/* Printable pay slip voucher */}
          {activeStaffPayslipInfo && (
            <div className="bg-surface border border-outline rounded-3xl p-6 print-area relative flex flex-col gap-6 shadow-sm border-dashed">
              {/* Voucher header */}
              <div className="flex justify-between items-start border-b border-outline/35 pb-4">
                <div>
                  <div className="text-[9px] bg-primary-container text-primary px-3 py-1 rounded-full font-bold uppercase inline-block border border-primary/10">
                    Official Payroll Slip
                  </div>
                  <h3 className="text-lg font-black mt-2 text-on-surface">{activeStaffPayslipInfo.name}</h3>
                  <p className="text-xs text-on-surface-variant font-mono">Period: Dec 1 - Dec 26, 2025</p>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="no-print flex items-center gap-1.5 border border-outline hover:bg-surface-container-low px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  <Icons.print className="w-4 h-4 text-on-surface-variant" />
                  Print Voucher
                </button>
              </div>

              {/* Voucher metadata details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-surface-container-low border border-outline p-4 rounded-2xl">
                <div>
                  <span className="text-on-surface-variant block font-bold text-[9px] uppercase tracking-wider">Stylist Designation</span>
                  <span className="font-bold mt-0.5 block">{staffs.find(s => s.code === activeStaffName)?.role || "Salon Stylist / Aesthetician"}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block font-bold text-[9px] uppercase tracking-wider">Payout Date</span>
                  <span className="font-bold mt-0.5 block">December 26, 2025</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block font-bold text-[9px] uppercase tracking-wider">Payment channel</span>
                  <span className="font-bold mt-0.5 block text-primary">Cash Vault</span>
                </div>
              </div>

              {/* Commission table breakdown */}
              <div>
                <h4 className="font-bold text-xs text-on-surface-variant uppercase tracking-wider mb-2">Daily Allocation Ledger</h4>
                <div className="max-h-56 overflow-y-auto border border-outline rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline font-bold sticky top-0">
                        <th className="p-2">Date</th>
                        <th className="p-2 text-right">Service 1</th>
                        <th className="p-2 text-right text-primary">Comi 1</th>
                        <th className="p-2 text-right">Service 2</th>
                        <th className="p-2 text-right text-primary">Comi 2</th>
                        <th className="p-2 text-right">Daily Rate</th>
                        <th className="p-2 text-right font-bold text-on-surface">Daily Total</th>
                        <th className="p-2 text-right text-red-600">CA Advance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/10 font-mono text-[10px]">
                      {activeStaffPayslipInfo.ledger.map((r: any, i: number) => (
                        <tr key={i} className="hover:bg-surface-container-low/20">
                          <td className="p-2 font-sans font-bold text-on-surface-variant">{r.date}</td>
                          <td className="p-2 text-right">{r.service1Val > 0 ? `₱${r.service1Val.toLocaleString()}` : "-"}</td>
                          <td className="p-2 text-right text-primary font-bold">{r.service1Comi > 0 ? `₱${r.service1Comi.toLocaleString()}` : "-"}</td>
                          <td className="p-2 text-right">{r.service2Val > 0 ? `₱${r.service2Val.toLocaleString()}` : "-"}</td>
                          <td className="p-2 text-right text-primary font-bold">{r.service2Comi > 0 ? `₱${r.service2Comi.toLocaleString()}` : "-"}</td>
                          <td className="p-2 text-right">{r.dailyRate > 0 ? `₱${r.dailyRate.toLocaleString()}` : "-"}</td>
                          <td className="p-2 text-right font-black text-on-surface">₱{r.netTotal.toLocaleString()}</td>
                          <td className="p-2 text-right text-red-600 font-bold">{r.ca > 0 ? `₱${r.ca.toLocaleString()}` : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dotted slip divider */}
              <div className="border-t border-dashed border-outline/50 my-1"></div>

              {/* Receipt bottom calculations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="flex flex-col gap-2 bg-surface-container-low p-4 rounded-2xl border border-outline">
                  <h4 className="font-bold text-xs text-on-surface-variant uppercase tracking-wider mb-1">Salary Calculations</h4>
                  <div className="flex justify-between border-b border-outline/10 pb-1.5">
                    <span className="text-on-surface-variant font-semibold">Commissions:</span>
                    <span className="font-bold font-mono">₱{activeStaffPayslipInfo.totalComi.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline/10 pb-1.5">
                    <span className="text-on-surface-variant font-semibold">Daily Rates Sum:</span>
                    <span className="font-bold font-mono">₱{activeStaffPayslipInfo.totalDaily.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline/10 pb-1.5 text-red-600">
                    <span className="font-semibold">Less Cash Advances:</span>
                    <span className="font-bold font-mono">-₱{activeStaffPayslipInfo.totalCA.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline/10 pb-1.5 text-red-650">
                    <span className="font-semibold">Less Other Deductions:</span>
                    <span className="font-bold font-mono">-₱{activeStaffPayslipInfo.utang.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-emerald-800 pt-1">
                    <span>NET PAYOUT DISBURSED:</span>
                    <span className="font-mono">₱{activeStaffPayslipInfo.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="flex flex-col justify-end gap-8 pl-6 border-l border-outline/25">
                  <div className="text-center">
                    <div className="h-0.5 bg-on-surface/30 w-40 mx-auto mb-1" />
                    <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Stylist Signature Receipt</span>
                  </div>
                  <div className="text-center">
                    <div className="h-0.5 bg-on-surface/30 w-40 mx-auto mb-1" />
                    <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Authorized Manager</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
