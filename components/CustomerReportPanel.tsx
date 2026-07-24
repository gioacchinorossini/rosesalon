import React, { useState, useMemo } from "react";
import { Icons } from "./Icons";
import { CustomerPamper } from "../app/data/initialData";

interface CustomerReportPanelProps {
  customerPamper: CustomerPamper[];
  setCustomerPamper: React.Dispatch<React.SetStateAction<CustomerPamper[]>>;
  saveState: (key: string, val: any) => void;
}

export const CustomerReportPanel: React.FC<CustomerReportPanelProps> = ({
  customerPamper,
  setCustomerPamper,
  saveState,
}) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // empty means all dates
  
  // Modal & form states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [pamperChoose, setPamperChoose] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Unique list of dates for filter dropdown
  const uniqueDates = useMemo(() => {
    const dates = customerPamper.map(c => c.date).filter(Boolean);
    const sorted = Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));
    return sorted;
  }, [customerPamper]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customerPamper.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.pamperChoose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mobile.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDate = !selectedDate || c.date === selectedDate;
      
      return matchesSearch && matchesDate;
    });
  }, [customerPamper, searchQuery, selectedDate]);

  // Statistics
  const totalReservations = filteredCustomers.length;
  const popularPackage = useMemo(() => {
    if (filteredCustomers.length === 0) return "N/A";
    const counts: { [pkg: string]: number } = {};
    filteredCustomers.forEach(c => {
      counts[c.pamperChoose] = (counts[c.pamperChoose] || 0) + 1;
    });
    let bestPkg = "N/A";
    let maxCount = 0;
    for (const [pkg, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        bestPkg = pkg;
      }
    }
    return bestPkg;
  }, [filteredCustomers]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName("");
    setMobile("");
    setPamperChoose("");
    setDate(new Date().toISOString().split("T")[0]);
    setShowModal(true);
  };

  const handleOpenEditModal = (c: CustomerPamper) => {
    setEditingId(c.id);
    setName(c.name);
    setMobile(c.mobile);
    setPamperChoose(c.pamperChoose);
    setDate(c.date);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pamperChoose || !date) return;

    let updated: CustomerPamper[];
    if (editingId) {
      updated = customerPamper.map(c => 
        c.id === editingId 
          ? { ...c, name, mobile: mobile || "N/A", pamperChoose, date } 
          : c
      );
    } else {
      const newItem: CustomerPamper = {
        id: "cp-" + Date.now() + "-" + Math.floor(Math.random() * 100),
        name,
        mobile: mobile || "N/A",
        pamperChoose,
        date
      };
      updated = [newItem, ...customerPamper];
    }

    setCustomerPamper(updated);
    saveState("rose_customerPamper", updated);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this customer pamper day record?")) {
      const updated = customerPamper.filter(c => c.id !== id);
      setCustomerPamper(updated);
      saveState("rose_customerPamper", updated);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn print:p-0">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Customer Report</h2>
          <p className="text-xs text-on-surface-variant">Analyze customer registrations and chosen packages</p>
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 border border-outline hover:bg-surface-container-low text-on-surface px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Icons.print className="w-4 h-4" />
            Print Report
          </button>
          
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Icons.add className="w-4 h-4" />
            Register Customer
          </button>
        </div>
      </div>

      {/* Printable Sheet Header - Displays ONLY during printing */}
      <div className="hidden print:flex flex-col items-center text-center gap-1 border-b border-zinc-200 pb-4 mb-6">
        <h1 className="text-2xl font-black tracking-wider text-zinc-950">CUSTOMER REPORT</h1>
        <p className="text-[10px] font-bold text-zinc-650 uppercase tracking-widest">Customer Monitoring Log Sheet</p>
        {selectedDate && (
          <p className="text-xs font-bold text-zinc-700 mt-1">Date: {new Date(selectedDate).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
        )}
      </div>

      {/* KPI Cards Block */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <div className="bg-surface border border-outline p-4.5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 18H8.25c-.18 0-.357-.023-.526-.068a11.008 11.008 0 01-.474-2.868L12 14M12 14a3 3 0 11-6 0M12 14L9 9m3 5l3-5" /></svg>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Total Pampered</span>
            <span className="text-xl font-bold font-mono text-on-surface mt-0.5 block">{totalReservations} Customers</span>
          </div>
        </div>

        <div className="bg-surface border border-outline p-4.5 rounded-2xl flex items-center gap-4 shadow-sm col-span-2">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l.18-.362a6.03 6.03 0 012.579-2.58l.362-.181m0 0a3 3 0 114.243-4.243 3 3 0 01-4.243 4.243zM9.53 16.122a9.75 9.75 0 01-2.903-2.903m2.903 2.903L5.2 20.09a.75.75 0 01-1.092-1.092l3.968-3.968m1.264-1.264a9.75 9.75 0 01-2.903-2.903m2.903 2.903v3.086M6.627 13.22a9.75 9.75 0 00-2.903 2.903m2.903-2.903h-3.086" /></svg>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Top Package Choice</span>
            <span className="text-xs font-bold text-on-surface mt-1 block truncate max-w-sm sm:max-w-lg md:max-w-xl">{popularPackage}</span>
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-surface border border-outline rounded-2xl shadow-sm flex flex-col overflow-hidden print:border-none print:shadow-none">
        
        {/* Filters Header (Hidden on print) */}
        <div className="p-4 bg-surface-container-low border-b border-outline flex flex-col sm:flex-row gap-4 items-center justify-between print:hidden">
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            {/* Search */}
            <div className="bg-white border border-outline rounded-xl px-3.5 py-2 flex items-center gap-2.5 w-full sm:w-72">
              <Icons.search className="w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search name or package..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent w-full text-xs outline-none border-none text-on-surface"
              />
            </div>

            {/* Date filter dropdown */}
            <div className="bg-white border border-outline rounded-xl px-3 py-2 flex items-center gap-2 w-full sm:w-48">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase shrink-0">Date:</span>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none border-none text-on-surface w-full cursor-pointer"
              >
                <option value="">All Pamper Days</option>
                {uniqueDates.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider bg-white border border-outline rounded-xl px-4 py-2 flex gap-1 items-center shadow-2xs">
            <span>Showing:</span>
            <span className="font-mono text-primary text-xs">{filteredCustomers.length} Records</span>
          </div>
        </div>

        {/* Sheet styled Table */}
        <div className="overflow-x-auto w-full print:overflow-visible">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline uppercase tracking-wider text-[10px]">
                <th className="p-3.5 pl-6 w-12 text-center">#</th>
                <th className="p-3.5">NAME</th>
                <th className="p-3.5">Mobile #</th>
                <th className="p-3.5">Pamper choose</th>
                <th className="p-3.5 pr-6 print:w-32">Date</th>
                <th className="p-3.5 pr-6 text-center print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10">
              {filteredCustomers.map((c, index) => (
                <tr key={c.id} className="hover:bg-surface-container-low/20 transition duration-150 print:hover:bg-transparent">
                  <td className="p-3.5 pl-6 text-center font-mono font-bold text-on-surface-variant">{index + 1}</td>
                  <td className="p-3.5 font-bold text-on-surface text-sm print:text-xs">{c.name}</td>
                  <td className="p-3.5 font-mono text-on-surface-variant font-medium">{c.mobile}</td>
                  <td className="p-3.5">
                    <span className="bg-primary/5 text-primary border border-primary/15 font-bold text-[11px] px-2.5 py-1 rounded-lg print:border-none print:bg-transparent print:text-zinc-950 print:p-0">
                      {c.pamperChoose}
                    </span>
                  </td>
                  <td className="p-3.5 pr-6 font-semibold font-mono text-on-surface">{c.date}</td>
                  <td className="p-3.5 pr-6 text-center print:hidden">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(c)}
                        className="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-container transition rounded-lg cursor-pointer"
                        title="Edit Record"
                      >
                        <Icons.edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="p-1 text-on-surface-variant hover:text-red-650 hover:bg-red-50 transition rounded-lg cursor-pointer"
                        title="Delete Record"
                      >
                        <Icons.delete className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center gap-2">
                      <Icons.calendar className="w-8 h-8 opacity-45" />
                      <p className="font-bold text-sm">No records found matching filters</p>
                      <p className="text-xs opacity-75">Click "Register Customer" to insert a new pamper reservation</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form for Add/Edit (Hidden on print) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn print:hidden">
          <form onSubmit={handleSave} className="bg-surface border border-outline rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-on-surface">
                {editingId ? "Update Customer Record" : "Register Customer"}
              </h3>
              <p className="text-xs text-on-surface-variant">
                Fill in the details for the customer monitoring log
              </p>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Clara"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2.5 rounded-xl outline-none focus:border-primary text-sm font-semibold transition text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Mobile #</label>
                <input
                  type="text"
                  placeholder="e.g. 0917-123-4567"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2.5 rounded-xl outline-none focus:border-primary text-sm font-semibold transition text-on-surface font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Pamper choose</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Foot Spa & Gel manicure"
                  value={pamperChoose}
                  onChange={(e) => setPamperChoose(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2.5 rounded-xl outline-none focus:border-primary text-sm font-semibold transition text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2.5 rounded-xl outline-none focus:border-primary text-sm font-semibold transition text-on-surface cursor-pointer font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-outline/25">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 border border-outline hover:bg-surface-container-low rounded-xl font-bold text-on-surface transition cursor-pointer text-xs"
              >
                Dismiss
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition cursor-pointer text-xs"
              >
                {editingId ? "Save Changes" : "Register Slot"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
