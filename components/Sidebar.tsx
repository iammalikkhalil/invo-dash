"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

const navItems = [
  {
    label: "All Users",
    href: "/users",
    isActive: (pathname: string) => pathname.startsWith("/users"),
  },
  {
    label: "Inventory Items",
    href: "/inventory-items",
    isActive: (pathname: string) => pathname.startsWith("/inventory-items"),
  },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar">
      <div>
        <Logo href="/users" width={158} height={38} />
      </div>

      <nav className="sidebar-nav" aria-label="Main Navigation">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`sidebar-link ${item.isActive(pathname) ? "sidebar-link-active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <p className="sidebar-note">Extend `navItems` in `Sidebar.tsx` when adding new modules.</p>
    </aside>
  );
}
