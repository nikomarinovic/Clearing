import { LayoutGrid, ArrowLeftRight, CalendarClock, ShoppingBag, Plane, PieChart, Settings, MoreHorizontal, PiggyBank, Heart } from "lucide-react";
import type { ComponentType } from "react";

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}

export const PRIMARY_NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/plan", label: "Plan", icon: CalendarClock },
  { to: "/purchases", label: "Purchases", icon: ShoppingBag },
  { to: "/savings", label: "Savings", icon: PiggyBank },
  { to: "/wishes", label: "Wishes", icon: Heart },
  { to: "/trips", label: "Trips", icon: Plane },
  { to: "/analytics", label: "Analytics", icon: PieChart },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const MOBILE_NAV: NavItem[] = [
  { to: "/", label: "Home", icon: LayoutGrid },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/plan", label: "Plan", icon: CalendarClock },
  { to: "/analytics", label: "Analytics", icon: PieChart },
  { to: "/more", label: "More", icon: MoreHorizontal },
];

export const MORE_NAV: NavItem[] = [
  { to: "/purchases", label: "Purchases", icon: ShoppingBag },
  { to: "/trips", label: "Trips", icon: Plane },
  { to: "/savings", label: "Savings", icon: PiggyBank },
  { to: "/wishes", label: "Wishes", icon: Heart },
  { to: "/settings", label: "Settings", icon: Settings },
];
