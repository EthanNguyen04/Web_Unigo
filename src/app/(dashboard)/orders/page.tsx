"use client";

import { useState, useMemo } from 'react';
import { Table, Button, Badge, Input, DatePicker } from 'antd';
import { ColumnsType } from 'antd/es/table'; // Import ColumnsType từ antd/es/table
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import isBetween from 'dayjs/plugin/isBetween';

// Kích hoạt các plugin
dayjs.extend(minMax);
dayjs.extend(isBetween);

// Định nghĩa interface cho một hàng trong data
interface Order {
  key: string;
  orderId: string;
  customer: string;
  date: string;
  total: number;
  status: 'Đã giao' | 'Đang xử lý' | 'Đang giao' | 'Chờ xác nhận';
}

// Di chuyển data ra ngoài component để tránh tạo lại mỗi lần render
const data: Order[] = [
  {
    key: '1',
    orderId: 'DH001',
    customer: 'Nguyễn Văn A',
    date: '2025-03-25',
    total: 1500000,
    status: 'Đã giao',
  },
  {
    key: '2',
    orderId: 'DH002',
    customer: 'Trần Thị B',
    date: '2025-03-26',
    total: 2300000,
    status: 'Đang xử lý',
  },
  {
    key: '3',
    orderId: 'DH003',
    customer: 'Lê Văn C',
    date: '2025-03-27',
    total: 870000,
    status: 'Chờ xác nhận',
  },
  {
    key: '4',
    orderId: 'DH004',
    customer: 'Phạm Thị D',
    date: '2025-03-28',
    total: 1200000,
    status: 'Đang giao',
  },
  {
    key: '5',
    orderId: 'DH005',
    customer: 'Hoàng Văn E',
    date: '2025-03-29',
    total: 1800000,
    status: 'Đã giao',
  },
  {
    key: '6',
    orderId: 'DH006',
    customer: 'Ngô Thị F',
    date: '2025-03-30',
    total: 950000,
    status: 'Đang xử lý',
  },
  {
    key: '7',
    orderId: 'DH007',
    customer: 'Đinh Văn G',
    date: '2025-04-01',
    total: 2000000,
    status: 'Chờ xác nhận',
  },
  {
    key: '8',
    orderId: 'DH008',
    customer: 'Bùi Thị H',
    date: '2025-04-02',
    total: 3000000,
    status: 'Đang giao',
  },
  {
    key: '9',
    orderId: 'DH009',
    customer: 'Lý Văn I',
    date: '2025-04-03',
    total: 1100000,
    status: 'Đã giao',
  },
  {
    key: '10',
    orderId: 'DH010',
    customer: 'Vũ Thị K',
    date: '2025-04-04',
    total: 2500000,
    status: 'Đang xử lý',
  },
  {
    key: '11',
    orderId: 'DH011',
    customer: 'Trương Văn L',
    date: '2025-04-05',
    total: 1400000,
    status: 'Chờ xác nhận',
  },
  {
    key: '12',
    orderId: 'DH012',
    customer: 'Hà Thị M',
    date: '2025-04-06',
    total: 1700000,
    status: 'Đang giao',
  },
];

const { RangePicker } = DatePicker;

export default function OrdersPage() {
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  const getStatusBadge = (status: 'Đã giao' | 'Đang xử lý' | 'Đang giao' | 'Chờ xác nhận'): 'success' | 'processing' | 'default' | 'warning' => {
    const statusMap: { [key in 'Đã giao' | 'Đang xử lý' | 'Đang giao' | 'Chờ xác nhận']: 'success' | 'processing' | 'default' | 'warning' } = {
      'Đã giao': 'success',
      'Đang xử lý': 'processing',
      'Đang giao': 'default',
      'Chờ xác nhận': 'warning',
    };
    return statusMap[status];
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearchText =
        item.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchText.toLowerCase());

      const itemDate = dayjs(item.date, 'YYYY-MM-DD');
      let matchesDate = true;

      if (dateRange[0] && dateRange[1]) {
        const startDate = dayjs.min(dayjs(dateRange[0]), dayjs(dateRange[1]));
        const endDate = dayjs.max(dayjs(dateRange[0]), dayjs(dateRange[1]));
        matchesDate = itemDate.isBetween(startDate, endDate, 'day', '[]');
      } else if (dateRange[0]) {
        matchesDate = itemDate.isSame(dateRange[0], 'day');
      }

      return matchesSearchText && matchesDate;
    });
  }, [searchText, dateRange]);

  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      sorter: (a: Order, b: Order) => a.orderId.localeCompare(b.orderId),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: Order, b: Order) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (text: number) => `${text.toLocaleString('vi-VN')} VNĐ`,
      sorter: (a: Order, b: Order) => a.total - b.total,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'Đã giao' | 'Đang xử lý' | 'Đang giao' | 'Chờ xác nhận') => (
        <Badge status={getStatusBadge(status)} text={status} />
      ),
      filters: [
        { text: 'Đã giao', value: 'Đã giao' },
        { text: 'Đang xử lý', value: 'Đang xử lý' },
        { text: 'Đang giao', value: 'Đang giao' },
        { text: 'Chờ xác nhận', value: 'Chờ xác nhận' },
      ],
      onFilter: (value, record: Order) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: () => (
        <div className="space-x-2">
          <Button type="link" className="text-blue-500">
            Xem
          </Button>
          <Button type="link" className="text-green-500">
            Sửa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <Button type="primary" icon={<PlusOutlined />} className="bg-blue-500">
          Thêm đơn hàng
        </Button>
      </div>

      <div className="mb-4 flex gap-4 items-center">
        <Input
          placeholder="Tìm kiếm đơn hàng..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-md"
        />
        <RangePicker
          value={dateRange}
          format="YYYY-MM-DD"
          onChange={(dates) => setDateRange(dates || [null, null])}
          allowClear
          className="w-64"
        />
        <Button onClick={() => setDateRange([null, null])}>Reset</Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        className="shadow-md rounded-lg"
      />
    </div>
  );
}