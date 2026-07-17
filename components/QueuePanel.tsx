import React, { useState, useEffect, useMemo } from "react";
import { Icons } from "./Icons";
import { ServiceItem, StaffMember } from "../app/data/initialData";

interface QueuePanelProps {
  services: ServiceItem[];
  staffs: StaffMember[];
  ongoingServices: Array<{
    id: string;
    customerName: string;
    services: Array<{ id: string; service: string; price: number; commissionRate?: number }>;
    staffCode: string;
    startTime: string; // ISO string
    date: string;
  }>;
  setOngoingServices: React.Dispatch<React.SetStateAction<Array<{
    id: string;
    customerName: string;
    services: Array<{ id: string; service: string; price: number; commissionRate?: number }>;
    staffCode: string;
    startTime: string;
    date: string;
  }>>>;
  setActiveOngoingId: (id: string | null) => void;
  setActivePanel: (panel: 'dashboard' | 'salesLedger' | 'pos' | 'services' | 'payslips' | 'payments' | 'bookings' | 'supplies' | 'staffs' | 'servicesLog' | 'queue') => void;
  saveState: (key: string, val: any) => void;
}

// Sub-component to display active live elapsed timer
const QueueElapsedTimer: React.FC<{ startTime: string }> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const calculateElapsed = () => {
      const diffMs = Date.now() - new Date(startTime).getTime();
      if (diffMs < 0) return "0m";
      const totalMinutes = Math.floor(diffMs / 60000);
      const hrs = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      if (hrs > 0) {
        return `${hrs}h ${mins}m`;
      }
      return `${mins}m`;
    };

    setElapsed(calculateElapsed());
    const interval = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 10000); // Update every 10s for responsiveness

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <span className="font-mono text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary/10 flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{elapsed} active</span>
    </span>
  );
};

export const QueuePanel: React.FC<QueuePanelProps> = ({
  services,
  staffs,
  ongoingServices,
  setOngoingServices,
  setActiveOngoingId,
  setActivePanel,
  saveState,
}) => {
  // New walk-in queue builder states
  const [customerName, setCustomerName] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(() => staffs.find(s => s.status === 'Active')?.code || "");
  const [isStylistPopupOpen, setIsStylistPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'Hair' | 'Nails' | 'Aesthetic' | 'Other'>('ALL');
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);

  // Filter service catalog
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchCat = selectedCategory === 'ALL' || s.category === selectedCategory;
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  // Statistics Computations
  const stats = useMemo(() => {
    const totalActive = ongoingServices.length;
    let totalEstRevenue = 0;
    let longestSessionMin = 0;

    ongoingServices.forEach(item => {
      const itemSubtotal = item.services.reduce((sum, s) => sum + s.price, 0);
      totalEstRevenue += itemSubtotal;

      const elapsedMin = Math.floor((Date.now() - new Date(item.startTime).getTime()) / 60000);
      if (elapsedMin > longestSessionMin) {
        longestSessionMin = elapsedMin;
      }
    });

    const formatLongest = () => {
      if (longestSessionMin <= 0) return "0m";
      const h = Math.floor(longestSessionMin / 60);
      const m = longestSessionMin % 60;
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return {
      totalActive,
      totalEstRevenue,
      longestSession: formatLongest()
    };
  }, [ongoingServices]);

  // Handlers
  const handleToggleService = (item: ServiceItem) => {
    if (selectedServices.find(s => s.id === item.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== item.id));
    } else {
      setSelectedServices([...selectedServices, item]);
    }
  };

  const handleStartTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert("Please provide a client name.");
      return;
    }
    if (selectedServices.length === 0) {
      alert("Please select at least one service.");
      return;
    }

    const mappedServices = selectedServices.map((s, idx) => ({
      id: `${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      service: s.name,
      price: s.price,
      commissionRate: s.commissionRate
    }));

    const newOngoing = {
      id: "ongoing-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      customerName: customerName.trim(),
      services: mappedServices,
      staffCode: selectedStaff || staffs.find(s => s.status === 'Active')?.code || "",
      startTime: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0]
    };

    const updated = [...ongoingServices, newOngoing];
    setOngoingServices(updated);
    saveState("rose_ongoingServices", updated);

    // Reset inputs
    setCustomerName("");
    setSelectedServices([]);
    alert(`Successfully checked in ${newOngoing.customerName} into the queue.`);
  };

  const handleCancelOngoing = (id: string) => {
    if (confirm("Are you sure you want to cancel and remove this active treatment session?")) {
      const updated = ongoingServices.filter(item => item.id !== id);
      setOngoingServices(updated);
      saveState("rose_ongoingServices", updated);
    }
  };

  const handleCheckoutOngoing = (id: string) => {
    setActiveOngoingId(id);
    setActivePanel('pos');
  };

  const getStaffName = (code: string) => {
    const s = staffs.find(staff => staff.code === code);
    return s ? s.name : code;
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header section */}
      <div className="border-b border-outline pb-4 flex flex-col gap-2">
        <h2 className="text-xl font-bold text-on-surface">Queue Board</h2>
        <p className="text-xs text-on-surface-variant">
          Monitor and manage active, in-chair treatment sessions currently operating in the salon.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-outline/25 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block tracking-wider">Active Treatments</span>
            <span className="text-2xl font-black text-primary mt-1 block">{stats.totalActive} Clients</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
          </div>
        </div>

        <div className="bg-surface border border-outline/25 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block tracking-wider">Longest Active Wait</span>
            <span className="text-2xl font-black text-secondary mt-1 block">{stats.longestSession}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>

        <div className="bg-surface border border-outline/25 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block tracking-wider">Estimated Queue Value</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">₱{stats.totalEstRevenue.toLocaleString()}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            ₱
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active treatments cards list */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <h3 className="font-bold text-sm text-on-surface">Clients Currently In-Chair ({ongoingServices.length})</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ongoingServices.map(item => {
              const subtotal = item.services.reduce((sum, s) => sum + s.price, 0);
              return (
                <div key={item.id} className="bg-white border border-outline rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition gap-4 relative">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">{item.customerName}</h4>
                        <span className="text-[10px] font-semibold text-on-surface-variant block mt-0.5">
                          Stylist: <span className="text-primary font-bold">{getStaffName(item.staffCode)}</span>
                        </span>
                      </div>
                      <QueueElapsedTimer startTime={item.startTime} />
                    </div>

                    <div className="border-t border-outline/10 pt-2 flex flex-col gap-1">
                      <span className="text-[9px] uppercase font-black text-on-surface-variant tracking-wider block">Selected Services</span>
                      <div className="flex flex-col gap-1 max-h-20 overflow-y-auto pr-1">
                        {item.services.map((s, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] font-medium text-on-surface bg-surface-container-low px-2 py-1 rounded border border-outline/10">
                            <span className="truncate pr-1">{s.service}</span>
                            <span className="font-bold shrink-0">₱{s.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-outline/10 pt-3 flex justify-between items-center mt-2">
                    <div>
                      <span className="text-[9px] text-on-surface-variant block uppercase font-bold tracking-wider">Subtotal</span>
                      <span className="text-sm font-black text-primary">₱{subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCancelOngoing(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition text-[10px] font-bold cursor-pointer"
                        title="Cancel Treatment"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCheckoutOngoing(item.id)}
                        className="bg-primary hover:bg-primary/90 text-white px-3.5 py-2 rounded-xl text-[10px] font-bold transition shadow-sm cursor-pointer"
                      >
                        Checkout & Pay
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {ongoingServices.length === 0 && (
              <div className="col-span-2 bg-surface-container-low border border-dashed border-outline/30 rounded-2xl py-12 px-4 text-center flex flex-col items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-on-surface-variant/40"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h4 className="font-bold text-xs text-on-surface">Queue is currently empty</h4>
                <p className="text-[10px] text-on-surface-variant max-w-[240px]">
                  Use the check-in form on the right to start a treatment session for a walk-in client.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Check-in new client form */}
        <div className="lg:col-span-4 bg-surface border border-outline rounded-2xl p-4 flex flex-col gap-4">
          <h3 className="font-bold text-sm text-on-surface border-b border-outline/10 pb-2">Check-in Walk-in Client</h3>

          <form onSubmit={handleStartTreatment} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Client Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Clara"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-white border border-outline px-3.5 py-2 rounded-xl text-xs font-semibold outline-none text-on-surface focus:border-primary transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Assign Stylist</label>
              <button
                type="button"
                onClick={() => setIsStylistPopupOpen(true)}
                className="bg-white border border-outline px-3 py-2 rounded-xl text-xs font-semibold text-left flex items-center justify-between hover:bg-surface-container-low transition cursor-pointer text-on-surface w-full h-[34px]"
              >
                <span className="truncate">
                  {staffs.find(s => s.code === selectedStaff)?.name || selectedStaff} ({selectedStaff})
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-on-surface-variant shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>

            {/* Service Catalog Selection */}
            <div className="flex flex-col gap-2 border border-outline/10 p-3 rounded-2xl bg-surface-container-low">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Add Services</label>
              
              {/* Category tabs */}
              <div className="flex flex-wrap gap-1 border-b border-outline/10 pb-2">
                {(['ALL', 'Hair', 'Nails', 'Aesthetic', 'Other'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded text-[9px] font-black uppercase transition ${
                      selectedCategory === cat ? 'bg-primary text-white' : 'text-on-surface-variant bg-white hover:text-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-outline px-2.5 py-1.5 rounded-lg text-[10px] outline-none text-on-surface focus:border-primary"
              />

              {/* Scrollable list */}
              <div className="max-h-36 overflow-y-auto flex flex-col gap-1 pr-1 mt-1">
                {filteredServices.map(item => {
                  const isChecked = selectedServices.some(s => s.id === item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleService(item)}
                      className={`flex justify-between items-center text-left text-[10px] font-semibold p-2 rounded-lg border transition ${
                        isChecked
                          ? 'border-primary/50 bg-primary/5 text-primary'
                          : 'border-outline/15 bg-white text-on-surface hover:border-primary/30'
                      }`}
                    >
                      <span className="truncate pr-1">{item.name}</span>
                      <span className="font-mono font-bold shrink-0">₱{item.price.toLocaleString()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected items indicator */}
            {selectedServices.length > 0 && (
              <div className="flex flex-col gap-1 border border-outline/10 p-3 rounded-2xl bg-white">
                <span className="text-[9px] uppercase font-black text-on-surface-variant tracking-wider">Services to start</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedServices.map(s => (
                    <span key={s.id} className="inline-flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded text-[10px] font-semibold text-on-surface">
                      {s.name}
                      <button
                        type="button"
                        onClick={() => handleToggleService(s)}
                        className="text-red-500 hover:text-red-750 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl transition shadow-md hover:shadow-lg text-xs mt-2 cursor-pointer"
            >
              Start Treatment & Add to Queue
            </button>
          </form>
        </div>
      </div>

      {/* Stylist Selector Popup Modal */}
      {isStylistPopupOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-outline rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto transform scale-100 transition-all duration-200">
            <div className="flex justify-between items-center border-b border-outline/20 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-on-surface flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  <span>Select Stylist</span>
                </h3>
                <p className="text-xs text-on-surface-variant">Assign a stylist for this treatment session.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsStylistPopupOpen(false)}
                className="p-1.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {staffs.filter(s => s.status === 'Active').map(s => {
                const isSelected = s.code === selectedStaff;
                const activeOngoingCount = ongoingServices.filter(os => os.staffCode === s.code).length;
                
                // Initials for avatar
                const initials = s.name.substring(0, 2).toUpperCase();
                
                return (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => {
                      setSelectedStaff(s.code);
                      setIsStylistPopupOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition text-left cursor-pointer ${
                      isSelected 
                        ? 'border-primary bg-primary/5 hover:bg-primary/10' 
                        : 'border-outline/50 hover:border-primary/50 hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isSelected ? 'bg-primary text-white' : 'bg-secondary/10 text-secondary'
                      }`}>
                        {initials}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                          {s.name} <span className="text-[10px] text-on-surface-variant font-mono">({s.code})</span>
                        </div>
                        <div className="text-[10px] text-on-surface-variant">{s.role}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 font-semibold text-[10px]">
                      <span className="text-on-surface-variant">
                        {Math.round(s.commissionRate * 100)}% Rate
                      </span>
                      {activeOngoingCount > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary font-bold flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>{activeOngoingCount} in chair</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Available</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
