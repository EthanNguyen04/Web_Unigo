"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  API_Get_CATEGORY,
  Post_ADD_category,
  Edit_category
} from "../../config";

interface Category {
  _id: string;
  name: string;
  status: boolean;
}

interface ApiResponse {
  message: string;
  categories?: Category[];
  category?: Category;
}

// Hàm chuyển tên về dạng "Áo Nam"
function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // form thêm mới
  const [newName, setNewName]       = useState("");
  const [adding, setAdding]         = useState(false);
  const [addError, setAddError]     = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // bộ lọc
  const [filterStatus, setFilterStatus] = useState<"all"|"active"|"inactive">("all");
  const [filterText, setFilterText]     = useState<string>("");

  // 1. Lấy toàn bộ categories (đã sync status)
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_Get_CATEGORY, {
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = (await res.json()) as ApiResponse;
      if (!Array.isArray(data.categories)) {
        throw new Error(data.message || "API không trả về categories");
      }
      setCategories(data.categories);
    } catch (e: any) {
      console.error("Lỗi khi tải phân loại:", e);
      setError(e.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 2. Thêm mới category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);
    const formattedName = toTitleCase(newName.trim());
    if (!formattedName) {
      setAddError("Tên phân loại không được để trống");
      return;
    }
    setAdding(true);
    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(Post_ADD_category, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name: formattedName })
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) throw new Error(data.message || `Server returned ${res.status}`);
      setAddSuccess("Tạo phân loại thành công!");
      setNewName("");
      fetchCategories();
    } catch (e: any) {
      console.error("Lỗi khi thêm phân loại:", e);
      setAddError(e.message || "Lỗi không xác định");
    } finally {
      setAdding(false);
    }
  };

  // 3. Sửa category (chỉ khi status === false)
  const handleEdit = async (cat: Category) => {
    if (cat.status) return; // chỉ sửa khi đang không hoạt động
    const nameInput = window.prompt("Nhập tên mới cho phân loại:", cat.name);
    const formattedName = nameInput ? toTitleCase(nameInput.trim()) : "";
    if (!formattedName || formattedName === cat.name) return;

    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(`${Edit_category}/${cat._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name: formattedName })
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) throw new Error(data.message || `Server returned ${res.status}`);
      alert("Cập nhật danh mục thành công!");
      fetchCategories();
    } catch (e: any) {
      console.error("Lỗi khi sửa phân loại:", e);
      alert(`Lỗi: ${e.message}`);
    }
  };

  // Apply filter trước khi render
  const filtered = categories.filter(cat => {
    if (filterStatus === "active" && !cat.status)   return false;
    if (filterStatus === "inactive" && cat.status)  return false;
    if (filterText && !cat.name.toLowerCase().includes(filterText.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="text-center text-orange-600 font-semibold py-8">Đang tải phân loại...</div>;
  if (error)   return <div className="text-center text-red-600 font-semibold py-8">Lỗi: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-orange-300">
      <h1 className="text-3xl font-extrabold mb-3 text-orange-600 tracking-wide drop-shadow-md">
        Quản lý phân loại
      </h1>
      <p className="mb-6 text-gray-700">Danh sách và chi tiết các phân loại sản phẩm.</p>

      {/* Form thêm mới */}
      <form onSubmit={handleAddCategory} className="mb-6 flex flex-col md:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Tên phân loại mới"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="border border-orange-400 focus:border-orange-600 focus:ring-2 focus:ring-orange-300 rounded-lg px-4 py-3 w-full md:flex-1 transition"
          disabled={adding}
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
          disabled={adding}
        >
          {adding ? "Đang thêm..." : "Thêm phân loại"}
        </button>
      </form>
      {addError   && <div className="text-red-600 mb-4 font-medium">{addError}</div>}
      {addSuccess && <div className="text-green-600 mb-4 font-medium">{addSuccess}</div>}

      {/* Bộ lọc */}
      <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          className="border border-orange-400 focus:border-orange-600 focus:ring-2 focus:ring-orange-300 rounded-lg px-4 py-2 transition"
        >
          <option value="all">Tất cả</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
        <input
          type="text"
          placeholder="Tìm theo tên..."
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          className="border border-orange-400 focus:border-orange-600 focus:ring-2 focus:ring-orange-300 rounded-lg px-4 py-2 flex-1 transition"
        />
      </div>

      {/* Bảng */}
      <div className="overflow-x-auto rounded-lg border border-orange-300 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-orange-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-orange-700">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-orange-700">Tên phân loại</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-orange-700">Trạng thái</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-orange-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500 italic">
                  Không tìm thấy phân loại phù hợp.
                </td>
              </tr>
            ) : filtered.map(cat => (
              <tr
                key={cat._id}
                className="hover:bg-orange-50 transition cursor-default"
              >
                <td className="px-6 py-4 text-sm text-gray-700">{cat._id}</td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cat.name}</td>
                <td className={`px-6 py-4 text-sm font-semibold ${
                  cat.status ? "text-green-600" : "text-red-600"
                }`}>
                  {cat.status ? "Hoạt động" : "Không hoạt động"}
                </td>
                <td className="px-6 py-4 text-sm">
                  {!cat.status && (
                    <button
                      onClick={() => handleEdit(cat)}
                      className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 font-semibold transition"
                      title="Sửa phân loại"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5h6m-1 1v6m-7 7l5-5-1.5-1.5-5 5V19z" />
                      </svg>
                      Sửa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryManagement;