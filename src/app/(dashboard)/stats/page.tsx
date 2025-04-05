"use client";

import { useState } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

// Dữ liệu mẫu mở rộng (2 tháng: 1/3/2025 - 30/4/2025)
const revenueData = [
  { date: '2025-03-01', revenue: 3000000 }, { date: '2025-03-02', revenue: 4500000 }, { date: '2025-03-03', revenue: 6000000 },
  { date: '2025-03-04', revenue: 7000000 }, { date: '2025-03-05', revenue: 5000000 }, { date: '2025-03-06', revenue: 8000000 },
  { date: '2025-03-07', revenue: 6500000 }, { date: '2025-03-08', revenue: 7200000 }, { date: '2025-03-09', revenue: 4800000 },
  { date: '2025-03-10', revenue: 5500000 }, { date: '2025-03-11', revenue: 6200000 }, { date: '2025-03-12', revenue: 7800000 },
  { date: '2025-03-13', revenue: 6900000 }, { date: '2025-03-14', revenue: 7400000 }, { date: '2025-03-15', revenue: 5100000 },
  { date: '2025-03-16', revenue: 5800000 }, { date: '2025-03-17', revenue: 6700000 }, { date: '2025-03-18', revenue: 7300000 },
  { date: '2025-03-19', revenue: 4900000 }, { date: '2025-03-20', revenue: 5600000 }, { date: '2025-03-21', revenue: 6400000 },
  { date: '2025-03-22', revenue: 7100000 }, { date: '2025-03-23', revenue: 6800000 }, { date: '2025-03-24', revenue: 5200000 },
  { date: '2025-03-25', revenue: 5900000 }, { date: '2025-03-26', revenue: 6600000 }, { date: '2025-03-27', revenue: 7500000 },
  { date: '2025-03-28', revenue: 8000000 }, { date: '2025-03-29', revenue: 5400000 }, { date: '2025-03-30', revenue: 6100000 },
  { date: '2025-03-31', revenue: 7700000 }, { date: '2025-04-01', revenue: 8200000 }, { date: '2025-04-02', revenue: 5700000 },
  { date: '2025-04-03', revenue: 6300000 }, { date: '2025-04-04', revenue: 7000000 }, { date: '2025-04-05', revenue: 7900000 },
  { date: '2025-04-06', revenue: 8500000 }, { date: '2025-04-07', revenue: 6000000 }, { date: '2025-04-08', revenue: 6800000 },
  { date: '2025-04-09', revenue: 7400000 }, { date: '2025-04-10', revenue: 8100000 }, { date: '2025-04-11', revenue: 5600000 },
  { date: '2025-04-12', revenue: 6200000 }, { date: '2025-04-13', revenue: 6900000 }, { date: '2025-04-14', revenue: 7600000 },
  { date: '2025-04-15', revenue: 8300000 }, { date: '2025-04-16', revenue: 5800000 }, { date: '2025-04-17', revenue: 6500000 },
  { date: '2025-04-18', revenue: 7200000 }, { date: '2025-04-19', revenue: 7800000 }, { date: '2025-04-20', revenue: 8400000 },
  { date: '2025-04-21', revenue: 5900000 }, { date: '2025-04-22', revenue: 6700000 }, { date: '2025-04-23', revenue: 7300000 },
  { date: '2025-04-24', revenue: 8000000 }, { date: '2025-04-25', revenue: 8600000 }, { date: '2025-04-26', revenue: 6100000 },
  { date: '2025-04-27', revenue: 6800000 }, { date: '2025-04-28', revenue: 7500000 }, { date: '2025-04-29', revenue: 8200000 },
  { date: '2025-04-30', revenue: 8700000 },
];

// Dữ liệu top sản phẩm bán chạy (15 sản phẩm)
const topProductsData = [
  { name: 'Áo thun nam', sales: 150 }, { name: 'Quần jeans nữ', sales: 120 }, { name: 'Giày thể thao', sales: 100 },
  { name: 'Túi xách da', sales: 80 }, { name: 'Mũ lưỡi trai', sales: 70 }, { name: 'Áo khoác gió', sales: 60 },
  { name: 'Dép sandal', sales: 55 }, { name: 'Đồng hồ nam', sales: 50 }, { name: 'Váy maxi', sales: 45 },
  { name: 'Balo du lịch', sales: 40 }, { name: 'Kính mát', sales: 35 }, { name: 'Thắt lưng da', sales: 30 },
  { name: 'Áo sơ mi nam', sales: 25 }, { name: 'Quần short nữ', sales: 20 }, { name: 'Giày cao gót', sales: 15 },
];

const { RangePicker } = DatePicker;

export default function StatsPage() {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(30, 'days'), // Mặc định 30 ngày trước
    dayjs(), // Đến hôm nay
  ]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day'); // Chế độ xem: ngày, tuần, tháng

  // Hàm tính tổng doanh thu và số đơn hàng từ dữ liệu mẫu
  const filteredRevenueData = revenueData.filter(item => {
    const itemDate = dayjs(item.date);
    if (dateRange[0] && dateRange[1]) {
      return itemDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
    }
    return true;
  });

  // Tính toán dữ liệu theo chế độ xem
  const aggregatedRevenueData = () => {
    if (viewMode === 'day') {
      return filteredRevenueData;
    } else if (viewMode === 'week') {
      const weekData: { [key: string]: number } = {};
      filteredRevenueData.forEach(item => {
        const week = dayjs(item.date).startOf('week').format('YYYY-MM-DD');
        weekData[week] = (weekData[week] || 0) + item.revenue;
      });
      return Object.entries(weekData).map(([date, revenue]) => ({ date, revenue }));
    } else if (viewMode === 'month') {
      const monthData: { [key: string]: number } = {};
      filteredRevenueData.forEach(item => {
        const month = dayjs(item.date).startOf('month').format('YYYY-MM');
        monthData[month] = (monthData[month] || 0) + item.revenue;
      });
      return Object.entries(monthData).map(([date, revenue]) => ({ date, revenue }));
    }
    return filteredRevenueData;
  };

  const totalRevenue = filteredRevenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = filteredRevenueData.length; // Giả định mỗi ngày là một đơn hàng
  const topProductsCount = topProductsData.length;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Thống kê</h1>
        <div className="flex gap-4">
          <Select
            value={viewMode}
            onChange={(value) => setViewMode(value)}
            className="w-32"
          >
            <Select.Option value="day">Theo ngày</Select.Option>
            <Select.Option value="week">Theo tuần</Select.Option>
            <Select.Option value="month">Theo tháng</Select.Option>
          </Select>
          <RangePicker
            value={dateRange}
            format="YYYY-MM-DD"
            onChange={(dates) => setDateRange(dates || [null, null])}
            allowClear
            className="w-64"
          />
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              formatter={(value) => `${Number(value).toLocaleString('vi-VN')} VNĐ`}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng số đơn hàng"
              value={totalOrders}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Sản phẩm bán chạy"
              value={topProductsCount}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title={`Doanh thu ${viewMode === 'day' ? 'theo ngày' : viewMode === 'week' ? 'theo tuần' : 'theo tháng'}`}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={aggregatedRevenueData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toLocaleString('vi-VN')} VNĐ`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Doanh thu" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top 10 sản phẩm bán chạy">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsData.slice(0, 10)}> {/* Lấy top 10 */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#82ca9d" name="Số lượng bán" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}