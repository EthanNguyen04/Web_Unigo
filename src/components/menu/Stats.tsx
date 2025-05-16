"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import { Get_Stats } from "../../config";

interface DayStat {
  day: number;
  totalQuantity: number;
  totalRevenue: number;
}

interface ProductStat {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
  averageRating: number;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#d0ed57",
  "#a4de6c",
  "#d88884",
  "#84d8c8",
  "#d884d8",
];

// Mock data
const mockStats: DayStat[] = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  totalQuantity: Math.floor(Math.random() * 20 + 10),
  totalRevenue: Math.floor(Math.random() * 1000000 + 100000),
}));

const mockProductStats: ProductStat[] = [
  { productId: "p1", productName: "Sản phẩm A", totalQuantity: 120, totalRevenue: 2500000, averageRating: 4.8 },
  { productId: "p2", productName: "Sản phẩm B", totalQuantity: 95, totalRevenue: 1900000, averageRating: 4.5 },
  { productId: "p3", productName: "Sản phẩm C", totalQuantity: 75, totalRevenue: 1400000, averageRating: 4.9 },
  { productId: "p4", productName: "Sản phẩm D", totalQuantity: 50, totalRevenue: 1000000, averageRating: 4.1 },
  { productId: "p5", productName: "Sản phẩm E", totalQuantity: 30, totalRevenue: 600000, averageRating: 4.6 },
  { productId: "p6", productName: "Sản phẩm F", totalQuantity: 25, totalRevenue: 450000, averageRating: 4.3 },
  { productId: "p7", productName: "Sản phẩm G", totalQuantity: 20, totalRevenue: 300000, averageRating: 4.0 },
  { productId: "p8", productName: "Sản phẩm H", totalQuantity: 18, totalRevenue: 250000, averageRating: 4.7 },
  { productId: "p9", productName: "Sản phẩm I", totalQuantity: 15, totalRevenue: 200000, averageRating: 4.4 },
  { productId: "p10", productName: "Sản phẩm J", totalQuantity: 10, totalRevenue: 150000, averageRating: 4.2 },
];

const Stats: React.FC = () => {
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [stats, setStats] = useState<DayStat[]>([]);
  const [productStats, setProductStats] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (y: number, m: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(`${Get_Stats}?year=${y}&month=${m}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();

      let originalStats: DayStat[] = data.stats || [];
      let products: ProductStat[] = data.productStats || [];

      if (!originalStats.length) originalStats = mockStats;
      if (!products.length) products = mockProductStats;

      const filledStats: DayStat[] = Array.from({ length: 30 }, (_, i) => {
        const day = i + 1;
        const found = originalStats.find((s) => s.day === day);
        return {
          day,
          totalQuantity: found?.totalQuantity || 0,
          totalRevenue: found?.totalRevenue || 0,
        };
      });

      setStats(filledStats);
      setProductStats(products);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
      setStats(mockStats);
      setProductStats(mockProductStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(year, month);
  }, [year, month]);

  const top10BestSelling = [...productStats]
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10);

  const topRatedProducts = [...productStats]
    .filter((p) => p.averageRating > 0)
    .sort((a, b) =>
      b.averageRating === a.averageRating
        ? b.totalRevenue - a.totalRevenue
        : b.averageRating - a.averageRating
    )
    .slice(0, 5);

  return (
    <div className="flex-1 p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-indigo-700">📊 Thống kê doanh thu & sản phẩm</h1>

      {/* Bộ lọc */}
      <div className="flex gap-6">
        <div>
          <label className="block font-medium text-gray-700 mb-1">Năm</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const y = today.getFullYear() - 2 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Tháng</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const m = i + 1;
              return <option key={m} value={m}>{m}</option>;
            })}
          </select>
        </div>
      </div>

      {loading && <p>⏳ Đang tải dữ liệu…</p>}
      {error && <p className="text-red-500">❌ {error}</p>}

      {!loading && !error && stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Biểu đồ doanh thu theo ngày */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              💰 Doanh thu theo ngày (30 ngày)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(v: any) => v.toLocaleString("vi-VN") + "₫"} />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#6366f1" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ Pie doanh thu theo sản phẩm */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              🍰 Doanh thu theo sản phẩm
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productStats}
                  dataKey="totalRevenue"
                  nameKey="productName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                >
                  {productStats.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => v.toLocaleString("vi-VN") + "₫"} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 sản phẩm bán chạy */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              📦 Top 10 sản phẩm bán chạy
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={top10BestSelling} layout="vertical" margin={{ left: 50, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="productName" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalQuantity" fill="#10b981" name="Số lượng bán" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top sản phẩm đánh giá cao */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              ⭐ Top sản phẩm đánh giá cao
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topRatedProducts} layout="vertical" margin={{ left: 50, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis dataKey="productName" type="category" width={150} />
                <Tooltip
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Legend />
                <Bar dataKey="averageRating" fill="#f59e0b" name="Đánh giá trung bình" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;