"use client";
import { useState } from "react";
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  CubeIcon, 
  ChartBarIcon, 
  UsersIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from "@heroicons/react/24/outline";
import Link from "next/link";
import clsx from "clsx";

const menuItems = [
  { name: "Tổng quan", path: "/", icon: HomeIcon },
  { name: "Quản lý đơn hàng", path: "/orders", icon: ClipboardDocumentListIcon },
  { name: "Quản lý sản phẩm", path: "/products", icon: CubeIcon },
  { name: "Thống kê & Doanh thu", path: "/stats", icon: ChartBarIcon },
  { name: "Quản lý người dùng", path: "/users", icon: UsersIcon },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={clsx("h-screen bg-gray-900 text-white flex flex-col transition-all", collapsed ? "w-16" : "w-60")}>
      {/* Nút toggle menu */}
      <button 
        className="p-2 focus:outline-none hover:bg-gray-800 flex items-center justify-center"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRightIcon className="h-6 w-6" /> : <ChevronLeftIcon className="h-6 w-6" />}
      </button>
      
      <nav className="flex-1">
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path} className="flex items-center p-3 hover:bg-gray-800">
            <item.icon className="h-6 w-6" />
            {!collapsed && <span className="ml-3">{item.name}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
