"use client";
import { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";

// Hàm lấy token từ cookie
const getTokenFromCookie = () => {
  const cookieName = "auth_token=";
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(cookieName)) {
      return cookie.substring(cookieName.length);
    }
  }
  return null;
};

const menuItems = [
  { name: "Tổng quan", path: "/", icon: HomeIcon },
  { name: "Quản lý đơn hàng", path: "/orders", icon: ClipboardDocumentListIcon },
  { name: "Quản lý sản phẩm", path: "/products", icon: CubeIcon },
  { name: "Thống kê & Doanh thu", path: "/stats", icon: ChartBarIcon },
  { name: "Quản lý người dùng", path: "/users", icon: UsersIcon },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  // Kiểm tra client-side rendering
  useEffect(() => {
    console.log("Sidebar component mounted on client-side");
  }, []);

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    // Hiển thị confirm dialog
    const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
    if (!confirmLogout) {
      return; // Nếu người dùng hủy, thoát hàm
    }

    // Lấy token từ cookie
    const token = getTokenFromCookie();
    if (!token) {
      alert("Không tìm thấy token. Vui lòng đăng nhập lại.");
      router.push("/login");
      return;
    }

    try {
      // Gọi API đăng xuất
      const response = await fetch("http://localhost:3000/api/user/logout_admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Xử lý các lỗi từ API
        switch (response.status) {
          case 400:
            alert(data.message || "Vui lòng cung cấp token!");
            break;
          case 401:
            alert(data.message || "Token không hợp lệ hoặc đã hết hạn.");
            router.push("/login"); // Chuyển hướng về login nếu token không hợp lệ
            break;
          case 404:
            alert(data.message || "Người dùng không tồn tại!");
            router.push("/login");
            break;
          case 500:
            alert(data.message || "Lỗi server: " + (data.error || "Không xác định"));
            break;
          default:
            alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
        }
        return;
      }

      // Thành công (200)
      if (data.message === "Đăng xuất admin thành công!") {
        // Xóa token từ cookie
        document.cookie = "auth_token=; path=/; max-age=0; SameSite=Strict";
        alert("Đăng xuất thành công!");
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Đã có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.");
    }
  };

  return (
    <div className={clsx("h-screen bg-gray-900 text-white flex flex-col transition-all", collapsed ? "w-16" : "w-60")}>
      {/* Nút toggle menu */}
      <button 
        className="p-2 focus:outline-none hover:bg-gray-800 flex items-center justify-center"
        onClick={() => {
          console.log("Toggle button clicked!");
          setCollapsed(!collapsed);
        }}
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

        {/* Nút đăng xuất */}
        <button
          onClick={() => {
            console.log("Logout button clicked!");
            handleLogout();
          }}
          className="flex items-center p-3 text-red-500 hover:bg-gray-800 w-full text-left"
        >
          <ChevronLeftIcon className="h-6 w-6" />
          {!collapsed && <span className="ml-3">Đăng xuất</span>}
        </button>
      </nav>
    </div>
  );
}