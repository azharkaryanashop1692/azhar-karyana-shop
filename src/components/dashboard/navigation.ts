import {
  ClipboardList,
  History,
  LayoutDashboard,
  Package,
  SquarePlus,
  Tags,
  Users,
} from "lucide-react";

// `short` is the label used in the phone bottom tab bar.
export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { id: "add-record", label: "Add Shop Record", short: "Add", icon: SquarePlus },
  { id: "history", label: "Shop History", short: "History", icon: History },
  { id: "needs", label: "Shop Needs", short: "Needs", icon: ClipboardList },
  { id: "orders", label: "Orders", short: "Orders", icon: Package },
  { id: "people", label: "People's Record", short: "People", icon: Users },
  { id: "products", label: "Products Price", short: "Products", icon: Tags },
] as const;

export type TabId = (typeof NAV_ITEMS)[number]["id"];
