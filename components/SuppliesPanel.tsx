import React, { useState, useMemo } from "react";
import { Icons } from "./Icons";
import { SuppliesMonitoringLog, SuppliesRequest, StaffMember } from "../app/data/initialData";

interface SuppliesPanelProps {
  suppliesMonitoring: SuppliesMonitoringLog[];
  setSuppliesMonitoring: React.Dispatch<React.SetStateAction<SuppliesMonitoringLog[]>>;
  suppliesRequest: SuppliesRequest[];
  setSuppliesRequest: React.Dispatch<React.SetStateAction<SuppliesRequest[]>>;
  staffs: StaffMember[];
  saveState: (key: string, val: any) => void;
}

export const SuppliesPanel: React.FC<SuppliesPanelProps> = ({
  suppliesMonitoring,
  setSuppliesMonitoring,
  suppliesRequest,
  setSuppliesRequest,
  staffs,
  saveState,
}) => {
  // Modal toggle states
  const [showAddSupplyModal, setShowAddSupplyModal] = useState(false);
  const [showRequestSupplyModal, setShowRequestSupplyModal] = useState(false);

  // Form States for Stock In/Out Log
  const [editingSuppLogId, setEditingSuppLogId] = useState<string | null>(null);
  const [newSuppDate, setNewSuppDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newSuppIn, setNewSuppIn] = useState("");
  const [newSuppPcsIn, setNewSuppPcsIn] = useState<number>(0);
  const [newSuppOut, setNewSuppOut] = useState("");
  const [newSuppPcsOut, setNewSuppPcsOut] = useState<number>(0);
  const [newSuppRemarks, setNewSuppRemarks] = useState("");
  const [newSuppStaff, setNewSuppStaff] = useState(() => staffs.find(s => s.status === 'Active')?.code || "MANAGER");

  // Form States for purchase requests
  const [editingSuppReqId, setEditingSuppReqId] = useState<string | null>(null);
  const [newReqDept, setNewReqDept] = useState("Hair");
  const [newReqDesc, setNewReqDesc] = useState("");
  const [newReqBrand, setNewReqBrand] = useState("");
  const [newReqPO, setNewReqPO] = useState("");
  const [newReqOnHand, setNewReqOnHand] = useState<number>(0);
  const [newReqStaff, setNewReqStaff] = useState(() => staffs.find(s => s.status === 'Active')?.code || "MANAGER");

  // Inventory Stock Health (Aggregating stocks in/out by item name)
  const inventoryShelfItems = useMemo(() => {
    const summary: { [name: string]: { in: number; out: number; base: number } } = {
      "Hair Color Dye - Ash Brown": { in: 0, out: 0, base: 12 },
      "Shampoo Premium 1L": { in: 0, out: 0, base: 8 },
      "Developer 20 Vol": { in: 0, out: 0, base: 10 },
      "Hair Bleach Powder": { in: 0, out: 0, base: 15 },
      "Gel Top Coat": { in: 0, out: 0, base: 6 },
      "Facial Wipes pack of 5": { in: 0, out: 0, base: 20 },
    };

    suppliesMonitoring.forEach(log => {
      if (log.stocksIn) {
        const key = Object.keys(summary).find(k => log.stocksIn.toLowerCase().includes(k.toLowerCase())) || log.stocksIn;
        if (!summary[key]) summary[key] = { in: 0, out: 0, base: 5 };
        summary[key].in += log.pcsIn;
      }
      if (log.stocksOut) {
        const key = Object.keys(summary).find(k => log.stocksOut.toLowerCase().includes(k.toLowerCase())) || log.stocksOut;
        if (!summary[key]) summary[key] = { in: 0, out: 0, base: 5 };
        summary[key].out += log.pcsOut;
      }
    });

    return Object.entries(summary).map(([name, data]) => {
      const current = data.base + data.in - data.out;
      const max = data.base + data.in;
      const pct = Math.max(0, Math.min(100, Math.round((current / (max || 1)) * 100)));
      return { name, current, base: data.base, percentage: pct };
    });
  }, [suppliesMonitoring]);

  const handleStartEditSupplyLog = (s: SuppliesMonitoringLog) => {
    setEditingSuppLogId(s.id);
    setNewSuppDate(s.date);
    setNewSuppIn(s.stocksIn);
    setNewSuppPcsIn(s.pcsIn);
    setNewSuppOut(s.stocksOut);
    setNewSuppPcsOut(s.pcsOut);
    setNewSuppRemarks(s.remarks);
    setNewSuppStaff(s.staff);
    setShowAddSupplyModal(true);
  };

  const handleAddSupplyLog = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: SuppliesMonitoringLog[];
    if (editingSuppLogId) {
      updated = suppliesMonitoring.map(s =>
        s.id === editingSuppLogId
          ? {
              ...s,
              date: newSuppDate,
              stocksIn: newSuppIn,
              pcsIn: Number(newSuppPcsIn),
              stocksOut: newSuppOut,
              pcsOut: Number(newSuppPcsOut),
              remarks: newSuppRemarks,
              staff: newSuppStaff,
            }
          : s
      );
      setEditingSuppLogId(null);
    } else {
      const newLog: SuppliesMonitoringLog = {
        id: (suppliesMonitoring.length + 1).toString() + "-" + Math.floor(Math.random() * 1000),
        date: newSuppDate,
        stocksIn: newSuppIn,
        pcsIn: Number(newSuppPcsIn),
        stocksOut: newSuppOut,
        pcsOut: Number(newSuppPcsOut),
        remarks: newSuppRemarks,
        staff: newSuppStaff,
      };
      updated = [newLog, ...suppliesMonitoring];
    }
    setSuppliesMonitoring(updated);
    saveState("rose_suppliesMonitoring", updated);
    setNewSuppIn("");
    setNewSuppPcsIn(0);
    setNewSuppOut("");
    setNewSuppPcsOut(0);
    setNewSuppRemarks("");
    setShowAddSupplyModal(false);
  };

  const handleDeleteSupplyLog = (id: string) => {
    if (confirm("Delete this inventory stock log?")) {
      const updated = suppliesMonitoring.filter(s => s.id !== id);
      setSuppliesMonitoring(updated);
      saveState("rose_suppliesMonitoring", updated);
    }
  };

  const handleQuickAdjustStock = (itemDescription: string, type: 'in' | 'out', qty: number) => {
    const newLog: SuppliesMonitoringLog = {
      id: (suppliesMonitoring.length + 1).toString() + "-" + Math.floor(Math.random() * 1000),
      date: new Date().toISOString().split("T")[0],
      stocksIn: type === 'in' ? itemDescription : "",
      pcsIn: type === 'in' ? qty : 0,
      stocksOut: type === 'out' ? itemDescription : "",
      pcsOut: type === 'out' ? qty : 0,
      remarks: "Quick adjustment from dashboard",
      staff: "MANAGER"
    };
    const updated = [newLog, ...suppliesMonitoring];
    setSuppliesMonitoring(updated);
    saveState("rose_suppliesMonitoring", updated);
  };

  const handleStartEditSupplyRequest = (r: SuppliesRequest) => {
    setEditingSuppReqId(r.id);
    setNewReqDept(r.department);
    setNewReqDesc(r.description);
    setNewReqBrand(r.brand);
    setNewReqPO(r.po);
    setNewReqOnHand(r.onHand);
    setNewReqStaff(r.reqBy);
    setShowRequestSupplyModal(true);
  };

  const handleAddSupplyRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqDesc) return;

    let updated: SuppliesRequest[];
    if (editingSuppReqId) {
      updated = suppliesRequest.map(r =>
        r.id === editingSuppReqId
          ? {
              ...r,
              department: newReqDept,
              description: newReqDesc,
              brand: newReqBrand || "Generic",
              po: newReqPO,
              onHand: Number(newReqOnHand),
              reqBy: newReqStaff,
            }
          : r
      );
      setEditingSuppReqId(null);
    } else {
      const newReq: SuppliesRequest = {
        id: (suppliesRequest.length + 1).toString() + "-" + Math.floor(Math.random() * 1000),
        department: newReqDept,
        date: new Date().toISOString().split("T")[0],
        description: newReqDesc,
        brand: newReqBrand || "Generic",
        po: newReqPO || `PO-${Math.floor(1000 + Math.random() * 9000)}`,
        onHand: Number(newReqOnHand),
        reqBy: newReqStaff,
        status: 'Pending'
      };
      updated = [newReq, ...suppliesRequest];
    }
    setSuppliesRequest(updated);
    saveState("rose_suppliesRequest", updated);
    setNewReqDesc("");
    setNewReqBrand("");
    setNewReqPO("");
    setNewReqOnHand(0);
    setShowRequestSupplyModal(false);
  };

  const handleDeleteSupplyRequest = (id: string) => {
    if (confirm("Delete this purchase request?")) {
      const updated = suppliesRequest.filter(r => r.id !== id);
      setSuppliesRequest(updated);
      saveState("rose_suppliesRequest", updated);
    }
  };

  const handleUpdateRequestStatus = (id: string, status: 'Approved' | 'Rejected') => {
    const updated = suppliesRequest.map(r => r.id === id ? { ...r, status } : r);
    setSuppliesRequest(updated);
    saveState("rose_suppliesRequest", updated);

    if (status === 'Approved') {
      const req = suppliesRequest.find(r => r.id === id);
      if (req) {
        const autoLog: SuppliesMonitoringLog = {
          id: (suppliesMonitoring.length + 1).toString() + "-" + Math.floor(Math.random() * 1000),
          date: new Date().toISOString().split("T")[0],
          stocksIn: `${req.description} (${req.brand})`,
          pcsIn: 5,
          stocksOut: "",
          pcsOut: 0,
          remarks: `Auto stock-in from approved PO ${req.po}`,
          staff: req.reqBy
        };
        const updatedLogs = [autoLog, ...suppliesMonitoring];
        setSuppliesMonitoring(updatedLogs);
        saveState("rose_suppliesMonitoring", updatedLogs);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Supplies & Inventory Manager</h2>
          <p className="text-xs text-on-surface-variant">Monitor chemical stocks, request purchasing forms, and process stock-in approvals</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingSuppLogId(null);
              setNewSuppDate(new Date().toISOString().split("T")[0]);
              setNewSuppIn("");
              setNewSuppPcsIn(0);
              setNewSuppOut("");
              setNewSuppPcsOut(0);
              setNewSuppRemarks("");
              setShowAddSupplyModal(true);
            }}
            className="flex items-center gap-1.5 border border-outline hover:bg-surface-container-low text-on-surface px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Icons.add className="w-4 h-4" />
            Log Stocks In/Out
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingSuppReqId(null);
              setNewReqDept("Hair");
              setNewReqDesc("");
              setNewReqBrand("");
              setNewReqPO("");
              setNewReqOnHand(0);
              setShowRequestSupplyModal(true);
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Icons.add className="w-4 h-4" />
            Submit Request Form
          </button>
        </div>
      </div>

      {/* Split layout: Stock shelf vs requests pipelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Visual product shelf */}
        <div className="lg:col-span-7 p-5 bg-surface border border-outline rounded-2xl flex flex-col gap-4 shadow-sm">
          <div>
            <h3 className="font-bold text-sm text-on-surface">Product Shelf Health</h3>
            <p className="text-xs text-on-surface-variant">Current remaining salon counts calculated from stock flows</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
            {inventoryShelfItems.map((item, idx) => {
              const healthColor = item.percentage > 50 ? 'bg-emerald-500' : item.percentage > 20 ? 'bg-amber-500' : 'bg-red-500';
              const healthText = item.percentage > 50 ? 'Good' : item.percentage > 20 ? 'Low Stock' : 'Critical / Out';
              const textColor = item.percentage > 50 ? 'text-emerald-700' : item.percentage > 20 ? 'text-amber-700' : 'text-red-700';

              return (
                <div key={idx} className="bg-white border border-outline p-4 rounded-xl flex flex-col justify-between gap-3 shadow-sm">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-xs text-on-surface truncate" title={item.name}>{item.name}</h4>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${textColor}`}>{healthText}</span>
                  </div>

                  <div>
                    <div className="flex justify-between items-end text-xs font-bold mb-1">
                      <span className="text-on-surface-variant">Stock level:</span>
                      <span className="font-mono">{item.current} units</span>
                    </div>

                    {/* Progress meter */}
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.percentage}%` }}
                        className={`h-full ${healthColor} rounded-full transition-all duration-300`}
                      />
                    </div>
                  </div>

                  {/* Quick adjustments */}
                  <div className="flex gap-1.5 border-t border-outline/10 pt-2.5 mt-1 justify-end">
                    <button
                      type="button"
                      onClick={() => handleQuickAdjustStock(item.name, 'out', 1)}
                      className="px-2.5 py-1 text-[10px] font-bold text-red-650 border border-red-100 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      Use 1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdjustStock(item.name, 'in', 5)}
                      className="px-2.5 py-1 text-[10px] font-bold text-emerald-650 border border-emerald-100 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                    >
                      +5 Delivery
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Approvals pipeline */}
        <div className="lg:col-span-5 p-5 bg-surface border border-outline rounded-2xl flex flex-col gap-4 shadow-sm">
          <div>
            <h3 className="font-bold text-sm text-on-surface">Purchase Forms Status</h3>
            <p className="text-xs text-on-surface-variant">Pipeline approvals workflow tracking</p>
          </div>

          <div className="flex flex-col gap-3">
            {suppliesRequest.map((req) => (
              <div key={req.id} className="bg-white border border-outline p-4 rounded-xl flex flex-col justify-between gap-3.5 text-xs shadow-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-on-surface">{req.description}</span>
                    <span className="text-[8px] text-on-surface-variant bg-surface-container border border-outline p-1 rounded font-bold uppercase tracking-wider">{req.brand}</span>
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">
                    PO: <span className="font-mono font-bold text-on-surface">{req.po}</span> • Dept: {req.department} <br />
                    On Hand: {req.onHand} • Requested by: <span className="font-bold">{req.reqBy}</span>
                  </div>
                </div>

                {/* Approval controls */}
                <div className="flex items-center justify-between border-t border-outline/10 pt-2.5">
                  {req.status === 'Pending' ? (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateRequestStatus(req.id, 'Approved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg transition uppercase tracking-wider cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateRequestStatus(req.id, 'Rejected')}
                        className="bg-red-500 hover:bg-red-650 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg transition uppercase tracking-wider cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${req.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {req.status}
                    </span>
                  )}

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleStartEditSupplyRequest(req)}
                      className="text-primary hover:underline font-bold text-[10px] cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSupplyRequest(req.id)}
                      className="text-red-555 hover:underline font-bold text-[10px] cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {suppliesRequest.length === 0 && (
              <div className="text-center py-8 text-xs text-on-surface-variant italic">
                No active purchase requests pending.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL: ADD / EDIT SUPPLY FLOW LOG */}
      {showAddSupplyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form onSubmit={handleAddSupplyLog} className="bg-surface border border-outline rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-on-surface">{editingSuppLogId ? "Update Inventory Flow" : "Log Stock Flow"}</h3>
              <p className="text-xs text-on-surface-variant">Log custom shipments in or out of shelves</p>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-on-surface-variant">Log Date</label>
                <input
                  type="date"
                  required
                  value={newSuppDate}
                  onChange={(e) => setNewSuppDate(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Stock IN Item Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Developer 20 Vol"
                    value={newSuppIn}
                    onChange={(e) => setNewSuppIn(e.target.value)}
                    className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Pcs In</label>
                  <input
                    type="number"
                    min={0}
                    value={newSuppPcsIn || ""}
                    onChange={(e) => setNewSuppPcsIn(Number(e.target.value))}
                    className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Stock OUT Item Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Developer 20 Vol"
                    value={newSuppOut}
                    onChange={(e) => setNewSuppOut(e.target.value)}
                    className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Pcs Out</label>
                  <input
                    type="number"
                    min={0}
                    value={newSuppPcsOut || ""}
                    onChange={(e) => setNewSuppPcsOut(Number(e.target.value))}
                    className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Logged By</label>
                  <select
                    value={newSuppStaff}
                    onChange={(e) => setNewSuppStaff(e.target.value)}
                    className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-bold cursor-pointer"
                  >
                    <option value="MANAGER">MANAGER</option>
                    {staffs.map(s => (
                      <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Remarks / Memo</label>
                  <input
                    type="text"
                    placeholder="e.g. Weekly replenishment"
                    value={newSuppRemarks}
                    onChange={(e) => setNewSuppRemarks(e.target.value)}
                    className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-outline/25">
              <button
                type="button"
                onClick={() => setShowAddSupplyModal(false)}
                className="px-4 py-2.5 border border-outline hover:bg-surface-container-low rounded-xl font-bold text-on-surface transition cursor-pointer text-xs"
              >
                Dismiss
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition cursor-pointer text-xs"
              >
                {editingSuppLogId ? "Update Log" : "Confirm Log"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: SUBMIT / EDIT PURCHASE REQUEST FORM */}
      {showRequestSupplyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form onSubmit={handleAddSupplyRequest} className="bg-surface border border-outline rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-on-surface">{editingSuppReqId ? "Modify Purchase Form" : "Create Purchase Form"}</h3>
              <p className="text-xs text-on-surface-variant">Submit supply replenishment requests to store management</p>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Department</label>
                  <select
                    value={newReqDept}
                    onChange={(e) => setNewReqDept(e.target.value)}
                    className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary text-xs font-bold cursor-pointer"
                  >
                    <option value="Hair">Hair Department</option>
                    <option value="Nails">Nails Department</option>
                    <option value="Aesthetic">Aesthetic Dept</option>
                    <option value="General">General Store</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">PO Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. PO-883"
                    value={newReqPO}
                    onChange={(e) => setNewReqPO(e.target.value)}
                    disabled={!!editingSuppReqId}
                    className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary text-xs font-mono font-bold disabled:bg-surface-container-low"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Item Description / Formula</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hair Bleach Powder"
                  value={newReqDesc}
                  onChange={(e) => setNewReqDesc(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Brand / Supplier</label>
                  <input
                    type="text"
                    placeholder="e.g. L'Oreal"
                    value={newReqBrand}
                    onChange={(e) => setNewReqBrand(e.target.value)}
                    className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">On Hand Count</label>
                  <input
                    type="number"
                    min={0}
                    value={newReqOnHand || ""}
                    onChange={(e) => setNewReqOnHand(Number(e.target.value))}
                    className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary text-xs font-bold text-right"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Requested By</label>
                <select
                  value={newReqStaff}
                  onChange={(e) => setNewReqStaff(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary text-xs font-bold cursor-pointer"
                >
                  <option value="MANAGER">MANAGER</option>
                  {staffs.map(s => (
                    <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-outline/25">
              <button
                type="button"
                onClick={() => setShowRequestSupplyModal(false)}
                className="px-4 py-2.5 border border-outline hover:bg-surface-container-low rounded-xl font-bold text-on-surface transition cursor-pointer text-xs"
              >
                Dismiss
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition cursor-pointer text-xs"
              >
                {editingSuppReqId ? "Update Request" : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
