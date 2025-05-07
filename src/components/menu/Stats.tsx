"use client";
import React, { useState, useEffect } from "react";
import { Get_Stats } from "../../config";

interface DayStat {
  day: number;
  totalQuantity: number;
  totalRevenue: number;
}

const Stats: React.FC = () => {
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [stats, setStats] = useState<DayStat[]>([]);
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
      setStats(data.stats || []);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(year, month);
  }, [year, month]);

  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold mb-4">Thống kê & Doanh thu</h1>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block font-medium">Năm</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded p-1"
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const y = today.getFullYear() - 2 + i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block font-medium">Tháng</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border rounded p-1"
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const m = i + 1;
              return (
                <option key={m} value={m}>
                  {m}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && <p>Đang tải dữ liệu…</p>}
      {error && <p className="text-red-500">❌ {error}</p>}

      {/* Data Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2 border">Ngày</th>
                <th className="p-2 border">Số lượng bán</th>
                <th className="p-2 border">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((d) => (
                <tr key={d.day} className="hover:bg-gray-50">
                  <td className="p-2 border">{d.day}</td>
                  <td className="p-2 border">{d.totalQuantity}</td>
                  <td className="p-2 border">
                    {d.totalRevenue.toLocaleString("vi-VN")}₫
                  </td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Stats;
