// 'use client';

import React from "react";
import {
  ShoppingCartIcon,
  CubeIcon,
  CurrencyDollarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const stats = [
  { title: "Tổng đơn hàng", value: 1200, icon: ShoppingCartIcon },
  { title: "Sản phẩm có sẵn", value: 350, icon: CubeIcon },
  { title: "Doanh thu tháng", value: "₫150,000,000", icon: CurrencyDollarIcon },
  { title: "Người dùng đăng ký", value: 2300, icon: UsersIcon },
];

const revenueData = [
  { name: "T1", revenue: 8000, order: 2400 },
  { name: "T2", revenue: 9670, order: 1398 },
  { name: "T3", revenue: 9800, order: 3908 },
  { name: "T4", revenue: 9500, order: 4800 },
  { name: "T5", revenue: 10200, order: 3800 },
];

const usersByRegion = [
  { name: "TP.HCM", value: 400 },
  { name: "Hà Nội", value: 300 },
  { name: "Đà Nẵng", value: 200 },
  { name: "Khác", value: 100 },
];

const COLORS = ["#FF9F40", "#36A2EB", "#4BC0C0", "#FF6384"];

export default function Home() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-orange-100 text-orange-900 p-5 rounded-xl flex items-center space-x-4 shadow-sm"
          >
            <stat.icon className="h-10 w-10 text-orange-600" />
            <div>
              <h3 className="text-sm font-semibold">{stat.title}</h3>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Revenue Analytics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#FF9F40" />
              <Line type="monotone" dataKey="order" stroke="#36A2EB" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Tỉ lệ người dùng theo khu vực</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usersByRegion}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {usersByRegion.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
