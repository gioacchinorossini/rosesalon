import React, { useState, useMemo, useEffect } from "react";
import { Icons } from "./Icons";
import { CustomerPamper } from "../app/data/initialData";

interface BookingsPanelProps {
  customerPamper: CustomerPamper[];
  setCustomerPamper: React.Dispatch<React.SetStateAction<CustomerPamper[]>>;
  saveState: (key: string, val: any) => void;
}

export const BookingsPanel: React.FC<BookingsPanelProps> = ({
  customerPamper,
  setCustomerPamper,
  saveState,
}) => {
  // Local UI states
  const [selectedBookingDate, setSelectedBookingDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [custSearch, setCustSearch] = useState("");
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // Form states
  const [editingCustId, setEditingCustId] = useState<string | null>(null);
  const [newCustName, setNewCustName] = useState("");
  const [newCustMobile, setNewCustMobile] = useState("");
  const [newCustPamper, setNewCustPamper] = useState("");

  // Derived state
  const filteredCustomers = useMemo(() => {
    return customerPamper.filter(c =>
      c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
      c.pamperChoose.toLowerCase().includes(custSearch.toLowerCase())
    );
  }, [customerPamper, custSearch]);

  // Fall back to latest booking date if selected date has no appointments on load
  useEffect(() => {
    if (customerPamper.length === 0) return;
    const hasBookingsForSelectedDate = customerPamper.some(c => c.date === selectedBookingDate);
    if (!hasBookingsForSelectedDate) {
      const uniqueDates = Array.from(new Set(customerPamper.map(c => c.date))).filter(Boolean);
      if (uniqueDates.length > 0) {
        uniqueDates.sort((a, b) => b.localeCompare(a));
        setSelectedBookingDate(uniqueDates[0]);
      }
    }
  }, [customerPamper]);

  const handleStartEditCustomer = (c: CustomerPamper) => {
    setEditingCustId(c.id);
    setNewCustName(c.name);
    setNewCustMobile(c.mobile);
    setNewCustPamper(c.pamperChoose);
    setShowAddCustomerModal(true);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPamper) return;

    let updated: CustomerPamper[];
    if (editingCustId) {
      updated = customerPamper.map(c =>
        c.id === editingCustId
          ? { ...c, name: newCustName, mobile: newCustMobile || "N/A", pamperChoose: newCustPamper, date: selectedBookingDate }
          : c
      );
      setEditingCustId(null);
    } else {
      const newCust: CustomerPamper = {
        id: (customerPamper.length + 1).toString() + "-" + Math.floor(Math.random() * 1000),
        name: newCustName,
        mobile: newCustMobile || "N/A",
        pamperChoose: newCustPamper,
        date: selectedBookingDate
      };
      updated = [newCust, ...customerPamper];
    }

    setCustomerPamper(updated);
    saveState("rose_customerPamper", updated);
    setNewCustName("");
    setNewCustMobile("");
    setNewCustPamper("");
    setShowAddCustomerModal(false);
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm("Delete this customer booking?")) {
      const updated = customerPamper.filter(c => c.id !== id);
      setCustomerPamper(updated);
      saveState("rose_customerPamper", updated);
    }
  };

  // Generate 7-day track based on selected booking date or current date
  const dateTracks = useMemo(() => {
    const start = new Date(selectedBookingDate);
    start.setDate(start.getDate() - 3); // Center around selected booking date
    const tracks: string[] = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      tracks.push(current.toISOString().split("T")[0]);
    }
    return tracks;
  }, [selectedBookingDate]);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Bookings</h2>
          <p className="text-xs text-on-surface-variant">View and manage client bookings by day</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingCustId(null);
            setNewCustName("");
            setNewCustMobile("");
            setNewCustPamper("");
            setShowAddCustomerModal(true);
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg self-start cursor-pointer"
        >
          <Icons.add className="w-4.5 h-4.5" />
          Add Booking
        </button>
      </div>

      {/* Timetable Week Header Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Date Input */}
        <div className="flex flex-col gap-1 bg-surface-container-low border border-outline p-3 rounded-xl">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Selected Date</label>
          <input
            type="date"
            value={selectedBookingDate}
            onChange={(e) => setSelectedBookingDate(e.target.value)}
            className="bg-white border border-outline/60 px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer mt-1"
          />
        </div>

        {/* Search bar */}
        <div className="md:col-span-3 bg-surface-container-low border border-outline rounded-xl px-4 py-3 flex items-center gap-3 w-full self-end h-full">
          <Icons.search className="w-4.5 h-4.5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search name or service..."
            value={custSearch}
            onChange={(e) => setCustSearch(e.target.value)}
            className="bg-transparent w-full text-xs outline-none border-none text-on-surface"
          />
        </div>
      </div>

      {/* Quick date tracks */}
      <div className="flex gap-2 bg-surface-container-low p-2 rounded-2xl border border-outline overflow-x-auto">
        {dateTracks.map(d => {
          const isSelected = selectedBookingDate === d;
          const dateObj = new Date(d);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = dateObj.toLocaleDateString('en-US', { day: 'numeric' });
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedBookingDate(d)}
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

      {/* Timetable Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.filter(c => c.date === selectedBookingDate).map((c, i) => (
          <div key={c.id} className="bg-white border border-outline p-5 rounded-2xl flex flex-col justify-between h-44 hover:border-primary/50 hover:shadow-md transition group relative">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-on-surface-variant bg-surface-container border border-outline/20 px-2 py-0.5 rounded uppercase">
                    Booking #{i + 1}
                  </span>
                  <h4 className="font-bold text-base text-on-surface mt-1">{c.name}</h4>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartEditCustomer(c)}
                    className="text-on-surface-variant hover:text-primary transition p-1 hover:bg-surface-container-low rounded-md"
                    title="Edit booking"
                  >
                    <Icons.edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomer(c.id)}
                    className="text-on-surface-variant hover:text-red-500 transition p-1 hover:bg-red-50 rounded-md"
                    title="Delete booking"
                  >
                    <Icons.delete className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-1 text-xs">
                <p className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
                  <span className="font-semibold text-on-surface">Phone:</span> {c.mobile}
                </p>

                <div className="mt-2 bg-primary/5 border border-primary/10 rounded-xl px-3 py-2 text-xs font-bold text-primary self-start flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l.18-.362a6.03 6.03 0 012.579-2.58l.362-.181m0 0a3 3 0 114.243-4.243 3 3 0 01-4.243 4.243zM9.53 16.122a9.75 9.75 0 01-2.903-2.903m2.903 2.903L5.2 20.09a.75.75 0 01-1.092-1.092l3.968-3.968m1.264-1.264a9.75 9.75 0 01-2.903-2.903m2.903 2.903v3.086M6.627 13.22a9.75 9.75 0 00-2.903 2.903m2.903-2.903h-3.086" /></svg>
                  <span>{c.pamperChoose}</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-on-surface-variant border-t border-outline/10 pt-2 font-mono font-bold text-right flex items-center justify-end gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              <span>Date: {c.date}</span>
            </div>
          </div>
        ))}

        {filteredCustomers.filter(c => c.date === selectedBookingDate).length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-on-surface-variant bg-surface-container-low border border-outline border-dashed rounded-2xl flex flex-col items-center justify-center gap-3">
            <Icons.calendar className="w-8 h-8 opacity-40 text-on-surface-variant" />
            <div>
              <p className="font-bold">No bookings for this day</p>
              <p className="opacity-75 mt-0.5">Click "Add Booking" to add one</p>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT CUSTOMER RESERVATION */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form onSubmit={handleAddCustomer} className="bg-surface border border-outline rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-on-surface">{editingCustId ? "Edit Booking" : "Add Booking"}</h3>
              <p className="text-xs text-on-surface-variant">Add booking details below</p>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Clara"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2.5 rounded-xl outline-none focus:border-primary text-sm font-semibold transition text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 0917-123-4567"
                  value={newCustMobile}
                  onChange={(e) => setNewCustMobile(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2.5 rounded-xl outline-none focus:border-primary text-sm font-semibold transition text-on-surface font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Service Requested</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Foot Spa & Gel manicure"
                  value={newCustPamper}
                  onChange={(e) => setNewCustPamper(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2.5 rounded-xl outline-none focus:border-primary text-sm font-semibold transition text-on-surface"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-outline/25">
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
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
