"use client";

import { useState, useMemo } from 'react';
import { Table, Button, Badge, Input, Select } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

// Định nghĩa interface cho một người dùng
interface User {
  key: string;
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  registeredDate: string;
  status: 'Hoạt động' | 'Khóa';
}

// Dữ liệu mẫu
const data: User[] = [
  { key: '1', id: 'U001', name: 'Nguyễn Văn A', email: 'nva@gmail.com', role: 'Admin', registeredDate: '2025-03-01', status: 'Hoạt động' },
  { key: '2', id: 'U002', name: 'Trần Thị B', email: 'ttb@gmail.com', role: 'User', registeredDate: '2025-03-05', status: 'Hoạt động' },
  { key: '3', id: 'U003', name: 'Lê Văn C', email: 'lvc@gmail.com', role: 'User', registeredDate: '2025-03-10', status: 'Khóa' },
  { key: '4', id: 'U004', name: 'Phạm Thị D', email: 'ptd@gmail.com', role: 'Admin', registeredDate: '2025-03-15', status: 'Hoạt động' },
  { key: '5', id: 'U005', name: 'Hoàng Văn E', email: 'hve@gmail.com', role: 'User', registeredDate: '2025-03-20', status: 'Khóa' },
  { key: '6', id: 'U006', name: 'Ngô Thị F', email: 'ntf@gmail.com', role: 'User', registeredDate: '2025-03-25', status: 'Hoạt động' },
  { key: '7', id: 'U007', name: 'Đinh Văn G', email: 'dvg@gmail.com', role: 'Admin', registeredDate: '2025-04-01', status: 'Hoạt động' },
  { key: '8', id: 'U008', name: 'Bùi Thị H', email: 'bth@gmail.com', role: 'User', registeredDate: '2025-04-05', status: 'Khóa' },
  { key: '9', id: 'U009', name: 'Lý Văn I', email: 'lvi@gmail.com', role: 'User', registeredDate: '2025-04-10', status: 'Hoạt động' },
  { key: '10', id: 'U010', name: 'Vũ Thị K', email: 'vtk@gmail.com', role: 'Admin', registeredDate: '2025-04-15', status: 'Hoạt động' },
];

export default function UsersPage() {
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Danh sách vai trò để lọc
  const roles = ['Tất cả', 'Admin', 'User'];

  // Hàm lấy trạng thái hiển thị
  const getStatusBadge = (status: 'Hoạt động' | 'Khóa') => {
    return status === 'Hoạt động' ? 'success' : 'error';
  };

  // Lọc dữ liệu dựa trên tìm kiếm và vai trò
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearchText =
        item.id.toLowerCase().includes(searchText.toLowerCase()) ||
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.email.toLowerCase().includes(searchText.toLowerCase());

      const matchesRole =
        !selectedRole || selectedRole === 'Tất cả' || item.role === selectedRole;

      return matchesSearchText && matchesRole;
    });
  }, [searchText, selectedRole]);

  // Định nghĩa các cột cho bảng
  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: User, b: User) => a.id.localeCompare(b.id),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'registeredDate',
      key: 'registeredDate',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY'),
      sorter: (a: User, b: User) => dayjs(a.registeredDate).unix() - dayjs(b.registeredDate).unix(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'Hoạt động' | 'Khóa') => (
        <Badge status={getStatusBadge(status)} text={status} />
      ),
      filters: [
        { text: 'Hoạt động', value: 'Hoạt động' },
        { text: 'Khóa', value: 'Khóa' },
      ],
      onFilter: (value, record: User) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record: User) => (
        <div className="space-x-2">
          <Button type="link" className="text-blue-500">
            Xem
          </Button>
          <Button type="link" className="text-green-500">
            Sửa
          </Button>
          <Button type="link" className={record.status === 'Hoạt động' ? 'text-red-500' : 'text-yellow-500'}>
            {record.status === 'Hoạt động' ? 'Khóa' : 'Mở khóa'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Người dùng</h1>
        <Button type="primary" icon={<PlusOutlined />} className="bg-blue-500">
          Thêm người dùng
        </Button>
      </div>

      <div className="mb-4 flex gap-4 items-center">
        <Input
          placeholder="Tìm kiếm người dùng..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-md"
        />
        <Select
          value={selectedRole || 'Tất cả'}
          onChange={(value) => setSelectedRole(value === 'Tất cả' ? null : value)}
          className="w-32"
        >
          {roles.map(role => (
            <Select.Option key={role} value={role}>
              {role}
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