import React, { useState, useEffect, useMemo } from "react";
import { Icons } from "./Icons";
import {
  ServiceItem,
  StaffMember,
  PaymentTransaction,
  MonthlySalesSummary,
  DailySalesSummaryRecord,
  ServiceLog,
  CustomerPamper
} from "../app/data/initialData";
import { StockItem, StockLog } from "./StocksPanel";

interface PosPanelProps {
  services: ServiceItem[];
  staffs: StaffMember[];
  salesSummary: { [monthKey: string]: MonthlySalesSummary };
  setSalesSummary: React.Dispatch<React.SetStateAction<{ [monthKey: string]: MonthlySalesSummary }>>;
  paymentTransactions: PaymentTransaction[];
  setPaymentTransactions: React.Dispatch<React.SetStateAction<PaymentTransaction[]>>;
  servicesLog: ServiceLog[];
  setServicesLog: React.Dispatch<React.SetStateAction<ServiceLog[]>>;
  saveState: (key: string, val: any) => void;
  ongoingServices: Array<{
    id: string;
    customerName: string;
    customerMobile?: string;
    services: Array<{ id: string; service: string; price: number; commissionRate?: number }>;
    staffCode: string;
    startTime: string; // ISO string
    date: string;
  }>;
  setOngoingServices: React.Dispatch<React.SetStateAction<Array<{
    id: string;
    customerName: string;
    customerMobile?: string;
    services: Array<{ id: string; service: string; price: number; commissionRate?: number }>;
    staffCode: string;
    startTime: string;
    date: string;
  }>>>;
  activeOngoingId: string | null;
  setActiveOngoingId: (id: string | null) => void;
  stocks: StockItem[];
  setStocks: React.Dispatch<React.SetStateAction<StockItem[]>>;
  stockLogs: StockLog[];
  setStockLogs: React.Dispatch<React.SetStateAction<StockLog[]>>;
  customerPamper: CustomerPamper[];
  setCustomerPamper: React.Dispatch<React.SetStateAction<CustomerPamper[]>>;
}

// Sub-component to display active live elapsed timer
const ElapsedTimer: React.FC<{ startTime: string }> = ({ startTime }) => {
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
    <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10 flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{elapsed} active</span>
    </span>
  );
};

export const PosPanel: React.FC<PosPanelProps> = ({
  services,
  staffs,
  salesSummary,
  setSalesSummary,
  paymentTransactions,
  setPaymentTransactions,
  servicesLog,
  setServicesLog,
  saveState,
  ongoingServices,
  setOngoingServices,
  activeOngoingId,
  setActiveOngoingId,
  stocks,
  setStocks,
  stockLogs,
  setStockLogs,
  customerPamper,
  setCustomerPamper,
}) => {
  // Navigation / POS Sub-tabs
  const [posSubTab, setPosSubTab] = useState<'service' | 'supplies'>('service');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStylistPopupOpen, setIsStylistPopupOpen] = useState(false);
  const [isQueuePopupOpen, setIsQueuePopupOpen] = useState(false);
  const [isDrawerDetailsOpen, setIsDrawerDetailsOpen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Category filters & catalog search (Service Tab)
  const [posCategory, setPosCategory] = useState<'ALL' | 'Hair' | 'Nails' | 'Aesthetic' | 'Other' | 'Products' | 'Supplies'>('ALL');
  const [posSearch, setPosSearch] = useState("");

  // Search filter for supplies tab
  const [supplySearch, setSupplySearch] = useState("");

  // Supply Cart State
  const [supplyCart, setSupplyCart] = useState<Array<{
    stockId: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    category: string;
    onHand: number;
  }>>([]);

  // Supply client / staff / payment details
  const [supplyClientName, setSupplyClientName] = useState("");
  const [supplyStaff, setSupplyStaff] = useState(() => staffs.find(s => s.status === 'Active')?.code || "");
  const [supplyDate, setSupplyDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [supplyPaymentMethod, setSupplyPaymentMethod] = useState<'Cash' | 'GCash' | 'Bank' | null>(null);
  const [supplyGcashRef, setSupplyGcashRef] = useState("");
  const [supplyBankRef, setSupplyBankRef] = useState("");

  // Cart & client details
  const [clientName, setClientName] = useState("");
  const [clientMobile, setClientMobile] = useState("");
  const [dsrDate, setDsrDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dsrStaff, setDsrStaff] = useState(() => staffs.find(s => s.status === 'Active')?.code || "");
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'GCash' | 'Bank' | null>(null);
  const [gcashRef, setGcashRef] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [supplyCashTendered, setSupplyCashTendered] = useState<string>("");

  const [dsrServices, setDsrServices] = useState<Array<{
    id: string;
    service: string;
    price: number;
    commissionRate?: number;
    isProduct?: boolean;
    sku?: string;
    stockId?: string;
  }>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rose_dsrServices");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [dsrBills, setDsrBills] = useState<{ [bill: number]: number }>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rose_dsrBills");
      return saved ? JSON.parse(saved) : { 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 1: 0 };
    }
    return { 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 1: 0 };
  });

  // Sync loaded active ongoing session
  useEffect(() => {
    if (activeOngoingId) {
      const ongoingItem = ongoingServices.find(item => item.id === activeOngoingId);
      if (ongoingItem) {
        setClientName(ongoingItem.customerName);
        setClientMobile(ongoingItem.customerMobile || "");
        setDsrStaff(ongoingItem.staffCode);
        setDsrDate(ongoingItem.date);
        updateDsrServices(ongoingItem.services);
        setPosSubTab('service');
      }
    }
  }, [activeOngoingId, ongoingServices]);

  // Daily Sales Report (DSR) spreadsheet reconciliation states
  const [pettyCash, setPettyCash] = useState<number>(1000); // ₱1,000 standard cash float
  const [creditDebit, setCreditDebit] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);
  const [cashAdvance, setCashAdvance] = useState<number>(0);
  const [addOn, setAddOn] = useState<number>(0);
  const [soldSupplies, setSoldSupplies] = useState<number>(0);
  const [gcashAmt, setGcashAmt] = useState<number>(0);
  const [onlineTransfer, setOnlineTransfer] = useState<number>(0);
  const [showAuditDetails, setShowAuditDetails] = useState<boolean>(true);

  // Sync cart states
  const updateDsrServices = (newVal: typeof dsrServices) => {
    setDsrServices(newVal);
    saveState("rose_dsrServices", newVal);
  };

  const updateDsrBills = (newVal: typeof dsrBills) => {
    setDsrBills(newVal);
    saveState("rose_dsrBills", newVal);
  };

  // Catalog items computed properties
  const posServicesCatalog = useMemo(() => {
    if (posCategory === 'Products') {
      return stocks
        .filter(s => s.category === 'Retail Product')
        .filter(s => s.name.toLowerCase().includes(posSearch.toLowerCase()))
        .map(s => ({
          id: `prod-${s.id}`,
          name: s.name,
          price: s.salesPrice || 0,
          category: 'Retail Product',
          commissionRate: 0,
          isProduct: true,
          sku: s.sku,
          stockId: s.id,
          onHand: s.onHand
        }));
    }

    if (posCategory === 'Supplies') {
      return stocks
        .filter(s => s.category === 'Consumable' || s.category === 'Equipment')
        .filter(s => s.name.toLowerCase().includes(posSearch.toLowerCase()))
        .map(s => ({
          id: `supply-${s.id}`,
          name: s.name,
          price: s.salesPrice || 0,
          category: s.category,
          commissionRate: 0,
          isProduct: true,
          sku: s.sku,
          stockId: s.id,
          onHand: s.onHand
        }));
    }

    return services
      .filter(s => {
        const matchCat = posCategory === 'ALL' || s.category === posCategory;
        const matchSearch = s.name.toLowerCase().includes(posSearch.toLowerCase());
        return matchCat && matchSearch;
      })
      .map(s => ({
        id: s.id,
        name: s.name,
        price: s.price,
        category: s.category,
        commissionRate: s.commissionRate,
        isProduct: false,
        sku: '',
        stockId: '',
        onHand: 0
      }));
  }, [services, stocks, posCategory, posSearch]);

  const dsrTotalServices = useMemo(() => {
    return dsrServices.reduce((sum, s) => sum + s.price, 0);
  }, [dsrServices]);

  const dsrTotalCashCalculated = useMemo(() => {
    return Object.entries(dsrBills).reduce((sum, [bill, count]) => sum + (Number(bill) * count), 0);
  }, [dsrBills]);

  // Sync GCash / Online Transfer when ticket subtotal or payment method changes
  useEffect(() => {
    if (paymentMethod === 'GCash') {
      setGcashAmt(dsrTotalServices);
      setOnlineTransfer(0);
    } else if (paymentMethod === 'Bank') {
      setOnlineTransfer(dsrTotalServices);
      setGcashAmt(0);
    } else {
      setGcashAmt(0);
      setOnlineTransfer(0);
    }
  }, [dsrTotalServices, paymentMethod]);

  const expectedNetCash = useMemo(() => {
    const cashSales = dsrTotalServices + soldSupplies - creditDebit - onlineTransfer - gcashAmt;
    return cashSales + pettyCash - expenses - cashAdvance + addOn;
  }, [dsrTotalServices, soldSupplies, creditDebit, onlineTransfer, gcashAmt, pettyCash, expenses, cashAdvance, addOn]);

  const dsrOverShort = useMemo(() => {
    return dsrTotalCashCalculated - expectedNetCash;
  }, [dsrTotalCashCalculated, expectedNetCash]);

  // Handlers
  const handleAddServiceToCart = (item: {
    id: string;
    name: string;
    price: number;
    commissionRate?: number;
    isProduct: boolean;
    sku: string;
    stockId: string;
    onHand: number;
  }) => {
    if (item.isProduct && item.onHand <= 0) {
      alert("This product is out of stock.");
      return;
    }

    if (item.isProduct) {
      const inCartCount = dsrServices.filter(s => s.stockId === item.stockId).length;
      if (inCartCount >= item.onHand) {
        alert(`Cannot add more. Only ${item.onHand} units are available in stock.`);
        return;
      }
    }

    const newRow = {
      id: (dsrServices.length + 1).toString() + "-" + Math.floor(Math.random() * 1000),
      service: item.name,
      price: item.price,
      commissionRate: item.commissionRate,
      isProduct: item.isProduct,
      sku: item.sku,
      stockId: item.stockId
    };
    updateDsrServices([...dsrServices, newRow]);
  };

  const handleDeleteDsrService = (id: string) => {
    updateDsrServices(dsrServices.filter(s => s.id !== id));
  };

  const handleAddSupplyToCart = (item: StockItem) => {
    if (item.onHand <= 0) {
      alert(`"${item.name}" is out of stock.`);
      return;
    }
    setSupplyCart(prev => {
      const exists = prev.find(ci => ci.stockId === item.id);
      if (exists) {
        if (exists.quantity >= item.onHand) {
          alert(`Cannot add more. Only ${item.onHand} units are available in stock.`);
          return prev;
        }
        return prev.map(ci => ci.stockId === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prev, {
        stockId: item.id,
        name: item.name,
        sku: item.sku,
        price: item.salesPrice || item.costPrice || 0,
        quantity: 1,
        category: item.category,
        onHand: item.onHand
      }];
    });
  };

  const handleAdjustSupplyQty = (stockId: string, amount: number) => {
    setSupplyCart(prev => {
      const exists = prev.find(ci => ci.stockId === stockId);
      if (!exists) return prev;
      const newQty = exists.quantity + amount;
      if (newQty <= 0) {
        return prev.filter(ci => ci.stockId !== stockId);
      }
      if (newQty > exists.onHand) {
        alert(`Cannot add more. Only ${exists.onHand} units are available in stock.`);
        return prev;
      }
      return prev.map(ci => ci.stockId === stockId ? { ...ci, quantity: newQty } : ci);
    });
  };

  const handleRemoveSupplyFromCart = (stockId: string) => {
    setSupplyCart(prev => prev.filter(ci => ci.stockId !== stockId));
  };

  const handleAdjustDenom = (bill: number, amount: number) => {
    const newVal = {
      ...dsrBills,
      [bill]: Math.max(0, (dsrBills[bill] || 0) + amount)
    };
    updateDsrBills(newVal);
  };

  // Queues current cart as an active treatment ticket in the salon
  const handleStartOngoingTreatment = () => {
    if (dsrServices.length === 0) return;

    const newOngoing = {
      id: "ongoing-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      customerName: clientName.trim() || "Walk-in Client",
      customerMobile: clientMobile.trim(),
      services: dsrServices,
      staffCode: dsrStaff || staffs.find(s => s.status === 'Active')?.code || "",
      startTime: new Date().toISOString(),
      date: dsrDate
    };

    const updated = [...ongoingServices, newOngoing];
    setOngoingServices(updated);
    saveState("rose_ongoingServices", updated);

    // Reset checkout fields
    updateDsrServices([]);
    setClientName("Walk-in");
    setClientMobile("");
    setCashTendered("");
    setActiveOngoingId(null);

    alert(`Started service for ${newOngoing.customerName}. Placed in Ongoing Services queue.`);
  };

  // Load a treatment back into checkout ticket
  const handleLoadOngoingToPos = (item: typeof ongoingServices[0]) => {
    setClientName(item.customerName);
    setClientMobile(item.customerMobile || "");
    setDsrStaff(item.staffCode);
    setDsrDate(item.date);
    updateDsrServices(item.services);
    setActiveOngoingId(item.id);
    setPosSubTab('service'); // Switch back to checkout ticket tab
    setIsQueuePopupOpen(false); // Close queue modal popup
  };

  const handleCancelOngoing = (id: string) => {
    if (confirm("Are you sure you want to cancel and remove this active treatment session?")) {
      const updated = ongoingServices.filter(item => item.id !== id);
      setOngoingServices(updated);
      saveState("rose_ongoingServices", updated);
    }
  };

  // Checkout process & save transaction
  const handleSaveDsrToLedger = (e: React.FormEvent) => {
    e.preventDefault();
    if (dsrServices.length === 0) return;

    // Validate stock levels before finalizing checkout
    const productsInCart = dsrServices.filter(s => s.isProduct);
    if (productsInCart.length > 0) {
      // Group by stockId to validate total quantity
      const cartQuantities: { [stockId: string]: number } = {};
      productsInCart.forEach(p => {
        if (p.stockId) {
          cartQuantities[p.stockId] = (cartQuantities[p.stockId] || 0) + 1;
        }
      });

      for (const [stockId, qtyNeeded] of Object.entries(cartQuantities)) {
        const stockItem = stocks.find(s => s.id === stockId);
        if (!stockItem) {
          alert("One of the products in your ticket was not found in the database.");
          return;
        }
        if (stockItem.onHand < qtyNeeded) {
          alert(`Not enough stock for "${stockItem.name}". Only ${stockItem.onHand} units left, but you have ${qtyNeeded} in the ticket.`);
          return;
        }
      }

      // Decrement stock levels and add logs
      const stocksCopy = stocks.map(item => {
        const qtyNeeded = cartQuantities[item.id] || 0;
        if (qtyNeeded > 0) {
          return { ...item, onHand: item.onHand - qtyNeeded };
        }
        return item;
      });

      const todayStr = new Date().toISOString().split("T")[0];
      const newLogs: StockLog[] = [];
      for (const [stockId, qtyNeeded] of Object.entries(cartQuantities)) {
        const item = stocks.find(s => s.id === stockId);
        if (item) {
          newLogs.push({
            id: `sl-pos-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            date: todayStr,
            itemId: item.id,
            itemName: item.name,
            type: "OUT",
            qty: qtyNeeded,
            remarks: `POS checkout sale for Client: ${clientName || "Walk-in"}`,
            staff: dsrStaff || "MANAGER"
          });
        }
      }

      const updatedStockLogs = [...newLogs, ...stockLogs];

      // Commit changes to state and database
      setStocks(stocksCopy);
      saveState("rose_stocks", stocksCopy);
      setStockLogs(updatedStockLogs);
      saveState("rose_stockLogs", updatedStockLogs);
    }

    // Validate payment fields
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }
    if (paymentMethod === 'Cash') {
      if (dsrTotalCashCalculated < dsrTotalServices) {
        alert(`Insufficient cash. The bill is ₱${dsrTotalServices.toLocaleString()}, but only ₱${dsrTotalCashCalculated.toLocaleString()} was counted in the drawer cash calculator.`);
        return;
      }
    } else {
      const ref = paymentMethod === 'GCash' ? gcashRef : bankRef;
      if (!ref.trim()) {
        alert(`Please specify the ${paymentMethod} Reference Number.`);
        return;
      }
    }

    const dateStr = dsrDate;
    const monthIndex = new Date(dateStr).getMonth();
    const monthsCodes = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthKey = monthsCodes[monthIndex];

    const currentMonthData = salesSummary[monthKey];
    if (!currentMonthData) {
      alert(`Month ${monthKey} is not registered in the 2026 ledger.`);
      return;
    }

    let recordsCopy = [...currentMonthData.records];
    let recordIndex = recordsCopy.findIndex(r => r.date === dateStr);

    let computedComi = 0;
    dsrServices.forEach(s => {
      const rate = s.commissionRate !== undefined ? s.commissionRate : 0.27;
      computedComi += s.price * rate;
    });

    const staffUpperName = dsrStaff.toUpperCase();

    // 1. Update salesSummary Ledger
    if (recordIndex >= 0) {
      const oldVal = recordsCopy[recordIndex].staffSales[staffUpperName] || 0;
      recordsCopy[recordIndex].staffSales[staffUpperName] = oldVal + dsrTotalServices;
      const sumStaff = Object.values(recordsCopy[recordIndex].staffSales).reduce((sum, v) => sum + v, 0);
      recordsCopy[recordIndex].gross = sumStaff;
      recordsCopy[recordIndex].exp = recordsCopy[recordIndex].exp + expenses;
      recordsCopy[recordIndex].comi = recordsCopy[recordIndex].comi + computedComi;
      recordsCopy[recordIndex].netSales = recordsCopy[recordIndex].gross - recordsCopy[recordIndex].exp - recordsCopy[recordIndex].daily - recordsCopy[recordIndex].comi;
      recordsCopy[recordIndex].roseShare = recordsCopy[recordIndex].netSales;
    } else {
      const newRec: DailySalesSummaryRecord = {
        date: dateStr,
        staffSales: { [staffUpperName]: dsrTotalServices },
        gross: dsrTotalServices,
        exp: expenses,
        daily: 200,
        comi: computedComi,
        netSales: dsrTotalServices - expenses - 200 - computedComi,
        roseShare: dsrTotalServices - expenses - 200 - computedComi
      };
      recordsCopy.push(newRec);
    }

    recordsCopy.sort((a, b) => a.date.localeCompare(b.date));

    const updatedSummary = {
      ...salesSummary,
      [monthKey]: {
        ...currentMonthData,
        records: recordsCopy
      }
    };

    setSalesSummary(updatedSummary);
    saveState("rose_salesSummary", updatedSummary);

    // 2. Add Payment Transaction
    let refNoStr = "";
    let cashVal = 0;
    let gcashVal = 0;
    let bankVal = 0;

    if (paymentMethod === 'Cash') {
      refNoStr = `CSH-${staffUpperName}-${Date.now().toString().slice(-6)}`;
      cashVal = dsrTotalCashCalculated;
    } else if (paymentMethod === 'GCash') {
      refNoStr = `GCASH-${gcashRef.trim()}`;
      gcashVal = gcashAmt || dsrTotalServices;
    } else {
      refNoStr = `BANK-${bankRef.trim()}`;
      bankVal = onlineTransfer || dsrTotalServices;
    }

    const newTx: PaymentTransaction = {
      id: (paymentTransactions.length + 1).toString() + "-" + Math.floor(Math.random() * 1000),
      date: dateStr,
      refNo: refNoStr,
      gcash: gcashAmt,
      bank: onlineTransfer,
      cash: dsrTotalCashCalculated,
      verifiedBy: "MANAGER",
      totalGross: dsrTotalServices + soldSupplies,
      remarks: `POS: ${staffUpperName}. Mode: ${paymentMethod}. PettyCash: ₱${pettyCash}, Exp: ₱${expenses}, CA: ₱${cashAdvance}, Addon: ₱${addOn}, Cards: ₱${creditDebit}. Supplies: ₱${soldSupplies}. Over/Short: ₱${dsrOverShort}. Customer: ${clientName}`
    };
    const updatedPay = [newTx, ...paymentTransactions];
    setPaymentTransactions(updatedPay);
    saveState("rose_paymentTransactions", updatedPay);

    // 3. Append to completed servicesLog
    const newLogs: ServiceLog[] = dsrServices.map((s, idx) => ({
      id: `${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      customerName: clientName || "Walk-in",
      serviceName: s.service,
      staffName: staffUpperName,
      price: s.price,
      date: dateStr,
      isProduct: s.isProduct
    }));
    const updatedServicesLog = [...newLogs, ...servicesLog];
    setServicesLog(updatedServicesLog);
    saveState("rose_servicesLog", updatedServicesLog);

    // 3.5. Log to Customer Pamper report if Name and Mobile are provided
    if (clientName && clientName.toLowerCase() !== "walk-in" && clientMobile.trim()) {
      const newPamperItem: CustomerPamper = {
        id: `cp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: clientName.trim(),
        mobile: clientMobile.trim(),
        pamperChoose: dsrServices.map(s => s.service).join(", ") || "Services Checkout",
        date: dateStr
      };
      const updatedPamper = [newPamperItem, ...customerPamper];
      setCustomerPamper(updatedPamper);
      saveState("rose_customerPamper", updatedPamper);
    }

    // 4. Remove from active ongoing queue if unlinked
    if (activeOngoingId) {
      const updatedOngoing = ongoingServices.filter(item => item.id !== activeOngoingId);
      setOngoingServices(updatedOngoing);
      saveState("rose_ongoingServices", updatedOngoing);
      setActiveOngoingId(null);
    }

    alert(`Payment successful! Recorded ledger entries, payment audit log, and completed services log.`);

    // Reset checkout states
    updateDsrServices([]);
    setClientName("Walk-in");
    setClientMobile("");
    setPaymentMethod(null);
    setGcashRef("");
    setBankRef("");
    setCashTendered("");
    // Clear cash count bills
    updateDsrBills({ 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 1: 0 });

    // Reset reconciliation inputs
    setPettyCash(1000);
    setCreditDebit(0);
    setExpenses(0);
    setCashAdvance(0);
    setAddOn(0);
    setSoldSupplies(0);
  };

  const handleCheckoutSupplies = (e: React.FormEvent) => {
    e.preventDefault();
    if (supplyCart.length === 0) return;

    // Validate stock levels
    for (const item of supplyCart) {
      const stockItem = stocks.find(s => s.id === item.stockId);
      if (!stockItem) {
        alert(`Product "${item.name}" was not found in the database.`);
        return;
      }
      if (stockItem.onHand < item.quantity) {
        alert(`Not enough stock for "${item.name}". Only ${stockItem.onHand} units left, but you requested ${item.quantity}.`);
        return;
      }
    }

    // Validate payment method selected
    if (!supplyPaymentMethod) {
      alert("Please select a payment method.");
      return;
    }
    if (supplyPaymentMethod === 'Cash') {
      const supplyTotal = supplyCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (dsrTotalCashCalculated < supplyTotal) {
        alert(`Insufficient cash. The bill is ₱${supplyTotal.toLocaleString()}, but only ₱${dsrTotalCashCalculated.toLocaleString()} was counted in the drawer cash calculator.`);
        return;
      }
    } else {
      const ref = supplyPaymentMethod === 'GCash' ? supplyGcashRef : supplyBankRef;
      if (!ref.trim()) {
        alert(`Please specify the ${supplyPaymentMethod} Reference Number.`);
        return;
      }
    }

    const dateStr = supplyDate;
    const monthIndex = new Date(dateStr).getMonth();
    const monthsCodes = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthKey = monthsCodes[monthIndex];

    const currentMonthData = salesSummary[monthKey];
    if (!currentMonthData) {
      alert(`Month ${monthKey} is not registered in the 2026 ledger.`);
      return;
    }

    const totalAmount = supplyCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const staffUpperName = supplyStaff.toUpperCase();

    // 1. Update stock levels and create stock logs
    const stocksCopy = stocks.map(item => {
      const cartItem = supplyCart.find(ci => ci.stockId === item.id);
      if (cartItem) {
        return { ...item, onHand: item.onHand - cartItem.quantity };
      }
      return item;
    });

    const newStockLogs: StockLog[] = supplyCart.map(item => ({
      id: `sl-pos-supply-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: dateStr,
      itemId: item.stockId,
      itemName: item.name,
      type: "OUT",
      qty: item.quantity,
      remarks: `POS Direct Supply checkout for Client: ${supplyClientName || "Walk-in"}`,
      staff: supplyStaff || "MANAGER"
    }));

    setStocks(stocksCopy);
    saveState("rose_stocks", stocksCopy);
    setStockLogs([...newStockLogs, ...stockLogs]);
    saveState("rose_stockLogs", [...newStockLogs, ...stockLogs]);

    // 2. Update Sales Summary Ledger
    let recordsCopy = [...currentMonthData.records];
    let recordIndex = recordsCopy.findIndex(r => r.date === dateStr);

    if (recordIndex >= 0) {
      const oldVal = recordsCopy[recordIndex].staffSales[staffUpperName] || 0;
      recordsCopy[recordIndex].staffSales[staffUpperName] = oldVal + totalAmount;
      const sumStaff = Object.values(recordsCopy[recordIndex].staffSales).reduce((sum, v) => sum + v, 0);
      recordsCopy[recordIndex].gross = sumStaff;
      recordsCopy[recordIndex].netSales = recordsCopy[recordIndex].gross - recordsCopy[recordIndex].exp - recordsCopy[recordIndex].daily - recordsCopy[recordIndex].comi;
      recordsCopy[recordIndex].roseShare = recordsCopy[recordIndex].netSales;
    } else {
      const newRec: DailySalesSummaryRecord = {
        date: dateStr,
        staffSales: { [staffUpperName]: totalAmount },
        gross: totalAmount,
        exp: 0,
        daily: 200,
        comi: 0,
        netSales: totalAmount - 200,
        roseShare: totalAmount - 200
      };
      recordsCopy.push(newRec);
    }
    recordsCopy.sort((a, b) => a.date.localeCompare(b.date));

    const updatedSummary = {
      ...salesSummary,
      [monthKey]: {
        ...currentMonthData,
        records: recordsCopy
      }
    };
    setSalesSummary(updatedSummary);
    saveState("rose_salesSummary", updatedSummary);

    // 3. Create Payment Transaction
    let refNoStr = "";
    let cashVal = 0;
    let gcashVal = 0;
    let bankVal = 0;

    if (supplyPaymentMethod === 'Cash') {
      refNoStr = `CSH-SUPPLY-${staffUpperName}-${Date.now().toString().slice(-6)}`;
      cashVal = totalAmount;
    } else if (supplyPaymentMethod === 'GCash') {
      refNoStr = `GCASH-SUPPLY-${supplyGcashRef.trim()}`;
      gcashVal = totalAmount;
    } else {
      refNoStr = `BANK-SUPPLY-${supplyBankRef.trim()}`;
      bankVal = totalAmount;
    }

    const newTx: PaymentTransaction = {
      id: (paymentTransactions.length + 1).toString() + "-" + Math.floor(Math.random() * 1000),
      date: dateStr,
      refNo: refNoStr,
      gcash: gcashVal,
      bank: bankVal,
      cash: cashVal,
      verifiedBy: "MANAGER",
      totalGross: totalAmount,
      remarks: `POS: ${staffUpperName}. Mode: ${supplyPaymentMethod}. PettyCash: ₱0, Exp: ₱0, CA: ₱0, Addon: ₱0, Cards: ₱0. Supplies: ₱${totalAmount}. Over/Short: ₱0. Customer: ${supplyClientName}`
    };

    setPaymentTransactions([newTx, ...paymentTransactions]);
    saveState("rose_paymentTransactions", [newTx, ...paymentTransactions]);

    // 4. Create Services Logs (for Sold Supplies list)
    const newServicesLogs: ServiceLog[] = [];
    supplyCart.forEach((item, itemIdx) => {
      for (let q = 0; q < item.quantity; q++) {
        newServicesLogs.push({
          id: `${Date.now()}-supply-${itemIdx}-${q}-${Math.floor(Math.random() * 1000)}`,
          customerName: supplyClientName || "Walk-in",
          serviceName: item.name,
          staffName: staffUpperName,
          price: item.price,
          date: dateStr,
          isProduct: true
        });
      }
    });

    const updatedServicesLog = [...newServicesLogs, ...servicesLog];
    setServicesLog(updatedServicesLog);
    saveState("rose_servicesLog", updatedServicesLog);

    alert(`Supply sale successful! Recorded payment, stock reduction, and sales logs.`);

    // Clear supply sale states
    setSupplyCart([]);
    setSupplyClientName("Walk-in");
    setSupplyGcashRef("");
    setSupplyBankRef("");
    setSupplyPaymentMethod(null);
    // Clear cash bills so drawer is fresh for next transaction
    updateDsrBills({ 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 1: 0 });
  };

  const getStylistName = (code: string) => {
    const s = staffs.find(staff => staff.code === code);
    return s ? s.name : code;
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header section with POS Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline pb-2">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Checkout Counter & POS</h2>
          <p className="text-xs text-on-surface-variant">
            Process payments directly or queue client treatment sessions in progress.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setIsQueuePopupOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 bg-surface-container-low border border-outline text-on-surface-variant hover:text-primary hover:bg-white h-[38px] shadow-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>View In-Chair Queue</span>
            {ongoingServices.length > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-primary text-white font-mono">
                {ongoingServices.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsDrawerDetailsOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 bg-surface-container-low border border-outline text-on-surface-variant hover:text-primary hover:bg-white h-[38px] shadow-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 17.625v-4.5zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v9c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-9zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v13.5c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
            <span>Cash Drawer Details</span>
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="flex items-center justify-center p-2.5 rounded-xl border border-outline hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition cursor-pointer h-[38px] w-[38px]"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4.5 h-4.5 text-primary animate-pulse">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3 3m12 6V4.5l-.01.01M15 9h4.5M15 9l6-6M9 15v4.5M9 15H4.5M9 15l-6 6m12-6v4.5M15 15h4.5M15 15l6 6" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4.5 h-4.5 text-on-surface-variant">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-outline gap-6 shrink-0 mb-2">
        <button
          type="button"
          onClick={() => setPosSubTab('service')}
          className={`pb-3 text-xs font-black uppercase tracking-wider transition-all relative cursor-pointer ${posSubTab === 'service'
            ? 'text-primary'
            : 'text-on-surface-variant hover:text-on-surface'
            }`}
        >
          <span className="flex items-center gap-1.5">
            <Icons.cart className="w-4 h-4" />
            <span>Service Checkout</span>
          </span>
          {posSubTab === 'service' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setPosSubTab('supplies')}
          className={`pb-3 text-xs font-black uppercase tracking-wider transition-all relative cursor-pointer ${posSubTab === 'supplies'
            ? 'text-primary'
            : 'text-on-surface-variant hover:text-on-surface'
            }`}
        >
          <span className="flex items-center gap-1.5">
            <Icons.grid className="w-4 h-4" />
            <span>Sell Supplies</span>
          </span>
          {posSubTab === 'supplies' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {posSubTab === 'service' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Catalog selection board */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex overflow-x-auto no-scrollbar gap-1.5 bg-surface-container-low p-1.5 rounded-xl border border-outline whitespace-nowrap">
              {(['ALL', 'Hair', 'Nails', 'Aesthetic', 'Other', 'Products', 'Supplies'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPosCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer shrink-0 ${posCategory === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-primary hover:bg-white'
                    }`}
                >
                  {cat === 'ALL' ? 'All Catalog' : cat === 'Products' ? 'Retail Products' : cat === 'Supplies' ? 'Salon Supplies' : cat}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-surface-container-low border border-outline rounded-xl px-4 py-2.5 flex items-center gap-3">
                <Icons.search className="w-4.5 h-4.5 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder={
                    posCategory === 'Products'
                      ? "Search retail products..."
                      : posCategory === 'Supplies'
                        ? "Search salon supplies..."
                        : "Search service menu..."
                  }
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  className="bg-transparent w-full text-xs outline-none border-none text-on-surface"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const name = prompt("Enter Custom Service Name:");
                  if (!name) return;
                  const price = Number(prompt("Enter Service Price (₱):"));
                  if (!price || isNaN(price)) return;
                  const customItem = {
                    id: "custom-" + Date.now(),
                    name,
                    price,
                    category: "Other",
                    commissionRate: 0.27,
                    isProduct: false,
                    sku: '',
                    stockId: '',
                    onHand: 0
                  };
                  handleAddServiceToCart(customItem);
                }}
                className="bg-secondary text-white hover:bg-secondary/90 px-4 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                + Custom Item
              </button>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {posServicesCatalog.map(service => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleAddServiceToCart(service)}
                  className="bg-white border border-outline hover:border-primary/50 hover:bg-primary-container/10 p-4 rounded-xl flex flex-col justify-between text-left transition h-28 group relative shadow-sm hover:shadow cursor-pointer"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant self-start">
                      {service.category}
                    </span>
                    <h4 className="font-bold text-xs text-on-surface mt-1 group-hover:text-primary transition">{service.name}</h4>
                  </div>
                  <div className="flex items-end justify-between w-full border-t border-outline/10 pt-2 mt-2">
                    <span className="text-sm font-black text-on-surface">₱{service.price.toLocaleString()}</span>
                    {service.isProduct ? (
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${service.onHand === 0
                        ? 'bg-red-50 text-red-650'
                        : service.onHand <= 5
                          ? 'bg-amber-50 text-amber-800 animate-pulse border border-amber-300'
                          : 'bg-emerald-50 text-emerald-700'
                        }`}>
                        {service.onHand === 0 ? 'Out of Stock' : service.onHand <= 5 ? `Low Stock: ${service.onHand}` : `${service.onHand} in stock`}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-on-surface-variant font-mono">
                        {Math.round((service.commissionRate ?? 0.27) * 100)}% Staff
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Tally Cash Sum section */}
            {paymentMethod === 'Cash' && (
              <div className="bg-surface border border-outline rounded-2xl p-4 flex flex-col gap-2.5 shadow-xs animate-fadeIn mt-auto">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.214-.112a2.386 2.386 0 001.378-2.146v-1.127m0-2.818V10m0 2.818V16m-3-2.818h6m-6 0a3 3 0 003 3h0a3 3 0 003-3m-6 0a3 3 0 003-3h0a3 3 0 003 3M6.75 12a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" /></svg>
                    Total Cash in Drawer:
                  </span>
                  <span className="font-mono text-sm font-black text-on-surface">
                    ₱{dsrTotalCashCalculated.toLocaleString()}
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${dsrOverShort === 0
                  ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
                  : dsrOverShort > 0
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-red-50 border-red-200 text-red-850'
                  }`}>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider block">Drawer Status</span>
                    <span className="text-xs font-bold mt-0.5 block">
                      {dsrOverShort === 0
                        ? "Drawer balances perfectly"
                        : dsrOverShort > 0
                          ? `Extra Cash: ₱${dsrOverShort.toLocaleString()}`
                          : `Short Cash: ₱${Math.abs(dsrOverShort).toLocaleString()}`
                      }
                    </span>
                  </div>
                  <div className="text-sm font-black font-mono">
                    {dsrOverShort >= 0 ? "+" : ""}{dsrOverShort.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Checkout cart */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <form onSubmit={handleSaveDsrToLedger} className="bg-surface border border-outline rounded-2xl p-5 flex flex-col shadow-sm lg:h-[calc(100vh-160px)] min-h-[550px] overflow-hidden gap-0">
              <div className="flex justify-between items-center border-b border-outline/20 pb-3 shrink-0">
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                  <Icons.cart className="w-4.5 h-4.5 text-primary" /> Checkout Ticket
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    updateDsrServices([]);
                    setClientName("Walk-in");
                    setActiveOngoingId(null);
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-bold cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {/* Scrollable Container for Cart and Inputs */}
              <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 pr-1">
                {/* Linked ongoing banner indicator */}
                {activeOngoingId && (
                  <div className="bg-primary/5 border border-primary/20 text-primary text-xs px-3 py-2 rounded-xl flex justify-between items-center font-bold animate-fadeIn gap-1.5">
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>Loaded from In-Chair Queue</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveOngoingId(null);
                        setClientName("Walk-in");
                        setClientMobile("");
                        updateDsrServices([]);
                      }}
                      className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                    >
                      Unlink
                    </button>
                  </div>
                )}

                {/* Client info grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-on-surface-variant">Staff</label>
                    <button
                      type="button"
                      onClick={() => setIsStylistPopupOpen(true)}
                      className="bg-white border border-outline px-3 py-2 rounded-lg text-xs font-bold text-left flex items-center justify-between hover:bg-surface-container-low transition cursor-pointer text-on-surface w-full h-[34px]"
                    >
                      <span className="truncate">
                        {staffs.find(s => s.code === dsrStaff)?.name || dsrStaff} ({dsrStaff})
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-on-surface-variant shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-on-surface-variant">Client Name</label>
                    <input
                      type="text"
                      placeholder="Enter client name..."
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="bg-white border border-outline px-3 py-2 rounded-lg text-xs font-semibold outline-none text-on-surface"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-on-surface-variant">Mobile #</label>
                  <input
                    type="text"
                    placeholder="e.g. 0917-123-4567"
                    value={clientMobile}
                    onChange={(e) => setClientMobile(e.target.value)}
                    className="bg-white border border-outline px-3 py-2 rounded-lg text-xs font-semibold outline-none text-on-surface font-mono"
                  />
                </div>

                {/* Cart List */}
                <div className="grid grid-cols-2 gap-2 border border-outline/20 p-2 rounded-xl bg-surface-container-low content-start">
                  {dsrServices.map((s, idx) => (
                    <div key={s.id} className="flex justify-between items-center bg-white p-2 py-1.5 rounded-lg border border-outline/25 text-[11px] h-11">
                      <div className="flex-1 pr-1 min-w-0">
                        <span className="font-semibold text-on-surface block truncate" title={s.service}>{s.service}</span>
                        <span className="text-[9px] text-on-surface-variant block font-mono leading-none mt-0.5">
                          {s.isProduct ? `Retail • SKU: ${s.sku || 'N/A'}` : `Comm: ${Math.round((s.commissionRate ?? 0.27) * 100)}%`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-bold text-on-surface">₱{s.price.toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteDsrService(s.id)}
                          className="text-red-500 hover:text-red-755 font-bold cursor-pointer text-sm px-0.5"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  {dsrServices.length === 0 && (
                    <div className="col-span-2 flex items-center justify-center text-xs text-on-surface-variant opacity-60 h-20 text-center">
                      Cart is empty.<br />Click catalog services on the left.
                    </div>
                  )}
                </div>

                {/* Drawer Cash Calculator */}
                {paymentMethod === 'Cash' && (
                  <div className="border-t border-outline/25 pt-3 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-2.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod(null)}
                        className="px-2 py-1 rounded-lg hover:bg-surface-container-high text-[10px] font-bold text-primary transition cursor-pointer flex items-center gap-1 border border-outline/45 bg-white shadow-3xs"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span>Back</span>
                      </button>
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Drawer Cash Calculator</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1000, 500, 200, 100, 50, 20, 10, 5, 1].map(bill => (
                        <div key={bill} className="flex flex-col items-center justify-between bg-surface border border-outline p-1.5 rounded-lg text-center gap-1 shadow-sm">
                          <span className="text-[10px] font-black text-on-surface">₱{bill}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleAdjustDenom(bill, -1)}
                              className="w-5 h-5 rounded-md bg-surface-container hover:bg-surface-container-high text-xs font-bold flex items-center justify-center transition cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold font-mono min-w-4">{dsrBills[bill] || 0}</span>
                            <button
                              type="button"
                              onClick={() => handleAdjustDenom(bill, 1)}
                              className="w-5 h-5 rounded-md bg-surface-container hover:bg-surface-container-high text-xs font-bold flex items-center justify-center transition cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[9px] text-on-surface-variant font-mono mt-0.5">₱{(bill * (dsrBills[bill] || 0)).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Summary */}
                {/* Cash Tendered & Change */}
                {paymentMethod === 'Cash' && (
                  <div className="flex flex-col gap-2 border-t border-outline/10 animate-fadeIn">
                    <div className="border-t border-outline/25 pt-3 flex justify-between items-center font-bold text-xs">
                      <span className="text-on-surface-variant">Total Bill Amount:</span>
                      <span className="text-base font-black text-primary">₱{dsrTotalServices.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-on-surface-variant">Cash Paid:</span>
                      <span className="font-mono text-sm font-black text-on-surface">
                        ₱{dsrTotalCashCalculated.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-on-surface-variant">Change:</span>
                      <span className="font-mono text-sm font-black text-emerald-700">
                        ₱{Math.max(0, dsrTotalCashCalculated - dsrTotalServices).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Method Selector */}
                {paymentMethod !== 'Cash' && (
                  <div className="border-t border-outline/25 pt-3">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-1 rounded-xl border border-outline/30">
                      {(['Cash', 'GCash', 'Bank'] as const).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${paymentMethod === method
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-on-surface-variant hover:text-primary hover:bg-white'
                            }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                )}



                {/* Digital payment verification details */}
                {(paymentMethod === 'GCash' || paymentMethod === 'Bank') && (
                  <div className="border-t border-outline/25 pt-3 animate-fadeIn flex flex-col gap-2.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{paymentMethod} Reference Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 10293847"
                        value={paymentMethod === 'GCash' ? gcashRef : bankRef}
                        onChange={(e) => {
                          if (paymentMethod === 'GCash') setGcashRef(e.target.value);
                          else setBankRef(e.target.value);
                        }}
                        className="bg-white border border-outline px-3.5 py-2.5 rounded-xl outline-none focus:border-primary text-sm font-semibold transition text-on-surface font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout actions */}
              <div className="flex gap-2.5 mt-auto border-t border-outline/20 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={handleStartOngoingTreatment}
                  disabled={dsrServices.length === 0}
                  className="flex-1 bg-secondary hover:bg-secondary/90 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white py-3 rounded-xl text-xs font-bold transition shadow-sm hover:shadow cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Queue Service</span>
                </button>

                <button
                  type="submit"
                  disabled={dsrServices.length === 0}
                  className="flex-[1.5] bg-primary disabled:bg-zinc-350 disabled:cursor-not-allowed hover:bg-primary-hover text-white py-3 rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-19.5 0a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25m-19.5 0v3A2.25 2.25 0 004.5 19.5h15a2.25 2.25 0 002.25-2.25v-3" /></svg>
                  <span>Checkout & Pay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Supplies Inventory list */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex bg-surface-container-low p-1.5 rounded-xl border border-outline items-center justify-between">
              <span className="text-xs font-bold text-on-surface px-2">Supplies & Retail Catalog</span>
              <span className="text-[10px] text-on-surface-variant font-mono bg-white px-2 py-0.5 border border-outline rounded-lg">
                {stocks.filter(s => s.category === 'Consumable' || s.category === 'Equipment' || s.category === 'Retail Product').length} items available
              </span>
            </div>

            <div className="bg-surface-container-low border border-outline rounded-xl px-4 py-2.5 flex items-center gap-3">
              <Icons.search className="w-4.5 h-4.5 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search stock catalog..."
                value={supplySearch}
                onChange={(e) => setSupplySearch(e.target.value)}
                className="bg-transparent w-full text-xs outline-none border-none text-on-surface"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {stocks
                .filter(s => s.category === 'Consumable' || s.category === 'Equipment' || s.category === 'Retail Product')
                .filter(s => s.name.toLowerCase().includes(supplySearch.toLowerCase()) || s.sku.toLowerCase().includes(supplySearch.toLowerCase()))
                .map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAddSupplyToCart(item)}
                    className="bg-white border border-outline hover:border-primary/50 hover:bg-primary-container/10 p-4 rounded-xl flex flex-col justify-between text-left transition h-28 group relative shadow-sm hover:shadow cursor-pointer"
                  >
                    <div className="flex flex-col gap-1">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded self-start ${item.category === 'Retail Product' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'
                        }`}>
                        {item.category}
                      </span>
                      <h4 className="font-bold text-xs text-on-surface mt-1 group-hover:text-primary transition">{item.name}</h4>
                      <span className="text-[9px] text-on-surface-variant font-mono">SKU: {item.sku || 'N/A'}</span>
                    </div>
                    <div className="flex items-end justify-between w-full border-t border-outline/10 pt-2 mt-2">
                      <span className="text-sm font-black text-on-surface">₱{(item.salesPrice || item.costPrice || 0).toLocaleString()}</span>
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${item.onHand === 0
                        ? 'bg-red-50 text-red-650'
                        : item.onHand <= 5
                          ? 'bg-amber-50 text-amber-800 animate-pulse border border-amber-300'
                          : 'bg-emerald-50 text-emerald-700'
                        }`}>
                        {item.onHand === 0 ? 'Out of Stock' : item.onHand <= 5 ? `Low Stock: ${item.onHand}` : `${item.onHand} units`}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Right Column: Direct Supply Checkout Form */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <form onSubmit={handleCheckoutSupplies} className="bg-surface border border-outline rounded-2xl p-5 flex flex-col shadow-sm lg:h-[calc(100vh-160px)] min-h-[550px] overflow-hidden gap-0">
              <div className="flex justify-between items-center border-b border-outline/20 pb-3 shrink-0">
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                  <Icons.grid className="w-4.5 h-4.5 text-primary" /> Supply Checkout
                </h3>
                <button
                  type="button"
                  onClick={() => setSupplyCart([])}
                  className="text-xs text-red-500 hover:text-red-700 font-bold cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 pr-1">
                {/* Client Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-on-surface-variant">Client Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Walk-in client"
                    value={supplyClientName}
                    onChange={(e) => setSupplyClientName(e.target.value)}
                    className="bg-white border border-outline px-3 py-2 rounded-lg text-xs font-semibold outline-none text-on-surface"
                  />
                </div>

                {/* Supply Cart List */}
                <div className="flex flex-col gap-2 border border-outline/20 p-2 rounded-xl bg-surface-container-low content-start">
                  {supplyCart.map((item) => (
                    <div key={item.stockId} className="flex justify-between items-center bg-white p-2 py-1.5 rounded-lg border border-outline/25 text-[11px] h-11">
                      <div className="flex-1 pr-1 min-w-0">
                        <span className="font-semibold text-on-surface block truncate" title={item.name}>{item.name}</span>
                        <span className="text-[9px] text-on-surface-variant block font-mono leading-none mt-0.5">
                          {item.category} • SKU: {item.sku || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5 bg-surface-container-low px-1.5 py-0.5 rounded-lg border border-outline/20">
                          <button
                            type="button"
                            onClick={() => handleAdjustSupplyQty(item.stockId, -1)}
                            className="w-4 h-4 text-xs font-black flex items-center justify-center hover:text-primary transition"
                          >-</button>
                          <span className="text-xs font-bold font-mono min-w-3 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleAdjustSupplyQty(item.stockId, 1)}
                            className="w-4 h-4 text-xs font-black flex items-center justify-center hover:text-primary transition"
                          >+</button>
                        </div>
                        <span className="font-bold text-on-surface min-w-[50px] text-right">₱{(item.price * item.quantity).toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSupplyFromCart(item.stockId)}
                          className="text-red-500 hover:text-red-700 font-bold cursor-pointer text-sm px-0.5"
                        >×</button>
                      </div>
                    </div>
                  ))}
                  {supplyCart.length === 0 && (
                    <div className="col-span-2 flex items-center justify-center text-xs text-on-surface-variant opacity-60 h-20 text-center">
                      Cart is empty.<br />Click catalog supplies on the left.
                    </div>
                  )}
                </div>

                {/* Drawer Cash Calculator — shown when Cash is selected */}
                {supplyPaymentMethod === 'Cash' && (
                  <div className="border-t border-outline/25 pt-3 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-2.5">
                      <button
                        type="button"
                        onClick={() => setSupplyPaymentMethod(null)}
                        className="px-2 py-1 rounded-lg hover:bg-surface-container-high text-[10px] font-bold text-primary transition cursor-pointer flex items-center gap-1 border border-outline/45 bg-white shadow-3xs"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span>Back</span>
                      </button>
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Drawer Cash Calculator</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1000, 500, 200, 100, 50, 20, 10, 5, 1].map(bill => (
                        <div key={bill} className="flex flex-col items-center justify-between bg-surface border border-outline p-1.5 rounded-lg text-center gap-1 shadow-sm">
                          <span className="text-[10px] font-black text-on-surface">₱{bill}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleAdjustDenom(bill, -1)}
                              className="w-5 h-5 rounded-md bg-surface-container hover:bg-surface-container-high text-xs font-bold flex items-center justify-center transition cursor-pointer"
                            >-</button>
                            <span className="text-xs font-bold font-mono min-w-4">{dsrBills[bill] || 0}</span>
                            <button
                              type="button"
                              onClick={() => handleAdjustDenom(bill, 1)}
                              className="w-5 h-5 rounded-md bg-surface-container hover:bg-surface-container-high text-xs font-bold flex items-center justify-center transition cursor-pointer"
                            >+</button>
                          </div>
                          <span className="text-[9px] text-on-surface-variant font-mono mt-0.5">₱{(bill * (dsrBills[bill] || 0)).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cash Summary — below drawer calculator */}
                {supplyPaymentMethod === 'Cash' && (() => {
                  const supplyTotal = supplyCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  return (
                    <div className="flex flex-col gap-2 border-t border-outline/10 animate-fadeIn">
                      <div className="border-t border-outline/25 pt-3 flex justify-between items-center font-bold text-xs">
                        <span className="text-on-surface-variant">Total Bill Amount:</span>
                        <span className="text-base font-black text-primary">₱{supplyTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-on-surface-variant">Cash Paid:</span>
                        <span className="font-mono text-sm font-black text-on-surface">₱{dsrTotalCashCalculated.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-on-surface-variant">Change:</span>
                        <span className="font-mono text-sm font-black text-emerald-700">₱{Math.max(0, dsrTotalCashCalculated - supplyTotal).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Payment Method Selector — shown when no method selected yet */}
                {supplyPaymentMethod !== 'Cash' && (
                  <div className="border-t border-outline/25 pt-3">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-1 rounded-xl border border-outline/30">
                      {(['Cash', 'GCash', 'Bank'] as const).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setSupplyPaymentMethod(method)}
                          className={`py-2 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                            supplyPaymentMethod === method
                              ? 'bg-primary text-white shadow-sm'
                              : 'text-on-surface-variant hover:text-primary hover:bg-white'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Digital payment reference input */}
                {(supplyPaymentMethod === 'GCash' || supplyPaymentMethod === 'Bank') && (
                  <div className="border-t border-outline/25 pt-3 animate-fadeIn flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 mb-0.5">
                      <button
                        type="button"
                        onClick={() => setSupplyPaymentMethod(null)}
                        className="px-2 py-1 rounded-lg hover:bg-surface-container-high text-[10px] font-bold text-primary transition cursor-pointer flex items-center gap-1 border border-outline/45 bg-white shadow-3xs"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span>Back</span>
                      </button>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{supplyPaymentMethod} Reference Number</label>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 10293847"
                      value={supplyPaymentMethod === 'GCash' ? supplyGcashRef : supplyBankRef}
                      onChange={(e) => {
                        if (supplyPaymentMethod === 'GCash') setSupplyGcashRef(e.target.value);
                        else setSupplyBankRef(e.target.value);
                      }}
                      className="bg-white border border-outline px-3.5 py-2.5 rounded-xl outline-none focus:border-primary text-sm font-semibold transition text-on-surface font-mono"
                    />
                    <div className="border-t border-outline/25 pt-3 flex justify-between items-center font-bold text-xs">
                      <span className="text-on-surface-variant">Total Bill Amount:</span>
                      <span className="text-base font-black text-primary">₱{supplyCart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout actions */}
              <div className="flex gap-2.5 mt-auto border-t border-outline/20 pt-4 shrink-0">
                <button
                  type="submit"
                  disabled={supplyCart.length === 0}
                  className="w-full bg-primary disabled:bg-zinc-350 disabled:cursor-not-allowed hover:bg-primary-hover text-white py-3 rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-19.5 0a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25m-19.5 0v3A2.25 2.25 0 004.5 19.5h15a2.25 2.25 0 002.25-2.25v-3" /></svg>
                  <span>Checkout &amp; Pay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stylist Selector Popup Modal */}
      {isStylistPopupOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-outline rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto transform scale-100 transition-all duration-200">
            <div className="flex justify-between items-center border-b border-outline/20 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-on-surface flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  <span>Select Staff</span>
                </h3>
                <p className="text-xs text-on-surface-variant">Assign a staff member for this checkout ticket.</p>
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
                const isSelected = s.code === dsrStaff;
                const activeOngoingCount = ongoingServices.filter(os => os.staffCode === s.code).length;

                // Initials for avatar
                const initials = s.name.substring(0, 2).toUpperCase();

                return (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => {
                      setDsrStaff(s.code);
                      setIsStylistPopupOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition text-left cursor-pointer ${isSelected
                      ? 'border-primary bg-primary/5 hover:bg-primary/10'
                      : 'border-outline/50 hover:border-primary/50 hover:bg-surface-container-low'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isSelected ? 'bg-primary text-white' : 'bg-secondary/10 text-secondary'
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

      {/* In-Chair Queue Retrieval Popup Modal */}
      {isQueuePopupOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-outline rounded-3xl p-6 max-w-4xl w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto transform scale-100 transition-all duration-200 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-outline/20 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-on-surface flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Active In-Chair Queue ({ongoingServices.length})</span>
                </h3>
                <p className="text-xs text-on-surface-variant">Select an ongoing treatment to check out and pay.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQueuePopupOpen(false)}
                className="p-1.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ongoingServices.map((item) => {
                const subtotal = item.services.reduce((sum, s) => sum + s.price, 0);
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-outline rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition gap-4 relative"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-xs text-on-surface truncate max-w-[140px]">{item.customerName}</h4>
                          <span className="text-[10px] text-on-surface-variant block mt-0.5 font-semibold">
                            Staff: <span className="text-primary font-bold">{getStylistName(item.staffCode)}</span>
                          </span>
                        </div>
                        <ElapsedTimer startTime={item.startTime} />
                      </div>

                      <div className="flex flex-col gap-2 bg-surface-container-low p-3 rounded-xl border border-outline/10 text-xs">
                        <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                          {item.services.map((s, index) => (
                            <div key={index} className="flex justify-between items-center text-on-surface-variant font-medium">
                              <span className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-on-surface-variant"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                <span>{s.service}</span>
                              </span>
                              <span className="font-mono text-primary font-bold">₱{s.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-on-surface-variant pt-2.5 border-t border-outline/10 mt-1 font-mono">
                          <span>Started: {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-between items-center border-t border-outline/10 pt-3 mt-1">
                      <div>
                        <span className="text-[9px] text-on-surface-variant block uppercase font-bold tracking-wider">Subtotal</span>
                        <span className="text-sm font-black text-primary">₱{subtotal.toLocaleString()}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCancelOngoing(item.id)}
                          className="px-2.5 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center justify-center"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() => handleLoadOngoingToPos(item)}
                          className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-[10px] font-bold transition shadow-xs hover:shadow-sm cursor-pointer flex items-center justify-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-19.5 0a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25m-19.5 0v3A2.25 2.25 0 004.5 19.5h15a2.25 2.25 0 002.25-2.25v-3" /></svg>
                          <span>Check Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {ongoingServices.length === 0 && (
                <div className="col-span-full py-16 text-center text-xs text-on-surface-variant bg-surface-container-low border border-outline border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-on-surface-variant/40"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <p className="font-bold">No active treatment services in progress</p>
                    <p className="opacity-75 mt-0.5">Queue clients from the Register Ticket view first.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cash Drawer Details Popup Modal */}
      {isDrawerDetailsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-outline rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto transform scale-100 transition-all duration-200 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-outline/20 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-on-surface flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 17.625v-4.5zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v9c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-9zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v13.5c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                  <span>Cash Drawer Details</span>
                </h3>
                <p className="text-xs text-on-surface-variant">Update the cash float, daily expenses, and non-cash totals.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerDetailsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Starting Cash / Float (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={pettyCash || ""}
                  onChange={(e) => setPettyCash(Number(e.target.value))}
                  className="bg-white border border-outline px-3 py-2 rounded-xl text-xs outline-none text-on-surface focus:border-primary transition"
                  placeholder="e.g. 1000"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Expenses Today (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={expenses || ""}
                  onChange={(e) => setExpenses(Number(e.target.value))}
                  className="bg-white border border-outline px-3 py-2 rounded-xl text-xs outline-none text-on-surface focus:border-primary transition"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Staff Cash Advance (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={cashAdvance || ""}
                  onChange={(e) => setCashAdvance(Number(e.target.value))}
                  className="bg-white border border-outline px-3 py-2 rounded-xl text-xs outline-none text-on-surface focus:border-primary transition"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Supplies Sold (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={soldSupplies || ""}
                  onChange={(e) => setSoldSupplies(Number(e.target.value))}
                  className="bg-white border border-outline px-3 py-2 rounded-xl text-xs outline-none text-on-surface focus:border-primary transition"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Card Payments (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={creditDebit || ""}
                  onChange={(e) => setCreditDebit(Number(e.target.value))}
                  className="bg-white border border-outline px-3 py-2 rounded-xl text-xs outline-none text-on-surface focus:border-primary transition"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Extra Cash Received (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={addOn || ""}
                  onChange={(e) => setAddOn(Number(e.target.value))}
                  className="bg-white border border-outline px-3 py-2 rounded-xl text-xs outline-none text-on-surface focus:border-primary transition"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">GCash Amount (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={gcashAmt || ""}
                  onChange={(e) => setGcashAmt(Number(e.target.value))}
                  className="bg-white border border-outline px-3 py-2 rounded-xl text-xs outline-none text-on-surface focus:border-primary transition font-mono"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Online Transfer (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={onlineTransfer || ""}
                  onChange={(e) => setOnlineTransfer(Number(e.target.value))}
                  className="bg-white border border-outline px-3 py-2 rounded-xl text-xs outline-none text-on-surface focus:border-primary transition font-mono"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="border-t border-outline/20 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDrawerDetailsOpen(false)}
                className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
