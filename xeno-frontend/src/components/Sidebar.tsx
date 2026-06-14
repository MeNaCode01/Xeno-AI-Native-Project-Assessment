import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Megaphone, PlusCircle, X } from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/audience", label: "Audience Builder", icon: Users },
    { to: "/campaigns", label: "Campaigns", icon: Megaphone },
    { to: "/campaign/new", label: "New Campaign", icon: PlusCircle },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Navigation Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-100 bg-white transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col dark:bg-slate-950 dark:border-slate-800 transition-colors duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Megaphone className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">CRM Strategist</span>
          </div>
          {/* Close drawer button for mobile screens */}
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-hidden dark:text-slate-400 dark:hover:bg-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
