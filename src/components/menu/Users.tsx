// src/components/maketingManager/Users.tsx

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Get_User, Add_staff, delete_staff } from "../../config";

interface UserItem {
  _id: string;
  email: string;
  account_status: string;
  role: string;
  created_at: string;
}

const roleTabs = [
  { key: "admin", label: "Chủ shop" },
  { key: "staff", label: "Nhân viên" },
  { key: "user", label: "Người dùng" },
];

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("admin");

  // States cho dialog thêm nhân viên
  const [showStaffDialog, setShowStaffDialog] = useState<boolean>(false);
  const [staffEmail, setStaffEmail] = useState<string>("");
  const [staffName, setStaffName] = useState<string>("");
  const [submittingStaff, setSubmittingStaff] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("tkn");
      if (!token) throw new Error("Chưa có token, vui lòng đăng nhập.");

      const res = await fetch(Get_User, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Lỗi khi tải danh sách người dùng.");

      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const mapStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Chưa xác minh";
      case "active":
        return "Đã xác minh";
      default:
        return status;
    }
  };
  const mapRole = (role: string) => {
    switch (role.toLowerCase()) {
      case "user":
        return "Người dùng";
      case "admin":
        return "Chủ shop";
      case "staff":
        return "Nhân viên";
      default:
        return role;
    }
  };

  const filteredUsers = users.filter((u) => u.role.toLowerCase() === activeTab);
  const shortId = (id: string) => (id.length > 5 ? "..." + id.slice(-5) : id);

  const handleAddStaff = async () => {
    if (!staffEmail.trim() || !staffName.trim()) {
      alert("Vui lòng nhập email và họ tên.");
      return;
    }
    setSubmittingStaff(true);
    try {
      const token = localStorage.getItem("tkn");
      if (!token) throw new Error("Chưa đăng nhập, không thể thêm nhân viên.");
      const res = await fetch(Add_staff, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: staffEmail.trim(), full_name: staffName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Lỗi khi thêm nhân viên.");
      alert("Thêm nhân viên thành công");
      setShowStaffDialog(false);
      setStaffEmail("");
      setStaffName("");
      await fetchUsers();
    } catch (e: any) {
      alert( + e.message);
    } finally {
      setSubmittingStaff(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá nhân viên này?")) return;
    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(delete_staff, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);
      alert(" Xoá nhân viên thành công");
      await fetchUsers();
    } catch (err: any) {
      alert( err.message);
    }
  };

  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>

      {/* Tabs for roles */}
      <div className="flex border-b mb-4">
        {roleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors ${
              activeTab === tab.key
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add staff button only in "Nhân viên" tab */}
      {activeTab === "staff" && (
        <div className="mb-4">
          <button
            onClick={() => setShowStaffDialog(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Thêm nhân viên
          </button>
        </div>
      )}

      {loading ? (
        <p>Đang tải danh sách...</p>
      ) : error ? (
        <p className="text-red-500"> {error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Trạng thái</th>
                <th className="p-2 border">Quyền hạn</th>
                <th className="p-2 border">Ngày tạo</th>
                {activeTab === "staff" && <th className="p-2 border">Xóa</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{shortId(u._id)}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{mapStatus(u.account_status)}</td>
                  <td className="p-2 border">{mapRole(u.role)}</td>
                  <td className="p-2 border">
                    {new Date(u.created_at).toLocaleString()}
                  </td>
                  {activeTab === "staff" && (
                    <td className="p-2 border">
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="text-red-500 hover:underline"
                      >
                        Xóa
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={activeTab === "staff" ? 6 : 5}
                    className="p-4 text-center text-gray-500"
                  >
                    Không có người dùng trong mục này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog thêm nhân viên */}
      {showStaffDialog && (
        <div className="fixed inset-0 backdrop-blur-sm bg-transparent flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Thêm nhân viên</h3>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email nhân viên"
                className="border w-full p-2 rounded"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
              />
              <input
                type="text"
                placeholder="Họ và tên"
                className="border w-full p-2 rounded"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowStaffDialog(false)}
                className="px-4 py-2 border rounded"
              >
                Huỷ
              </button>
              <button
                onClick={handleAddStaff}
                disabled={submittingStaff}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {submittingStaff ? "Đang thêm..." : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
