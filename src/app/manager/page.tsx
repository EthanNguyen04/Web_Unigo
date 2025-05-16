"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Dashboard from "../../components/menu/Dashboard";
import Orders    from "../../components/menu/Orders";
import Products  from "../../components/menu/Product";
import Stats     from "../../components/menu/Stats";
import Users     from "../../components/menu/Users";
import Marketing from "../../components/menu/Marketing";

import { API_LOGIN, API_LOGOUT } from "../../config";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  ChartBarIcon,
  UsersIcon,
  MegaphoneIcon,
  PowerIcon,
} from "@heroicons/react/24/outline";

interface MenuItem {
  name: string;
  path: string;
  component: React.ReactElement;
  icon: React.ReactElement;
}

const menuItems: MenuItem[] = [
  {
    name: "Tổng quan",
    path: "/",
    component: <Dashboard />,
    icon: <HomeIcon className="h-5 w-5 mr-2" />,
  },
  {
    name: "Quản lý đơn hàng",
    path: "/orders",
    component: <Orders />,
    icon: <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />,
  },
  {
    name: "Quản lý sản phẩm",
    path: "/products",
    component: <Products />,
    icon: <CubeIcon className="h-5 w-5 mr-2" />,
  },
  {
    name: "Thống kê & Doanh thu",
    path: "/stats",
    component: <Stats />,
    icon: <ChartBarIcon className="h-5 w-5 mr-2" />,
  },
  {
    name: "Marketing",
    path: "/marketing",
    component: <Marketing />,
    icon: <MegaphoneIcon className="h-5 w-5 mr-2" />,
  },
  {
    name: "Quản lý người dùng",
    path: "/users",
    component: <Users />,
    icon: <UsersIcon className="h-5 w-5 mr-2" />,
  },
];

const Sidebar = () => {
  const [selectedPage, setSelectedPage] = useState<React.ReactElement>(<Dashboard />);
  const [activePath, setActivePath]     = useState<string>("/");
  const [collapsed, setCollapsed]       = useState<boolean>(false);
  const [name, setName]                 = useState<string>("");
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const r = localStorage.getItem('role');
      setRole(r);
    }
  }, []);

  const filteredMenu = role === 'staff'
    ? menuItems.filter(item => !['/','/stats','/users'].includes(item.path))
    : menuItems;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("name");
      if (storedName) setName(storedName);
    }
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("tkn");
      if (!token) return router.replace("/");

      try {
        const res = await fetch(API_LOGIN, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.status !== 200) return router.replace("/");
        localStorage.setItem("name", data.fullname);
        setName(data.fullname);
      } catch {
        router.replace("/");
      }
    };
    checkToken();
  }, [router]);

  const handleMenuClick = (component: React.ReactElement, path: string) => {
    setSelectedPage(component);
    setActivePath(path);
  };

  const handleLogout = () => {
    if (!window.confirm("Bạn có chắc chắn muốn đăng xuất?")) return;
    const token = localStorage.getItem("tkn");
    if (!token) return router.replace("/");
    fetch(API_LOGOUT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .catch(console.error)
      .finally(() => {
        localStorage.removeItem("tkn");
        router.replace("/");
      });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={`$ {
          collapsed ? "w-16" : "w-60"
        } bg-gradient-to-b from-orange-500 to-orange-700 text-white h-full flex flex-col justify-between shadow-lg transition-all duration-300`}
      >
        <div>
          <div className="flex items-center justify-between px-4 py-5 border-b border-orange-300">
            {!collapsed && (
              <span className="text-lg font-bold tracking-wide">Unigo Admin</span>
            )}
            <button onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? (
                <ChevronRightIcon className="h-5 w-5" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <nav className="flex flex-col mt-4">
            {filteredMenu.map(item => (
              <button
                key={item.path}
                onClick={() => handleMenuClick(item.component, item.path)}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors rounded-l-full ${
                  activePath === item.path ? "bg-white text-orange-700 shadow-md" : "hover:bg-orange-600"
                }`}
              >
                {item.icon}
                {!collapsed && <span className="truncate">{item.name}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center justify-between px-4 py-4 border-t border-orange-300">
          {!collapsed && <span className="text-xs font-light">{name}</span>}
          <button onClick={handleLogout} className="hover:text-red-300">
            <PowerIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-gray-50 flex-1 p-6 overflow-y-auto">
        {selectedPage}
      </div>
    </div>
  );
};

export default Sidebar;
