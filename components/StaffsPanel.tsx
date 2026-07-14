import React, { useState } from "react";
import { Icons } from "./Icons";
import { StaffMember } from "../app/data/initialData";

interface StaffsPanelProps {
  staffs: StaffMember[];
  setStaffs: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  activeStaffName: string;
  setActiveStaffName: (name: string) => void;
  saveState: (key: string, val: any) => void;
}

export const StaffsPanel: React.FC<StaffsPanelProps> = ({
  staffs,
  setStaffs,
  activeStaffName,
  setActiveStaffName,
  saveState,
}) => {
  // Modal toggle state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // Form states
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [newStaffCode, setNewStaffCode] = useState("");
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("Hair Specialist");
  const [newStaffMobile, setNewStaffMobile] = useState("");
  const [newStaffDailyRate, setNewStaffDailyRate] = useState<number>(200);
  const [newStaffCommRate, setNewStaffCommRate] = useState<number>(0.27);
  const [newStaffStatus, setNewStaffStatus] = useState<"Active" | "Inactive">("Active");
  const [newStaffHireDate, setNewStaffHireDate] = useState("");
  const [newStaffNotes, setNewStaffNotes] = useState("");

  const handleStartEditStaff = (staff: StaffMember) => {
    setEditingStaffId(staff.id);
    setNewStaffCode(staff.code);
    setNewStaffName(staff.name);
    setNewStaffRole(staff.role);
    setNewStaffMobile(staff.mobile);
    setNewStaffDailyRate(staff.dailyRate);
    setNewStaffCommRate(staff.commissionRate);
    setNewStaffStatus(staff.status);
    setNewStaffHireDate(staff.hireDate);
    setNewStaffNotes(staff.notes || "");
    setShowAddStaffModal(true);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffCode || !newStaffName) return;

    const upperCode = newStaffCode.trim().toUpperCase();
    if (staffs.some(s => s.code === upperCode && s.id !== editingStaffId)) {
      alert("A staff member with this code already exists. Please choose a unique code (e.g. Genesis -> GENE).");
      return;
    }

    let updated: StaffMember[];
    if (editingStaffId) {
      updated = staffs.map(s =>
        s.id === editingStaffId
          ? {
              ...s,
              code: upperCode,
              name: newStaffName.trim(),
              role: newStaffRole,
              mobile: newStaffMobile.trim(),
              dailyRate: Number(newStaffDailyRate),
              commissionRate: Number(newStaffCommRate),
              status: newStaffStatus,
              hireDate: newStaffHireDate,
              notes: newStaffNotes.trim(),
            }
          : s
      );
      setEditingStaffId(null);
      alert("Staff member updated successfully.");
    } else {
      const newStaff: StaffMember = {
        id: Date.now().toString(),
        code: upperCode,
        name: newStaffName.trim(),
        role: newStaffRole,
        mobile: newStaffMobile.trim(),
        dailyRate: Number(newStaffDailyRate),
        commissionRate: Number(newStaffCommRate),
        status: newStaffStatus,
        hireDate: newStaffHireDate || new Date().toISOString().split("T")[0],
        notes: newStaffNotes.trim(),
      };
      updated = [...staffs, newStaff];
      alert("New staff member registered successfully.");
    }
    setStaffs(updated);
    saveState("rose_staffs", updated);
    setShowAddStaffModal(false);
  };

  const handleDeleteStaff = (id: string) => {
    const staff = staffs.find(s => s.id === id);
    if (!staff) return;
    if (confirm(`Are you sure you want to remove ${staff.name} (${staff.code}) from the roster?`)) {
      const updated = staffs.filter(s => s.id !== id);
      setStaffs(updated);
      saveState("rose_staffs", updated);
      if (activeStaffName === staff.code && updated.length > 0) {
        setActiveStaffName(updated[0].code);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Staff & Stylist Directory</h2>
          <p className="text-xs text-on-surface-variant">Register and manage salon stylists, commission settings, and roster status</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingStaffId(null);
            setNewStaffCode("");
            setNewStaffName("");
            setNewStaffRole("Hair Specialist");
            setNewStaffMobile("");
            setNewStaffDailyRate(200);
            setNewStaffCommRate(0.27);
            setNewStaffStatus("Active");
            setNewStaffHireDate(new Date().toISOString().split("T")[0]);
            setNewStaffNotes("");
            setShowAddStaffModal(true);
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg self-start cursor-pointer"
        >
          <Icons.add className="w-4.5 h-4.5" />
          Add Staff
        </button>
      </div>

      {/* Staff Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffs.map((staff) => {
          const isActive = staff.status === "Active";
          const initials = staff.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

          return (
            <div key={staff.id} className="bg-white border border-outline p-5 rounded-2xl flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition">
              <div className="flex flex-col gap-4">
                {/* Top profile line */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-sm shadow-inner">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-on-surface leading-tight">{staff.name}</h4>
                        <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-surface-container text-primary border border-outline/35 font-mono">
                          {staff.code}
                        </span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant font-medium mt-0.5 block">{staff.role}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                    {staff.status}
                  </span>
                </div>

                {/* Contact and Hire Date */}
                <div className="text-[11px] text-on-surface-variant flex flex-col gap-1.5 border-y border-outline/10 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-on-surface/80">Mobile:</span>
                    <span className="font-mono">{staff.mobile || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-on-surface/80">Hire Date:</span>
                    <span>{staff.hireDate}</span>
                  </div>
                  {staff.notes && (
                    <div className="mt-1 bg-surface-container-low p-2 rounded-lg border border-outline/10 italic text-[10px] text-on-surface-variant/90 leading-relaxed">
                      "{staff.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Rates & Actions */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-col">
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Salary & Comm</span>
                  <span className="text-xs font-bold text-on-surface">
                    ₱{staff.dailyRate.toLocaleString()}/day • <span className="text-primary font-mono">{Math.round(staff.commissionRate * 100)}%</span>
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartEditStaff(staff)}
                    className="flex items-center gap-1 text-primary hover:underline font-bold text-[11px] px-2 py-1 rounded hover:bg-primary-container/20 transition cursor-pointer"
                  >
                    <Icons.edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteStaff(staff.id)}
                    className="flex items-center gap-1 text-red-555 hover:text-red-700 font-bold text-[11px] px-2 py-1 rounded hover:bg-red-55 transition cursor-pointer"
                  >
                    <Icons.delete className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT STAFF MEMBER */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form onSubmit={handleAddStaff} className="bg-surface border border-outline rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-on-surface">{editingStaffId ? "Update Staff Profile" : "Register Staff Member"}</h3>
              <p className="text-xs text-on-surface-variant">Update active stylists, default rates, and commission tiers</p>
            </div>

            <div className="flex flex-col gap-3 text-xs max-h-[460px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Stylist Code (Unique)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JEPO"
                    value={newStaffCode}
                    onChange={(e) => setNewStaffCode(e.target.value)}
                    disabled={!!editingStaffId}
                    className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary text-xs font-bold uppercase disabled:bg-surface-container-low"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jepoy Salazar"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Role / Service Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Hairdresser"
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Mobile Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. 0918-123-4567"
                    value={newStaffMobile}
                    onChange={(e) => setNewStaffMobile(e.target.value)}
                    className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Daily Rate Pay (₱)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newStaffDailyRate || ""}
                    onChange={(e) => setNewStaffDailyRate(Number(e.target.value))}
                    className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary text-xs font-mono font-bold text-right"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Stylist Commission Share</label>
                  <select
                    value={newStaffCommRate}
                    onChange={(e) => setNewStaffCommRate(Number(e.target.value))}
                    className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary text-xs font-semibold cursor-pointer"
                  >
                    <option value={0.27}>27% (Standard Tier)</option>
                    <option value={0.36}>36% (Premium Tier)</option>
                    <option value={0.16}>16% (Junior Tier)</option>
                    <option value={0.0}>0% (Hourly Flat)</option>
                    <option value={0.5}>50% (Co-owner / Split)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Roster Status</label>
                  <select
                    value={newStaffStatus}
                    onChange={(e) => setNewStaffStatus(e.target.value as "Active" | "Inactive")}
                    className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary text-xs font-semibold cursor-pointer"
                  >
                    <option value="Active">Active Duty</option>
                    <option value="Inactive">On Leave / Inactive</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Hiring Date</label>
                  <input
                    type="date"
                    value={newStaffHireDate}
                    onChange={(e) => setNewStaffHireDate(e.target.value)}
                    className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-on-surface-variant">Profile Notes / Skill Specs</label>
                <textarea
                  placeholder="Notes about stylist performance or specialized skills..."
                  value={newStaffNotes}
                  onChange={(e) => setNewStaffNotes(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-medium h-16 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-outline/25">
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="px-4 py-2.5 border border-outline hover:bg-surface-container-low rounded-xl font-bold text-on-surface transition cursor-pointer text-xs"
              >
                Dismiss
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition cursor-pointer text-xs"
              >
                {editingStaffId ? "Update Staff" : "Register Stylist"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
