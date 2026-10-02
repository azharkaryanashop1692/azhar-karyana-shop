"use client";

import { useState, type ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { NAV_ITEMS, type TabId } from "./navigation";
import DashboardSection from "./sections/DashboardSection";
import AddShopRecordSection from "./sections/AddShopRecordSection";
import ShopHistorySection from "./sections/ShopHistorySection";
import ShopNeedsSection from "./sections/ShopNeedsSection";
import OrdersSection from "./sections/OrdersSection";
import PeoplesRecordSection from "./sections/PeoplesRecordSection";
import ProductsPriceSection from "./sections/ProductsPriceSection";

export default function DashboardLayout({ userEmail }: { userEmail: string }) {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  // shop_history record being edited on the Add Shop Record screen; null = new record.
  const [editRecordId, setEditRecordId] = useState<number | null>(null);

  const navigate = (id: TabId) => {
    setEditRecordId(null);
    setActiveTab(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  const editRecord = (id: number) => {
    navigate("add-record");
    setEditRecordId(id);
  };

  const views: Record<TabId, ReactNode> = {
    dashboard: <DashboardSection onNavigate={navigate} />,
    "add-record": <AddShopRecordSection key={editRecordId ?? "new"} editId={editRecordId} />,
    history: <ShopHistorySection onEdit={editRecord} />,
    needs: <ShopNeedsSection />,
    orders: <OrdersSection />,
    people: <PeoplesRecordSection />,
    products: <ProductsPriceSection />,
  };

  const activeLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? "";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        active={activeTab}
        onSelect={navigate}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <div className="lg:pl-[250px]">
        <Header title={activeLabel} userEmail={userEmail} onMenuClick={() => setMenuOpen(true)} />
        <main key={activeTab} className="px-4 py-6 sm:px-6">
          {views[activeTab]}
        </main>
      </div>
    </div>
  );
}
