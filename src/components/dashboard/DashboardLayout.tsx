"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { NAV_ITEMS, type TabId } from "./navigation";
import { getShopHistory, type ShopHistoryRecord } from "@/app/dashboard/actions";
import type { Order } from "@/app/dashboard/orderActions";
import type { Person } from "@/app/dashboard/peopleActions";
import type { Product } from "@/app/dashboard/productActions";
import DashboardSection from "./sections/DashboardSection";
import AddShopRecordSection from "./sections/AddShopRecordSection";
import ShopHistorySection from "./sections/ShopHistorySection";
import ShopNeedsSection from "./sections/ShopNeedsSection";
import OrdersSection from "./sections/OrdersSection";
import PeoplesRecordSection from "./sections/PeoplesRecordSection";
import ProductsPriceSection from "./sections/ProductsPriceSection";

export default function DashboardLayout({
  userEmail,
  initialHistory,
  initialShopNeeds,
  initialOrders,
  initialPeople,
  initialProducts,
}: {
  userEmail: string;
  initialHistory: ShopHistoryRecord[] | null;
  initialShopNeeds: string;
  initialOrders: Order[] | null;
  initialPeople: Person[] | null;
  initialProducts: Product[] | null;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [people, setPeople] = useState(initialPeople);
  const [shopNeeds, setShopNeeds] = useState(initialShopNeeds);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  // Shop History records, preloaded on the server so the screen opens with data.
  const [history, setHistory] = useState(initialHistory);
  // shop_history record open in the edit popup (from Shop History); null = popup closed.
  const [editRecordId, setEditRecordId] = useState<number | null>(null);

  const navigate = (id: TabId) => {
    setEditRecordId(null);
    setActiveTab(id);
    window.scrollTo({ top: 0 });
  };

  // Keep the cached Shop History current so Previous Cash / Current stay instant.
  const refreshHistory = () => {
    getShopHistory().then(({ records, error }) => {
      if (!error) setHistory(records);
    });
  };

  const views: Record<TabId, ReactNode> = {
    dashboard: (
      <DashboardSection
        onNavigate={navigate}
        history={history}
        orders={orders}
        people={people}
        shopNeeds={shopNeeds}
      />
    ),
    "add-record": (
      <AddShopRecordSection history={history} onSaved={refreshHistory} />
    ),
    history: <ShopHistorySection onEdit={setEditRecordId} records={history} setRecords={setHistory} />,
    needs: <ShopNeedsSection text={shopNeeds} setText={setShopNeeds} />,
    orders: <OrdersSection orders={orders} setOrders={setOrders} />,
    people: <PeoplesRecordSection people={people} setPeople={setPeople} />,
    products: <ProductsPriceSection products={products} setProducts={setProducts} />,
  };

  const activeLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? "";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar active={activeTab} onSelect={navigate} />
      <div className="lg:pl-[250px]">
        <Header title={activeLabel} userEmail={userEmail} />
        {/* Bottom padding keeps content clear of the phone tab bar. */}
        <main key={activeTab} className="px-4 pt-6 pb-28 sm:px-6 lg:pb-6">
          {views[activeTab]}
        </main>
      </div>
      <BottomNav active={activeTab} onSelect={navigate} />

      {/* Edit popup: the full Add Shop Record form filled with the record's data. */}
      {editRecordId !== null && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-2 sm:p-4"
          onClick={() => setEditRecordId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edit Shop Record"
            className="mx-auto w-full max-w-[1600px] rounded-2xl border border-white/10 bg-background p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Edit Shop Record</h3>
              <button
                type="button"
                onClick={() => setEditRecordId(null)}
                aria-label="Close"
                className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
            <AddShopRecordSection
              key={editRecordId}
              editId={editRecordId}
              editDetail={history?.find((r) => r.id === editRecordId)?.detail ?? null}
              history={history}
              onSaved={refreshHistory}
            />
          </div>
        </div>
      )}
    </div>
  );
}
