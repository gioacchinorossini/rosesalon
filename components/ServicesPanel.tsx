import React, { useState, useMemo } from "react";
import { Icons } from "./Icons";
import { ServiceItem } from "../app/data/initialData";

interface ServicesPanelProps {
  services: ServiceItem[];
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  saveState: (key: string, val: any) => void;
}

export const ServicesPanel: React.FC<ServicesPanelProps> = ({
  services,
  setServices,
  saveState,
}) => {
  // Local UI States
  const [servicesFilter, setServicesFilter] = useState<'ALL' | 'Hair' | 'Nails' | 'Aesthetic' | 'Other'>('ALL');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  // Form States
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState<'Hair' | 'Nails' | 'Aesthetic' | 'Other'>('Hair');
  const [newServicePrice, setNewServicePrice] = useState<number>(0);
  const [newServiceComm, setNewServiceComm] = useState<number>(0.27);

  // Derived state
  const filteredServicesList = useMemo(() => {
    return services.filter(s => {
      if (servicesFilter === 'ALL') return true;
      return s.category === servicesFilter;
    });
  }, [services, servicesFilter]);

  const handleStartEditService = (s: ServiceItem) => {
    setEditingServiceId(s.id);
    setNewServiceName(s.name);
    setNewServiceCategory(s.category);
    setNewServicePrice(s.price);
    setNewServiceComm(s.commissionRate);
    setShowAddServiceModal(true);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || newServicePrice < 0) return;

    let updated: ServiceItem[];
    if (editingServiceId) {
      updated = services.map(s =>
        s.id === editingServiceId
          ? {
              ...s,
              name: newServiceName,
              category: newServiceCategory,
              price: Number(newServicePrice),
              commissionRate: Number(newServiceComm),
            }
          : s
      );
      setEditingServiceId(null);
    } else {
      const newService: ServiceItem = {
        id: (services.length + 1).toString() + "-" + Math.floor(Math.random() * 1000),
        name: newServiceName,
        category: newServiceCategory,
        price: Number(newServicePrice),
        commissionRate: Number(newServiceComm),
      };
      updated = [...services, newService];
    }
    setServices(updated);
    saveState("rose_services", updated);
    setNewServiceName("");
    setNewServicePrice(0);
    setNewServiceComm(0.27);
    setShowAddServiceModal(false);
  };

  const handleDeleteService = (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      const updated = services.filter(s => s.id !== id);
      setServices(updated);
      saveState("rose_services", updated);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Service List</h2>
          <p className="text-xs text-on-surface-variant">Set standard prices and stylist commission rates</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingServiceId(null);
            setNewServiceName("");
            setNewServiceCategory("Hair");
            setNewServicePrice(0);
            setNewServiceComm(0.27);
            setShowAddServiceModal(true);
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg self-start cursor-pointer"
        >
          <Icons.add className="w-4.5 h-4.5" />
          Add New Service
        </button>
      </div>

      {/* Category selection */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'Hair', 'Nails', 'Aesthetic', 'Other'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setServicesFilter(cat)}
            className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer border ${servicesFilter === cat
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white border-outline text-on-surface-variant hover:bg-surface-container-low'
              }`}
          >
            {cat === 'ALL' ? 'All Services' : cat}
          </button>
        ))}
      </div>

      {/* Catalog edit inline wrapper / or modal (kept inline/modal as original) */}
      {showAddServiceModal && (
        <div className="bg-surface-container-low border border-outline p-5 rounded-2xl animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-on-surface">
              {editingServiceId ? "Modify Existing Treatment Service" : "Register New Treatment Service"}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowAddServiceModal(false);
                setEditingServiceId(null);
                setNewServiceName('');
              }}
              className="text-xs text-on-surface-variant hover:text-on-surface font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-on-surface-variant">Service Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Keratin Blowout"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary font-semibold text-on-surface text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-on-surface-variant">Category</label>
              <select
                value={newServiceCategory}
                onChange={(e) => setNewServiceCategory(e.target.value as any)}
                className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary cursor-pointer font-bold text-on-surface text-xs"
              >
                <option value="Hair">Hair Services</option>
                <option value="Nails">Nails Services</option>
                <option value="Aesthetic">Aesthetic Services</option>
                <option value="Other">Other Services</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-on-surface-variant">Standard Price (₱)</label>
              <input
                type="number"
                required
                min={0}
                placeholder="500"
                value={newServicePrice || ''}
                onChange={(e) => setNewServicePrice(Math.max(0, Number(e.target.value)))}
                className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary text-right font-bold text-on-surface text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-on-surface-variant">Stylist Commission Rate</label>
              <select
                value={newServiceComm}
                onChange={(e) => setNewServiceComm(Number(e.target.value))}
                className="bg-white border border-outline px-3.5 py-2.5 rounded-lg outline-none focus:border-primary cursor-pointer font-bold text-on-surface text-xs"
              >
                <option value={0.27}>27% (Standard Services)</option>
                <option value={0.36}>36% (Haircut Special)</option>
                <option value={0.16}>16% (Facial/Aesthetic Special)</option>
                <option value={0.0}>0% (No Commission)</option>
                <option value={0.50}>50% (Equal Split)</option>
              </select>
            </div>

            <div className="md:col-span-4 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddServiceModal(false);
                  setEditingServiceId(null);
                  setNewServiceName('');
                }}
                className="border border-outline px-4 py-2.5 rounded-xl font-bold hover:bg-surface-container-low transition cursor-pointer text-on-surface text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold transition shadow-md hover:shadow-lg cursor-pointer text-xs"
              >
                Save Service
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServicesList.map((service) => (
          <div key={service.id} className="bg-white border border-outline p-5 rounded-2xl flex flex-col justify-between h-40 hover:border-primary/50 hover:shadow-md transition">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-primary-container text-primary self-start">
                    {service.category}
                  </span>
                  <h4 className="font-bold text-xs text-on-surface mt-1">{service.name}</h4>
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartEditService(service)}
                    className="text-primary hover:text-primary-hover p-1 rounded-md hover:bg-primary-container/20 transition cursor-pointer"
                  >
                    <Icons.edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(service.id)}
                    className="text-red-555 hover:text-red-705 p-1 rounded-md hover:bg-red-50 transition cursor-pointer"
                  >
                    <Icons.delete className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between border-t border-outline/10 pt-3">
              <div className="flex flex-col">
                <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Catalog Price</span>
                <span className="text-base font-black text-on-surface">₱{service.price.toLocaleString()}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Comm Rate</span>
                <span className="text-xs font-black text-primary font-mono">{Math.round(service.commissionRate * 100)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
