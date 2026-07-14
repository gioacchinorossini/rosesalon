import React from "react";
import { Icons } from "./Icons";

type ActivePanel = 'dashboard' | 'salesLedger' | 'pos' | 'services' | 'payslips' | 'payments' | 'bookings' | 'supplies' | 'staffs';

interface SidebarProps {
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
  handleResetData: () => void;
  handleLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePanel,
  setActivePanel,
  handleResetData,
  handleLogout,
}) => {
  return (
    <aside className="no-print w-full md:w-72 bg-background flex flex-col justify-between py-6 px-4 md:sticky md:top-0 md:h-screen shrink-0 z-30 border-r border-outline">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-semibold text-lg shadow-md border border-primary/10">
            RB
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight text-on-surface">Rose Beau</h1>
            <p className="text-[10px] text-on-surface-variant font-medium">Salon Manager</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
            { id: 'pos', label: 'Checkout Counter', icon: Icons.cart },
            { id: 'bookings', label: 'Bookings', icon: Icons.calendar },
            { id: 'salesLedger', label: 'Sales Logs', icon: Icons.salesLedger },
            { id: 'staffs', label: 'Staff Directory', icon: Icons.bookings },
            { id: 'payslips', label: 'Staff Payslips', icon: Icons.payslip },
            { id: 'payments', label: 'Payment History', icon: Icons.payments },
            { id: 'supplies', label: 'Supplies & Inventory', icon: Icons.supplies },
            { id: 'services', label: 'Service List', icon: Icons.services }
          ].map((item) => {
            const active = activePanel === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActivePanel(item.id as ActivePanel)}
                className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-150 text-left font-semibold text-xs w-full group relative ${active
                    ? 'bg-primary text-white shadow-md'
                    : 'hover:bg-primary-container/40 text-on-surface-variant hover:text-primary'
                  }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 flex flex-col gap-2 pt-4 border-t border-outline/20 px-2">
        <button
          onClick={handleResetData}
          className="flex items-center justify-center gap-2 border border-dashed border-red-200 hover:bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-bold transition duration-150 w-full cursor-pointer"
        >
          Reset Salon Data
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 border border-outline hover:bg-surface-container-low text-on-surface px-4 py-2.5 rounded-xl text-[10px] font-bold transition duration-150 w-full cursor-pointer"
        >
          Log Out
        </button>

        <div className="text-[10px] text-on-surface-variant text-center mt-2 font-semibold tracking-wider uppercase opacity-50">
          Rose Beau Salon v2.0
        </div>
      </div>
    </aside>
  );
};
