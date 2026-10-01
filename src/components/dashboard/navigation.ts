import {
  ClipboardList,
  History,
  LayoutDashboard,
  Package,
  SquarePlus,
  Tags,
  Users,
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "add-record", label: "Add Shop Record", icon: SquarePlus },
  { id: "history", label: "Shop History", icon: History },
  { id: "needs", label: "Shop Needs", icon: ClipboardList },
  { id: "orders", label: "Orders", icon: Package },
  { id: "people", label: "People's Record", icon: Users },
  { id: "products", label: "Products Price", icon: Tags },
] as const;

export type TabId = (typeof NAV_ITEMS)[number]["id"];
