"use client";
import { useEffect, useState } from "react";
import {
  ShoppingCartIcon,
  CubeIcon,
  CurrencyDollarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { API_dashboard } from "../../config";

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(API_dashboard);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
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
      content: <p className="text-gray-600">{stats.revenue}</p>,
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
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {dashboardStats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white shadow-md p-5 rounded-lg flex items-center space-x-4"
        >
          <stat.icon className="h-10 w-10 text-blue-500" />
          <div>
            <h3 className="text-gray-600 font-semibold">{stat.title}</h3>
            {stat.content}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
