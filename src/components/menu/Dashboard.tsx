"use client";
import { useEffect, useState, useCallback } from "react";
import {
  ShoppingCartIcon,
  CubeIcon,
  CurrencyDollarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { API_dashboard } from "../../config";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28CFF",
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
];

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("tkn");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const res = await fetch(API_dashboard, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi server: ${res.status}`);
      }

      const data = await res.json();
      if (!data) {
        throw new Error("Không nhận được dữ liệu từ server");
      }
      setStats(data);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      setError(error.message || "Có lỗi xảy ra khi tải dữ liệu");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <svg
          className="animate-spin -ml-1 mr-3 h-10 w-10 text-[#2563eb]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <span className="text-blue-600 font-semibold">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#2563eb]">Dashboard</h2>
          <button
            onClick={fetchStats}
            className="bg-[#2563eb] text-white px-4 py-2 rounded hover:bg-[#1e40af] transition"
          >
            Thử lại
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Lỗi: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Tổng đơn hàng",
      content: (
        <>
          <p className="text-gray-600">Tổng: {stats?.totalOrders || 0}</p>
          <p className="text-gray-600">Chờ giao: {stats?.pendingOrders || 0}</p>
        </>
      ),
      icon: ShoppingCartIcon,
    },
    {
      title: "Sản phẩm",
      content: (
        <>
          <p className="text-gray-600">Đang bán: {stats?.sellingProducts || 0}</p>
          <p className="text-gray-600">Hết hàng: {stats?.outOfStockProducts || 0}</p>
        </>
      ),
      icon: CubeIcon,
    },
    {
      title: "Doanh thu tháng",
      content: (
        <>
          <p className="text-gray-600">{stats?.revenue ? `${stats.revenue.toLocaleString('vi-VN')}đ` : '0đ'}</p>
        </>
      ),
      icon: CurrencyDollarIcon,
    },
    {
      title: "Người dùng đăng ký",
      content: (
        <>
          <p className="text-gray-600">Đã xác minh: {stats?.activeUsers || 0}</p>
          <p className="text-gray-600">Chờ xác minh: {stats?.pendingUsers || 0}</p>
          <p className="text-gray-600">Đã khóa: {stats?.disabledUsers || 0}</p>
        </>
      ),
      icon: UsersIcon,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#2563eb]">Dashboard</h2>
        <button
          onClick={fetchStats}
          className="bg-[#2563eb] text-white px-4 py-2 rounded hover:bg-[#1e40af] transition"
        >
          Làm mới
        </button>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white shadow-md p-5 rounded-lg flex items-center space-x-4"
          >
            <stat.icon className="h-10 w-10 text-[#2563eb]" />
            <div>
              <h3 className="text-gray-600 font-semibold">{stat.title}</h3>
              {stat.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;