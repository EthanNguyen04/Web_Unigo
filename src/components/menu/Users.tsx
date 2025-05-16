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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("admin");

  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [staffEmail, setStaffEmail] = useState("");
  const [staffName, setStaffName] = useState("");
  const [submittingStaff, setSubmittingStaff] = useState(false);

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

      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
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
        body: JSON.stringify({
          email: staffEmail.trim(),
          full_name: staffName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || data.message || "Lỗi khi thêm nhân viên.");

      alert("✅ Thêm nhân viên thành công");
      setShowStaffDialog(false);
      setStaffEmail("");
      setStaffName("");
      await fetchUsers();
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setSubmittingStaff(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá nhân viên này?")) return;

    try {
      const token = localStorage.getItem("tkn");
      if (!token) throw new Error("Chưa đăng nhập, không thể xoá nhân viên.");

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

      alert("✅ Xoá nhân viên thành công");
      await fetchUsers();
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="flex-1 p-6 bg-white rounded-xl shadow-xl">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800">Quản lý người dùng</h1>

      <div className="flex border-b border-gray-200 mb-6">
        {roleTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2 font-semibold transition-all duration-300 border-b-4 text-sm md:text-base ${
              activeTab === key
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "staff" && (
        <div className="mb-6">
          <button
            onClick={() => setShowStaffDialog(true)}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition shadow-sm"
          >
            + Thêm nhân viên
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 italic">Đang tải danh sách...</p>
      ) : error ? (
        <p className="text-red-600 font-semibold">{error}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3 border border-gray-200">ID</th>
                <th className="p-3 border border-gray-200">Email</th>
                <th className="p-3 border border-gray-200">Trạng thái</th>
                <th className="p-3 border border-gray-200">Quyền hạn</th>
                <th className="p-3 border border-gray-200">Ngày tạo</th>
                {activeTab === "staff" && <th className="p-3 border border-gray-200">Xoá</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "staff" ? 6 : 5} className="p-4 text-center text-gray-400 italic">
                    Không có người dùng trong mục này.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-100 transition">
                    <td className="p-3 border border-gray-200 font-mono text-xs">{shortId(user._id)}</td>
                    <td className="p-3 border border-gray-200">{user.email}</td>
                    <td className="p-3 border border-gray-200">{mapStatus(user.account_status)}</td>
                    <td className="p-3 border border-gray-200">{mapRole(user.role)}</td>
                    <td className="p-3 border border-gray-200">{new Date(user.created_at).toLocaleString()}</td>
                    {activeTab === "staff" && (
                      <td className="p-3 border border-gray-200 text-center">
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                          title="Xoá nhân viên"
                        >
                          Xoá
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showStaffDialog && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-fadeInUp">
            <h3 className="text-xl font-semibold mb-5 text-gray-800">Thêm nhân viên mới</h3>
            <input
              type="email"
              placeholder="Email nhân viên"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Họ và tên"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStaffDialog(false)}
                className="px-5 py-2 border rounded-lg hover:bg-gray-100 transition"
                disabled={submittingStaff}
              >
                Huỷ
              </button>
              <button
                onClick={handleAddStaff}
                disabled={submittingStaff}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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