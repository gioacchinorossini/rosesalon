import React, { useState, useEffect } from "react";
import { Icons } from "./Icons";

type ActivePanel = 'dashboard' | 'salesLedger' | 'pos' | 'services' | 'payslips' | 'payments' | 'bookings' | 'supplies' | 'staffs' | 'servicesLog' | 'queue' | 'stocks' | 'customerReport';

interface SidebarProps {
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
  handleResetData: () => void;
  handleLogout: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const ResetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" className={props.className} style={props.style}>
    <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 126.5 25T708-706v-94h80v240H548v-80h146q-41-49-100-74.5T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 108-115.5 174T480-160Z" />
  </svg>
);

const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" className={props.className} style={props.style}>
    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({
  activePanel,
  setActivePanel,
  handleResetData,
  handleLogout,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(
    activePanel === 'staffs' || activePanel === 'payslips'
  );
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(
    activePanel === 'servicesLog' || activePanel === 'salesLedger' || activePanel === 'payments' || activePanel === 'customerReport'
  );

  // Auto-expand dropdowns when sub-panels are programmatically activated
  useEffect(() => {
    if (activePanel === 'staffs' || activePanel === 'payslips') {
      setStaffDropdownOpen(true);
    }
    if (activePanel === 'servicesLog' || activePanel === 'salesLedger' || activePanel === 'payments' || activePanel === 'customerReport') {
      setReportsDropdownOpen(true);
    }
  }, [activePanel]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
    { id: 'queue', label: 'Queue', icon: Icons.list },
    { id: 'pos', label: 'POS', icon: Icons.cart },
    // { id: 'bookings', label: 'Bookings', icon: Icons.calendar },
    {
      id: 'reports_group',
      label: 'Reports',
      icon: Icons.salesLedger,
      isDropdown: true,
      subItems: [
        { id: 'servicesLog', label: 'Daily Sales Log', icon: Icons.pos },
        { id: 'salesLedger', label: 'Sales Logs', icon: Icons.salesLedger },
        { id: 'payments', label: 'Payment History', icon: Icons.payments },
        { id: 'customerReport', label: 'Customer Report', icon: Icons.bookings }
      ]
    },
    {
      id: 'staffs_group',
      label: 'Staffs',
      icon: Icons.bookings,
      isDropdown: true,
      subItems: [
        { id: 'staffs', label: 'Staffs', icon: Icons.bookings },
        { id: 'payslips', label: 'Staff Payslips', icon: Icons.payslip }
      ]
    },
    { id: 'supplies', label: 'Supplies & Inventory', icon: Icons.supplies },
    { id: 'stocks', label: 'Stocks & Retail', icon: Icons.grid },
    { id: 'services', label: 'Service List', icon: Icons.services }
  ];

  return (
    <aside className={`no-print w-full bg-background flex flex-col justify-between py-6 px-4 md:sticky md:top-0 md:h-screen shrink-0 z-30 border-r border-outline transition-all duration-300 ease-in-out ${isCollapsed ? 'md:w-20' : 'md:w-72'
      }`}>
      <div className="flex flex-col gap-6">
        <div className={`flex items-center justify-between px-3 py-2 ${isCollapsed ? 'flex-col gap-4' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-semibold text-lg shadow-md border border-primary/10 shrink-0">
              RB
            </div>
            {!isCollapsed && (
              <div className="animate-fadeIn">
                <h1 className="font-bold text-base leading-tight text-on-surface">Rose Beau</h1>
                <p className="text-[10px] text-on-surface-variant font-medium">Salon Manager</p>
              </div>
            )}
          </div>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg border border-outline hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition cursor-pointer"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                )}
              </svg>
            </button>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            if (item.isDropdown) {
              const hasActiveSubItem = item.subItems?.some(sub => activePanel === sub.id);
              const Icon = item.icon;
              const isOpen = item.id === 'staffs_group' ? staffDropdownOpen : reportsDropdownOpen;
              return (
                <div key={item.id} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => {
                      if (item.id === 'staffs_group') {
                        setStaffDropdownOpen(!staffDropdownOpen);
                      } else if (item.id === 'reports_group') {
                        setReportsDropdownOpen(!reportsDropdownOpen);
                      }
                    }}
                    title={item.label}
                    className={`flex items-center justify-between rounded-xl transition-all duration-155 text-left font-semibold text-xs w-full group relative cursor-pointer ${isCollapsed ? 'justify-center px-0 py-3' : 'px-5 py-3'
                      } ${hasActiveSubItem
                        ? 'text-primary bg-primary-container/20'
                        : 'text-on-surface-variant hover:bg-primary-container/40 hover:text-primary'
                      }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
                      <Icon className="w-4.5 h-4.5 shrink-0" />
                      {!isCollapsed && item.label}
                    </div>
                    {/* Caret chevron */}
                    {!isCollapsed && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`w-4 h-4 transition-transform duration-155 ${isOpen ? 'transform rotate-180' : ''}`}
                      >
                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  {/* Submenu items */}
                  {isOpen && (
                    <div className={`flex flex-col gap-1 mt-1 animate-fadeIn ${isCollapsed ? 'pl-0 ml-0 border-none' : 'pl-6 ml-7 border-l border-outline/20'
                      }`}>
                      {item.subItems?.map(sub => {
                        const active = activePanel === sub.id;
                        const SubIcon = sub.icon;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setActivePanel(sub.id as ActivePanel)}
                            title={sub.label}
                            className={`flex items-center rounded-lg transition-all duration-150 text-left font-semibold w-full cursor-pointer ${isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-4 py-2.5 text-[11px]'
                              } ${active
                                ? 'bg-primary text-white shadow-sm'
                                : 'hover:bg-primary-container/30 text-on-surface-variant hover:text-primary'
                              }`}
                          >
                            <SubIcon className="w-3.5 h-3.5 shrink-0" />
                            {!isCollapsed && sub.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = activePanel === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePanel(item.id as ActivePanel)}
                title={item.label}
                className={`flex items-center rounded-xl transition-all duration-150 text-left font-semibold text-xs w-full group relative cursor-pointer ${isCollapsed ? 'justify-center px-0 py-3' : 'gap-4 px-5 py-3'
                  } ${active
                    ? 'bg-primary text-white shadow-md'
                    : 'hover:bg-primary-container/40 text-on-surface-variant hover:text-primary'
                  }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {!isCollapsed && item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`mt-8 flex flex-col gap-2 pt-4 border-t border-outline/20 ${isCollapsed ? 'px-0 items-center' : 'px-2'}`}>
        <button
          onClick={handleResetData}
          title="Reset Salon Data"
          className={`flex items-center justify-center border border-dashed border-red-200 hover:bg-red-50 text-red-600 rounded-xl transition duration-150 w-full cursor-pointer ${isCollapsed ? 'w-10 h-10 p-0' : 'gap-2 px-4 py-2 text-[10px] font-bold w-full'
            }`}
        >
          <ResetIcon className="w-4.5 h-4.5 shrink-0" />
          {!isCollapsed && "Reset Salon Data"}
        </button>

        <button
          onClick={handleLogout}
          title="Log Out"
          className={`flex items-center justify-center border border-outline hover:bg-surface-container-low text-on-surface rounded-xl transition duration-150 w-full cursor-pointer ${isCollapsed ? 'w-10 h-10 p-0' : 'gap-2 px-4 py-2.5 text-[10px] font-bold w-full'
            }`}
        >
          <LogoutIcon className="w-4.5 h-4.5 shrink-0" />
          {!isCollapsed && "Log Out"}
        </button>

        {!isCollapsed ? (
          <div className="text-[10px] text-on-surface-variant text-center mt-2 font-semibold tracking-wider uppercase opacity-50">
            Rose Beau Salon v2.0
          </div>
        ) : (
          <div className="text-[8px] text-on-surface-variant text-center mt-2 font-bold opacity-45">
            v2.0
          </div>
        )}
      </div>
    </aside>
  );
};
