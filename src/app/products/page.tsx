"use client";

import { useState, useMemo } from 'react';
import { Table, Button, Badge, Input, Select } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';

// Định nghĩa interface cho một sản phẩm
interface Product {
  key: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'Còn hàng' | 'Hết hàng';
}

// Dữ liệu mẫu
const data: Product[] = [
  { key: '1', productId: 'SP001', name: 'Áo thun nam', category: 'Quần áo', price: 150000, stock: 50, status: 'Còn hàng' },
  { key: '2', productId: 'SP002', name: 'Quần jeans nữ', category: 'Quần áo', price: 300000, stock: 0, status: 'Hết hàng' },
  { key: '3', productId: 'SP003', name: 'Giày thể thao', category: 'Giày dép', price: 500000, stock: 20, status: 'Còn hàng' },
  { key: '4', productId: 'SP004', name: 'Túi xách da', category: 'Phụ kiện', price: 800000, stock: 5, status: 'Còn hàng' },
  { key: '5', productId: 'SP005', name: 'Mũ lưỡi trai', category: 'Phụ kiện', price: 100000, stock: 0, status: 'Hết hàng' },
  { key: '6', productId: 'SP006', name: 'Áo khoác gió', category: 'Quần áo', price: 450000, stock: 15, status: 'Còn hàng' },
  { key: '7', productId: 'SP007', name: 'Dép sandal', category: 'Giày dép', price: 200000, stock: 30, status: 'Còn hàng' },
  { key: '8', productId: 'SP008', name: 'Đồng hồ nam', category: 'Phụ kiện', price: 1200000, stock: 2, status: 'Còn hàng' },
  { key: '9', productId: 'SP009', name: 'Váy maxi', category: 'Quần áo', price: 350000, stock: 0, status: 'Hết hàng' },
  { key: '10', productId: 'SP010', name: 'Balo du lịch', category: 'Phụ kiện', price: 600000, stock: 10, status: 'Còn hàng' },
];

export default function ProductsPage() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Danh sách danh mục để lọc
  const categories = ['Tất cả', 'Quần áo', 'Giày dép', 'Phụ kiện'];

  // Hàm lấy trạng thái hiển thị
  const getStatusBadge = (status: 'Còn hàng' | 'Hết hàng') => {
    return status === 'Còn hàng' ? 'success' : 'error';
  };

  // Lọc dữ liệu dựa trên tìm kiếm và danh mục
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearchText =
        item.productId.toLowerCase().includes(searchText.toLowerCase()) ||
        item.name.toLowerCase().includes(searchText.toLowerCase());

      const matchesCategory =
        !selectedCategory || selectedCategory === 'Tất cả' || item.category === selectedCategory;

      return matchesSearchText && matchesCategory;
    });
  }, [searchText, selectedCategory]);

  // Định nghĩa các cột cho bảng
  const columns: ColumnsType<Product> = [
    {
      title: 'Mã sản phẩm',
      dataIndex: 'productId',
      key: 'productId',
      sorter: (a: Product, b: Product) => a.productId.localeCompare(b.productId),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (text: number) => `${text.toLocaleString('vi-VN')} VNĐ`,
      sorter: (a: Product, b: Product) => a.price - b.price,
    },
    {
      title: 'Số lượng tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a: Product, b: Product) => a.stock - b.stock,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'Còn hàng' | 'Hết hàng') => (
        <Badge status={getStatusBadge(status)} text={status} />
      ),
      filters: [
        { text: 'Còn hàng', value: 'Còn hàng' },
        { text: 'Hết hàng', value: 'Hết hàng' },
      ],
      onFilter: (value, record: Product) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: () => ( // Xóa tham số _ và record vì không sử dụng
        <div className="space-x-2">
          <Button type="link" className="text-blue-500">
            Xem
          </Button>
          <Button type="link" className="text-green-500">
            Sửa
          </Button>
          <Button type="link" className="text-red-500">
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <Button type="primary" icon={<PlusOutlined />} className="bg-blue-500">
          Thêm sản phẩm
        </Button>
      </div>

      <div className="mb-4 flex gap-4 items-center">
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-md"
        />
        <Select
          value={selectedCategory || 'Tất cả'}
          onChange={(value) => setSelectedCategory(value === 'Tất cả' ? null : value)}
          className="w-32"
        >
          {categories.map(category => (
            <Select.Option key={category} value={category}>
              {category}
            </Select.Option>
          ))}
        </Select>
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