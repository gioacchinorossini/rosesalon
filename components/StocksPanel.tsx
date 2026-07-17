import React, { useState, useMemo } from "react";
import { Icons } from "./Icons";
import { StaffMember } from "../app/data/initialData";

export interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: 'Retail Product' | 'Consumable' | 'Equipment';
  onHand: number;
  minThreshold: number;
  costPrice: number;
  salesPrice?: number;
  supplier: string;
}

export interface StockLog {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  qty: number;
  remarks: string;
  staff: string;
}

interface StocksPanelProps {
  stocks: StockItem[];
  setStocks: React.Dispatch<React.SetStateAction<StockItem[]>>;
  stockLogs: StockLog[];
  setStockLogs: React.Dispatch<React.SetStateAction<StockLog[]>>;
  staffs: StaffMember[];
  saveState: (key: string, val: any) => void;
}

export const StocksPanel: React.FC<StocksPanelProps> = ({
  stocks,
  setStocks,
  stockLogs,
  setStockLogs,
  staffs,
  saveState,
}) => {
  // Navigation tabs inside stocks
  const [subTab, setSubTab] = useState<'catalog' | 'ledger'>('catalog');

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Retail Product' | 'Consumable' | 'Equipment'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Low Stock' | 'Out of Stock' | 'Healthy'>('All');

  // Modal toggles
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Form States - Add/Edit Item
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemSku, setItemSku] = useState("");
  const [itemCategory, setItemCategory] = useState<'Retail Product' | 'Consumable' | 'Equipment'>('Retail Product');
  const [itemOnHand, setItemOnHand] = useState<number>(0);
  const [itemMinThreshold, setItemMinThreshold] = useState<number>(3);
  const [itemCostPrice, setItemCostPrice] = useState<number>(0);
  const [itemSalesPrice, setItemSalesPrice] = useState<number>(0);
  const [itemSupplier, setItemSupplier] = useState("");

  // Form States - Stock In/Out Adjustment
  const [adjustItemId, setAdjustItemId] = useState("");
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT' | 'ADJUST'>('IN');
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustRemarks, setAdjustRemarks] = useState("");
  const [adjustStaff, setAdjustStaff] = useState(() => staffs.find(s => s.status === 'Active')?.code || "MANAGER");

  // Calculated KPIs
  const totalSKUs = stocks.length;
  const lowStockCount = useMemo(() => {
    return stocks.filter(s => s.onHand <= s.minThreshold).length;
  }, [stocks]);
  const outOfStockCount = useMemo(() => {
    return stocks.filter(s => s.onHand === 0).length;
  }, [stocks]);
  const totalAssetValue = useMemo(() => {
    return stocks.reduce((sum, s) => sum + (s.onHand * s.costPrice), 0);
  }, [stocks]);

  // Filtered Stock Items
  const filteredStocks = useMemo(() => {
    return stocks.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory = categoryFilter === 'All' || s.category === categoryFilter;

      let matchStatus = true;
      if (statusFilter === 'Low Stock') {
        matchStatus = s.onHand <= s.minThreshold && s.onHand > 0;
      } else if (statusFilter === 'Out of Stock') {
        matchStatus = s.onHand === 0;
      } else if (statusFilter === 'Healthy') {
        matchStatus = s.onHand > s.minThreshold;
      }

      return matchSearch && matchCategory && matchStatus;
    });
  }, [stocks, searchQuery, categoryFilter, statusFilter]);

  // Filtered Stock Logs
  const filteredLogs = useMemo(() => {
    return stockLogs.filter(log => {
      return log.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
             log.remarks.toLowerCase().includes(searchQuery.toLowerCase()) ||
             log.staff.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [stockLogs, searchQuery]);

  // Form submit: Add or edit item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemSku) return;

    let updated: StockItem[];
    if (editingItemId) {
      updated = stocks.map(s => s.id === editingItemId ? {
        ...s,
        name: itemName,
        sku: itemSku.toUpperCase(),
        category: itemCategory,
        onHand: itemOnHand,
        minThreshold: itemMinThreshold,
        costPrice: itemCostPrice,
        salesPrice: itemCategory === 'Retail Product' ? itemSalesPrice : undefined,
        supplier: itemSupplier || "Generic"
      } : s);
    } else {
      const newItem: StockItem = {
        id: "st-" + Date.now(),
        name: itemName,
        sku: itemSku.toUpperCase(),
        category: itemCategory,
        onHand: itemOnHand,
        minThreshold: itemMinThreshold,
        costPrice: itemCostPrice,
        salesPrice: itemCategory === 'Retail Product' ? itemSalesPrice : undefined,
        supplier: itemSupplier || "Generic"
      };
      updated = [...stocks, newItem];
    }

    setStocks(updated);
    saveState("rose_stocks", updated);
    resetItemForm();
    setShowAddProductModal(false);
  };

  const handleStartEdit = (s: StockItem) => {
    setEditingItemId(s.id);
    setItemName(s.name);
    setItemSku(s.sku);
    setItemCategory(s.category);
    setItemOnHand(s.onHand);
    setItemMinThreshold(s.minThreshold);
    setItemCostPrice(s.costPrice);
    setItemSalesPrice(s.salesPrice || 0);
    setItemSupplier(s.supplier);
    setShowAddProductModal(true);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Delete this stock item SKU from catalog?")) {
      const updated = stocks.filter(s => s.id !== id);
      setStocks(updated);
      saveState("rose_stocks", updated);
    }
  };

  const resetItemForm = () => {
    setEditingItemId(null);
    setItemName("");
    setItemSku("");
    setItemCategory("Retail Product");
    setItemOnHand(0);
    setItemMinThreshold(3);
    setItemCostPrice(0);
    setItemSalesPrice(0);
    setItemSupplier("");
  };

  // Quick Adjustment shortcut buttons (+1 / -1)
  const handleQuickAdjust = (item: StockItem, delta: number) => {
    const nextOnHand = Math.max(0, item.onHand + delta);
    
    // Update stock item
    const updatedStocks = stocks.map(s => s.id === item.id ? { ...s, onHand: nextOnHand } : s);
    setStocks(updatedStocks);
    saveState("rose_stocks", updatedStocks);

    // Append log
    const newLog: StockLog = {
      id: "sl-" + Date.now() + "-" + Math.floor(Math.random() * 100),
      date: new Date().toISOString().split("T")[0],
      itemId: item.id,
      itemName: item.name,
      type: delta > 0 ? 'IN' : 'OUT',
      qty: Math.abs(delta),
      remarks: delta > 0 ? "Quick Restock (+)" : "Quick Usage (-)",
      staff: "MANAGER"
    };
    const updatedLogs = [newLog, ...stockLogs];
    setStockLogs(updatedLogs);
    saveState("rose_stockLogs", updatedLogs);
  };

  // Form submit: Stock In/Out Bulk Adjustment
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItemId || adjustQty <= 0) return;

    const item = stocks.find(s => s.id === adjustItemId);
    if (!item) return;

    let finalOnHand = item.onHand;
    if (adjustType === 'IN') {
      finalOnHand += adjustQty;
    } else if (adjustType === 'OUT') {
      finalOnHand = Math.max(0, finalOnHand - adjustQty);
    } else {
      // Direct override setting
      finalOnHand = adjustQty;
    }

    // Update stock item quantity
    const updatedStocks = stocks.map(s => s.id === item.id ? { ...s, onHand: finalOnHand } : s);
    setStocks(updatedStocks);
    saveState("rose_stocks", updatedStocks);

    // Append to logs
    const newLog: StockLog = {
      id: "sl-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      itemId: item.id,
      itemName: item.name,
      type: adjustType,
      qty: adjustQty,
      remarks: adjustRemarks || "Manual Adjustment Log",
      staff: adjustStaff
    };
    const updatedLogs = [newLog, ...stockLogs];
    setStockLogs(updatedLogs);
    saveState("rose_stockLogs", updatedLogs);

    // Reset Form
    setAdjustQty(1);
    setAdjustRemarks("");
    setShowAdjustModal(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Product Stocks & Catalog</h2>
          <p className="text-xs text-on-surface-variant">Manage salon items, view products on hand, and track stock changes</p>
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (stocks.length === 0) {
                alert("Please add a product first before making changes.");
                return;
              }
              setAdjustItemId(stocks[0].id);
              setAdjustType('IN');
              setAdjustQty(1);
              setAdjustRemarks("");
              setShowAdjustModal(true);
            }}
            className="flex items-center gap-1.5 border border-outline hover:bg-surface-container-low text-on-surface px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Icons.add className="w-4 h-4" />
            Add Stock Changes
          </button>
          
          <button
            type="button"
            onClick={() => {
              resetItemForm();
              setShowAddProductModal(true);
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Icons.add className="w-4 h-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* KPI Stats widgets block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-outline p-4.5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Total Products</span>
            <span className="text-xl font-bold font-mono text-on-surface mt-0.5 block">{totalSKUs} Items</span>
          </div>
        </div>

        <div className={`bg-surface border p-4.5 rounded-2xl flex items-center gap-4 shadow-sm ${
          lowStockCount > 0 ? 'border-amber-200 bg-amber-50/20' : 'border-outline'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            lowStockCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-surface-container text-on-surface-variant'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Low Stock</span>
            <span className="text-xl font-bold font-mono text-on-surface mt-0.5 block">
              {lowStockCount} {lowStockCount === 1 ? 'Item' : 'Items'}
            </span>
          </div>
        </div>

        <div className={`bg-surface border p-4.5 rounded-2xl flex items-center gap-4 shadow-sm ${
          outOfStockCount > 0 ? 'border-red-200 bg-red-50/20' : 'border-outline'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            outOfStockCount > 0 ? 'bg-red-100 text-red-650' : 'bg-surface-container text-on-surface-variant'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Out of Stock</span>
            <span className="text-xl font-bold font-mono text-on-surface mt-0.5 block">{outOfStockCount} Items</span>
          </div>
        </div>

        <div className="bg-surface border border-outline p-4.5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.214-.112a2.386 2.386 0 001.378-2.146v-1.127m0-2.818V10m0 2.818V16m-3-2.818h6m-6 0a3 3 0 003 3h0a3 3 0 003-3m-6 0a3 3 0 003-3h0a3 3 0 003 3M6.75 12a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" /></svg>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Total Value (Cost)</span>
            <span className="text-xl font-bold font-mono text-emerald-800 mt-0.5 block">
              ₱{totalAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Panel Content with View Sub-tabs */}
      <div className="bg-surface border border-outline rounded-2xl shadow-sm flex flex-col overflow-hidden">
        
        {/* Navigation Tabs Header & Search Filter */}
        <div className="p-4 bg-surface-container-low border-b border-outline flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="bg-white border border-outline rounded-xl p-1 flex gap-1 items-center self-start shadow-sm">
            <button
              type="button"
              onClick={() => setSubTab('catalog')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                subTab === 'catalog'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
              <span>Product Catalog</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('ledger')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                subTab === 'ledger'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span>Stock Log History</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="bg-white border border-outline rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-sm max-w-xs w-full">
            <Icons.search className="w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder={subTab === 'catalog' ? "Search products..." : "Search log history..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full text-xs outline-none border-none text-on-surface"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* View Mode 1: Product Catalog */}
        {subTab === 'catalog' && (
          <div className="flex flex-col">
            
            {/* Filters Row */}
            <div className="p-4 border-b border-outline flex flex-wrap gap-3 items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-on-surface-variant">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="bg-white border border-outline px-2.5 py-1.5 rounded-lg outline-none font-bold text-on-surface cursor-pointer text-xs"
                >
                  <option value="All">All Categories</option>
                  <option value="Retail Product">Retail Products</option>
                  <option value="Consumable">Consumables</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-on-surface-variant">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-white border border-outline px-2.5 py-1.5 rounded-lg outline-none font-bold text-on-surface cursor-pointer text-xs"
                >
                  <option value="All">All Stock Levels</option>
                  <option value="Healthy">Healthy Stock (&gt; Min)</option>
                  <option value="Low Stock">Low Stock (&lt;= Min)</option>
                  <option value="Out of Stock">Out of Stock (=0)</option>
                </select>
              </div>
            </div>

            {/* Catalog Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Barcode / SKU</th>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">Cost Price</th>
                    <th className="p-3.5 text-right">Sales Price</th>
                    <th className="p-3.5 text-center">Quantity On Hand</th>
                    <th className="p-3.5">Supplier</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Quick Edit</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10">
                  {filteredStocks.map((item) => {
                    const isLow = item.onHand <= item.minThreshold;
                    const isOut = item.onHand === 0;

                    return (
                      <tr key={item.id} className="hover:bg-surface-container-low/20 transition duration-150">
                        <td className="p-3.5 font-mono font-bold text-primary">{item.sku}</td>
                        <td className="p-3.5 font-bold text-on-surface">{item.name}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.category === 'Retail Product'
                              ? 'bg-blue-50 text-blue-800'
                              : item.category === 'Consumable'
                                ? 'bg-purple-50 text-purple-800'
                                : 'bg-amber-50 text-amber-800'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-semibold">
                          ₱{item.costPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-right font-mono font-semibold">
                          {item.salesPrice ? `₱${item.salesPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : <span className="opacity-40">-</span>}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`font-mono font-bold text-sm ${isOut ? 'text-red-650' : isLow ? 'text-amber-700' : 'text-on-surface'}`}>
                            {item.onHand} units
                          </span>
                          <span className="text-[9px] text-on-surface-variant block mt-0.5">Min: {item.minThreshold}</span>
                        </td>
                        <td className="p-3.5 text-on-surface-variant font-medium">{item.supplier}</td>
                        <td className="p-3.5">
                          {isOut ? (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-red-100 text-red-800 tracking-wider">Out of Stock</span>
                          ) : isLow ? (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-amber-100 text-amber-800 tracking-wider">Low Stock</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 tracking-wider">In Stock</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleQuickAdjust(item, -1)}
                              disabled={isOut}
                              className="w-7 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:hover:bg-red-50 text-red-700 font-bold border border-red-100 rounded-lg transition text-sm cursor-pointer"
                              title="Deduct 1 unit"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickAdjust(item, 1)}
                              className="w-7 h-7 flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-100 rounded-lg transition text-sm cursor-pointer"
                              title="Restock 1 unit"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex justify-center items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              className="text-on-surface-variant hover:text-primary transition p-1 hover:bg-surface-container-low rounded-md cursor-pointer"
                              title="Edit product details"
                            >
                              <Icons.edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-on-surface-variant hover:text-red-500 transition p-1 hover:bg-red-50 rounded-md cursor-pointer"
                              title="Remove item"
                            >
                              <Icons.delete className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStocks.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-xs text-on-surface-variant italic font-medium">
                        No product stocks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* View Mode 2: Stock Log History */}
        {subTab === 'ledger' && (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5 text-center">Quantity</th>
                    <th className="p-3.5">By</th>
                    <th className="p-3.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10">
                  {filteredLogs.map((log) => {
                    return (
                      <tr key={log.id} className="hover:bg-surface-container-low/20 transition duration-150">
                        <td className="p-3.5 font-mono font-bold text-on-surface-variant">{log.date}</td>
                        <td className="p-3.5 font-bold text-on-surface">{log.itemName}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            log.type === 'IN'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.type === 'OUT'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {log.type === 'IN' ? 'Stock In' : log.type === 'OUT' ? 'Stock Out' : 'Adjustment'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-black text-sm text-on-surface">
                          {log.qty} pcs
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-on-surface">{log.staff}</span>
                        </td>
                        <td className="p-3.5 text-on-surface-variant font-medium">{log.remarks}</td>
                      </tr>
                    );
                  })}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-xs text-on-surface-variant italic font-medium">
                        No logs found in history.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form onSubmit={handleSaveItem} className="bg-surface border border-outline rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-on-surface">
                {editingItemId ? "Edit Product" : "Add New Product"}
              </h3>
              <p className="text-xs text-on-surface-variant">Fill in product name, details, and warning level</p>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Barcode / SKU</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SH-KER-500"
                    value={itemSku}
                    onChange={(e) => setItemSku(e.target.value)}
                    className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-mono font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as any)}
                    className="bg-white border border-outline px-3 py-2 rounded-lg outline-none focus:border-primary text-xs font-bold cursor-pointer"
                  >
                    <option value="Retail Product">Retail Product</option>
                    <option value="Consumable">Consumable Supply</option>
                    <option value="Equipment">Salon Equipment</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-on-surface-variant">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Keratin Shampoo 500ml"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Quantity On Hand</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={itemOnHand || 0}
                    onChange={(e) => setItemOnHand(Number(e.target.value))}
                    className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Low Stock Warning Level</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={itemMinThreshold || 3}
                    onChange={(e) => setItemMinThreshold(Number(e.target.value))}
                    className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Cost Price (₱)</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={itemCostPrice || 0}
                    onChange={(e) => setItemCostPrice(Number(e.target.value))}
                    className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-bold font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={`font-semibold text-on-surface-variant ${itemCategory !== 'Retail Product' ? 'opacity-40' : ''}`}>
                    Sales Price (₱) {itemCategory !== 'Retail Product' ? '(N/A)' : ''}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    disabled={itemCategory !== 'Retail Product'}
                    value={itemSalesPrice || 0}
                    onChange={(e) => setItemSalesPrice(Number(e.target.value))}
                    className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-bold font-mono disabled:bg-surface-container-low"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-on-surface-variant">Supplier Name</label>
                <input
                  type="text"
                  placeholder="e.g. L'Oreal Corp, Generic, etc."
                  value={itemSupplier}
                  onChange={(e) => setItemSupplier(e.target.value)}
                  className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-outline/25">
              <button
                type="button"
                onClick={() => {
                  setShowAddProductModal(false);
                  resetItemForm();
                }}
                className="px-4 py-2.5 border border-outline hover:bg-surface-container-low rounded-xl font-bold text-on-surface transition cursor-pointer text-xs"
              >
                Dismiss
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition cursor-pointer text-xs"
              >
                {editingItemId ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CHANGE STOCK QUANTITY */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form onSubmit={handleSaveAdjustment} className="bg-surface border border-outline rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-on-surface">Change Stock Quantity</h3>
              <p className="text-xs text-on-surface-variant">Add or remove items from the salon stocks</p>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-on-surface-variant">Select Product</label>
                <select
                  value={adjustItemId}
                  onChange={(e) => setAdjustItemId(e.target.value)}
                  className="bg-white border border-outline px-3 py-2 rounded-lg outline-none focus:border-primary text-xs font-bold cursor-pointer"
                >
                  {stocks.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.sku} - {s.name} ({s.onHand} on hand)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Change Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="bg-white border border-outline px-3 py-2 rounded-lg outline-none focus:border-primary text-xs font-bold cursor-pointer"
                  >
                    <option value="IN">Stock In (Delivery/Return)</option>
                    <option value="OUT">Stock Out (Usage/Sold)</option>
                    <option value="ADJUST">Correction (Manual Audit)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Quantity (pcs)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={adjustQty || 1}
                    onChange={(e) => setAdjustQty(Number(e.target.value))}
                    className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">By</label>
                  <select
                    value={adjustStaff}
                    onChange={(e) => setAdjustStaff(e.target.value)}
                    className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-bold cursor-pointer"
                  >
                    <option value="MANAGER">MANAGER</option>
                    {staffs.map(s => (
                      <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-on-surface-variant">Notes</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delivery, Audit, damaged, etc."
                    value={adjustRemarks}
                    onChange={(e) => setAdjustRemarks(e.target.value)}
                    className="bg-white border border-outline px-3.5 py-2 rounded-lg outline-none focus:border-primary text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-outline/25">
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="px-4 py-2.5 border border-outline hover:bg-surface-container-low rounded-xl font-bold text-on-surface transition cursor-pointer text-xs"
              >
                Dismiss
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
