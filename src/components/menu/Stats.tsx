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
import { Get_Stats, Get_Stats_Daily } from "../../config";

interface DayStat {
  day: number;
  totalQuantity: number;
  totalRevenue: number;
  totalImportPrice: number;
  profit: number;
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

// Mock data chỉ cho sản phẩm
const mockStats: DayStat[] = [];

const Stats: React.FC = () => {
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [stats, setStats] = useState<DayStat[]>([]);
  const [productStats, setProductStats] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompletedOnly, setShowCompletedOnly] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Function to truncate product names
  const truncateProductName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // Function to copy product ID
  const copyProductId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Custom YAxis tick component
  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const product = productStats.find(p => p.productName === payload.value);
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="end" 
          fill={copiedId === product?.productId ? "#10b981" : "#666"} 
          fontSize={12}
          cursor="pointer"
          onClick={() => product && copyProductId(product.productId)}
          className="hover:text-indigo-600 transition-colors"
        >
          {truncateProductName(payload.value)}
          {copiedId === product?.productId && " ✓"}
        </text>
        <title>{copiedId === product?.productId ? 'Đã copy!' : 'Nhấn để copy ID sản phẩm'}</title>
      </g>
    );
  };

  const fetchStats = async (y: number, m: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("tkn");
      const url = showCompletedOnly 
        ? `${Get_Stats}?year=${y}&month=${m}&order_status=hoan_thanh`
        : `${Get_Stats}?year=${y}&month=${m}`;
        
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Lỗi ${res.status}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Không thể lấy dữ liệu thống kê');
      }

      // Fetch daily stats
      const dailyRes = await fetch(`${Get_Stats_Daily}?year=${y}&month=${m}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!dailyRes.ok) throw new Error(`Lỗi ${dailyRes.status}`);
      const dailyData = await dailyRes.json();

      let originalStats: DayStat[] = dailyData.stats || [];
      let products: ProductStat[] = data.data || [];

      if (!products.length) {
        throw new Error('Không có dữ liệu thống kê sản phẩm');
      }

      const filledStats: DayStat[] = Array.from({ length: 30 }, (_, i) => {
        const day = i + 1;
        const found = originalStats.find((s) => s.day === day);
        const revenue = found?.totalRevenue || 0;
        const importPrice = found?.totalImportPrice || 0;
        return {
          day,
          totalQuantity: found?.totalQuantity || 0,
          totalRevenue: revenue,
          totalImportPrice: importPrice,
          profit: revenue - importPrice
        };
      });

      setStats(filledStats);
      setProductStats(products);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
      setStats([]);
      setProductStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(year, month);
  }, [year, month, showCompletedOnly]);

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
      <div className="flex gap-6 items-end">
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
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showCompletedOnly}
              onChange={(e) => setShowCompletedOnly(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {showCompletedOnly ? 'Chỉ xem đơn hoàn thành' : 'Xem tất cả đơn hàng'}
            </span>
          </label>
        </div>
      </div>

      {loading && <p>⏳ Đang tải dữ liệu…</p>}
      {error && <p className="text-red-500">❌ {error}</p>}

      {!loading && !error && stats.length > 0 && (
        <div className="space-y-6">
          {/* Biểu đồ doanh thu theo ngày */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              💰 Doanh thu theo ngày (30 ngày)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  interval={0}
                  tickFormatter={(value) => `${value}`}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickLine={{ stroke: '#666' }}
                  axisLine={{ stroke: '#666' }}
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickLine={{ stroke: '#666' }}
                  axisLine={{ stroke: '#666' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickLine={{ stroke: '#666' }}
                  axisLine={{ stroke: '#666' }}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === "Doanh thu" || name === "Vốn" || name === "Lãi") {
                      return value.toLocaleString("vi-VN") + "₫";
                    }
                    return value;
                  }}
                  labelFormatter={(label) => `Ngày ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '20px'
                  }}
                />
                <Bar yAxisId="left" dataKey="totalRevenue" fill="#6366f1" name="Doanh thu" />
                <Bar yAxisId="left" dataKey="totalImportPrice" fill="#ef4444" name="Vốn" />
                <Bar yAxisId="right" dataKey="profit" fill="#10b981" name="Lãi" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Nút toggle */}
          <div className="flex justify-center items-center py-4">
            <div className="bg-white rounded-lg shadow-sm px-6 py-3 inline-flex items-center hover:shadow-md transition-shadow duration-200 relative group">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {showCompletedOnly ? 'Chuyển sang xem tất cả đơn hàng' : 'Chuyển sang chỉ xem đơn hoàn thành'}
              </div>
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showCompletedOnly}
                  onChange={(e) => setShowCompletedOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 group-hover:bg-gray-300 peer-checked:group-hover:bg-indigo-700"></div>
                <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors duration-200">
                  {showCompletedOnly ? 'Chỉ xem đơn hoàn thành' : 'Xem tất cả đơn hàng'}
                </span>
              </label>
            </div>
          </div>

          {/* Grid cho 3 biểu đồ còn lại */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Biểu đồ Pie doanh thu theo sản phẩm */}
            <div className="bg-white p-4 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                🍰 Doanh thu theo sản phẩm
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={productStats}
                    dataKey="totalRevenue"
                    nameKey="productName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, percent }) => {
                      // Chỉ hiển thị % cho các phần có tỷ lệ > 5%
                      if (percent > 0.05) {
                        return `${(percent * 100).toFixed(1)}%`;
                      }
                      return '';
                    }}
                  >
                    {productStats.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => value.toLocaleString("vi-VN") + "₫"}
                    labelFormatter={(label) => `Sản phẩm: ${label}`}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{
                      paddingLeft: "20px",
                      fontSize: "12px",
                      maxWidth: "200px"
                    }}
                    formatter={(value, entry: any) => (
                      <span className="text-gray-600">
                        {truncateProductName(value, 15)}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top 10 sản phẩm bán chạy */}
            <div className="bg-white p-4 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                📦 Top 10 sản phẩm bán chạy
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={top10BestSelling} layout="vertical" margin={{ left: 50, right: 20, top: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="productName" 
                    type="category" 
                    width={250}
                    tick={CustomYAxisTick}
                    interval={0}
                  />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      if (name === 'productName') {
                        return props.payload.productName;
                      }
                      return value.toLocaleString("vi-VN") + " sản phẩm";
                    }}
                    labelFormatter={(label) => ''}
                  />
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
              <div className="w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topRatedProducts} layout="vertical" margin={{ left: 50, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      domain={[0, 5]} 
                      tickFormatter={(value) => `${value.toFixed(1)}`}
                      tick={{ fontSize: 12, fill: '#666' }}
                      tickLine={{ stroke: '#666' }}
                      axisLine={{ stroke: '#666' }}
                    />
                    <YAxis 
                      dataKey="productName" 
                      type="category" 
                      width={250}
                      tick={CustomYAxisTick}
                      interval={0}
                      tickLine={{ stroke: '#666' }}
                      axisLine={{ stroke: '#666' }}
                    />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        if (name === 'productName') {
                          return props.payload.productName;
                        }
                        return typeof value === "number" ? `${value.toFixed(1)} sao` : value;
                      }}
                      labelFormatter={(label) => ''}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        paddingTop: '10px'
                      }}
                    />
                    <Bar 
                      dataKey="averageRating" 
                      fill="#f59e0b" 
                      name="Đánh giá trung bình"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;