import React, { useState, useMemo, useEffect } from "react";
import { Icons } from "./Icons";
import { ServiceLog, ServiceItem, StaffMember } from "../app/data/initialData";

interface ServicesLogPanelProps {
  servicesLog: ServiceLog[];
  setServicesLog: React.Dispatch<React.SetStateAction<ServiceLog[]>>;
  services: ServiceItem[];
  staffs: StaffMember[];
  saveState: (key: string, val: any) => void;
}

export const ServicesLogPanel: React.FC<ServicesLogPanelProps> = ({
  servicesLog,
  setServicesLog,
  services,
  staffs,
  saveState,
}) => {
  // Local UI states
  const [selectedLogDate, setSelectedLogDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [logSearch, setLogSearch] = useState("");
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [viewMode, setViewMode] = useState<'row' | 'grid'>('row');

  // Form states
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedStaffCode, setSelectedStaffCode] = useState("");
  const [servicePrice, setServicePrice] = useState<number>(0);
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Derived active service & stylist mappings for quick lookups
  const serviceMap = useMemo(() => {
    return new Map(services.map(s => [s.name, s]));
  }, [services]);

  const staffMap = useMemo(() => {
    return new Map(staffs.map(s => [s.code, s]));
  }, [staffs]);

  // Derived state for list filtering
  const filteredLogs = useMemo(() => {
    return servicesLog.filter(log =>
      log.customerName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.serviceName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.staffName.toLowerCase().includes(logSearch.toLowerCase())
    );
  }, [servicesLog, logSearch]);

  // If there are no logs for the selected date on load/log change, fallback to the latest date with logs
  useEffect(() => {
    if (servicesLog.length === 0) return;
    const hasLogsForSelectedDate = servicesLog.some(log => log.date === selectedLogDate);
    if (!hasLogsForSelectedDate) {
      const uniqueDates = Array.from(new Set(servicesLog.map(log => log.date))).filter(Boolean);
      if (uniqueDates.length > 0) {
        uniqueDates.sort((a, b) => b.localeCompare(a));
        setSelectedLogDate(uniqueDates[0]);
      }
    }
  }, [servicesLog]);

  const handleStartEditLog = (log: ServiceLog) => {
    setEditingLogId(log.id);
    setCustomerName(log.customerName);
    
    // Find matching service item by name
    const sItem = services.find(s => s.name === log.serviceName);
    setSelectedServiceId(sItem ? sItem.id : "");
    
    setSelectedStaffCode(log.staffName);
    setServicePrice(log.price);
    setLogDate(log.date);
    setShowAddLogModal(true);
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const sItem = services.find(s => s.id === serviceId);
    if (sItem) {
      setServicePrice(sItem.price);
    }
  };

  const handleAddLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedServiceId || !selectedStaffCode) return;

    const selectedService = services.find(s => s.id === selectedServiceId);
    const selectedStaff = staffs.find(s => s.code === selectedStaffCode);

    if (!selectedService || !selectedStaff) return;

    let updated: ServiceLog[];
    if (editingLogId) {
      updated = servicesLog.map(l =>
        l.id === editingLogId
          ? {
              ...l,
              customerName,
              serviceName: selectedService.name,
              staffName: selectedStaff.code,
              price: Number(servicePrice),
              date: logDate
            }
          : l
      );
      setEditingLogId(null);
    } else {
      const newLog: ServiceLog = {
        id: (servicesLog.length + 1).toString() + "-" + Math.floor(Math.random() * 1000),
        customerName,
        serviceName: selectedService.name,
        staffName: selectedStaff.code,
        price: Number(servicePrice),
        date: logDate
      };
      updated = [newLog, ...servicesLog];
    }

    setServicesLog(updated);
    saveState("rose_servicesLog", updated);
    
    // Reset form states
    setCustomerName("");
    setSelectedServiceId("");
    setSelectedStaffCode("");
    setServicePrice(0);
    setShowAddLogModal(false);
  };

  const handleDeleteLog = (id: string) => {
    if (confirm("Are you sure you want to delete this service log entry?")) {
      const updated = servicesLog.filter(l => l.id !== id);
      setServicesLog(updated);
      saveState("rose_servicesLog", updated);
    }
  };

  // Generate 7-day track centered around selected log date
  const dateTracks = useMemo(() => {
    const start = new Date(selectedLogDate);
    start.setDate(start.getDate() - 3);
    const tracks: string[] = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      tracks.push(current.toISOString().split("T")[0]);
    }
    return tracks;
  }, [selectedLogDate]);

  // Helper to resolve icon based on service category
  const getCategoryIcon = (serviceName: string): React.ReactNode => {
    const sItem = serviceMap.get(serviceName);
    if (!sItem) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      );
    }
    switch (sItem.category) {
      case "Hair":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
        );
      case "Nails":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l.18-.362a6.03 6.03 0 012.579-2.58l.362-.181m0 0a3 3 0 114.243-4.243 3 3 0 01-4.243 4.243zM9.53 16.122a9.75 9.75 0 01-2.903-2.903m2.903 2.903L5.2 20.09a.75.75 0 01-1.092-1.092l3.968-3.968m1.264-1.264a9.75 9.75 0 01-2.903-2.903m2.903 2.903v3.086M6.627 13.22a9.75 9.75 0 00-2.903 2.903m2.903-2.903h-3.086" /></svg>
        );
      case "Aesthetic":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l3.582-1.791L16.164 21l-.813-5.096 3.704-3.61-5.118-.744L12 7l-2.062 4.55-5.118.744 3.704 3.61z" /></svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Services Log</h2>
          <p className="text-xs text-on-surface-variant">Track Completed services, stylist assignments, and earnings</p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-auto w-full md:w-auto justify-between md:justify-end">
          {/* View Mode Toggle */}
          <div className="bg-surface-container-low border border-outline rounded-xl p-1 flex gap-1 items-center">
            <button
              type="button"
              onClick={() => setViewMode('row')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'row'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/10'
              }`}
            >
              <Icons.list className="w-3.5 h-3.5" />
              Rows
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/10'
              }`}
            >
              <Icons.grid className="w-3.5 h-3.5" />
              Cards
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingLogId(null);
              setCustomerName("");
              setSelectedServiceId(services[0]?.id || "");
              setServicePrice(services[0]?.price || 0);
              setSelectedStaffCode(staffs.find(s => s.status === 'Active')?.code || "");
              setLogDate(selectedLogDate);
              setShowAddLogModal(true);
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg cursor-pointer"
          >
            <Icons.add className="w-4.5 h-4.5" />
            Log Completed Service
          </button>
        </div>
      </div>

      {/* Selector and Filter Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Date Selector */}
        <div className="flex flex-col gap-1 bg-surface-container-low border border-outline p-3 rounded-xl">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Active Services Date</label>
          <input
            type="date"
            value={selectedLogDate}
            onChange={(e) => setSelectedLogDate(e.target.value)}
            className="bg-white border border-outline/60 px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer mt-1"
          />
        </div>

        {/* Search bar */}
        <div className="md:col-span-3 bg-surface-container-low border border-outline rounded-xl px-4 py-3 flex items-center gap-3 w-full self-end h-full">
          <Icons.search className="w-4.5 h-4.5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search client name, service, or stylist..."
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            className="bg-transparent w-full text-xs outline-none border-none text-on-surface"
          />
        </div>
      </div>

      {/* Date track timeline */}
      <div className="flex gap-2 bg-surface-container-low p-2 rounded-2xl border border-outline overflow-x-auto">
        {dateTracks.map(d => {
          const isSelected = selectedLogDate === d;
          const dateObj = new Date(d);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = dateObj.toLocaleDateString('en-US', { day: 'numeric' });
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedLogDate(d)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-16 transition-all duration-155 cursor-pointer ${isSelected
                  ? 'bg-primary text-white shadow-md scale-105'
                  : 'bg-white hover:bg-primary-container/20 text-on-surface-variant hover:text-primary border border-outline/20'
                }`}
            >
              <span className="text-[10px] font-bold uppercase">{dayName}</span>
              <span className="text-sm font-black mt-1">{dayNum}</span>
            </button>
          );
        })}
      </div>

      {viewMode === 'row' ? (
        /* Logs Table / Row List */
        <div className="bg-white border border-outline rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline font-bold">
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Service Logged</th>
                  <th className="p-3.5">Assigned Stylist</th>
                  <th className="p-3.5 text-right">Price Charged</th>
                  <th className="p-3.5 text-center">Date Performed</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10 text-on-surface">
                {filteredLogs.filter(log => log.date === selectedLogDate).map((log, i) => {
                  const stylist = staffMap.get(log.staffName);
                  return (
                    <tr key={log.id} className="hover:bg-surface-container-low/20 transition-all font-medium animate-fadeIn">
                      <td className="p-3.5 font-bold text-on-surface-variant">#{i + 1}</td>
                      <td className="p-3.5 font-bold text-on-surface text-sm">{log.customerName}</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 bg-primary/5 border border-primary/10 rounded-xl px-2.5 py-1 text-xs font-bold text-primary">
                          {getCategoryIcon(log.serviceName)}
                          <span>{log.serviceName}</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-on-surface">
                          {stylist ? stylist.name : log.staffName}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-mono ml-1.5 font-bold bg-surface-container px-1.5 py-0.5 rounded border border-outline/20">
                          {log.staffName}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-700 text-sm">
                        ₱{log.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-on-surface-variant text-[11px]">
                        {log.date}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEditLog(log)}
                            className="text-on-surface-variant hover:text-primary transition p-1.5 hover:bg-surface-container-low rounded-md"
                            title="Edit Log"
                          >
                            <Icons.edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLog(log.id)}
                            className="text-on-surface-variant hover:text-red-500 transition p-1.5 hover:bg-red-50 rounded-md"
                            title="Delete Log"
                          >
                            <Icons.delete className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredLogs.filter(log => log.date === selectedLogDate).length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-xs text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Icons.calendar className="w-8 h-8 opacity-40 text-on-surface-variant" />
                        <div>
                          <p className="font-bold">No services logged for this day</p>
                          <p className="opacity-75 mt-0.5">Click "Log Completed Service" to register a transaction</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredLogs.filter(log => log.date === selectedLogDate).length > 0 && (
                <tfoot>
                  <tr className="bg-surface-container-low text-on-surface font-bold border-t border-outline">
                    <td colSpan={4} className="p-3.5 text-right uppercase text-xs">Daily Service Total:</td>
                    <td className="p-3.5 text-right text-emerald-850 font-mono text-sm font-black">
                      ₱{filteredLogs.filter(log => log.date === selectedLogDate).reduce((sum, item) => sum + item.price, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      ) : (
        /* Logs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLogs.filter(log => log.date === selectedLogDate).map((log, i) => {
            const stylist = staffMap.get(log.staffName);
            return (
              <div key={log.id} className="bg-white border border-outline p-5 rounded-2xl flex flex-col justify-between h-44 hover:border-primary/50 hover:shadow-md transition group relative">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-on-surface-variant bg-surface-container border border-outline/20 px-2 py-0.5 rounded uppercase">
                        Log Record #{i + 1}
                      </span>
                      <h4 className="font-bold text-base text-on-surface mt-1">{log.customerName}</h4>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEditLog(log)}
                        className="text-on-surface-variant hover:text-primary transition p-1 hover:bg-surface-container-low rounded-md"
                        title="Edit Log"
                      >
                        <Icons.edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-on-surface-variant hover:text-red-500 transition p-1 hover:bg-red-50 rounded-md"
                        title="Delete Log"
                      >
                        <Icons.delete className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 mt-1 text-xs">
                    <p className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
                      <span className="font-semibold text-on-surface">Stylist:</span> {stylist ? `${stylist.name} (${log.staffName})` : log.staffName}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="bg-primary/5 border border-primary/10 rounded-xl px-3 py-2 text-xs font-bold text-primary flex items-center gap-1.5">
                        {getCategoryIcon(log.serviceName)}
                        <span>{log.serviceName}</span>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700">
                        ₱{log.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-on-surface-variant border-t border-outline/10 pt-2 font-mono font-bold text-right flex items-center justify-end gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                  <span>Rendered: {log.date}</span>
                </div>
              </div>
            );
          })}

          {filteredLogs.filter(log => log.date === selectedLogDate).length === 0 && (
            <div className="col-span-full py-16 text-center text-xs text-on-surface-variant bg-surface-container-low border border-outline border-dashed rounded-2xl flex flex-col items-center justify-center gap-3">
              <Icons.calendar className="w-8 h-8 opacity-40 text-on-surface-variant" />
              <div>
                <p className="font-bold">No services logged for this day</p>
                <p className="opacity-75 mt-0.5">Click "Log Completed Service" to register a transaction</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: LOG NEW / MODIFY RENDERED SERVICE */}
      {showAddLogModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form onSubmit={handleAddLogSubmit} className="bg-surface border border-outline rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-on-surface">{editingLogId ? "Update Service Log" : "Log Completed Service"}</h3>
              <p className="text-xs text-on-surface-variant">Record treatment details and service commission metrics</p>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              {/* Customer Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2.5 rounded-xl outline-none focus:border-primary text-sm font-semibold transition text-on-surface"
                />
              </div>

              {/* Service Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Service Performed</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2.5 rounded-xl outline-none focus:border-primary text-sm font-semibold transition text-on-surface cursor-pointer"
                >
                  <option value="" disabled>Select a service...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (₱{s.price})</option>
                  ))}
                </select>
              </div>

              {/* Price input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Charged Price (₱)</label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="Service price"
                  value={servicePrice || ""}
                  onChange={(e) => setServicePrice(Number(e.target.value))}
                  className="bg-white border border-outline px-3.5 py-2.5 rounded-xl outline-none focus:border-primary text-sm font-semibold transition text-on-surface"
                />
              </div>

              {/* Stylist Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Assigned Stylist</label>
                <select
                  value={selectedStaffCode}
                  onChange={(e) => setSelectedStaffCode(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2.5 rounded-xl outline-none focus:border-primary text-sm font-semibold transition text-on-surface cursor-pointer"
                >
                  <option value="" disabled>Select stylist...</option>
                  {staffs.filter(s => s.status === 'Active').map(s => (
                    <option key={s.id} value={s.code}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Date Performed</label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2.5 rounded-xl outline-none focus:border-primary text-sm font-semibold transition text-on-surface cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-outline/25">
              <button
                type="button"
                onClick={() => setShowAddLogModal(false)}
                className="px-4 py-2.5 border border-outline hover:bg-surface-container-low rounded-xl font-bold text-on-surface transition cursor-pointer text-xs"
              >
                Dismiss
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition cursor-pointer text-xs"
              >
                {editingLogId ? "Update Log" : "Log Service"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
