
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Video,
  MapPin,
  UsersRound,
  History,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { SimovisLogoIcon } from "../../public/icons/Icons";
import LogoutButton from "../auth/LogoutButton";

const menuItems = [
  {
    label: "Monitoring",
    href: "/dashboard",
    icon: Video,
  },
  {
    label: "Manajemen Lokasi",
    href: "/dashboard/location-management",
    icon: MapPin,
  },
  {
    label: "Manajemen User",
    href: "/dashboard/userManagement",
    icon: UsersRound,
  },
  {
    label: "Riwayat Analisis",
    href: "/dashboard/history",
    icon: History,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Buka menu navigasi"
        className="fixed left-4 top-4 z-40 rounded-lg bg-white p-2 shadow-md lg:hidden"
      >
        <Menu size={22} />
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64
          flex-col border-r border-zinc-100 bg-white
          transition-transform duration-200
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex h-24 shrink-0 items-center justify-between px-7">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center  text-[#4D0077]"
          >
            <SimovisLogoIcon className="h-9 w-9" />
            <span className="text-2xl font-semibold italic mt-2">
              Simovis
            </span>
          </Link>

          <button
            type="button"
            className="lg:hidden"
            aria-label="Tutup sidebar"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Navigasi dashboard"
          className="flex-1 space-y-2 px-5 pt-5"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`
                  flex items-center gap-3 rounded-xl
                  px-4 py-3 text-sm transition-colors
                  ${
                    isActive
                      ? "bg-brand-secondary border-[#E2DAE7] border-1 font-medium text-brand-purple"
                      : "text-font-primary hover:bg-zinc-50 hover:text-[#4D0077]"
                  }
                `}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="flex items-center justify-center px-5 py-6">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
