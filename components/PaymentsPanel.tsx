import React, { useState, useMemo } from "react";
import { Icons } from "./Icons";
import { PaymentTransaction } from "../app/data/initialData";

interface PaymentsPanelProps {
  paymentTransactions: PaymentTransaction[];
  setPaymentTransactions: React.Dispatch<React.SetStateAction<PaymentTransaction[]>>;
  saveState: (key: string, val: any) => void;
}

export const PaymentsPanel: React.FC<PaymentsPanelProps> = ({
  paymentTransactions,
  setPaymentTransactions,
  saveState,
}) => {
  // Local UI States
  const [paySearch, setPaySearch] = useState("");
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  // Form States
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [newPayDate, setNewPayDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newPayRef, setNewPayRef] = useState("");
  const [newPayGcash, setNewPayGcash] = useState<number>(0);
  const [newPayBank, setNewPayBank] = useState<number>(0);
  const [newPayCash, setNewPayCash] = useState<number>(0);
  const [newPayVerified, setNewPayVerified] = useState<string>("MANAGER");
  const [newPayRemarks, setNewPayRemarks] = useState("");

  // Derived state
  const filteredPayments = useMemo(() => {
    return paymentTransactions.filter(p =>
      p.refNo.toLowerCase().includes(paySearch.toLowerCase()) ||
      p.verifiedBy.toLowerCase().includes(paySearch.toLowerCase()) ||
      (p.remarks && p.remarks.toLowerCase().includes(paySearch.toLowerCase()))
    );
  }, [paymentTransactions, paySearch]);

  const handleStartEditPayment = (p: PaymentTransaction) => {
    setEditingPaymentId(p.id);
    setNewPayDate(p.date);
    setNewPayRef(p.refNo);
    setNewPayGcash(p.gcash);
    setNewPayBank(p.bank);
    setNewPayCash(p.cash);
    setNewPayVerified(p.verifiedBy);
    setNewPayRemarks(p.remarks || "");
    setShowAddPaymentModal(true);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const gross = Number(newPayGcash) + Number(newPayBank) + Number(newPayCash);

    let updated: PaymentTransaction[];
    if (editingPaymentId) {
      updated = paymentTransactions.map(p =>
        p.id === editingPaymentId
          ? {
              ...p,
              date: newPayDate,
              refNo: newPayRef,
              gcash: Number(newPayGcash),
              bank: Number(newPayBank),
              cash: Number(newPayCash),
              verifiedBy: newPayVerified,
              totalGross: gross,
              remarks: newPayRemarks,
            }
          : p
      );
      setEditingPaymentId(null);
    } else {
      const newTransaction: PaymentTransaction = {
        id: (paymentTransactions.length + 1).toString() + "-" + Math.floor(Math.random() * 1000),
        date: newPayDate,
        refNo: newPayRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        gcash: Number(newPayGcash),
        bank: Number(newPayBank),
        verifiedBy: newPayVerified,
        cash: Number(newPayCash),
        totalGross: gross,
        remarks: newPayRemarks,
      };
      updated = [newTransaction, ...paymentTransactions];
    }

    setPaymentTransactions(updated);
    saveState("rose_paymentTransactions", updated);
    setNewPayRef("");
    setNewPayGcash(0);
    setNewPayBank(0);
    setNewPayCash(0);
    setNewPayRemarks("");
    setShowAddPaymentModal(false);
  };

  const handleDeletePayment = (id: string) => {
    if (confirm("Delete this payment record?")) {
      const updated = paymentTransactions.filter(p => p.id !== id);
      setPaymentTransactions(updated);
      saveState("rose_paymentTransactions", updated);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Payments</h2>
          <p className="text-xs text-on-surface-variant">Track payments made via GCash, Bank Transfer, and Cash</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingPaymentId(null);
            setNewPayDate(new Date().toISOString().split("T")[0]);
            setNewPayRef("");
            setNewPayGcash(0);
            setNewPayBank(0);
            setNewPayCash(0);
            setNewPayVerified("MANAGER");
            setNewPayRemarks("");
            setShowAddPaymentModal(true);
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg self-start cursor-pointer"
        >
          <Icons.add className="w-4.5 h-4.5" />
          Record Payment
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-surface-container-low border border-outline rounded-xl px-4 py-3 flex items-center gap-3 w-full">
        <Icons.search className="w-4.5 h-4.5 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Search reference, remarks, or status..."
          value={paySearch}
          onChange={(e) => setPaySearch(e.target.value)}
          className="bg-transparent w-full text-xs outline-none border-none text-on-surface"
        />
      </div>

      {/* Responsive table */}
      <div className="bg-white border border-outline rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline font-bold">
                <th className="p-3">Log Date</th>
                <th className="p-3">Reference No</th>
                <th className="p-3 text-right">GCash</th>
                <th className="p-3 text-right">Bank Transfer</th>
                <th className="p-3 text-right">Cash</th>
                <th className="p-3 text-right text-primary font-black">Total Paid</th>
                <th className="p-3 text-center">Verified By</th>
                <th className="p-3">Remarks / Memo</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10 text-on-surface">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low/20 transition-all font-medium">
                  <td className="p-3 font-semibold text-on-surface-variant">{p.date}</td>
                  <td className="p-3 font-mono text-[11px] font-bold text-on-surface">{p.refNo}</td>
                  <td className="p-3 text-right font-mono text-blue-800">
                    {p.gcash > 0 ? `₱${p.gcash.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                  </td>
                  <td className="p-3 text-right font-mono text-teal-800">
                    {p.bank > 0 ? `₱${p.bank.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                  </td>
                  <td className="p-3 text-right font-mono text-amber-800">
                    {p.cash > 0 ? `₱${p.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                  </td>
                  <td className="p-3 text-right font-mono text-primary font-black bg-primary/5">
                    ₱{p.totalGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${p.verifiedBy === "MANAGER"
                        ? "bg-emerald-100 text-emerald-850"
                        : p.verifiedBy === "COUNTER"
                          ? "bg-blue-100 text-blue-850"
                          : "bg-amber-100 text-amber-850"
                      }`}>
                      {p.verifiedBy}
                    </span>
                  </td>
                  <td className="p-3 text-on-surface-variant max-w-xs truncate" title={p.remarks}>{p.remarks || "-"}</td>
                  <td className="p-3 text-center flex justify-center items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleStartEditPayment(p)}
                      className="text-primary hover:underline font-bold transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePayment(p.id)}
                      className="text-red-550 hover:text-red-750 transition cursor-pointer"
                    >
                      <Icons.delete className="w-4 h-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-xs text-on-surface-variant">
                    No transactions registered under this filter.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-surface-container-low text-on-surface font-bold border-t border-outline">
                <td colSpan={2} className="p-3 text-right uppercase">Total:</td>
                <td className="p-3 text-right text-blue-850 font-mono">
                  ₱{filteredPayments.reduce((s, p) => s + p.gcash, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-right text-teal-850 font-mono">
                  ₱{filteredPayments.reduce((s, p) => s + p.bank, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-right text-amber-850 font-mono">
                  ₱{filteredPayments.reduce((s, p) => s + p.cash, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-right font-mono text-sm font-black text-primary">
                  ₱{filteredPayments.reduce((s, p) => s + p.totalGross, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT PAYMENT TRANSACTION */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form onSubmit={handleAddPayment} className="bg-surface border border-outline rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-on-surface">{editingPaymentId ? "Edit Payment" : "Add Payment"}</h3>
              <p className="text-xs text-on-surface-variant">Add or update payment record</p>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={newPayDate}
                    onChange={(e) => setNewPayDate(e.target.value)}
                    className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary font-bold text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Reference No</label>
                  <input
                    type="text"
                    placeholder="e.g. Ref: 2048"
                    value={newPayRef}
                    onChange={(e) => setNewPayRef(e.target.value)}
                    className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">GCash (₱)</label>
                  <input
                    type="number"
                    min={0}
                    value={newPayGcash || ""}
                    onChange={(e) => setNewPayGcash(Number(e.target.value))}
                    className="bg-white border border-outline px-2.5 py-2 rounded-lg outline-none focus:border-primary text-right font-mono text-xs font-bold text-blue-800"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Bank (₱)</label>
                  <input
                    type="number"
                    min={0}
                    value={newPayBank || ""}
                    onChange={(e) => setNewPayBank(Number(e.target.value))}
                    className="bg-white border border-outline px-2.5 py-2 rounded-lg outline-none focus:border-primary text-right font-mono text-xs font-bold text-teal-800"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Cash (₱)</label>
                  <input
                    type="number"
                    min={0}
                    value={newPayCash || ""}
                    onChange={(e) => setNewPayCash(Number(e.target.value))}
                    className="bg-white border border-outline px-2.5 py-2 rounded-lg outline-none focus:border-primary text-right font-mono text-xs font-bold text-amber-800"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Verified By</label>
                <select
                  value={newPayVerified}
                  onChange={(e) => setNewPayVerified(e.target.value as any)}
                  className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary font-bold cursor-pointer text-xs"
                >
                  <option value="MANAGER">MANAGER</option>
                  <option value="COUNTER">CASHIER</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Remarks / Memo</label>
                <textarea
                  placeholder="Payment details or notes..."
                  value={newPayRemarks}
                  onChange={(e) => setNewPayRemarks(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary h-16 resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-outline/25">
              <button
                type="button"
                onClick={() => setShowAddPaymentModal(false)}
                className="px-4 py-2.5 border border-outline hover:bg-surface-container-low rounded-xl font-bold text-on-surface transition cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition cursor-pointer text-xs"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
