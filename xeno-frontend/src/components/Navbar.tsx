import React, { useState, useRef, useEffect } from "react";
import { Menu, User, Sun, Moon, Laptop, ChevronDown } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import type { Theme } from "../context/ThemeContext";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeOptions: { value: Theme; label: string; icon: React.ComponentType<any> }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ];

  const currentOption = themeOptions.find((opt) => opt.value === theme) || themeOptions[2];
  const CurrentIcon = currentOption.icon;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white px-6 shadow-xs shrink-0 dark:bg-slate-950 dark:border-slate-800 transition-colors duration-200">
      <div className="flex items-center gap-4">
        {/* Toggle sidebar button visible on mobile screens */}
        <button
          onClick={onToggleSidebar}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-hidden dark:text-slate-400 dark:hover:bg-slate-900"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="hidden text-sm font-medium text-slate-500 sm:inline-block dark:text-slate-400">
          Welcome Back
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Dropdown Toggle */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 transition-all duration-150 cursor-pointer shadow-xs"
          >
            <CurrentIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{currentOption.label}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-md dark:border-slate-800 dark:bg-slate-950 z-50">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setTheme(opt.value);
                      setDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors ${
                      theme === opt.value
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
          <User className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
};
