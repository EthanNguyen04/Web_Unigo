"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "../../components/menu/Dashboard";
import Orders from "../../components/menu/Orders";
import Products from "../../components/menu/Product";
import Stats from "../../components/menu/Stats";
import Users from "../../components/menu/Users";
import { API_LOGIN, API_LOGOUT } from "../../config";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  ChartBarIcon,
  UsersIcon,
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
    name: "Quản lý người dùng",
    path: "/users",
    component: <Users />,
    icon: <UsersIcon className="h-5 w-5 mr-2" />,
  },
];

const Sidebar = () => {
  const [selectedPage, setSelectedPage] = useState<React.ReactElement>(<Dashboard />);
  const [activePath, setActivePath] = useState<string>("/");
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const router = useRouter();

  // Lấy giá trị name từ localStorage sau khi component đã mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("name");
      if (storedName) {
        setName(storedName);
      }
    }
  }, []);

  // Kiểm tra token khi trang được tải hoặc làm mới
  useEffect(() => {
    const checkToken = async () => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("tkn");
      if (token) {
        const tokena = "Bearer " + token;
        try {
          const res = await fetch(API_LOGIN, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: tokena,
            },
          });
          const data = await res.json();
          if (res.status !== 200) {
            router.replace("/");
          } else if (res.status === 200) {
            localStorage.setItem("name", data.fullname);
            setName(data.fullname);
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra token:", error);
          router.replace("/");
        }
      } else {
        router.replace("/");
      }
    };

    checkToken();
  }, [router]);

  // Hàm chuyển đổi nội dung khi chọn menu
  const handleMenuClick = (component: React.ReactElement, path: string) => {
    setSelectedPage(component);
    setActivePath(path);
  };

  // Hàm xử lý đăng xuất có xác nhận
  const handleLogout = () => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
    if (!confirmed) return;

    const checkToken = async () => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("tkn");
      if (token) {
        const tokena = "Bearer " + token;
        try {
          await fetch(API_LOGOUT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: tokena,
            },
          });
          localStorage.removeItem("tkn");
          router.replace("/");
        } catch (error) {
          console.error("Lỗi khi đăng xuất:", error);
          router.replace("/");
        }
      } else {
        router.replace("/");
      }
    };
    checkToken();
  };

  return (
    // Sử dụng overflow-hidden cho container chính để ngăn cuộn toàn trang
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar cố định */}
      <div
        className={`${
          collapsed ? "w-16" : "w-1/5"
        } bg-[#CE6700] text-white h-full flex flex-col justify-between transition-all duration-300`}
      >
        <div>
          <div className="flex items-center justify-between p-4">
            {!collapsed && (
              <span className="text-xl font-bold">Quản lý cửa hàng Unigo</span>
            )}
            <button onClick={() => setCollapsed(!collapsed)} className="focus:outline-none">
              {collapsed ? (
                <ChevronRightIcon className="h-6 w-6" />
              ) : (
                <ChevronLeftIcon className="h-6 w-6" />
              )}
            </button>
          </div>
          <nav className="flex flex-col">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleMenuClick(item.component, item.path)}
                className={`flex items-center p-4 transition-colors ${
                  activePath === item.path ? "bg-gray-600" : "hover:bg-gray-700"
                }`}
              >
                {item.icon}
                {!collapsed && <span>{item.name}</span>}
              </button>
            ))}
          </nav>
        </div>
        {/* Thông tin nhân viên và nút đăng xuất */}
        <div className="flex items-center justify-between p-4 border-t border-white/30 mb-10">
          {!collapsed && <span className="text-sm">{name}</span>}
          <button onClick={handleLogout} className="focus:outline-none">
            <PowerIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Nội dung chính cho phép cuộn */}
      <div className="bg-[#fff] flex-1 p-6 overflow-y-auto">
        {selectedPage}
      </div>
    </div>
  );
};

export default Sidebar;
