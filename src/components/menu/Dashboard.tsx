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

  useEffect(() => {
    const sampleData = {
      totalOrders: 1280,
      pendingOrders: 120,
      sellingProducts: 350,
      outOfStockProducts: 50,
      stoppedProducts: 20,
      revenue: "145,000,000đ",
      revenueChange: 12.5,
      activeUsers: 980,
      pendingUsers: 45,
      topProducts: [
        { name: "Áo sơ mi", sales: 250 },
        { name: "Quần jeans", sales: 230 },
        { name: "Giày sneaker", sales: 220 },
        { name: "Áo khoác", sales: 210 },
        { name: "Balo du lịch", sales: 200 },
        { name: "Áo thun", sales: 190 },
        { name: "Mũ lưỡi trai", sales: 180 },
        { name: "Kính râm", sales: 170 },
        { name: "Túi xách", sales: 160 },
        { name: "Giày boot", sales: 150 },
      ],
      revenueByCategory: [
        { name: "Thời trang", value: 40000000 },
        { name: "Giày dép", value: 30000000 },
        { name: "Phụ kiện", value: 20000000 },
        { name: "Đồ du lịch", value: 15000000 },
      ],
      weakestProducts: [
        {
          name: "Túi đeo chéo",
          image: "https://via.placeholder.com/40",
          percent: 5,
        },
        {
          name: "Khăn len",
          image: "https://via.placeholder.com/40",
          percent: 8,
        },
        {
          name: "Găng tay",
          image: "https://via.placeholder.com/40",
          percent: 10,
        },
      ],
      strongestProducts: [
        {
          name: "Áo hoodie",
          image: "https://via.placeholder.com/40",
          percent: 95,
        },
        {
          name: "Quần thể thao",
          image: "https://via.placeholder.com/40",
          percent: 92,
        },
        {
          name: "Áo thun nam",
          image: "https://via.placeholder.com/40",
          percent: 90,
        },
      ],
    };

    setStats(sampleData);
    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_dashboard);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
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

  const dashboardStats = [
    {
      title: "Tổng đơn hàng",
      content: (
        <>
          <p className="text-gray-600">Tổng: {stats.totalOrders}</p>
          <p className="text-gray-600">Chờ giao: {stats.pendingOrders}</p>
        </>
      ),
      icon: ShoppingCartIcon,
    },
    {
      title: "Sản phẩm có sẵn",
      content: (
        <>
          <p className="text-gray-600">Đang bán: {stats.sellingProducts}</p>
          <p className="text-gray-600">Hết hàng: {stats.outOfStockProducts}</p>
          <p className="text-gray-600">Ngừng bán: {stats.stoppedProducts}</p>
        </>
      ),
      icon: CubeIcon,
    },
    {
      title: "Doanh thu tháng",
      content: (
        <>
          <p className="text-gray-600">{stats.revenue}</p>
          {typeof stats.revenueChange === "number" && (
            <p
              className={`text-sm font-semibold mt-1 ${stats.revenueChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
            >
              {stats.revenueChange >= 0 ? "▲" : "▼"} {Math.abs(stats.revenueChange)}%
            </p>
          )}
        </>
      ),
      icon: CurrencyDollarIcon,
    },
    {
      title: "Người dùng đăng ký",
      content: (
        <>
          <p className="text-gray-600">Đã xác minh: {stats.activeUsers}</p>
          <p className="text-gray-600">Chờ xác minh: {stats.pendingUsers}</p>
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